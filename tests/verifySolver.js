// Automated Verification and Edge Case Test Suite for ChronosAI Timetable Generator
import { PRESET_ENGINEERING, PRESET_IMPOSSIBLE_CONFLICTS, PRESET_TIGHT_RESOURCE } from '../src/data/presets.js';
import { DEFAULT_CONFIG } from '../src/data/models.js';
import { checkFeasibility } from '../src/solver/feasibilityChecker.js';
import { generateTimetable } from '../src/solver/timetableSolver.js';
import { evaluateTimetable } from '../src/solver/fitnessEvaluator.js';
import { validateSlotMove, validateNewSlot } from '../src/solver/conflictValidator.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('  CHRONOSAI TIMETABLE GENERATOR — TEST SUITE');
  console.log('======================================================\n');

  // Test 1: Solvable Preset Feasibility
  console.log('--- 1. Feasibility Pre-Flight Check (Solvable) ---');
  const engFeasibility = checkFeasibility(
    PRESET_ENGINEERING.divisions,
    PRESET_ENGINEERING.rooms,
    PRESET_ENGINEERING.faculty,
    PRESET_ENGINEERING.subjects,
    DEFAULT_CONFIG
  );
  assert(engFeasibility.isFeasible === true, 'Engineering preset is detected as mathematically feasible');
  assert(engFeasibility.criticalErrors.length === 0, 'No critical errors in engineering preset');

  // Test 2: Impossible Constraints Detection
  console.log('\n--- 2. Impossible Constraints Detection (Pigeonhole & Bottlenecks) ---');
  const impFeasibility = checkFeasibility(
    PRESET_IMPOSSIBLE_CONFLICTS.divisions,
    PRESET_IMPOSSIBLE_CONFLICTS.rooms,
    PRESET_IMPOSSIBLE_CONFLICTS.faculty,
    PRESET_IMPOSSIBLE_CONFLICTS.subjects,
    DEFAULT_CONFIG
  );
  assert(impFeasibility.isFeasible === false, 'Impossible scenario is detected as infeasible');
  assert(impFeasibility.criticalErrors.length >= 3, 'Detects multiple critical impossible errors');
  
  const hasPigeonhole = impFeasibility.criticalErrors.some(e => e.type === 'DIVISION_OVERFLOW');
  assert(hasPigeonhole, 'Detects DIVISION_OVERFLOW (required hours > available week slots)');

  const hasTeacherOverload = impFeasibility.criticalErrors.some(e => e.type === 'FACULTY_OVERLOAD');
  assert(hasTeacherOverload, 'Detects FACULTY_OVERLOAD (teaching load > contracted max)');

  const hasLabDeficit = impFeasibility.criticalErrors.some(e => e.type === 'LAB_CAPACITY_DEFICIT');
  assert(hasLabDeficit, 'Detects LAB_CAPACITY_DEFICIT (lab sessions > available lab blocks)');

  assert(impFeasibility.autoFixSuggestions.length > 0, 'Provides automated fix suggestions for impossible constraints');

  // Test 3: Timetable Generation (CSP Solver with MRV & Degree Heuristics)
  console.log('\n--- 3. Timetable Solver Generation on Engineering Preset ---');
  const result = await generateTimetable({
    divisions: PRESET_ENGINEERING.divisions,
    rooms: PRESET_ENGINEERING.rooms,
    faculty: PRESET_ENGINEERING.faculty,
    subjects: PRESET_ENGINEERING.subjects,
    config: DEFAULT_CONFIG
  });

  assert(result.success === true, 'Timetable generation returned success status');
  assert(result.timetable.length > 0, `Allocated ${result.timetable.length} sessions`);
  assert(result.unallocated.length === 0, 'Zero unallocated sessions in solvable preset');
  assert(result.stats.hardViolations === 0, 'Zero hard violations (100% conflict free)');
  assert(result.quality.fitnessScore >= 90, `High quality fitness score: ${result.quality.fitnessScore}%`);

  // Test 4: Physical Constraint Invariants on Generated Schedule
  console.log('\n--- 4. Constraint Invariants on Generated Schedule ---');
  const slots = result.timetable;
  let teacherClashes = 0;
  let roomClashes = 0;
  let divisionClashes = 0;
  let breakClashes = 0;
  let labCrossesLunch = 0;

  for (let i = 0; i < slots.length; i++) {
    const s1 = slots[i];
    const dur1 = s1.duration || 1;

    // Check lunch collision
    for (let offset = 0; offset < dur1; offset++) {
      const p = s1.period + offset;
      const periodConf = DEFAULT_CONFIG.periods.find(item => item.index === p);
      if (periodConf?.isBreak) breakClashes++;
    }

    // Check lab crossing lunch: if starting at Period 3 (11:15-12:15) with duration 2, it would hit Period 4 (Lunch)
    if (dur1 > 1) {
      if (s1.period === 3 || s1.period === 4) labCrossesLunch++;
    }

    for (let j = i + 1; j < slots.length; j++) {
      const s2 = slots[j];
      if (s1.day !== s2.day) continue;

      const dur2 = s2.duration || 1;
      const start1 = s1.period;
      const end1 = s1.period + dur1 - 1;
      const start2 = s2.period;
      const end2 = s2.period + dur2 - 1;

      const overlaps = Math.max(start1, start2) <= Math.min(end1, end2);
      if (overlaps) {
        if (s1.facultyId === s2.facultyId) teacherClashes++;
        if (s1.roomId === s2.roomId) roomClashes++;
        if (s1.divisionId === s2.divisionId) divisionClashes++;
      }
    }
  }

  assert(teacherClashes === 0, 'No teacher is double-booked across any slot');
  assert(roomClashes === 0, 'No classroom/lab is double-booked across any slot');
  assert(divisionClashes === 0, 'No division has overlapping classes');
  assert(breakClashes === 0, 'No classes scheduled during lunch break');
  assert(labCrossesLunch === 0, 'No 2-hour lab block crosses the lunch break interval');

  // Test 5: Interactive Conflict Validator (Drag & Reschedule)
  console.log('\n--- 5. Interactive Conflict Validator Testing ---');
  if (slots.length >= 2) {
    const slotA = slots[0];
    const slotB = slots[1];

    // Attempting to move slotA into the exact slot of slotB using slotB's room
    const conflictResult = validateSlotMove({
      slotToMove: slotA,
      targetDay: slotB.day,
      targetPeriod: slotB.period,
      targetRoomId: slotB.roomId,
      timetable: slots,
      divisions: PRESET_ENGINEERING.divisions,
      rooms: PRESET_ENGINEERING.rooms,
      faculty: PRESET_ENGINEERING.faculty,
      subjects: PRESET_ENGINEERING.subjects,
      config: DEFAULT_CONFIG
    });

    assert(conflictResult.isValid === false, 'Validator correctly flags conflict when moving into an occupied slot');
    assert(conflictResult.conflicts.length > 0, `Validator returns specific conflict messages: "${conflictResult.conflicts[0]?.message}"`);
  }

  // Test 6: Manual Subject Addition Conflict Validation
  console.log('\n--- 6. Manual Subject Addition Validation (Add Subject) ---');
  if (slots.length >= 1) {
    const occupiedSlot = slots[0];

    // Attempting to add a new slot at the exact same time/room as an existing class
    const addConflictResult = validateNewSlot({
      divisionId: PRESET_ENGINEERING.divisions[0].id,
      subjectId: PRESET_ENGINEERING.subjects[0].id,
      facultyId: PRESET_ENGINEERING.faculty[0].id,
      roomId: occupiedSlot.roomId,
      day: occupiedSlot.day,
      period: occupiedSlot.period,
      duration: 1,
      timetable: slots,
      divisions: PRESET_ENGINEERING.divisions,
      rooms: PRESET_ENGINEERING.rooms,
      faculty: PRESET_ENGINEERING.faculty,
      subjects: PRESET_ENGINEERING.subjects,
      config: DEFAULT_CONFIG
    });

    assert(addConflictResult.isValid === false, 'Validator catches collision when manually adding to an occupied classroom/time');
    assert(addConflictResult.conflicts.length > 0, `Collision warning caught: "${addConflictResult.conflicts[0]?.message}"`);
  }

  // Summary
  console.log('\n======================================================');
  console.log(`  RESULTS: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('======================================================\n');
}

runTestSuite().catch(console.error);

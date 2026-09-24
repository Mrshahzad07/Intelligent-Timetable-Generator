// Intelligent Timetable Generator: Hybrid CSP + Heuristic Backtracking Solver
import { ROOM_TYPES, SUBJECT_TYPES } from '../data/models.js';
import { evaluateTimetable } from './fitnessEvaluator.js';

/**
 * Generates an optimized college timetable respecting all hard constraints
 * and maximizing soft constraints.
 * 
 * @param {Object} input - { divisions, rooms, faculty, subjects, config }
 * @param {Function} onProgress - Optional callback for live progress updates
 * @returns {Promise<Object>} - { success, timetable, stats, quality, unallocated }
 */
export async function generateTimetable({ divisions, rooms, faculty, subjects, config }, onProgress = null) {
  const startTime = performance.now();

  const divisionMap = new Map(divisions.map(d => [d.id, d]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const facultyMap = new Map(faculty.map(f => [f.id, f]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  // 1. Build discrete session units to schedule
  const sessionUnits = [];
  subjects.forEach(subject => {
    const duration = subject.duration || (subject.type === SUBJECT_TYPES.PRACTICAL ? 2 : 1);
    for (let i = 0; i < subject.weeklySessions; i++) {
      sessionUnits.push({
        unitId: `${subject.id}_s${i + 1}`,
        subjectId: subject.id,
        divisionId: subject.divisionId,
        facultyId: subject.facultyId,
        duration,
        type: subject.type,
        preferredRoomType: subject.preferredRoomType || (subject.type === SUBJECT_TYPES.PRACTICAL ? ROOM_TYPES.LAB : ROOM_TYPES.LECTURE_HALL),
        priority: duration > 1 ? 100 : 50 // Labs prioritized highest
      });
    }
  });

  // Calculate teacher constraint tightness (fewer available slots = higher priority)
  const teacherTightness = new Map();
  faculty.forEach(f => {
    const unavail = (f.unavailableSlots || []).length;
    teacherTightness.set(f.id, unavail);
  });

  // Sort sessions: Most Constrained Variable (MRV) first
  // 1. Multi-period sessions (Labs) first
  // 2. Teachers with highest unavailability / tightest constraints
  // 3. Higher subject frequency
  sessionUnits.sort((a, b) => {
    if (b.duration !== a.duration) return b.duration - a.duration;
    const tightB = teacherTightness.get(b.facultyId) || 0;
    const tightA = teacherTightness.get(a.facultyId) || 0;
    if (tightB !== tightA) return tightB - tightA;
    return 0;
  });

  // 2. Prepare Timetable Lookup Grid & State
  const days = config.days;
  const periods = config.periods;
  const maxPeriod = Math.max(...periods.map(p => p.index));

  // Occupancy fast matrix: key = `${entityType}_${id}_${day}_${period}`
  const occupied = new Set();
  const divisionDaySubjectCount = {}; // `${divId}_${day}_${subjectId}` -> count
  const facultyDayPeriodCount = {};   // `${facultyId}_${day}` -> count

  function isSlotOccupied(entityType, entityId, day, period) {
    return occupied.has(`${entityType}_${entityId}_${day}_${period}`);
  }

  function markSlot(entityType, entityId, day, period, occupy = true) {
    const key = `${entityType}_${entityId}_${day}_${period}`;
    if (occupy) {
      occupied.add(key);
    } else {
      occupied.delete(key);
    }
  }

  // Pre-mark teacher unavailability and lunch break
  periods.forEach(p => {
    if (p.isBreak) {
      days.forEach(day => {
        divisions.forEach(d => markSlot('div', d.id, day, p.index, true));
        rooms.forEach(r => markSlot('room', r.id, day, p.index, true));
        faculty.forEach(f => markSlot('fac', f.id, day, p.index, true));
      });
    }
  });

  // Mark teacher specific unavailable slots
  faculty.forEach(f => {
    (f.unavailableSlots || []).forEach(un => {
      const fullDay = days.find(d => d.startsWith(un.day)) || un.day;
      markSlot('fac', f.id, fullDay, un.period, true);
    });
  });

  const allocations = []; // final array of allocated slots
  let iterations = 0;
  const MAX_ITERATIONS = 35000;
  let bestAllocations = [];

  // 3. Candidate Domain Generator
  function getCandidateSlots(unit) {
    const division = divisionMap.get(unit.divisionId);
    const suitableRooms = rooms.filter(r => {
      if (unit.preferredRoomType === ROOM_TYPES.LAB) {
        return r.type === ROOM_TYPES.LAB;
      }
      // For theory, prefer lecture halls; labs allowed only if no other option
      return r.type === ROOM_TYPES.LECTURE_HALL || r.type === ROOM_TYPES.SEMINAR || r.type === ROOM_TYPES.LAB;
    }).filter(r => r.capacity >= (division?.studentCount || 0));

    const candidates = [];

    for (const day of days) {
      for (const p of periods) {
        const startPeriod = p.index;
        const endPeriod = startPeriod + unit.duration - 1;

        if (endPeriod > maxPeriod) continue;

        // Check if any period in block hits a lunch break or boundary
        let hasBreak = false;
        for (let pt = startPeriod; pt <= endPeriod; pt++) {
          const pObj = periods.find(item => item.index === pt);
          if (!pObj || pObj.isBreak) {
            hasBreak = true;
            break;
          }
        }
        if (hasBreak) continue;

        // Check division and faculty availability for ALL periods of duration
        let divOrFacBusy = false;
        for (let pt = startPeriod; pt <= endPeriod; pt++) {
          if (isSlotOccupied('div', unit.divisionId, day, pt) ||
              isSlotOccupied('fac', unit.facultyId, day, pt)) {
            divOrFacBusy = true;
            break;
          }
        }
        if (divOrFacBusy) continue;

        // Check suitable rooms that are free for ALL periods
        for (const room of suitableRooms) {
          let roomBusy = false;
          for (let pt = startPeriod; pt <= endPeriod; pt++) {
            if (isSlotOccupied('room', room.id, day, pt)) {
              roomBusy = true;
              break;
            }
          }
          if (!roomBusy) {
            // Calculate heuristic score (lower is better)
            let heuristicPenalty = 0;

            // Penalty if division already has this subject today
            const divDaySubKey = `${unit.divisionId}_${day}_${unit.subjectId}`;
            const sameDayCount = divisionDaySubjectCount[divDaySubKey] || 0;
            if (sameDayCount > 0) {
              heuristicPenalty += 20 * sameDayCount;
            }

            // Penalty for faculty daily load
            const facDayKey = `${unit.facultyId}_${day}`;
            const facDayLoad = facultyDayPeriodCount[facDayKey] || 0;
            heuristicPenalty += facDayLoad * 5;

            // Practicals prefer afternoon, theory prefers morning
            if (unit.duration > 1) {
              if (startPeriod < 4) heuristicPenalty += 8; // labs prefer afternoon
            } else {
              if (startPeriod > 4) heuristicPenalty += 3; // theory slightly prefers morning
            }

            candidates.push({
              day,
              period: startPeriod,
              duration: unit.duration,
              roomId: room.id,
              penalty: heuristicPenalty
            });
          }
        }
      }
    }

    // Sort candidates: Lowest penalty first (Least Constraining Value)
    candidates.sort((a, b) => a.penalty - b.penalty);
    return candidates;
  }

  // 4. Backtracking Search Engine
  function backtrack(unitIndex) {
    iterations++;

    if (allocations.length > bestAllocations.length) {
      bestAllocations = [...allocations];
    }

    if (unitIndex >= sessionUnits.length) {
      return true; // All units successfully placed!
    }

    if (iterations > MAX_ITERATIONS) {
      return false; // Iteration ceiling reached
    }

    const unit = sessionUnits[unitIndex];
    const candidateSlots = getCandidateSlots(unit);

    for (const slot of candidateSlots) {
      // 1. Make allocation
      for (let offset = 0; offset < unit.duration; offset++) {
        const pt = slot.period + offset;
        markSlot('div', unit.divisionId, slot.day, pt, true);
        markSlot('fac', unit.facultyId, slot.day, pt, true);
        markSlot('room', slot.roomId, slot.day, pt, true);
      }

      const divDaySubKey = `${unit.divisionId}_${slot.day}_${unit.subjectId}`;
      divisionDaySubjectCount[divDaySubKey] = (divisionDaySubjectCount[divDaySubKey] || 0) + 1;

      const facDayKey = `${unit.facultyId}_${slot.day}`;
      facultyDayPeriodCount[facDayKey] = (facultyDayPeriodCount[facDayKey] || 0) + unit.duration;

      const allocatedItem = {
        id: `slot_${unit.unitId}_${slot.day}_${slot.period}`,
        unitId: unit.unitId,
        subjectId: unit.subjectId,
        divisionId: unit.divisionId,
        facultyId: unit.facultyId,
        roomId: slot.roomId,
        day: slot.day,
        period: slot.period,
        duration: unit.duration
      };

      allocations.push(allocatedItem);

      // Recurse to next unit
      if (backtrack(unitIndex + 1)) {
        return true;
      }

      // Backtrack (undo move)
      allocations.pop();

      for (let offset = 0; offset < unit.duration; offset++) {
        const pt = slot.period + offset;
        markSlot('div', unit.divisionId, slot.day, pt, false);
        markSlot('fac', unit.facultyId, slot.day, pt, false);
        markSlot('room', slot.roomId, slot.day, pt, false);
      }

      divisionDaySubjectCount[divDaySubKey] = Math.max(0, divisionDaySubjectCount[divDaySubKey] - 1);
      facultyDayPeriodCount[facDayKey] = Math.max(0, facultyDayPeriodCount[facDayKey] - unit.duration);
    }

    return false;
  }

  // Execute CSP Backtracking
  const fullSuccess = backtrack(0);
  const finalTimetable = fullSuccess ? allocations : bestAllocations;

  // Identify unallocated sessions if partial
  const allocatedUnitIds = new Set(finalTimetable.map(s => s.unitId));
  const unallocatedUnits = sessionUnits.filter(u => !allocatedUnitIds.has(u.unitId)).map(u => {
    const sub = subjectMap.get(u.subjectId);
    const div = divisionMap.get(u.divisionId);
    const fac = facultyMap.get(u.facultyId);
    return {
      unitId: u.unitId,
      subjectName: sub?.name || u.subjectId,
      divisionName: div?.shortCode || u.divisionId,
      facultyName: fac?.name || u.facultyId,
      duration: u.duration,
      reason: 'No conflict-free slot found within constraints (Room/Teacher saturated)'
    };
  });

  const endTime = performance.now();
  const timeMs = Math.round(endTime - startTime);

  // Evaluate quality
  const quality = evaluateTimetable(finalTimetable, { divisions, rooms, faculty, subjects, config });

  return {
    success: fullSuccess && unallocatedUnits.length === 0,
    isPartial: unallocatedUnits.length > 0,
    timetable: finalTimetable,
    unallocated: unallocatedUnits,
    stats: {
      totalUnits: sessionUnits.length,
      placedUnits: finalTimetable.length,
      unallocatedCount: unallocatedUnits.length,
      iterations,
      timeMs,
      fitnessScore: quality.fitnessScore,
      hardViolations: quality.hardViolations
    },
    quality
  };
}

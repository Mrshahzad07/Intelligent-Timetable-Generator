// Feasibility Checker & Mathematical Impossibility Detector
import { ROOM_TYPES, SUBJECT_TYPES } from '../data/models.js';

/**
 * Pre-flight feasibility diagnostic engine.
 * Applies pigeonhole principle, graph matching bounds, and capacity checks
 * to detect impossible or conflicting constraints BEFORE running the solver.
 */
export function checkFeasibility(divisions, rooms, faculty, subjects, config) {
  const activePeriods = config.periods.filter(p => !p.isBreak);
  const totalAcademicPeriodsPerDay = activePeriods.length;
  const totalAcademicDays = config.days.length;
  const totalAvailableSlotsPerDivision = totalAcademicDays * totalAcademicPeriodsPerDay;

  const criticalErrors = [];
  const warnings = [];
  const autoFixSuggestions = [];

  // 1. Division Slot Overflow (Pigeonhole Principle)
  divisions.forEach(div => {
    const divSubjects = subjects.filter(s => s.divisionId === div.id);
    const totalRequiredPeriods = divSubjects.reduce((acc, s) => {
      return acc + (s.weeklySessions * (s.duration || 1));
    }, 0);

    if (totalRequiredPeriods > totalAvailableSlotsPerDivision) {
      const excess = totalRequiredPeriods - totalAvailableSlotsPerDivision;
      criticalErrors.push({
        id: `err-div-overflow-${div.id}`,
        type: 'DIVISION_OVERFLOW',
        entityId: div.id,
        entityName: div.name,
        severity: 'CRITICAL',
        title: `Pigeonhole Violation: ${div.shortCode || div.name} Over-Subscribed`,
        message: `${div.name} requires ${totalRequiredPeriods} academic periods per week, but only ${totalAvailableSlotsPerDivision} periods are available (${totalAcademicDays} days × ${totalAcademicPeriodsPerDay} periods).`,
        metric: {
          required: totalRequiredPeriods,
          available: totalAvailableSlotsPerDivision,
          excess
        },
        suggestion: `Reduce weekly hours by ${excess} or increase working days/periods per day.`
      });

      autoFixSuggestions.push({
        id: `fix-div-${div.id}`,
        title: `Trim ${excess} Excess Periods from ${div.shortCode}`,
        actionType: 'REDUCE_DIVISION_SESSIONS',
        divisionId: div.id,
        excessCount: excess
      });
    } else if (totalRequiredPeriods === totalAvailableSlotsPerDivision) {
      warnings.push({
        id: `warn-div-packed-${div.id}`,
        type: 'DIVISION_PACKED',
        entityName: div.name,
        severity: 'WARNING',
        title: `${div.shortCode} Schedule 100% Saturated`,
        message: `${div.name} utilizes every available period with 0 buffer for assemblies, remediation, or sports.`
      });
    }
  });

  // 2. Faculty Overload & Availability Bottlenecks
  faculty.forEach(fac => {
    const facSubjects = subjects.filter(s => s.facultyId === fac.id);
    const assignedPeriods = facSubjects.reduce((acc, s) => {
      return acc + (s.weeklySessions * (s.duration || 1));
    }, 0);

    // Check Max Weekly Limit
    if (assignedPeriods > fac.maxWeeklyLectures) {
      const excess = assignedPeriods - fac.maxWeeklyLectures;
      criticalErrors.push({
        id: `err-fac-weekly-${fac.id}`,
        type: 'FACULTY_OVERLOAD',
        entityId: fac.id,
        entityName: fac.name,
        severity: 'CRITICAL',
        title: `Faculty Weekly Overload: ${fac.name}`,
        message: `${fac.name} is assigned ${assignedPeriods} periods across all subjects, exceeding their contracted maximum limit of ${fac.maxWeeklyLectures} periods/week.`,
        metric: {
          required: assignedPeriods,
          available: fac.maxWeeklyLectures,
          excess
        },
        suggestion: `Reassign ${excess} periods to another faculty member or increase ${fac.name}'s max weekly load.`
      });

      autoFixSuggestions.push({
        id: `fix-fac-load-${fac.id}`,
        title: `Increase ${fac.name} Max Hours to ${assignedPeriods}`,
        actionType: 'INCREASE_FACULTY_LOAD',
        facultyId: fac.id,
        newLimit: assignedPeriods
      });
    }

    // Check Available Time Slots against Unavailability
    const totalUnavailableSlots = (fac.unavailableSlots || []).length;
    const teacherAvailableSlots = totalAvailableSlotsPerDivision - totalUnavailableSlots;

    if (assignedPeriods > teacherAvailableSlots) {
      const deficit = assignedPeriods - teacherAvailableSlots;
      criticalErrors.push({
        id: `err-fac-unavail-${fac.id}`,
        type: 'FACULTY_UNAVAILABILITY_CLASH',
        entityId: fac.id,
        entityName: fac.name,
        severity: 'CRITICAL',
        title: `Impossible Availability: ${fac.name}`,
        message: `${fac.name} needs to teach ${assignedPeriods} periods, but is only available for ${teacherAvailableSlots} periods due to ${totalUnavailableSlots} marked unavailable slots.`,
        metric: {
          required: assignedPeriods,
          available: teacherAvailableSlots,
          excess: deficit
        },
        suggestion: `Clear ${deficit} unavailable slots or reassign courses.`
      });

      autoFixSuggestions.push({
        id: `fix-fac-unavail-${fac.id}`,
        title: `Clear Unavailable Slots for ${fac.name}`,
        actionType: 'CLEAR_FACULTY_UNAVAILABLE',
        facultyId: fac.id
      });
    }
  });

  // 3. Room Resource Bottlenecks (Labs & Classrooms)
  const labRooms = rooms.filter(r => r.type === ROOM_TYPES.LAB);
  const lectureRooms = rooms.filter(r => r.type === ROOM_TYPES.LECTURE_HALL || r.type === ROOM_TYPES.SEMINAR);

  // Practical / Lab Demand Check
  const practicalSubjects = subjects.filter(s => s.type === SUBJECT_TYPES.PRACTICAL || s.preferredRoomType === ROOM_TYPES.LAB);
  const totalPracticalSessions = practicalSubjects.reduce((acc, s) => acc + s.weeklySessions, 0);
  const totalLabPeriodsNeeded = practicalSubjects.reduce((acc, s) => acc + (s.weeklySessions * (s.duration || 2)), 0);

  // Maximum continuous 2-period lab blocks per day:
  // e.g. in 6 periods [1,2,3, lunch, 4,5,6], valid 2-period blocks are (1,2) and (4,5) or (5,6) -> approx 2-3 per day
  const validLabBlocksPerDay = countValidContinuousBlocks(config.periods, 2);
  const totalLabBlocksCapacity = labRooms.length * totalAcademicDays * validLabBlocksPerDay;

  if (labRooms.length === 0 && totalPracticalSessions > 0) {
    criticalErrors.push({
      id: 'err-no-labs',
      type: 'NO_LABS',
      severity: 'CRITICAL',
      title: 'Missing Lab Rooms',
      message: `${totalPracticalSessions} practical lab sessions are required, but zero lab rooms are configured in the college repository.`,
      suggestion: 'Add at least one laboratory room with suitable capacity.'
    });

    autoFixSuggestions.push({
      id: 'fix-add-lab',
      title: 'Create Default Computer Lab (CL-01)',
      actionType: 'ADD_LAB_ROOM'
    });
  } else if (totalPracticalSessions > totalLabBlocksCapacity) {
    const deficit = totalPracticalSessions - totalLabBlocksCapacity;
    criticalErrors.push({
      id: 'err-lab-capacity-deficit',
      type: 'LAB_CAPACITY_DEFICIT',
      severity: 'CRITICAL',
      title: 'Laboratory Capacity Deficit',
      message: `Curriculum demands ${totalPracticalSessions} lab sessions (${totalLabPeriodsNeeded} hours), but ${labRooms.length} available lab(s) can host at most ${totalLabBlocksCapacity} continuous 2-hour blocks per week.`,
      metric: {
        required: totalPracticalSessions,
        available: totalLabBlocksCapacity,
        excess: deficit
      },
      suggestion: `Add ${Math.ceil(deficit / (totalAcademicDays * validLabBlocksPerDay))} additional lab room(s) or convert practical hours to theory.`
    });

    autoFixSuggestions.push({
      id: 'fix-add-lab-deficit',
      title: 'Add New Laboratory Room to Meet Demand',
      actionType: 'ADD_LAB_ROOM'
    });
  }

  // Check Classroom Capacity against Division Student Count
  divisions.forEach(div => {
    const suitableRooms = rooms.filter(r => r.capacity >= div.studentCount);
    if (suitableRooms.length === 0) {
      criticalErrors.push({
        id: `err-room-capacity-${div.id}`,
        type: 'ROOM_CAPACITY_EXCEEDED',
        entityId: div.id,
        entityName: div.name,
        severity: 'CRITICAL',
        title: `Room Capacity Shortage for ${div.shortCode}`,
        message: `${div.name} has ${div.studentCount} students, but the largest room in the college has capacity ${Math.max(0, ...rooms.map(r => r.capacity))}.`,
        suggestion: `Increase room capacities or split division into smaller cohorts.`
      });

      autoFixSuggestions.push({
        id: `fix-expand-rooms-${div.id}`,
        title: `Upgrade Lecture Hall Capacities to ${div.studentCount + 10} Seats`,
        actionType: 'EXPAND_ROOM_CAPACITY',
        targetCapacity: div.studentCount + 10
      });
    }
  });

  // 4. Simultaneous Division Concurrency
  // If at any point N divisions need classes simultaneously, we need at least N rooms.
  if (divisions.length > rooms.length) {
    warnings.push({
      id: 'warn-room-concurrency',
      type: 'ROOM_CONCURRENCY',
      severity: 'WARNING',
      title: 'High Room Concurrency Risk',
      message: `There are ${divisions.length} divisions but only ${rooms.length} total rooms/labs. During peak periods, all divisions cannot have class simultaneously without room contention.`
    });
  }

  return {
    isFeasible: criticalErrors.length === 0,
    criticalErrors,
    warnings,
    autoFixSuggestions,
    metrics: {
      totalAcademicDays,
      totalAcademicPeriodsPerDay,
      totalAvailableSlotsPerDivision,
      totalRequiredPeriodsAcrossAllDivisions: subjects.reduce((a, s) => a + (s.weeklySessions * (s.duration || 1)), 0),
      totalFacultyCapacity: faculty.reduce((a, f) => a + f.maxWeeklyLectures, 0),
      totalLabBlocksCapacity
    }
  };
}

/**
 * Calculates how many 2-period continuous blocks fit in a day without crossing lunch breaks
 */
export function countValidContinuousBlocks(periods, duration = 2) {
  let count = 0;
  for (let i = 0; i <= periods.length - duration; i++) {
    let valid = true;
    for (let k = 0; k < duration; k++) {
      if (periods[i + k].isBreak) {
        valid = false;
        break;
      }
    }
    if (valid) {
      count++;
      i += (duration - 1); // jump non-overlapping blocks
    }
  }
  return Math.max(1, count);
}

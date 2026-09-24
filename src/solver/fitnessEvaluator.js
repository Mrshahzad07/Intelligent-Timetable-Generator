// Fitness Evaluator & Constraint Quality Scorer
import { ROOM_TYPES } from '../data/models.js';

/**
 * Evaluates both Hard Constraint violations and Soft Constraint quality.
 * Returns a comprehensive score from 0 to 100 with detailed diagnostic breakdown.
 */
export function evaluateTimetable(timetable, { divisions, rooms, faculty, subjects, config }) {
  let hardViolations = 0;
  const hardViolationDetails = [];

  let softPenalty = 0;
  const softIssues = [];

  const divisionMap = new Map(divisions.map(d => [d.id, d]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const facultyMap = new Map(faculty.map(f => [f.id, f]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  // Index allocations by time slot: [day][period]
  const slotIndex = {};
  const facultyDayPeriods = {}; // facId -> day -> Set of periods
  const divisionDayPeriods = {}; // divId -> day -> Set of periods
  const divisionDaySubjects = {}; // divId -> day -> subjectId -> count

  // Initialize tracking
  faculty.forEach(f => {
    facultyDayPeriods[f.id] = {};
    config.days.forEach(d => { facultyDayPeriods[f.id][d] = []; });
  });

  divisions.forEach(div => {
    divisionDayPeriods[div.id] = {};
    divisionDaySubjects[div.id] = {};
    config.days.forEach(d => {
      divisionDayPeriods[div.id][d] = [];
      divisionDaySubjects[div.id][d] = {};
    });
  });

  // Track room and teacher usage per (day, period)
  const roomUsage = new Map(); // `${roomId}-${day}-${period}` -> slot
  const facUsage = new Map();  // `${facultyId}-${day}-${period}` -> slot
  const divUsage = new Map();  // `${divId}-${day}-${period}` -> slot

  timetable.forEach(slot => {
    const { day, period, duration = 1, divisionId, facultyId, roomId, subjectId } = slot;
    const subject = subjectMap.get(subjectId);
    const room = roomMap.get(roomId);
    const teacher = facultyMap.get(facultyId);
    const division = divisionMap.get(divisionId);

    for (let offset = 0; offset < duration; offset++) {
      const currentPeriod = period + offset;
      const key = `${day}-${currentPeriod}`;

      // Check lunch break violation
      const periodConfig = config.periods.find(p => p.index === currentPeriod);
      if (periodConfig?.isBreak) {
        hardViolations++;
        hardViolationDetails.push({
          type: 'BREAK_VIOLATION',
          message: `Class for ${division?.shortCode || divisionId} scheduled during ${periodConfig.name} on ${day}.`
        });
      }

      // Check Room Conflict
      const roomKey = `${roomId}-${key}`;
      if (roomUsage.has(roomKey)) {
        hardViolations++;
        hardViolationDetails.push({
          type: 'ROOM_CONFLICT',
          message: `Room ${room?.name} is double-booked on ${day} Period ${currentPeriod}.`
        });
      } else {
        roomUsage.set(roomKey, slot);
      }

      // Check Teacher Conflict
      const facKey = `${facultyId}-${key}`;
      if (facUsage.has(facKey)) {
        hardViolations++;
        hardViolationDetails.push({
          type: 'TEACHER_CONFLICT',
          message: `Teacher ${teacher?.name} is double-booked on ${day} Period ${currentPeriod}.`
        });
      } else {
        facUsage.set(facKey, slot);
      }

      // Check Division Conflict
      const divKey = `${divisionId}-${key}`;
      if (divUsage.has(divKey)) {
        hardViolations++;
        hardViolationDetails.push({
          type: 'DIVISION_CONFLICT',
          message: `Division ${division?.shortCode} has two classes scheduled at once on ${day} Period ${currentPeriod}.`
        });
      } else {
        divUsage.set(divKey, slot);
      }

      // Check Teacher Unavailability
      const dayShort = config.dayShort[config.days.indexOf(day)];
      const isUnavailable = (teacher?.unavailableSlots || []).some(
        un => (un.day === day || un.day === dayShort) && un.period === currentPeriod
      );
      if (isUnavailable) {
        hardViolations++;
        hardViolationDetails.push({
          type: 'TEACHER_UNAVAILABLE',
          message: `${teacher?.name} is scheduled on ${day} Period ${currentPeriod} which is marked as unavailable.`
        });
      }

      // Record periods for soft constraints
      if (facultyDayPeriods[facultyId] && facultyDayPeriods[facultyId][day]) {
        facultyDayPeriods[facultyId][day].push(currentPeriod);
      }
      if (divisionDayPeriods[divisionId] && divisionDayPeriods[divisionId][day]) {
        divisionDayPeriods[divisionId][day].push(currentPeriod);
      }
    }

    // Room suitability & capacity
    if (subject && room) {
      if (subject.preferredRoomType === ROOM_TYPES.LAB && room.type !== ROOM_TYPES.LAB) {
        hardViolations++;
        hardViolationDetails.push({
          type: 'ROOM_TYPE_MISMATCH',
          message: `Practical subject ${subject.name} assigned to regular lecture room ${room.name}.`
        });
      }
      if (division && room.capacity < division.studentCount) {
        hardViolations++;
        hardViolationDetails.push({
          type: 'CAPACITY_DEFICIT',
          message: `Room ${room.name} (Cap: ${room.capacity}) is too small for ${division.name} (${division.studentCount} students).`
        });
      }
    }

    // Record subject occurrences per day
    if (divisionDaySubjects[divisionId]?.[day]) {
      divisionDaySubjects[divisionId][day][subjectId] = (divisionDaySubjects[divisionId][day][subjectId] || 0) + 1;
    }
  });

  // Soft Constraint 1: Subject Daily Spread
  // Penalize having more than 1 theory lecture of the same subject on the same day for a division
  divisions.forEach(div => {
    config.days.forEach(day => {
      const counts = divisionDaySubjects[div.id][day];
      Object.entries(counts).forEach(([subId, count]) => {
        const sub = subjectMap.get(subId);
        if (sub && sub.type !== 'practical' && count > 1) {
          const penalty = (count - 1) * 15;
          softPenalty += penalty;
          softIssues.push({
            type: 'SUBJECT_REPEAT',
            message: `${div.shortCode} has ${count} lectures of ${sub.name} on ${day}.`
          });
        }
      });
    });
  });

  // Soft Constraint 2: Faculty Daily Overload & Consecutive Fatigue
  faculty.forEach(fac => {
    config.days.forEach(day => {
      const periods = (facultyDayPeriods[fac.id][day] || []).sort((a, b) => a - b);
      if (periods.length > fac.maxDailyLectures) {
        const excess = periods.length - fac.maxDailyLectures;
        softPenalty += excess * 12;
        softIssues.push({
          type: 'FACULTY_DAILY_OVERLOAD',
          message: `${fac.name} has ${periods.length} periods on ${day} (max: ${fac.maxDailyLectures}).`
        });
      }

      // Check consecutive hours
      let consecutive = 1;
      for (let i = 1; i < periods.length; i++) {
        if (periods[i] === periods[i - 1] + 1) {
          consecutive++;
          if (consecutive >= 3) {
            softPenalty += 8;
            softIssues.push({
              type: 'FACULTY_FATIGUE',
              message: `${fac.name} has ${consecutive} consecutive teaching periods on ${day}.`
            });
          }
        } else {
          consecutive = 1;
        }
      }
    });
  });

  // Soft Constraint 3: Student Schedule Gaps (Isolated idle periods)
  divisions.forEach(div => {
    config.days.forEach(day => {
      const periods = (divisionDayPeriods[div.id][day] || []).sort((a, b) => a - b);
      if (periods.length >= 2) {
        for (let i = 0; i < periods.length - 1; i++) {
          const gap = periods[i + 1] - periods[i] - 1;
          // Ignore lunch break gap
          const midPeriod = periods[i] + 1;
          const isMidLunch = config.periods.find(p => p.index === midPeriod)?.isBreak;
          if (gap === 1 && !isMidLunch) {
            softPenalty += 10;
            softIssues.push({
              type: 'STUDENT_WINDOW_GAP',
              message: `${div.shortCode} has an isolated free period on ${day} at Period ${midPeriod}.`
            });
          }
        }
      }
    });
  });

  // Calculate normalized Fitness Score (0 - 100)
  // Hard violations strictly cap fitness
  let fitnessScore = 100;
  if (hardViolations > 0) {
    fitnessScore = Math.max(0, Math.round(50 - hardViolations * 10));
  } else {
    fitnessScore = Math.max(70, Math.round(100 - (softPenalty * 0.15)));
  }

  // Room Utilization percentage
  const totalAvailableRoomSlots = rooms.length * config.days.length * config.periods.filter(p => !p.isBreak).length;
  const totalOccupiedRoomSlots = timetable.reduce((acc, s) => acc + (s.duration || 1), 0);
  const roomUtilization = totalAvailableRoomSlots > 0 ? Math.round((totalOccupiedRoomSlots / totalAvailableRoomSlots) * 100) : 0;

  return {
    fitnessScore,
    hardViolations,
    hardViolationDetails,
    softPenalty,
    softIssuesCount: softIssues.length,
    softIssues: softIssues.slice(0, 10), // sample top 10
    roomUtilization,
    isHardCompliant: hardViolations === 0
  };
}

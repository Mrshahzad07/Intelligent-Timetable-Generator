// Interactive Conflict Validator for Manual Moves and Swaps
import { ROOM_TYPES } from '../data/models.js';

/**
 * Validates whether moving a slot to a target day/period/room causes hard constraint conflicts.
 */
export function validateSlotMove({
  slotToMove,
  targetDay,
  targetPeriod,
  targetRoomId,
  timetable,
  divisions,
  rooms,
  faculty,
  subjects,
  config
}) {
  const conflicts = [];
  const duration = slotToMove.duration || 1;
  const maxPeriod = Math.max(...config.periods.map(p => p.index));

  const divisionMap = new Map(divisions.map(d => [d.id, d]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const facultyMap = new Map(faculty.map(f => [f.id, f]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  const currentSubject = subjectMap.get(slotToMove.subjectId);
  const currentFaculty = facultyMap.get(slotToMove.facultyId);
  const currentDivision = divisionMap.get(slotToMove.divisionId);
  const targetRoom = roomMap.get(targetRoomId);

  // 1. Boundary and Lunch Break Check
  for (let offset = 0; offset < duration; offset++) {
    const pt = targetPeriod + offset;
    if (pt > maxPeriod) {
      conflicts.push({
        type: 'OUT_OF_BOUNDS',
        message: `Slot extends beyond the end of the academic day.`
      });
      break;
    }
    const periodConf = config.periods.find(p => p.index === pt);
    if (periodConf?.isBreak) {
      conflicts.push({
        type: 'BREAK_COLLISION',
        message: `Overlaps with ${periodConf.name}. Academic classes cannot be scheduled during breaks.`
      });
    }
  }

  // 2. Room Type & Capacity Suitability
  if (targetRoom && currentSubject) {
    if (currentSubject.preferredRoomType === ROOM_TYPES.LAB && targetRoom.type !== ROOM_TYPES.LAB) {
      conflicts.push({
        type: 'ROOM_TYPE_MISMATCH',
        message: `Lab subject ${currentSubject.name} requires a laboratory room, but ${targetRoom.name} is a ${targetRoom.type}.`
      });
    }
    if (currentDivision && targetRoom.capacity < currentDivision.studentCount) {
      conflicts.push({
        type: 'CAPACITY_DEFICIT',
        message: `Room ${targetRoom.name} (Cap: ${targetRoom.capacity}) is smaller than ${currentDivision.shortCode} class size (${currentDivision.studentCount}).`
      });
    }
  }

  // 3. Faculty Unavailability
  for (let offset = 0; offset < duration; offset++) {
    const pt = targetPeriod + offset;
    const isUnavail = (currentFaculty?.unavailableSlots || []).some(
      un => (un.day === targetDay || targetDay.startsWith(un.day)) && un.period === pt
    );
    if (isUnavail) {
      conflicts.push({
        type: 'FACULTY_UNAVAILABLE',
        message: `${currentFaculty?.name} is marked unavailable on ${targetDay} at Period ${pt}.`
      });
    }
  }

  // 4. Overlap with Existing Timetable (excluding the slot itself)
  const otherSlots = timetable.filter(s => s.id !== slotToMove.id);

  for (const other of otherSlots) {
    if (other.day !== targetDay) continue;

    const otherStart = other.period;
    const otherEnd = other.period + (other.duration || 1) - 1;
    const myStart = targetPeriod;
    const myEnd = targetPeriod + duration - 1;

    // Check if time ranges overlap
    const hasOverlap = Math.max(myStart, otherStart) <= Math.min(myEnd, otherEnd);

    if (hasOverlap) {
      const otherSub = subjectMap.get(other.subjectId);
      const otherFac = facultyMap.get(other.facultyId);
      const otherDiv = divisionMap.get(other.divisionId);
      const otherRm = roomMap.get(other.roomId);

      // Check Teacher clash
      if (other.facultyId === slotToMove.facultyId) {
        conflicts.push({
          type: 'TEACHER_CONFLICT',
          message: `${currentFaculty?.name} is already teaching ${otherSub?.name} for ${otherDiv?.shortCode} during this period.`
        });
      }

      // Check Division clash
      if (other.divisionId === slotToMove.divisionId) {
        conflicts.push({
          type: 'DIVISION_CONFLICT',
          message: `${currentDivision?.shortCode} already has ${otherSub?.name} scheduled in this period.`
        });
      }

      // Check Room clash
      if (other.roomId === targetRoomId) {
        conflicts.push({
          type: 'ROOM_CONFLICT',
          message: `Room ${targetRoom?.name} is occupied by ${otherDiv?.shortCode} (${otherSub?.name}) at this time.`
        });
      }
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts
  };
}

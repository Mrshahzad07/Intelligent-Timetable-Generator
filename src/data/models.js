// Data Models, Schemas, Constraint Definitions & Entity Factories
// for ChronosAI Intelligent College Timetable Generator

export const ROOM_TYPES = {
  LECTURE_HALL: 'lecture_hall',
  LAB: 'lab',
  SEMINAR: 'seminar'
};

export const SUBJECT_TYPES = {
  THEORY: 'theory',
  PRACTICAL: 'practical'
};

export const HARD_CONSTRAINTS = {
  TEACHER_CONFLICT: 'TEACHER_CONFLICT',           // No teacher in 2 rooms at the same time
  ROOM_CONFLICT: 'ROOM_CONFLICT',                 // No room hosts 2 classes at the same time
  DIVISION_CONFLICT: 'DIVISION_CONFLICT',         // No division attends 2 classes at the same time
  ROOM_TYPE_MISMATCH: 'ROOM_TYPE_MISMATCH',       // Labs must take place in lab rooms
  ROOM_CAPACITY_DEFICIT: 'ROOM_CAPACITY_DEFICIT', // Room capacity must >= student count
  BREAK_COLLISION: 'BREAK_COLLISION',             // No classes during lunch/break intervals
  TEACHER_UNAVAILABLE: 'TEACHER_UNAVAILABLE',     // Teacher not scheduled during their off-slots
  LAB_BLOCK_CONTINUITY: 'LAB_BLOCK_CONTINUITY'    // Practical 2h sessions must be consecutive without lunch split
};

export const SOFT_CONSTRAINTS = {
  SUBJECT_SPREAD: 'SUBJECT_SPREAD',               // Distribute theory subjects across different days
  FACULTY_FATIGUE: 'FACULTY_FATIGUE',             // Avoid 3+ consecutive hours for teachers
  FACULTY_DAILY_MAX: 'FACULTY_DAILY_MAX',         // Avoid exceeding teacher daily max classes
  STUDENT_HOLE_GAP: 'STUDENT_HOLE_GAP',           // Minimize idle window gaps in student schedules
  PREFERRED_TIME: 'PREFERRED_TIME'                // Theory preferred morning, labs preferred afternoon
};

export const DEFAULT_CONFIG = {
  collegeName: 'Apex Institute of Technology & Engineering',
  academicTerm: 'Autumn Semester 2026-27',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  dayShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  periods: [
    { index: 1, name: 'Period 1', time: '09:00 - 10:00', isBreak: false },
    { index: 2, name: 'Period 2', time: '10:00 - 11:00', isBreak: false },
    { index: 3, name: 'Period 3', time: '11:15 - 12:15', isBreak: false },
    { index: 4, name: 'Lunch Break', time: '12:15 - 01:15', isBreak: true },
    { index: 5, name: 'Period 4', time: '01:15 - 02:15', isBreak: false },
    { index: 6, name: 'Period 5', time: '02:15 - 03:15', isBreak: false },
    { index: 7, name: 'Period 6', time: '03:15 - 04:15', isBreak: false }
  ]
};

export const SUBJECT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16'  // lime
];

/**
 * Factory for creating Division entity
 */
export function createDivision({
  id = `div-${Date.now()}`,
  name = 'New Division',
  shortCode = 'DIV',
  studentCount = 60,
  year = 3,
  color = '#3b82f6'
} = {}) {
  return { id, name, shortCode, studentCount, year, color };
}

/**
 * Factory for creating Classroom/Lab entity
 */
export function createRoom({
  id = `room-${Date.now()}`,
  name = 'LH-101',
  type = ROOM_TYPES.LECTURE_HALL,
  capacity = 75,
  building = 'Academic Block A',
  equipment = 'Standard Projector'
} = {}) {
  return { id, name, type, capacity, building, equipment };
}

/**
 * Factory for creating Faculty member entity
 */
export function createFaculty({
  id = `fac-${Date.now()}`,
  name = 'New Faculty',
  department = 'Computer Science',
  email = 'faculty@college.edu',
  maxDailyLectures = 3,
  maxWeeklyLectures = 14,
  unavailableSlots = []
} = {}) {
  return {
    id,
    name,
    department,
    email,
    maxDailyLectures,
    maxWeeklyLectures,
    unavailableSlots
  };
}

/**
 * Factory for creating Subject entity
 */
export function createSubject({
  id = `sub-${Date.now()}`,
  name = 'Subject Name',
  code = 'CS101',
  type = SUBJECT_TYPES.THEORY,
  divisionId = '',
  facultyId = '',
  weeklySessions = 3,
  duration = 1,
  preferredRoomType = ROOM_TYPES.LECTURE_HALL,
  color = '#3b82f6'
} = {}) {
  return {
    id,
    name,
    code,
    type,
    divisionId,
    facultyId,
    weeklySessions,
    duration: type === SUBJECT_TYPES.PRACTICAL ? 2 : duration,
    preferredRoomType: type === SUBJECT_TYPES.PRACTICAL ? ROOM_TYPES.LAB : preferredRoomType,
    color
  };
}

/**
 * Validates a Division entity
 */
export function validateDivision(div) {
  const errors = [];
  if (!div.name?.trim()) errors.push('Division name cannot be empty');
  if (!div.shortCode?.trim()) errors.push('Division short code cannot be empty');
  if (!div.studentCount || div.studentCount <= 0) errors.push('Student count must be greater than 0');
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a Room entity
 */
export function validateRoom(room) {
  const errors = [];
  if (!room.name?.trim()) errors.push('Room name cannot be empty');
  if (!Object.values(ROOM_TYPES).includes(room.type)) errors.push('Invalid room type');
  if (!room.capacity || room.capacity <= 0) errors.push('Room capacity must be greater than 0');
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a Faculty entity
 */
export function validateFaculty(fac) {
  const errors = [];
  if (!fac.name?.trim()) errors.push('Faculty name cannot be empty');
  if (!fac.maxDailyLectures || fac.maxDailyLectures <= 0) errors.push('Max daily lectures must be at least 1');
  if (!fac.maxWeeklyLectures || fac.maxWeeklyLectures < fac.maxDailyLectures) {
    errors.push('Max weekly lectures cannot be less than max daily lectures');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a Subject entity
 */
export function validateSubject(sub, { divisions = [], faculty = [] } = {}) {
  const errors = [];
  if (!sub.name?.trim()) errors.push('Subject name cannot be empty');
  if (!sub.code?.trim()) errors.push('Subject code cannot be empty');
  if (!sub.weeklySessions || sub.weeklySessions <= 0) errors.push('Weekly sessions must be at least 1');
  if (divisions.length > 0 && !divisions.some(d => d.id === sub.divisionId)) {
    errors.push('Assigned division does not exist');
  }
  if (faculty.length > 0 && !faculty.some(f => f.id === sub.facultyId)) {
    errors.push('Assigned faculty does not exist');
  }
  return { isValid: errors.length === 0, errors };
}

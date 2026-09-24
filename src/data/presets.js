// Presets for College Timetable Generator
import { ROOM_TYPES, SUBJECT_TYPES } from './models.js';

export const PRESET_ENGINEERING = {
  id: 'preset-engineering',
  name: 'Faculty of Engineering (Solvable)',
  description: 'Realistic 3-Division Engineering Department with 12 Faculty, 6 Rooms/Labs, Theory & 2-Hour Practical Lab Blocks.',
  isFeasible: true,
  divisions: [
    { id: 'div-csa', name: 'CS-A (Computer Science Yr 3, Sec A)', shortCode: 'CS-A', studentCount: 60, color: '#3b82f6' },
    { id: 'div-csb', name: 'CS-B (Computer Science Yr 3, Sec B)', shortCode: 'CS-B', studentCount: 60, color: '#8b5cf6' },
    { id: 'div-ita', name: 'IT-A (Information Tech Yr 3, Sec A)', shortCode: 'IT-A', studentCount: 55, color: '#06b6d4' }
  ],
  rooms: [
    { id: 'room-101', name: 'LH-101 (Lecture Hall)', type: ROOM_TYPES.LECTURE_HALL, capacity: 75, building: 'Academic Block A' },
    { id: 'room-102', name: 'LH-102 (Lecture Hall)', type: ROOM_TYPES.LECTURE_HALL, capacity: 75, building: 'Academic Block A' },
    { id: 'room-103', name: 'LH-103 (Lecture Hall)', type: ROOM_TYPES.LECTURE_HALL, capacity: 70, building: 'Academic Block B' },
    { id: 'room-lab1', name: 'CL-01 (Computing Lab)', type: ROOM_TYPES.LAB, capacity: 65, building: 'CS Department' },
    { id: 'room-lab2', name: 'CL-02 (AI & Data Lab)', type: ROOM_TYPES.LAB, capacity: 65, building: 'CS Department' },
    { id: 'room-lab3', name: 'NL-01 (Networks Lab)', type: ROOM_TYPES.LAB, capacity: 65, building: 'IT Department' }
  ],
  faculty: [
    { id: 'fac-turing', name: 'Dr. Alan Turing', department: 'CS', email: 'a.turing@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [{ day: 'Mon', period: 1 }] },
    { id: 'fac-lovelace', name: 'Prof. Ada Lovelace', department: 'CS', email: 'a.lovelace@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [{ day: 'Fri', period: 7 }] },
    { id: 'fac-hopper', name: 'Dr. Grace Hopper', department: 'CS', email: 'g.hopper@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [{ day: 'Wed', period: 1 }] },
    { id: 'fac-codd', name: 'Dr. Edgar Codd', department: 'CS', email: 'e.codd@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] },
    { id: 'fac-knuth', name: 'Prof. Donald Knuth', department: 'Maths', email: 'd.knuth@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 12, unavailableSlots: [{ day: 'Tue', period: 6 }, { day: 'Tue', period: 7 }] },
    { id: 'fac-berners', name: 'Dr. Tim Berners-Lee', department: 'IT', email: 't.lee@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] },
    { id: 'fac-ritchie', name: 'Prof. Dennis Ritchie', department: 'IT', email: 'd.ritchie@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [{ day: 'Mon', period: 7 }] },
    { id: 'fac-shannon', name: 'Prof. Claude Shannon', department: 'IT', email: 'c.shannon@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 12, unavailableSlots: [] },
    { id: 'fac-dijkstra', name: 'Dr. Edsger Dijkstra', department: 'CS', email: 'e.dijkstra@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] },
    { id: 'fac-chomsky', name: 'Dr. Noam Chomsky', department: 'CS', email: 'n.chomsky@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 12, unavailableSlots: [{ day: 'Thu', period: 7 }] },
    { id: 'fac-neumann', name: 'Dr. John v. Neumann', department: 'CS', email: 'j.neumann@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 12, unavailableSlots: [] },
    { id: 'fac-lamport', name: 'Dr. Leslie Lamport', department: 'IT', email: 'l.lamport@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 12, unavailableSlots: [] }
  ],
  subjects: [
    // CS-A subjects
    { id: 'sub-csa-algo', name: 'Algorithms & Complexity', code: 'CS301', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-turing', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#3b82f6' },
    { id: 'sub-csa-algolab', name: 'Algorithms Lab (2hr)', code: 'CS301L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csa', facultyId: 'fac-turing', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#2563eb' },
    { id: 'sub-csa-os', name: 'Operating Systems', code: 'CS302', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-hopper', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#10b981' },
    { id: 'sub-csa-oslab', name: 'OS Systems Lab (2hr)', code: 'CS302L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csa', facultyId: 'fac-hopper', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#059669' },
    { id: 'sub-csa-dbms', name: 'Database Systems', code: 'CS303', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-codd', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#f59e0b' },
    { id: 'sub-csa-dbmslab', name: 'DBMS SQL Lab (2hr)', code: 'CS303L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csa', facultyId: 'fac-codd', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#d97706' },
    { id: 'sub-csa-toc', name: 'Theory of Computation', code: 'CS304', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-chomsky', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#8b5cf6' },
    { id: 'sub-csa-math', name: 'Discrete Math & Stats', code: 'CS305', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-knuth', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#ec4899' },
    { id: 'sub-csa-se', name: 'Software Engineering', code: 'CS306', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-dijkstra', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#6366f1' },

    // CS-B subjects
    { id: 'sub-csb-algo', name: 'Algorithms & Complexity', code: 'CS301', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csb', facultyId: 'fac-turing', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#3b82f6' },
    { id: 'sub-csb-algolab', name: 'Algorithms Lab (2hr)', code: 'CS301L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csb', facultyId: 'fac-turing', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#2563eb' },
    { id: 'sub-csb-oop', name: 'OOP & Java Architecture', code: 'CS307', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csb', facultyId: 'fac-lovelace', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#06b6d4' },
    { id: 'sub-csb-ooplab', name: 'Java Programming Lab (2hr)', code: 'CS307L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csb', facultyId: 'fac-lovelace', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#0891b2' },
    { id: 'sub-csb-dbms', name: 'Database Systems', code: 'CS303', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csb', facultyId: 'fac-codd', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#f59e0b' },
    { id: 'sub-csb-dbmslab', name: 'DBMS SQL Lab (2hr)', code: 'CS303L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csb', facultyId: 'fac-codd', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#d97706' },
    { id: 'sub-csb-ca', name: 'Computer Architecture', code: 'CS308', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csb', facultyId: 'fac-neumann', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#14b8a6' },
    { id: 'sub-csb-math', name: 'Discrete Math & Stats', code: 'CS305', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csb', facultyId: 'fac-knuth', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#ec4899' },
    { id: 'sub-csb-se', name: 'Software Engineering', code: 'CS306', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csb', facultyId: 'fac-dijkstra', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#6366f1' },

    // IT-A subjects
    { id: 'sub-ita-web', name: 'Web Technologies', code: 'IT301', type: SUBJECT_TYPES.THEORY, divisionId: 'div-ita', facultyId: 'fac-berners', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#06b6d4' },
    { id: 'sub-ita-weblab', name: 'Web Dev Lab (2hr)', code: 'IT301L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-ita', facultyId: 'fac-berners', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#0891b2' },
    { id: 'sub-ita-net', name: 'Computer Networks', code: 'IT302', type: SUBJECT_TYPES.THEORY, divisionId: 'div-ita', facultyId: 'fac-ritchie', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#10b981' },
    { id: 'sub-ita-netlab', name: 'Networks Simulation Lab (2hr)', code: 'IT302L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-ita', facultyId: 'fac-ritchie', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#059669' },
    { id: 'sub-ita-ai', name: 'Artificial Intelligence', code: 'IT303', type: SUBJECT_TYPES.THEORY, divisionId: 'div-ita', facultyId: 'fac-shannon', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#8b5cf6' },
    { id: 'sub-ita-ds', name: 'Distributed Systems', code: 'IT304', type: SUBJECT_TYPES.THEORY, divisionId: 'div-ita', facultyId: 'fac-lamport', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#f97316' },
    { id: 'sub-ita-dbms', name: 'Enterprise DBMS', code: 'IT305', type: SUBJECT_TYPES.THEORY, divisionId: 'div-ita', facultyId: 'fac-codd', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#f59e0b' },
    { id: 'sub-ita-oop', name: 'Full-Stack OOP', code: 'IT306', type: SUBJECT_TYPES.THEORY, divisionId: 'div-ita', facultyId: 'fac-lovelace', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#ec4899' }
  ]
};

export const PRESET_IMPOSSIBLE_CONFLICTS = {
  id: 'preset-impossible',
  name: 'Impossible & Conflicting Constraints (Test Scenario)',
  description: 'Designed specifically to trigger pre-flight mathematical impossibility alerts, pigeonhole principle violations, room bottlenecks, and faculty over-allocations.',
  isFeasible: false,
  divisions: [
    { id: 'div-csa', name: 'CS-A (Computer Science Yr 3)', shortCode: 'CS-A', studentCount: 70, color: '#ef4444' },
    { id: 'div-csb', name: 'CS-B (Computer Science Yr 3)', shortCode: 'CS-B', studentCount: 70, color: '#f97316' }
  ],
  rooms: [
    // Bottleneck: Only 1 small classroom (cap 40 vs 70 students) and 1 lab
    { id: 'room-101', name: 'Small Classroom (Cap 40)', type: ROOM_TYPES.LECTURE_HALL, capacity: 40, building: 'Old Wing' },
    { id: 'room-lab1', name: 'Only 1 Computer Lab', type: ROOM_TYPES.LAB, capacity: 60, building: 'Main' }
  ],
  faculty: [
    // Overloaded faculty: Dr. Turing assigned 26 hours, but max weekly is 12 and unavailable Mon-Wed!
    { 
      id: 'fac-turing', 
      name: 'Dr. Alan Turing (Overloaded)', 
      department: 'CS', 
      email: 'a.turing@univ.edu', 
      maxDailyLectures: 2, 
      maxWeeklyLectures: 10, 
      unavailableSlots: [
        { day: 'Mon', period: 1 }, { day: 'Mon', period: 2 }, { day: 'Mon', period: 3 }, { day: 'Mon', period: 5 }, { day: 'Mon', period: 6 }, { day: 'Mon', period: 7 },
        { day: 'Tue', period: 1 }, { day: 'Tue', period: 2 }, { day: 'Tue', period: 3 }, { day: 'Tue', period: 5 }, { day: 'Tue', period: 6 }, { day: 'Tue', period: 7 },
        { day: 'Wed', period: 1 }, { day: 'Wed', period: 2 }, { day: 'Wed', period: 3 }, { day: 'Wed', period: 5 }, { day: 'Wed', period: 6 }, { day: 'Wed', period: 7 }
      ]
    },
    { 
      id: 'fac-hopper', 
      name: 'Dr. Grace Hopper', 
      department: 'CS', 
      email: 'g.hopper@univ.edu', 
      maxDailyLectures: 3, 
      maxWeeklyLectures: 14, 
      unavailableSlots: [] 
    }
  ],
  subjects: [
    // CS-A has 34 periods required (Capacity of 5-day week is 30 periods!)
    { id: 'sub-csa-1', name: 'Algorithms Intensive', code: 'CS901', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-turing', weeklySessions: 6, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#ef4444' },
    { id: 'sub-csa-2', name: 'OS Architecture', code: 'CS902', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-turing', weeklySessions: 6, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#f59e0b' },
    { id: 'sub-csa-3', name: 'Data Structures Advanced', code: 'CS903', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-hopper', weeklySessions: 6, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#3b82f6' },
    { id: 'sub-csa-4', name: 'Deep Learning Theory', code: 'CS904', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-hopper', weeklySessions: 6, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#8b5cf6' },
    { id: 'sub-csa-lab1', name: 'Algorithms Mega Lab (2hr)', code: 'CS901L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csa', facultyId: 'fac-turing', weeklySessions: 3, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#dc2626' },
    { id: 'sub-csa-lab2', name: 'OS Systems Mega Lab (2hr)', code: 'CS902L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csa', facultyId: 'fac-hopper', weeklySessions: 2, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#059669' },
    
    // CS-B also demands labs in the same single lab
    { id: 'sub-csb-lab1', name: 'Graphics Lab (2hr)', code: 'CS905L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csb', facultyId: 'fac-hopper', weeklySessions: 3, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#ec4899' },
    { id: 'sub-csb-lab2', name: 'Network Lab (2hr)', code: 'CS906L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csb', facultyId: 'fac-hopper', weeklySessions: 3, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#6366f1' }
  ]
};

export const PRESET_TIGHT_RESOURCE = {
  id: 'preset-tight',
  name: 'Tight Resources & High Density (Advanced Solvable)',
  description: 'Exactly matches room count with division concurrency. Tests backtracking depth and minimum remaining values heuristic.',
  isFeasible: true,
  divisions: [
    { id: 'div-csa', name: 'Division Alpha', shortCode: 'DIV-A', studentCount: 50, color: '#3b82f6' },
    { id: 'div-csb', name: 'Division Beta', shortCode: 'DIV-B', studentCount: 50, color: '#10b981' }
  ],
  rooms: [
    { id: 'room-101', name: 'Hall 1', type: ROOM_TYPES.LECTURE_HALL, capacity: 60, building: 'Main' },
    { id: 'room-102', name: 'Hall 2', type: ROOM_TYPES.LECTURE_HALL, capacity: 60, building: 'Main' },
    { id: 'room-lab1', name: 'Lab 1', type: ROOM_TYPES.LAB, capacity: 60, building: 'Annex' }
  ],
  faculty: [
    { id: 'fac-1', name: 'Prof. Miller', department: 'CS', email: 'm@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 12, unavailableSlots: [{ day: 'Mon', period: 1 }] },
    { id: 'fac-2', name: 'Prof. Davis', department: 'CS', email: 'd@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 12, unavailableSlots: [] },
    { id: 'fac-3', name: 'Prof. Wilson', department: 'CS', email: 'w@univ.edu', maxDailyLectures: 3, maxWeeklyLectures: 12, unavailableSlots: [{ day: 'Fri', period: 7 }] }
  ],
  subjects: [
    { id: 'sub-a-1', name: 'Data Structures', code: 'CS201', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-1', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#3b82f6' },
    { id: 'sub-a-2', name: 'DS Lab (2hr)', code: 'CS201L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csa', facultyId: 'fac-1', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#2563eb' },
    { id: 'sub-a-3', name: 'Circuits', code: 'CS202', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-2', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#10b981' },
    { id: 'sub-a-4', name: 'Discrete Math', code: 'CS203', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csa', facultyId: 'fac-3', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#f59e0b' },
    
    { id: 'sub-b-1', name: 'Data Structures', code: 'CS201', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csb', facultyId: 'fac-1', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#3b82f6' },
    { id: 'sub-b-2', name: 'Circuits', code: 'CS202', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csb', facultyId: 'fac-2', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#10b981' },
    { id: 'sub-b-3', name: 'Circuits Lab (2hr)', code: 'CS202L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-csb', facultyId: 'fac-2', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#059669' },
    { id: 'sub-b-4', name: 'Discrete Math', code: 'CS203', type: SUBJECT_TYPES.THEORY, divisionId: 'div-csb', facultyId: 'fac-3', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#f59e0b' }
  ]
};

export const PRESET_MECHANICAL = {
  id: 'preset-mechanical',
  name: 'Mechanical Engineering (Thermodynamics & CAD)',
  description: '2 Cohorts (ME-A, ME-B), 3 Lecture Halls, 2 Workshop/CAD Labs, Thermal Engineering & Manufacturing.',
  isFeasible: true,
  divisions: [
    { id: 'div-mea', name: 'ME-A (Mechanical Yr 3, Sec A)', shortCode: 'ME-A', studentCount: 60, color: '#f59e0b' },
    { id: 'div-meb', name: 'ME-B (Mechanical Yr 3, Sec B)', shortCode: 'ME-B', studentCount: 55, color: '#f97316' }
  ],
  rooms: [
    { id: 'rm-m1', name: 'Hall M-101 (Lecture)', type: ROOM_TYPES.LECTURE_HALL, capacity: 70, building: 'Mechanical Wing' },
    { id: 'rm-m2', name: 'Hall M-102 (Lecture)', type: ROOM_TYPES.LECTURE_HALL, capacity: 70, building: 'Mechanical Wing' },
    { id: 'rm-m3', name: 'CAD Simulation Lab', type: ROOM_TYPES.LAB, capacity: 65, building: 'Computing Wing' },
    { id: 'rm-m4', name: 'Thermal Dynamics Lab', type: ROOM_TYPES.LAB, capacity: 65, building: 'Heavy Machinery Wing' }
  ],
  faculty: [
    { id: 'fac-sharma', name: 'Dr. R. Sharma', department: 'Thermal Eng', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] },
    { id: 'fac-patel', name: 'Prof. K. Patel', department: 'Design & CAD', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] },
    { id: 'fac-singh', name: 'Dr. V. Singh', department: 'Manufacturing', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] },
    { id: 'fac-gupta', name: 'Dr. A. Gupta', department: 'Fluid Dynamics', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] }
  ],
  subjects: [
    { id: 'sub-mea-fm', name: 'Fluid Mechanics', code: 'ME301', type: SUBJECT_TYPES.THEORY, divisionId: 'div-mea', facultyId: 'fac-gupta', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#3b82f6' },
    { id: 'sub-mea-fmlab', name: 'Fluid Mechanics Lab (2hr)', code: 'ME301L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-mea', facultyId: 'fac-gupta', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#2563eb' },
    { id: 'sub-mea-th', name: 'Thermodynamics & Heat Transfer', code: 'ME302', type: SUBJECT_TYPES.THEORY, divisionId: 'div-mea', facultyId: 'fac-sharma', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#f59e0b' },
    { id: 'sub-mea-thlab', name: 'Thermal Power Lab (2hr)', code: 'ME302L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-mea', facultyId: 'fac-sharma', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#d97706' },
    { id: 'sub-mea-cad', name: 'Solid Modeling & CAD Lab (2hr)', code: 'ME303L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-mea', facultyId: 'fac-patel', weeklySessions: 2, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#8b5cf6' },

    { id: 'sub-meb-fm', name: 'Fluid Mechanics', code: 'ME301', type: SUBJECT_TYPES.THEORY, divisionId: 'div-meb', facultyId: 'fac-gupta', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#3b82f6' },
    { id: 'sub-meb-th', name: 'Thermodynamics & Heat Transfer', code: 'ME302', type: SUBJECT_TYPES.THEORY, divisionId: 'div-meb', facultyId: 'fac-sharma', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#f59e0b' },
    { id: 'sub-meb-thlab', name: 'Thermal Power Lab (2hr)', code: 'ME302L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-meb', facultyId: 'fac-sharma', weeklySessions: 1, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#d97706' },
    { id: 'sub-meb-cad', name: 'Solid Modeling & CAD Lab (2hr)', code: 'ME303L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-meb', facultyId: 'fac-patel', weeklySessions: 2, duration: 2, preferredRoomType: ROOM_TYPES.LAB, color: '#8b5cf6' },
    { id: 'sub-meb-mfg', name: 'Manufacturing Processes', code: 'ME304', type: SUBJECT_TYPES.THEORY, divisionId: 'div-meb', facultyId: 'fac-singh', weeklySessions: 3, duration: 1, preferredRoomType: ROOM_TYPES.LECTURE_HALL, color: '#10b981' }
  ]
};

export const PRESET_BLANK_CANVAS = {
  id: 'preset-blank',
  name: '⚡ Blank Canvas (Start from 0 Entities)',
  description: 'Completely clear slate with 0 static dummy data. Use the AI Agent to build your real college timetable.',
  isFeasible: true,
  divisions: [],
  rooms: [],
  faculty: [],
  subjects: []
};

export const ALL_PRESETS = [PRESET_ENGINEERING, PRESET_MECHANICAL, PRESET_BLANK_CANVAS, PRESET_IMPOSSIBLE_CONFLICTS, PRESET_TIGHT_RESOURCE];

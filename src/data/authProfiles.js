// Campus Authentication Profiles & Credentials
// Defines Admin, Faculty Member, and Student profiles with roles and granular permissions.

export const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student'
};

export const AUTH_PROFILES = [
  {
    id: 'user-admin',
    role: ROLES.ADMIN,
    name: 'Dr. Alan Turing',
    title: 'Principal & Institutional Admin',
    email: 'admin@campus.edu',
    username: 'admin',
    password: 'admin123',
    department: 'Institute Administration',
    avatar: '🛡️',
    badgeClass: 'badge-admin',
    badgeLabel: 'Principal / Admin',
    description: 'Full institutional authority: generate schedules, modify entities & constraints, manually add subjects, and audit resources.',
    permissions: {
      canGenerate: true,
      canChangePreset: true,
      canManageEntities: true,
      canAuditStats: true,
      canAddSubject: true,
      canEditSlot: true,
      canDeleteSlot: true,
      canExport: true,
      canPrint: true,
      canUseAI: true
    }
  },
  {
    id: 'user-faculty',
    role: ROLES.FACULTY,
    name: 'Prof. Marcus Brody',
    title: 'Senior Faculty & Academic Coordinator',
    email: 'faculty@campus.edu',
    username: 'faculty',
    password: 'faculty123',
    department: 'Computer Science & Engineering',
    facultyId: 'fac-1', // maps to primary faculty entity
    avatar: '👨‍🏫',
    badgeClass: 'badge-faculty',
    badgeLabel: 'Faculty Member',
    description: 'Faculty privileges: view all timetables, inspect teaching load, and manually add particular subjects for your classroom via (+) slot icons.',
    permissions: {
      canGenerate: true, // can re-run solver or schedule if needed
      canChangePreset: false,
      canManageEntities: false, // read-only view of institutional rules
      canAuditStats: true,
      canAddSubject: true, // Key requirement: manually add subjects by clicking add icon
      canEditSlot: true,
      canDeleteSlot: true,
      canExport: true,
      canPrint: true,
      canUseAI: true
    }
  },
  {
    id: 'user-student',
    role: ROLES.STUDENT,
    name: 'Alex Chen',
    title: 'Student Representative (Year 3)',
    email: 'student@campus.edu',
    username: 'student',
    password: 'student123',
    department: 'Computer Science - Div A',
    divisionId: 'div-cs-a', // maps to primary division entity
    studentRoll: 'CS-2026-042',
    avatar: '🎓',
    badgeClass: 'badge-student',
    badgeLabel: 'Student',
    description: 'Student view: clean read-only division timetable, room directions, course details, personal schedule download, and lecture inspection.',
    permissions: {
      canGenerate: false,
      canChangePreset: false,
      canManageEntities: false,
      canAuditStats: false,
      canAddSubject: false, // Cannot alter timetable
      canEditSlot: false,   // Cannot reschedule/delete
      canDeleteSlot: false,
      canExport: true,
      canPrint: true,
      canUseAI: false
    }
  }
];

export const DEMO_CREDENTIALS = [
  {
    role: 'Principal / Admin',
    email: 'admin@campus.edu',
    username: 'admin',
    password: 'admin123',
    badge: 'Administrator'
  },
  {
    role: 'Faculty Member',
    email: 'faculty@campus.edu',
    username: 'faculty',
    password: 'faculty123',
    badge: 'Faculty'
  },
  {
    role: 'Student',
    email: 'student@campus.edu',
    username: 'student',
    password: 'student123',
    badge: 'Student'
  }
];

export function authenticateUser(identifier, password) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  const profile = AUTH_PROFILES.find(p => 
    (p.email.toLowerCase() === cleanId || p.username.toLowerCase() === cleanId) &&
    p.password === cleanPass
  );

  return profile || null;
}

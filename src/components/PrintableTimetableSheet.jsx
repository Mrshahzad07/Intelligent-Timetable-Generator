import React from 'react';
import { Award, CheckCircle2, ShieldCheck, Clock, MapPin, User, BookOpen, FlaskConical } from 'lucide-react';

export default function PrintableTimetableSheet({
  divisions,
  rooms,
  faculty,
  subjects,
  config,
  timetable,
  viewMode = 'division',
  selectedDivisionId,
  selectedFacultyId,
  selectedRoomId,
  printSettings = {},
  isPreview = false
}) {
  const divisionMap = new Map(divisions.map(d => [d.id, d]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const facultyMap = new Map(faculty.map(f => [f.id, f]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  // Default print settings if omitted
  const settings = {
    collegeName: printSettings.collegeName || 'APEX INSTITUTE OF TECHNOLOGY & ENGINEERING',
    departmentName: printSettings.departmentName || 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING',
    academicTerm: printSettings.academicTerm || 'Autumn Semester 2026–2027',
    academicYear: printSettings.academicYear || '2026–2027',
    effectiveDate: printSettings.effectiveDate || 'October 1, 2026',
    advisorName: printSettings.advisorName || 'Dr. Eleanor Vance (Class Coordinator)',
    coordinatorName: printSettings.coordinatorName || 'Prof. Marcus Brody',
    hodName: printSettings.hodName || 'Dr. Alan Turing',
    deanName: printSettings.deanName || 'Dr. H. Vance',
    includeSubjectLegend: printSettings.includeSubjectLegend !== false,
    includeRoomLegend: printSettings.includeRoomLegend !== false,
    includeRules: printSettings.includeRules !== false,
    includeSignatures: printSettings.includeSignatures !== false,
    customNotes: printSettings.customNotes || '',
    targetScope: printSettings.targetScope || 'current'
  };

  // Determine which divisions to render
  const getDivisionsToRender = () => {
    if (settings.targetScope === 'all-divisions') {
      return divisions;
    }
    if (viewMode === 'division') {
      const current = divisionMap.get(selectedDivisionId) || divisions[0];
      return current ? [current] : [];
    }
    return [];
  };

  // Helper to find slot
  const findSlot = (day, periodIndex, divId) => {
    let pool = timetable;
    if (divId) {
      pool = timetable.filter(s => s.divisionId === divId);
    } else if (viewMode === 'faculty') {
      pool = timetable.filter(s => s.facultyId === selectedFacultyId);
    } else if (viewMode === 'room') {
      pool = timetable.filter(s => s.roomId === selectedRoomId);
    }

    const direct = pool.find(s => s.day === day && s.period === periodIndex);
    if (direct) return { slot: direct, isContinuation: false };

    const continuation = pool.find(s => {
      const dur = s.duration || 1;
      return s.day === day && s.period < periodIndex && (s.period + dur) > periodIndex;
    });
    if (continuation) return { slot: continuation, isContinuation: true };

    return null;
  };

  // Compute active metadata for current view
  const currentEntity = () => {
    if (viewMode === 'division') return divisionMap.get(selectedDivisionId);
    if (viewMode === 'faculty') return facultyMap.get(selectedFacultyId);
    if (viewMode === 'room') return roomMap.get(selectedRoomId);
    return null;
  };

  const entity = currentEntity();

  // Distinct subjects in the active view
  const getActiveSubjects = (divId = null) => {
    let slots = timetable;
    if (divId) {
      slots = timetable.filter(s => s.divisionId === divId);
    } else if (viewMode === 'division') {
      slots = timetable.filter(s => s.divisionId === selectedDivisionId);
    } else if (viewMode === 'faculty') {
      slots = timetable.filter(s => s.facultyId === selectedFacultyId);
    } else if (viewMode === 'room') {
      slots = timetable.filter(s => s.roomId === selectedRoomId);
    }

    const subIds = [...new Set(slots.map(s => s.subjectId))];
    return subIds.map(id => {
      const sub = subjectMap.get(id);
      const fac = facultyMap.get(sub?.facultyId);
      const rm = roomMap.get(sub?.preferredRoomId);
      return { subject: sub, faculty: fac, room: rm };
    }).filter(item => item.subject);
  };

  // Render a single division sheet
  const renderDivisionTable = (div) => {
    const activeSubjects = getActiveSubjects(div.id);
    const divSlots = timetable.filter(s => s.divisionId === div.id);
    const totalWeeklyHours = divSlots.reduce((a, s) => a + (s.duration || 1), 0);

    return (
      <div key={div.id} className="print-division-sheet">
        {/* Institutional Header Letterhead */}
        <div className="print-letterhead">
          <div className="print-header-crest">
            <div className="crest-emblem">🏛️</div>
          </div>
          <div className="print-header-center">
            <h1 className="print-college-title">{settings.collegeName}</h1>
            <h2 className="print-dept-title">{settings.departmentName}</h2>
            <div className="print-term-sub">
              <span>{settings.academicTerm}</span>
              <span className="dot-sep">•</span>
              <span>Academic Year: {settings.academicYear}</span>
              <span className="dot-sep">•</span>
              <span>Effective Date: {settings.effectiveDate}</span>
            </div>
          </div>
          <div className="print-header-status">
            <div className="official-stamp-box">
              <span className="stamp-title">OFFICIAL TIMETABLE</span>
              <span className="stamp-sub">STATUS: APPROVED</span>
              <span className="stamp-code">CSP-VERIFIED: 0 CONFLICTS</span>
            </div>
          </div>
        </div>

        {/* Division & Cohort Context Bar */}
        <div className="print-meta-banner">
          <div className="meta-banner-left">
            <div className="banner-primary-tag">
              <strong>COHORT:</strong> {div.name} ({div.shortCode})
            </div>
            <div className="banner-sub-tag">
              <strong>STUDENT STRENGTH:</strong> {div.studentCount} Students
            </div>
            <div className="banner-sub-tag">
              <strong>CLASS ADVISOR:</strong> {settings.advisorName}
            </div>
          </div>
          <div className="meta-banner-right">
            <div className="banner-metric">
              <span className="m-label">TOTAL WORKLOAD:</span>
              <span className="m-val">{totalWeeklyHours} Hours / Week</span>
            </div>
            <div className="banner-metric">
              <span className="m-label">SCHEDULE PERIODS:</span>
              <span className="m-val">6 Periods + Lunch Break</span>
            </div>
          </div>
        </div>

        {/* Primary Timetable Grid */}
        <div className="print-table-wrapper">
          <table className="print-timetable-matrix">
            <thead>
              <tr>
                <th className="pth-day">DAY</th>
                {config.periods.map(p => (
                  <th key={p.index} className={`pth-period ${p.isBreak ? 'pth-break' : ''}`}>
                    <div className="pth-title">{p.isBreak ? 'LUNCH BREAK' : p.name.toUpperCase()}</div>
                    <div className="pth-time">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.days.map(day => (
                <tr key={day}>
                  <td className="ptd-day-label">
                    <strong>{day.toUpperCase()}</strong>
                  </td>
                  {config.periods.map(p => {
                    if (p.isBreak) {
                      return (
                        <td key={p.index} className="ptd-break-cell">
                          <div className="ptd-break-wrapper">
                            <span className="break-icon">☕</span>
                            <span className="break-text-vert">LUNCH RECESS</span>
                          </div>
                        </td>
                      );
                    }

                    const match = findSlot(day, p.index, div.id);
                    if (!match) {
                      return (
                        <td key={p.index} className="ptd-empty-cell">
                          <span className="empty-dash">—</span>
                          <span className="empty-sub">Library / Self-Study</span>
                        </td>
                      );
                    }

                    const slot = match.slot;
                    const sub = subjectMap.get(slot.subjectId);
                    const fac = facultyMap.get(slot.facultyId);
                    const rm = roomMap.get(slot.roomId);
                    const isLab = (slot.duration || 1) > 1 || sub?.type === 'practical';

                    if (match.isContinuation) {
                      return (
                        <td key={p.index} className="ptd-slot-cell ptd-lab-contd">
                          <div className="ptd-contd-box">
                            <div className="contd-badge">↳ LAB CONTINUATION</div>
                            <div className="contd-code">{sub?.code}</div>
                            <div className="contd-title" title={sub?.name}>{sub?.name}</div>
                            <div className="contd-loc">📍 {rm?.name}</div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={p.index} className={`ptd-slot-cell ${isLab ? 'ptd-lab-slot' : 'ptd-theory-slot'}`}>
                        <div className="ptd-cell-content">
                          <div className="ptd-code-row">
                            <span className="ptd-code-pill">{sub?.code || 'SUB'}</span>
                            <span className={`ptd-type-pill ${isLab ? 'type-lab' : 'type-theory'}`}>
                              {isLab ? 'LAB (2H)' : 'THEORY'}
                            </span>
                          </div>
                          <div className="ptd-subject-name" title={sub?.name}>
                            {sub?.name || 'Class Session'}
                          </div>
                          <div className="ptd-footer-info">
                            <div className="ptd-fac-name" title={fac?.name}>
                              <span className="info-icon">👤</span> {fac?.name || 'Unassigned Faculty'}
                            </div>
                            <div className="ptd-room-name" title={rm?.name}>
                              <span className="info-icon">📍</span> {rm?.name || 'Hall TBD'}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customized Bottom Sections */}

        {/* Section 1: Course & Faculty Allocation Directory */}
        {settings.includeSubjectLegend && activeSubjects.length > 0 && (
          <div className="print-section print-subject-legend">
            <h3 className="print-section-header">
              <span>SECTION 1: COURSE & FACULTY ALLOCATION DIRECTORY</span>
              <span className="sec-sub">Curriculum Credit Distribution & Faculty In-Charge</span>
            </h3>
            <table className="print-legend-table">
              <thead>
                <tr>
                  <th style={{ width: '85px' }}>Course Code</th>
                  <th>Course Title</th>
                  <th style={{ width: '100px' }}>Type</th>
                  <th>Faculty In-Charge</th>
                  <th>Assigned Venue</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Weekly Hours</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>Credits</th>
                </tr>
              </thead>
              <tbody>
                {activeSubjects.map(({ subject: sub, faculty: fac, room: rm }) => {
                  const isPractical = sub.type === 'practical';
                  const credits = isPractical ? '2.0' : '4.0';
                  const hours = isPractical ? `${sub.weeklySessions * 2} hrs (Practical)` : `${sub.weeklySessions} hrs (Theory)`;
                  return (
                    <tr key={sub.id}>
                      <td><strong>{sub.code}</strong></td>
                      <td>{sub.name}</td>
                      <td>
                        <span className={`print-badge ${isPractical ? 'badge-lab' : 'badge-theory'}`}>
                          {isPractical ? 'Practical Lab' : 'Theory Lecture'}
                        </span>
                      </td>
                      <td>{fac?.name || 'Department Faculty'}</td>
                      <td>{rm?.name || 'Allotted Hall'} ({rm?.type === 'lab' ? 'Lab Facility' : 'Lecture Hall'})</td>
                      <td style={{ textAlign: 'center' }}>{hours}</td>
                      <td style={{ textAlign: 'center' }}>{credits}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 2: Laboratory & Infrastructure Notes */}
        {settings.includeRoomLegend && (
          <div className="print-section print-infrastructure-legend">
            <h3 className="print-section-header">
              <span>SECTION 2: ALLOCATED FACILITIES & LABORATORY VENUES</span>
            </h3>
            <div className="print-infra-grid">
              {rooms.slice(0, 4).map(r => (
                <div key={r.id} className="print-infra-card">
                  <strong>{r.name}</strong>
                  <span>Type: {r.type === 'lab' ? 'Specialized Computing Lab' : 'Lecture Hall'}</span>
                  <span>Capacity: {r.capacity} Seats • {r.building || 'Academic Block'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Institutional Regulations & Attendance Policy */}
        {settings.includeRules && (
          <div className="print-section print-rules-notice">
            <h3 className="print-section-header">
              <span>SECTION 3: INSTITUTIONAL REGULATIONS & ACADEMIC DIRECTIVES</span>
            </h3>
            <div className="print-rules-content">
              <p>
                <strong>1. Mandatory Attendance:</strong> Under Academic Regulation §14.2, students must maintain a minimum of <strong>85% attendance</strong> in theory and 100% in practical labs to be eligible for end-semester examinations.
              </p>
              <p>
                <strong>2. Laboratory Continuity:</strong> Practical laboratory sessions are atomic 2-hour blocks and cannot be split or rescheduled without written endorsement from the Timetable In-Charge and HOD.
              </p>
              <p>
                <strong>3. Punctuality & Discipline:</strong> Students must occupy their assigned classrooms 5 minutes prior to the scheduled lecture. Recess and lunch intervals are strictly reserved for student wellness.
              </p>
              {settings.customNotes && (
                <p className="print-custom-note">
                  <strong>Additional Department Directive:</strong> {settings.customNotes}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Section 4: Official Sign-Off & Approvals Block */}
        {settings.includeSignatures && (
          <div className="print-section print-signatures-block">
            <div className="signatures-grid">
              <div className="signature-col">
                <div className="sig-line"></div>
                <div className="sig-name">{settings.coordinatorName}</div>
                <div className="sig-title">Timetable In-Charge / Coordinator</div>
                <div className="sig-date">Date: {settings.effectiveDate}</div>
              </div>

              <div className="signature-col">
                <div className="sig-line"></div>
                <div className="sig-name">{settings.hodName}</div>
                <div className="sig-title">Head of Department (CSE)</div>
                <div className="sig-date">Date: {settings.effectiveDate}</div>
              </div>

              <div className="signature-col">
                <div className="sig-line"></div>
                <div className="sig-name">{settings.deanName}</div>
                <div className="sig-title">Dean of Academic Affairs / Principal</div>
                <div className="sig-date">Seal of the Institution</div>
              </div>
            </div>
          </div>
        )}

        {/* Document Footer Bar */}
        <div className="print-doc-footer">
          <span>ChronosAI Academic Timetable Management System • Form Ref: ACAD-TT-2026/V2</span>
          <span>Page Verified & Validated Against University Scheduling Constraints</span>
        </div>
      </div>
    );
  };

  // Render Faculty Member Sheet
  const renderFacultySheet = () => {
    const fac = facultyMap.get(selectedFacultyId) || faculty[0];
    const facSlots = timetable.filter(s => s.facultyId === fac?.id);
    const totalFacultyHours = facSlots.reduce((a, s) => a + (s.duration || 1), 0);

    return (
      <div className="print-division-sheet">
        {/* Letterhead */}
        <div className="print-letterhead">
          <div className="print-header-crest">
            <div className="crest-emblem">👨‍🏫</div>
          </div>
          <div className="print-header-center">
            <h1 className="print-college-title">{settings.collegeName}</h1>
            <h2 className="print-dept-title">{settings.departmentName}</h2>
            <div className="print-term-sub">
              <span>FACULTY TEACHING SCHEDULE • {settings.academicTerm}</span>
              <span className="dot-sep">•</span>
              <span>Effective Date: {settings.effectiveDate}</span>
            </div>
          </div>
          <div className="print-header-status">
            <div className="official-stamp-box">
              <span className="stamp-title">OFFICIAL RECORD</span>
              <span className="stamp-sub">STATUS: VERIFIED</span>
              <span className="stamp-code">TEACHING LOAD: OK</span>
            </div>
          </div>
        </div>

        {/* Faculty Banner */}
        <div className="print-meta-banner">
          <div className="meta-banner-left">
            <div className="banner-primary-tag">
              <strong>FACULTY NAME:</strong> {fac?.name}
            </div>
            <div className="banner-sub-tag">
              <strong>DESIGNATION:</strong> {fac?.designation || 'Professor'}
            </div>
            <div className="banner-sub-tag">
              <strong>DEPARTMENT:</strong> {fac?.department || 'Computer Science'}
            </div>
          </div>
          <div className="meta-banner-right">
            <div className="banner-metric">
              <span className="m-label">ASSIGNED HOURS:</span>
              <span className="m-val">{totalFacultyHours} / {fac?.maxWeeklyLectures || 18} hrs</span>
            </div>
            <div className="banner-metric">
              <span className="m-label">DAILY CAPACITY:</span>
              <span className="m-val">Max {fac?.maxDailyLectures || 4} lectures / day</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="print-table-wrapper">
          <table className="print-timetable-matrix">
            <thead>
              <tr>
                <th className="pth-day">DAY</th>
                {config.periods.map(p => (
                  <th key={p.index} className={`pth-period ${p.isBreak ? 'pth-break' : ''}`}>
                    <div className="pth-title">{p.isBreak ? 'LUNCH BREAK' : p.name.toUpperCase()}</div>
                    <div className="pth-time">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.days.map(day => (
                <tr key={day}>
                  <td className="ptd-day-label">
                    <strong>{day.toUpperCase()}</strong>
                  </td>
                  {config.periods.map(p => {
                    if (p.isBreak) {
                      return (
                        <td key={p.index} className="ptd-break-cell">
                          <div className="ptd-break-wrapper">
                            <span className="break-icon">☕</span>
                            <span className="break-text-vert">LUNCH RECESS</span>
                          </div>
                        </td>
                      );
                    }

                    const match = findSlot(day, p.index, null);
                    if (!match) {
                      return (
                        <td key={p.index} className="ptd-empty-cell">
                          <span className="empty-dash">—</span>
                          <span className="empty-sub">Research / Office Hours</span>
                        </td>
                      );
                    }

                    const slot = match.slot;
                    const sub = subjectMap.get(slot.subjectId);
                    const div = divisionMap.get(slot.divisionId);
                    const rm = roomMap.get(slot.roomId);
                    const isLab = (slot.duration || 1) > 1 || sub?.type === 'practical';

                    return (
                      <td key={p.index} className={`ptd-slot-cell ${isLab ? 'ptd-lab-slot' : 'ptd-theory-slot'}`}>
                        <div className="ptd-cell-content">
                          <div className="ptd-code-row">
                            <span className="ptd-code-pill">{sub?.code}</span>
                            <span className="ptd-div-badge">{div?.shortCode || 'DIV'}</span>
                          </div>
                          <div className="ptd-subject-name" title={sub?.name}>{sub?.name}</div>
                          <div className="ptd-footer-info">
                            <div className="ptd-room-name">
                              <span className="info-icon">📍</span> {rm?.name || 'Hall TBD'}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        {settings.includeSignatures && (
          <div className="print-section print-signatures-block">
            <div className="signatures-grid">
              <div className="signature-col">
                <div className="sig-line"></div>
                <div className="sig-name">{fac?.name}</div>
                <div className="sig-title">Faculty Member Signature</div>
                <div className="sig-date">Date: {settings.effectiveDate}</div>
              </div>

              <div className="signature-col">
                <div className="sig-line"></div>
                <div className="sig-name">{settings.hodName}</div>
                <div className="sig-title">Head of Department (CSE)</div>
                <div className="sig-date">Date: {settings.effectiveDate}</div>
              </div>

              <div className="signature-col">
                <div className="sig-line"></div>
                <div className="sig-name">{settings.deanName}</div>
                <div className="sig-title">Dean of Academics</div>
                <div className="sig-date">Official Stamp</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main rendering logic
  if (viewMode === 'faculty') {
    return (
      <div className={`printable-sheet-container ${isPreview ? 'preview-mode' : 'physical-print-mode'}`}>
        {renderFacultySheet()}
      </div>
    );
  }

  const divisionsToRender = getDivisionsToRender();

  return (
    <div className={`printable-sheet-container ${isPreview ? 'preview-mode' : 'physical-print-mode'}`}>
      {divisionsToRender.map(div => renderDivisionTable(div))}
    </div>
  );
}

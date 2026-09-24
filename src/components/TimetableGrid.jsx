import React from 'react';
import SlotCard from './SlotCard';
import { Coffee, PlusCircle, AlertTriangle, Sparkles } from 'lucide-react';

export default function TimetableGrid({
  viewMode,
  timetable,
  divisions,
  rooms,
  faculty,
  subjects,
  config,
  selectedDivisionId,
  selectedFacultyId,
  selectedRoomId,
  onSlotClick,
  onEmptySlotClick,
  unallocated = []
}) {
  const divisionMap = new Map(divisions.map(d => [d.id, d]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const facultyMap = new Map(faculty.map(f => [f.id, f]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  // Filter relevant slots based on current view mode
  const getFilteredSlots = () => {
    if (viewMode === 'division') {
      return timetable.filter(s => s.divisionId === selectedDivisionId);
    }
    if (viewMode === 'faculty') {
      return timetable.filter(s => s.facultyId === selectedFacultyId);
    }
    if (viewMode === 'room') {
      return timetable.filter(s => s.roomId === selectedRoomId);
    }
    return timetable; // master
  };

  const activeSlots = getFilteredSlots();

  // Find slot for day and period
  const findSlot = (day, periodIndex, targetDivId = null) => {
    let pool = activeSlots;
    if (targetDivId) {
      pool = timetable.filter(s => s.divisionId === targetDivId);
    }

    // Direct slot starting at this period
    const direct = pool.find(s => s.day === day && s.period === periodIndex);
    if (direct) return { slot: direct, isContinuation: false };

    // Continuation of multi-hour session
    const continuation = pool.find(s => {
      const dur = s.duration || 1;
      return s.day === day && s.period < periodIndex && (s.period + dur) > periodIndex;
    });
    if (continuation) return { slot: continuation, isContinuation: true };

    return null;
  };

  // Check if faculty is marked unavailable during this slot
  const isFacultyUnavailable = (day, periodIndex) => {
    if (viewMode !== 'faculty') return false;
    const fac = facultyMap.get(selectedFacultyId);
    if (!fac?.unavailableSlots) return false;
    const dayShort = config.dayShort[config.days.indexOf(day)];
    return fac.unavailableSlots.some(
      un => (un.day === day || un.day === dayShort) && un.period === periodIndex
    );
  };

  const currentEntityName = () => {
    if (viewMode === 'division') return divisionMap.get(selectedDivisionId)?.name || 'Division';
    if (viewMode === 'faculty') return facultyMap.get(selectedFacultyId)?.name || 'Faculty Member';
    if (viewMode === 'room') return roomMap.get(selectedRoomId)?.name || 'Room';
    return 'College Master Timetable';
  };

  return (
    <div className="timetable-wrapper">
      {/* Unallocated Sessions Warning Banner if any */}
      {unallocated.length > 0 && (
        <div className="unallocated-banner">
          <div className="banner-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="banner-content">
            <div className="banner-title">
              {unallocated.length} Session(s) Unallocated Due to Saturated Constraints
            </div>
            <div className="banner-desc">
              The solver satisfied all physical limits, but remaining sessions had no conflict-free slot.
              <span className="unallocated-pills">
                {unallocated.slice(0, 4).map((u, i) => (
                  <span key={i} className="unallocated-chip">
                    {u.subjectName} ({u.divisionName})
                  </span>
                ))}
                {unallocated.length > 4 && <span>+{unallocated.length - 4} more</span>}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid Container */}
      {viewMode === 'master' ? (
        <div className="master-grid-container">
          {divisions.map(div => (
            <div key={div.id} className="master-division-section">
              <div className="master-division-header">
                <span className="div-accent-bar" style={{ backgroundColor: div.color || '#3b82f6' }}></span>
                <h3>{div.name} ({div.shortCode})</h3>
                <span className="student-count-tag">{div.studentCount} Students</span>
              </div>

              <div className="grid-table-container">
                <table className="timetable-grid">
                  <thead>
                    <tr>
                      <th className="th-day">Day</th>
                      {config.periods.map(p => (
                        <th key={p.index} className={`th-period ${p.isBreak ? 'th-break' : ''}`}>
                          <div className="period-title">{p.name}</div>
                          <div className="period-time">{p.time}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {config.days.map(day => (
                      <tr key={day}>
                        <td className="td-day-label">
                          <span className="day-name">{day}</span>
                        </td>
                        {config.periods.map(p => {
                          if (p.isBreak) {
                            return (
                              <td key={p.index} className="td-cell td-break-cell">
                                <div className="break-cell-content">
                                  <Coffee size={14} />
                                  <span>Lunch</span>
                                </div>
                              </td>
                            );
                          }

                          const match = findSlot(day, p.index, div.id);
                          return (
                            <td key={p.index} className="td-cell">
                              {match ? (
                                <SlotCard
                                  slot={match.slot}
                                  subject={subjectMap.get(match.slot.subjectId)}
                                  faculty={facultyMap.get(match.slot.facultyId)}
                                  room={roomMap.get(match.slot.roomId)}
                                  division={div}
                                  isContinuation={match.isContinuation}
                                  onClick={() => onSlotClick(match.slot)}
                                  showDivision={false}
                                />
                              ) : (
                                <div
                                  className="empty-slot"
                                  onClick={() => onEmptySlotClick({ day, period: p.index, divisionId: div.id })}
                                >
                                  <span className="empty-text">Free</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="single-grid-container">
          <div className="grid-header-meta">
            <h2 className="current-schedule-title">{currentEntityName()}</h2>
            <div className="grid-stats-mini">
              <span>{activeSlots.length} Total Sessions</span>
              <span>•</span>
              <span>{activeSlots.reduce((a, s) => a + (s.duration || 1), 0)} Hours / Week</span>
            </div>
          </div>

          <div className="grid-table-container">
            <table className="timetable-grid">
              <thead>
                <tr>
                  <th className="th-day">Day</th>
                  {config.periods.map(p => (
                    <th key={p.index} className={`th-period ${p.isBreak ? 'th-break' : ''}`}>
                      <div className="period-title">{p.name}</div>
                      <div className="period-time">{p.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.days.map(day => (
                  <tr key={day}>
                    <td className="td-day-label">
                      <span className="day-name">{day}</span>
                    </td>
                    {config.periods.map(p => {
                      if (p.isBreak) {
                        return (
                          <td key={p.index} className="td-cell td-break-cell">
                            <div className="break-cell-content">
                              <Coffee size={15} />
                              <span>Lunch Break</span>
                            </div>
                          </td>
                        );
                      }

                      const unavailable = isFacultyUnavailable(day, p.index);
                      if (unavailable) {
                        return (
                          <td key={p.index} className="td-cell td-unavailable-cell">
                            <div className="unavailable-content" title="Faculty marked unavailable for this slot">
                              <span>Unavailable</span>
                            </div>
                          </td>
                        );
                      }

                      const match = findSlot(day, p.index);

                      return (
                        <td key={p.index} className="td-cell">
                          {match ? (
                            <SlotCard
                              slot={match.slot}
                              subject={subjectMap.get(match.slot.subjectId)}
                              faculty={facultyMap.get(match.slot.facultyId)}
                              room={roomMap.get(match.slot.roomId)}
                              division={divisionMap.get(match.slot.divisionId)}
                              isContinuation={match.isContinuation}
                              onClick={() => onSlotClick(match.slot)}
                              showDivision={viewMode !== 'division'}
                            />
                          ) : (
                            <div
                              className="empty-slot"
                              onClick={() => onEmptySlotClick({ day, period: p.index })}
                            >
                              <span className="empty-text">Free</span>
                              <PlusCircle size={14} className="empty-add-icon" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  LayoutGrid, 
  BookOpen, 
  Clock, 
  CheckCircle,
  FlaskConical,
  Award
} from 'lucide-react';

export default function ViewSelector({
  viewMode,
  setViewMode,
  divisions,
  faculty,
  rooms,
  subjects,
  timetable,
  selectedDivisionId,
  setSelectedDivisionId,
  selectedFacultyId,
  setSelectedFacultyId,
  selectedRoomId,
  setSelectedRoomId
}) {
  const currentDivision = divisions.find(d => d.id === selectedDivisionId);
  const currentFaculty = faculty.find(f => f.id === selectedFacultyId);
  const currentRoom = rooms.find(r => r.id === selectedRoomId);

  // Calculate contextual stats for active entity
  const divisionStats = () => {
    if (!currentDivision) return null;
    const divSubjects = subjects.filter(s => s.divisionId === currentDivision.id);
    const divSlots = timetable.filter(s => s.divisionId === currentDivision.id);
    const totalHours = divSlots.reduce((a, s) => a + (s.duration || 1), 0);
    const labHours = divSlots.filter(s => (s.duration || 1) > 1).reduce((a, s) => a + s.duration, 0);
    return {
      subjectCount: divSubjects.length,
      totalHours,
      labHours,
      theoryHours: totalHours - labHours
    };
  };

  const facultyStats = () => {
    if (!currentFaculty) return null;
    const facSlots = timetable.filter(s => s.facultyId === currentFaculty.id);
    const totalAssigned = facSlots.reduce((a, s) => a + (s.duration || 1), 0);
    const percentage = Math.min(100, Math.round((totalAssigned / currentFaculty.maxWeeklyLectures) * 100));
    return {
      totalAssigned,
      maxWeekly: currentFaculty.maxWeeklyLectures,
      percentage,
      maxDaily: currentFaculty.maxDailyLectures
    };
  };

  const roomStats = () => {
    if (!currentRoom) return null;
    const roomSlots = timetable.filter(s => s.roomId === currentRoom.id);
    const totalOccupied = roomSlots.reduce((a, s) => a + (s.duration || 1), 0);
    const totalWeeklySlots = 30; // 5 days x 6 periods
    const utilization = Math.min(100, Math.round((totalOccupied / totalWeeklySlots) * 100));
    return {
      totalOccupied,
      utilization,
      freeSlots: Math.max(0, totalWeeklySlots - totalOccupied)
    };
  };

  const divStat = divisionStats();
  const facStat = facultyStats();
  const rmStat = roomStats();

  return (
    <div className="view-selector-container">
      {/* Mode Tabs */}
      <div className="view-mode-tabs-wrapper">
        <div className="view-mode-tabs">
          <button
            className={`view-tab ${viewMode === 'division' ? 'active' : ''}`}
            onClick={() => setViewMode('division')}
          >
            <GraduationCap size={17} />
            <span>Division Schedule</span>
          </button>

          <button
            className={`view-tab ${viewMode === 'faculty' ? 'active' : ''}`}
            onClick={() => setViewMode('faculty')}
          >
            <Users size={17} />
            <span>Faculty Schedule</span>
          </button>

          <button
            className={`view-tab ${viewMode === 'room' ? 'active' : ''}`}
            onClick={() => setViewMode('room')}
          >
            <Building2 size={17} />
            <span>Room Utilization</span>
          </button>

          <button
            className={`view-tab ${viewMode === 'master' ? 'active' : ''}`}
            onClick={() => setViewMode('master')}
          >
            <LayoutGrid size={17} />
            <span>Master Matrix</span>
          </button>
        </div>
      </div>

      {/* Entity Selector & Meaningful Context Banner */}
      <div className="entity-selector-bar">
        {viewMode === 'division' && (
          <div className="selector-with-context">
            <div className="pill-group">
              <span className="pill-label">Select Division:</span>
              {divisions.map(div => (
                <button
                  key={div.id}
                  className={`entity-pill ${selectedDivisionId === div.id ? 'active' : ''}`}
                  onClick={() => setSelectedDivisionId(div.id)}
                >
                  <span className="pill-dot" style={{ backgroundColor: div.color || '#3b82f6' }} />
                  <span>{div.shortCode || div.name}</span>
                  <span className="pill-badge">{div.studentCount} seats</span>
                </button>
              ))}
            </div>

            {divStat && (
              <div className="context-chip-row">
                <span className="context-chip">
                  <BookOpen size={13} /> {divStat.subjectCount} Enrolled Courses
                </span>
                <span className="context-chip">
                  <Clock size={13} /> {divStat.totalHours} Academic Hours / Week
                </span>
                <span className="context-chip highlight-chip">
                  <FlaskConical size={13} /> {divStat.labHours}h Practical Labs
                </span>
              </div>
            )}
          </div>
        )}

        {viewMode === 'faculty' && (
          <div className="selector-with-context">
            <div className="dropdown-filter-group">
              <label className="filter-label">
                <Users size={15} /> Select Faculty Member:
              </label>
              <select
                className="entity-dropdown"
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.department})
                  </option>
                ))}
              </select>
            </div>

            {facStat && (
              <div className="workload-progress-bar-container">
                <div className="workload-info">
                  <span className="workload-label">Teaching Load:</span>
                  <span className="workload-val">{facStat.totalAssigned} / {facStat.maxWeekly} hrs ({facStat.percentage}%)</span>
                </div>
                <div className="progress-track">
                  <div 
                    className={`progress-fill ${facStat.percentage > 90 ? 'progress-danger' : 'progress-success'}`}
                    style={{ width: `${facStat.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'room' && (
          <div className="selector-with-context">
            <div className="dropdown-filter-group">
              <label className="filter-label">
                <Building2 size={15} /> Select Classroom / Lab:
              </label>
              <select
                className="entity-dropdown"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type === 'lab' ? 'Laboratory' : 'Lecture Hall'}) — Cap: {r.capacity}
                  </option>
                ))}
              </select>
            </div>

            {rmStat && (
              <div className="context-chip-row">
                <span className="context-chip">
                  <Building2 size={13} /> {currentRoom?.building}
                </span>
                <span className="context-chip highlight-chip">
                  Occupancy: {rmStat.utilization}% ({rmStat.totalOccupied} hrs booked)
                </span>
                <span className="context-chip">
                  {rmStat.freeSlots} Free Periods Available
                </span>
              </div>
            )}
          </div>
        )}

        {viewMode === 'master' && (
          <div className="master-legend">
            <span className="legend-item"><span className="legend-dot theory"></span> Theory Lecture (1h)</span>
            <span className="legend-item"><span className="legend-dot lab"></span> Practical Lab Block (2h)</span>
            <span className="legend-item"><span className="legend-dot break"></span> Recess / Lunch Break</span>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles,
  BookOpen,
  Layers,
  GraduationCap
} from 'lucide-react';
import { validateNewSlot } from '../solver/conflictValidator';
import { ROOM_TYPES, SUBJECT_TYPES } from '../data/models';

export default function AddSubjectModal({
  isOpen,
  onClose,
  initialSlot = null, // { day, period, divisionId, facultyId, roomId }
  timetable = [],
  divisions = [],
  rooms = [],
  faculty = [],
  subjects = [],
  config,
  currentUser,
  onAddSubject
}) {
  if (!isOpen) return null;

  // Selected State
  const [selectedDivisionId, setSelectedDivisionId] = useState(
    initialSlot?.divisionId || divisions[0]?.id || ''
  );

  // Available subjects for the selected division
  const divisionSubjects = subjects.filter(s => s.divisionId === selectedDivisionId);

  const [selectedSubjectId, setSelectedSubjectId] = useState(
    divisionSubjects[0]?.id || (subjects[0]?.id || 'custom')
  );

  // Custom subject toggle
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [customSubjectCode, setCustomSubjectCode] = useState('');
  const [customSubjectType, setCustomSubjectType] = useState(SUBJECT_TYPES.THEORY);

  // Determine current active subject object
  const activeSubject = isCustomSubject 
    ? {
        id: `custom-sub-${Date.now()}`,
        name: customSubjectName || 'Special Session',
        code: customSubjectCode || 'SPL-101',
        type: customSubjectType,
        preferredRoomType: customSubjectType === SUBJECT_TYPES.PRACTICAL ? ROOM_TYPES.LAB : ROOM_TYPES.LECTURE_HALL,
        color: '#8b5cf6'
      }
    : (subjects.find(s => s.id === selectedSubjectId) || divisionSubjects[0] || subjects[0]);

  // Selected Faculty
  const [selectedFacultyId, setSelectedFacultyId] = useState(() => {
    if (currentUser?.facultyId && faculty.some(f => f.id === currentUser.facultyId)) {
      return currentUser.facultyId;
    }
    if (initialSlot?.facultyId) return initialSlot.facultyId;
    return activeSubject?.facultyId || faculty[0]?.id || '';
  });

  // Selected Room
  const [selectedRoomId, setSelectedRoomId] = useState(() => {
    if (initialSlot?.roomId) return initialSlot.roomId;
    const preferred = activeSubject?.preferredRoomType === ROOM_TYPES.LAB 
      ? rooms.find(r => r.type === ROOM_TYPES.LAB) 
      : rooms.find(r => r.type === ROOM_TYPES.LECTURE_HALL);
    return preferred?.id || rooms[0]?.id || '';
  });

  // Day & Period
  const [selectedDay, setSelectedDay] = useState(initialSlot?.day || config.days[0] || 'Monday');
  const [selectedPeriod, setSelectedPeriod] = useState(
    initialSlot?.period ? String(initialSlot.period) : '1'
  );

  // Duration
  const [duration, setDuration] = useState(
    activeSubject?.type === SUBJECT_TYPES.PRACTICAL ? 2 : 1
  );

  // Notes
  const [notes, setNotes] = useState('');

  // Live Conflict Validation Result
  const [validationResult, setValidationResult] = useState({ isValid: true, conflicts: [] });

  // Update selected subject when division changes
  useEffect(() => {
    if (!isCustomSubject) {
      const divSubs = subjects.filter(s => s.divisionId === selectedDivisionId);
      if (divSubs.length > 0) {
        setSelectedSubjectId(divSubs[0].id);
        if (divSubs[0].facultyId && currentUser?.role !== 'faculty') {
          setSelectedFacultyId(divSubs[0].facultyId);
        }
      }
    }
  }, [selectedDivisionId]);

  // Update preferred room and duration when subject changes
  useEffect(() => {
    if (activeSubject) {
      if (activeSubject.facultyId && currentUser?.role !== 'faculty') {
        setSelectedFacultyId(activeSubject.facultyId);
      }
      const isLab = activeSubject.type === SUBJECT_TYPES.PRACTICAL || activeSubject.preferredRoomType === ROOM_TYPES.LAB;
      setDuration(isLab ? 2 : 1);

      const suitableRoom = isLab 
        ? rooms.find(r => r.type === ROOM_TYPES.LAB) 
        : rooms.find(r => r.type === ROOM_TYPES.LECTURE_HALL);
      if (suitableRoom) setSelectedRoomId(suitableRoom.id);
    }
  }, [selectedSubjectId, isCustomSubject]);

  // Run Real-time Conflict Validation
  useEffect(() => {
    const periodNum = parseInt(selectedPeriod, 10);
    const durNum = parseInt(duration, 10);

    const subjectListForVal = isCustomSubject 
      ? [...subjects, activeSubject] 
      : subjects;

    const result = validateNewSlot({
      divisionId: selectedDivisionId,
      subjectId: activeSubject?.id || selectedSubjectId,
      facultyId: selectedFacultyId,
      roomId: selectedRoomId,
      day: selectedDay,
      period: periodNum,
      duration: durNum,
      timetable,
      divisions,
      rooms,
      faculty,
      subjects: subjectListForVal,
      config
    });

    setValidationResult(result);
  }, [
    selectedDivisionId,
    selectedSubjectId,
    selectedFacultyId,
    selectedRoomId,
    selectedDay,
    selectedPeriod,
    duration,
    isCustomSubject,
    customSubjectName,
    customSubjectType
  ]);

  // Auto Find Free Room for this slot
  const handleAutoFindFreeRoom = () => {
    const periodNum = parseInt(selectedPeriod, 10);
    const durNum = parseInt(duration, 10);

    const isLab = activeSubject?.type === SUBJECT_TYPES.PRACTICAL || activeSubject?.preferredRoomType === ROOM_TYPES.LAB;
    const targetRoomType = isLab ? ROOM_TYPES.LAB : ROOM_TYPES.LECTURE_HALL;

    const candidateRooms = rooms.filter(r => r.type === targetRoomType);

    for (const r of candidateRooms) {
      let isRoomBusy = false;
      for (let pOffset = 0; pOffset < durNum; pOffset++) {
        const checkPeriod = periodNum + pOffset;
        const busy = timetable.some(s => {
          if (s.day !== selectedDay || s.roomId !== r.id) return false;
          const sDur = s.duration || 1;
          return checkPeriod >= s.period && checkPeriod < s.period + sDur;
        });
        if (busy) {
          isRoomBusy = true;
          break;
        }
      }
      if (!isRoomBusy) {
        setSelectedRoomId(r.id);
        return;
      }
    }

    if (candidateRooms[0]) {
      setSelectedRoomId(candidateRooms[0].id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const periodNum = parseInt(selectedPeriod, 10);
    const durNum = parseInt(duration, 10);

    const newSlotData = {
      divisionId: selectedDivisionId,
      subjectId: activeSubject?.id || selectedSubjectId,
      customSubject: isCustomSubject ? activeSubject : null,
      facultyId: selectedFacultyId,
      roomId: selectedRoomId,
      day: selectedDay,
      period: periodNum,
      duration: durNum,
      notes: notes.trim()
    };

    onAddSubject(newSlotData);
    onClose();
  };

  return (
    <div className="modal-overlay add-subject-modal-overlay" onClick={onClose}>
      <div className="modal-content add-subject-modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="add-subject-form-wrapper">
          {/* Header - Always Fixed at Top */}
          <div className="modal-header compact-modal-header">
            <div className="modal-title-group">
              <div className="compact-badge-icon">
                <PlusCircle size={18} />
              </div>
              <div>
                <h3 className="compact-title">Add Subject to Timetable</h3>
                <p className="compact-subtitle">
                  Configure classroom session with real-time collision detection
                </p>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close modal">
              <X size={16} />
            </button>
          </div>

          {/* Form Scrollable Area - Properly Structured into Logical Sections */}
          <div className="compact-modal-scroll-area">
            {/* Section 1: Classroom & Subject Information */}
            <div className="form-section-card">
              <div className="form-section-header">
                <Layers size={14} className="text-primary" />
                <span>1. Classroom & Course Subject</span>
              </div>

              <div className="form-section-body">
                {/* 1. Classroom / Division */}
                <div className="form-group-item">
                  <label htmlFor="modal-select-division">Classroom / Division *</label>
                  <select
                    id="modal-select-division"
                    className="form-control form-select-full"
                    value={selectedDivisionId}
                    onChange={(e) => setSelectedDivisionId(e.target.value)}
                  >
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.shortCode}) • Capacity: {d.studentCount} students
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Subject / Course */}
                <div className="form-group-item">
                  <div className="label-with-action-row">
                    <label htmlFor="modal-select-subject">Subject / Course *</label>
                    <button
                      type="button"
                      className="btn-toggle-custom"
                      onClick={() => setIsCustomSubject(!isCustomSubject)}
                    >
                      {isCustomSubject ? '← Back to Curriculum' : '+ Add Custom Subject'}
                    </button>
                  </div>

                  {!isCustomSubject ? (
                    <select
                      id="modal-select-subject"
                      className="form-control form-select-full"
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                    >
                      {divisionSubjects.length > 0 ? (
                        divisionSubjects.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.code} — {s.name} ({s.type === 'practical' ? 'Practical Lab 2h' : 'Theory 1h'})
                          </option>
                        ))
                      ) : (
                        <option value="">No curriculum subjects registered</option>
                      )}
                    </select>
                  ) : (
                    <div className="custom-subject-inputs-row">
                      <input
                        type="text"
                        className="form-control custom-name-input"
                        placeholder="Subject Name (e.g. AI Ethics)"
                        value={customSubjectName}
                        onChange={(e) => setCustomSubjectName(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-control custom-code-input"
                        placeholder="Code (e.g. CS-490)"
                        value={customSubjectCode}
                        onChange={(e) => setCustomSubjectCode(e.target.value)}
                      />
                      <select
                        className="form-control custom-type-select"
                        value={customSubjectType}
                        onChange={(e) => setCustomSubjectType(e.target.value)}
                      >
                        <option value={SUBJECT_TYPES.THEORY}>Theory (1h)</option>
                        <option value={SUBJECT_TYPES.PRACTICAL}>Lab (2h)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Faculty & Location Assignment */}
            <div className="form-section-card">
              <div className="form-section-header">
                <GraduationCap size={14} className="text-success" />
                <span>2. Faculty & Classroom Venue</span>
              </div>

              <div className="form-section-body form-grid-2col">
                {/* 3. Assigned Faculty */}
                <div className="form-group-item">
                  <label htmlFor="modal-select-faculty">Assigned Faculty *</label>
                  <select
                    id="modal-select-faculty"
                    className="form-control form-select-full"
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                  >
                    {faculty.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.department || 'CSE'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Classroom / Lab Room */}
                <div className="form-group-item">
                  <div className="label-with-action-row">
                    <label htmlFor="modal-select-room">Room / Hall *</label>
                    <button
                      type="button"
                      className="btn-auto-pick-room"
                      onClick={handleAutoFindFreeRoom}
                      title="Automatically find a free room for this time slot"
                    >
                      <Sparkles size={11} /> Auto-pick Free
                    </button>
                  </div>
                  <select
                    id="modal-select-room"
                    className="form-control form-select-full"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.type === 'lab' ? 'Lab' : 'Lecture Hall'}) • Cap: {r.capacity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Timing & Duration (3 Dedicated Columns) */}
            <div className="form-section-card">
              <div className="form-section-header">
                <Clock size={14} className="text-info" />
                <span>3. Schedule Timing & Slot Duration</span>
              </div>

              <div className="form-section-body form-grid-3col">
                {/* 5. Day */}
                <div className="form-group-item">
                  <label htmlFor="modal-select-day">Day of Week *</label>
                  <select
                    id="modal-select-day"
                    className="form-control form-select-full"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    {config.days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* 6. Period */}
                <div className="form-group-item">
                  <label htmlFor="modal-select-period">Time Period *</label>
                  <select
                    id="modal-select-period"
                    className="form-control form-select-full"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    {config.periods.filter(p => !p.isBreak).map(p => (
                      <option key={p.index} value={p.index}>
                        {p.name} ({p.time})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Duration */}
                <div className="form-group-item">
                  <label htmlFor="modal-select-duration">Session Duration *</label>
                  <select
                    id="modal-select-duration"
                    className="form-control form-select-full"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  >
                    <option value={1}>1 Hour (Standard)</option>
                    <option value={2}>2 Hours (Lab Block)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Remarks & Conflict Status */}
            <div className="form-section-card">
              <div className="form-section-body">
                {/* 8. Optional Notes */}
                <div className="form-group-item">
                  <label htmlFor="modal-input-notes">Topic / Remarks (Optional)</label>
                  <input
                    id="modal-input-notes"
                    type="text"
                    className="form-control form-select-full"
                    placeholder="e.g. Unit 3 Revision, Lab Practical, Seminar"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* 9. Live Conflict Validation Status Banner */}
                <div className="modal-status-banner-wrap">
                  {validationResult.isValid ? (
                    <div className="status-pill valid-pill">
                      <CheckCircle2 size={16} className="flex-shrink-0" />
                      <span>Slot is conflict-free (Faculty, Room & Division ready)</span>
                    </div>
                  ) : (
                    <div className="status-pill error-pill">
                      <AlertTriangle size={16} className="flex-shrink-0" />
                      <span>Conflict: {validationResult.conflicts[0]?.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer - Always Fixed at Bottom, Never Cut Off */}
          <div className="modal-footer compact-modal-footer">
            <button type="button" className="btn btn-secondary compact-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary compact-btn btn-add-confirm"
              disabled={!validationResult.isValid && currentUser?.role !== 'admin'}
            >
              <PlusCircle size={15} />
              <span>Add to Timetable</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

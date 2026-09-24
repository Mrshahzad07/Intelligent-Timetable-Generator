import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRightLeft, Trash2, MapPin, User, Calendar, Clock } from 'lucide-react';
import { validateSlotMove } from '../solver/conflictValidator';

export default function ManualSwapModal({
  isOpen,
  onClose,
  slot,
  timetable,
  divisions,
  rooms,
  faculty,
  subjects,
  config,
  onSaveMove,
  onDeleteSlot
}) {
  if (!isOpen || !slot) return null;

  const divisionMap = new Map(divisions.map(d => [d.id, d]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const facultyMap = new Map(faculty.map(f => [f.id, f]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  const currentSubject = subjectMap.get(slot.subjectId);
  const currentFaculty = facultyMap.get(slot.facultyId);
  const currentDivision = divisionMap.get(slot.divisionId);
  const currentRoom = roomMap.get(slot.roomId);

  const [targetDay, setTargetDay] = useState(slot.day);
  const [targetPeriod, setTargetPeriod] = useState(slot.period);
  const [targetRoomId, setTargetRoomId] = useState(slot.roomId);
  const [validationResult, setValidationResult] = useState({ isValid: true, conflicts: [] });

  // Re-validate dynamically whenever destination inputs change
  useEffect(() => {
    const result = validateSlotMove({
      slotToMove: slot,
      targetDay,
      targetPeriod: parseInt(targetPeriod, 10),
      targetRoomId,
      timetable,
      divisions,
      rooms,
      faculty,
      subjects,
      config
    });
    setValidationResult(result);
  }, [slot, targetDay, targetPeriod, targetRoomId, timetable]);

  const handleApply = () => {
    if (!validationResult.isValid) return;
    onSaveMove({
      slotId: slot.id,
      day: targetDay,
      period: parseInt(targetPeriod, 10),
      roomId: targetRoomId
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <ArrowRightLeft size={20} className="modal-icon text-primary" />
            <div>
              <h3>Reschedule or Swap Session</h3>
              <p className="modal-subtitle">Interactive constraint-aware class slot editor</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Current Session Summary Card */}
          <div className="current-slot-summary" style={{ borderLeftColor: currentSubject?.color || '#3b82f6' }}>
            <div className="summary-title-row">
              <h4>{currentSubject?.name}</h4>
              <span className="code-pill">{currentSubject?.code}</span>
            </div>
            <div className="summary-details-grid">
              <div><User size={13} /> {currentFaculty?.name}</div>
              <div><MapPin size={13} /> {currentRoom?.name}</div>
              <div><Calendar size={13} /> {slot.day}</div>
              <div><Clock size={13} /> Period {slot.period} ({slot.duration || 1} hr)</div>
            </div>
          </div>

          {/* Destination Form */}
          <div className="reschedule-form">
            <h4 className="form-subheading">Select Target Time & Room</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Target Day</label>
                <select
                  value={targetDay}
                  onChange={(e) => setTargetDay(e.target.value)}
                  className="form-control"
                >
                  {config.days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Target Starting Period</label>
                <select
                  value={targetPeriod}
                  onChange={(e) => setTargetPeriod(e.target.value)}
                  className="form-control"
                >
                  {config.periods.filter(p => !p.isBreak).map(p => (
                    <option key={p.index} value={p.index}>
                      {p.name} ({p.time})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Target Classroom / Lab</label>
              <select
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="form-control"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type === 'lab' ? 'Lab' : 'Lecture Hall'}) — Cap: {r.capacity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Constraint Conflict Validation Preview */}
          <div className="validation-preview-box">
            {validationResult.isValid ? (
              <div className="valid-feedback">
                <CheckCircle2 size={18} className="text-success" />
                <span>Move is 100% Valid. No teacher, room, or division conflicts detected.</span>
              </div>
            ) : (
              <div className="invalid-feedback">
                <div className="invalid-header">
                  <AlertTriangle size={18} className="text-danger" />
                  <span>Hard Constraint Violations Detected ({validationResult.conflicts.length}):</span>
                </div>
                <ul className="conflict-list">
                  {validationResult.conflicts.map((c, i) => (
                    <li key={i}>{c.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-danger-outline"
            onClick={() => {
              onDeleteSlot(slot.id);
              onClose();
            }}
          >
            <Trash2 size={15} />
            <span>Remove from Grid</span>
          </button>

          <div className="footer-right">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleApply}
              disabled={!validationResult.isValid}
            >
              Apply Move
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

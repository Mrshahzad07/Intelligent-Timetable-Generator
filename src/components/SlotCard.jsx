import React from 'react';
import { User, MapPin, Clock, FlaskConical, BookOpen, AlertCircle } from 'lucide-react';

export default function SlotCard({
  slot,
  subject,
  faculty,
  room,
  division,
  onClick,
  isContinuation = false,
  showDivision = false
}) {
  if (isContinuation) {
    return (
      <div className="slot-card continuation-card" onClick={onClick} title="Continued from previous period">
        <div className="continuation-bar"></div>
        <div className="continuation-content">
          <FlaskConical size={14} className="icon-pulse" />
          <span>{subject?.name} (Lab Contd.)</span>
        </div>
      </div>
    );
  }

  const isLab = (slot.duration || 1) > 1 || subject?.type === 'practical';

  return (
    <div
      className={`slot-card ${isLab ? 'lab-card' : 'theory-card'} ${slot.hasConflict ? 'conflict-card' : ''}`}
      onClick={onClick}
      style={{
        borderLeftColor: subject?.color || '#3b82f6'
      }}
      title="Click to inspect, swap, or reassign this slot"
    >
      <div className="slot-card-header">
        <span className="subject-code-badge" style={{ backgroundColor: `${subject?.color || '#3b82f6'}20`, color: subject?.color || '#3b82f6' }}>
          {subject?.code || 'SUB'}
        </span>
        <span className="session-type-badge">
          {isLab ? (
            <>
              <FlaskConical size={12} />
              <span>Lab (2h)</span>
            </>
          ) : (
            <>
              <BookOpen size={12} />
              <span>Theory</span>
            </>
          )}
        </span>
      </div>

      <div className="slot-subject-title">
        {subject?.name || 'Class Session'}
      </div>

      <div className="slot-card-meta">
        {showDivision && division && (
          <div className="meta-row meta-division">
            <span className="meta-div-tag" style={{ backgroundColor: `${division.color || '#3b82f6'}22` }}>
              {division.shortCode || division.name}
            </span>
          </div>
        )}

        <div className="meta-row">
          <User size={13} className="meta-icon" />
          <span className="meta-text">{faculty?.name || 'Unassigned'}</span>
        </div>

        <div className="meta-row">
          <MapPin size={13} className="meta-icon" />
          <span className="meta-text">{room?.name || 'Unassigned Room'}</span>
        </div>
      </div>

      {slot.hasConflict && (
        <div className="conflict-badge-mini" title="This slot violates a constraint!">
          <AlertCircle size={12} />
          <span>Conflict</span>
        </div>
      )}
    </div>
  );
}

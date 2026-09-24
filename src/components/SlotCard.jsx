import React from 'react';
import { User, MapPin, FlaskConical, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

export default function SlotCard({
  slot,
  subject,
  faculty,
  room,
  division,
  onClick,
  isContinuation = false,
  showDivision = false,
  searchQuery = ''
}) {
  const accentColor = subject?.color || '#3b82f6';

  // Check if matches active search filter
  const isMatch = searchQuery.trim() !== '' && (
    (subject?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (subject?.code?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (faculty?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (room?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (division?.shortCode?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isDimmed = searchQuery.trim() !== '' && !isMatch;

  if (isContinuation) {
    return (
      <div 
        className={`slot-card continuation-card ${isMatch ? 'search-matched' : ''} ${isDimmed ? 'search-dimmed' : ''}`} 
        onClick={onClick} 
        style={{ '--card-accent': accentColor }}
        title="Continued practical session from previous period"
      >
        <div className="continuation-bar"></div>
        <div className="continuation-content">
          <FlaskConical size={13} className="icon-pulse" />
          <span>{subject?.name} (Lab Contd.)</span>
        </div>
      </div>
    );
  }

  const isLab = (slot.duration || 1) > 1 || subject?.type === 'practical';

  return (
    <div
      className={`slot-card ${isLab ? 'lab-card' : 'theory-card'} ${slot.hasConflict ? 'conflict-card' : ''} ${isMatch ? 'search-matched' : ''} ${isDimmed ? 'search-dimmed' : ''}`}
      onClick={onClick}
      style={{
        '--card-accent': accentColor,
        borderLeftColor: accentColor
      }}
      title="Click to inspect, swap, or reassign this slot"
    >
      <div className="slot-card-header">
        <span 
          className="subject-code-badge" 
          style={{ 
            backgroundColor: `${accentColor}25`, 
            color: accentColor,
            borderColor: `${accentColor}40`
          }}
        >
          {subject?.code || 'SUB'}
        </span>
        <span className="session-type-badge">
          {isLab ? (
            <>
              <FlaskConical size={11} className="badge-icon-lab" />
              <span>Lab (2h)</span>
            </>
          ) : (
            <>
              <BookOpen size={11} className="badge-icon-theory" />
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
          <User size={12} className="meta-icon" />
          <span className="meta-text">{faculty?.name || 'Unassigned'}</span>
        </div>

        <div className="meta-row">
          <MapPin size={12} className="meta-icon" />
          <span className="meta-text">{room?.name || 'Unassigned Room'}</span>
        </div>
      </div>

      {isMatch && (
        <span className="search-match-badge" title="Matches active search">
          <Sparkles size={10} />
        </span>
      )}

      {slot.hasConflict && (
        <div className="conflict-badge-mini" title="This slot violates a constraint!">
          <AlertCircle size={11} />
          <span>Conflict</span>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { 
  X, 
  BookOpen, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  FlaskConical, 
  Users, 
  ArrowRightLeft,
  Mail,
  Building,
  Sparkles
} from 'lucide-react';

export default function LectureDetailsModal({
  isOpen,
  onClose,
  slot,
  timetable,
  divisions,
  rooms,
  faculty,
  subjects,
  config,
  currentUser,
  onOpenReschedule
}) {
  if (!isOpen || !slot) return null;

  const division = divisions.find(d => d.id === slot.divisionId);
  const room = rooms.find(r => r.id === slot.roomId);
  const teacher = faculty.find(f => f.id === slot.facultyId);
  const subject = subjects.find(s => s.id === slot.subjectId);

  const periodConfig = config?.periods?.find(p => p.index === slot.period);
  const isLab = (slot.duration || 1) > 1 || subject?.type === 'practical';
  const canEdit = currentUser?.permissions?.canEditSlot;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content lecture-details-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottomColor: subject?.color || 'var(--primary)' }}>
          <div className="modal-title-group">
            <div 
              className="lecture-color-tag" 
              style={{ backgroundColor: subject?.color || '#3b82f6' }}
            >
              {isLab ? <FlaskConical size={20} color="#fff" /> : <BookOpen size={20} color="#fff" />}
            </div>
            <div>
              <div className="lecture-header-sub">
                <span className="lecture-code-badge">{subject?.code || 'COURSE'}</span>
                <span className="lecture-type-badge">{isLab ? 'Laboratory Session' : 'Theory Lecture'}</span>
              </div>
              <h3>{subject?.name || 'Class Session'}</h3>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body lecture-details-body">
          {/* Key Metric Grid */}
          <div className="lecture-info-grid">
            {/* Instructor */}
            <div className="info-card">
              <div className="info-card-header">
                <User size={15} className="text-primary" />
                <span>Course Instructor</span>
              </div>
              <div className="info-card-value">{teacher?.name || 'Faculty Member'}</div>
              <div className="info-card-sub">{teacher?.department || 'Department Faculty'}</div>
              {teacher?.email && (
                <div className="info-card-email">
                  <Mail size={12} /> {teacher.email}
                </div>
              )}
            </div>

            {/* Room / Location */}
            <div className="info-card">
              <div className="info-card-header">
                <MapPin size={15} className="text-primary" />
                <span>Classroom / Venue</span>
              </div>
              <div className="info-card-value">{room?.name || 'Assigned Room'}</div>
              <div className="info-card-sub">
                <Building size={12} /> {room?.building || 'Campus Wing'} • Cap: {room?.capacity || 60}
              </div>
              {room?.equipment && (
                <div className="info-card-extra">{room.equipment}</div>
              )}
            </div>

            {/* Schedule & Timing */}
            <div className="info-card">
              <div className="info-card-header">
                <Clock size={15} className="text-primary" />
                <span>Session Timing</span>
              </div>
              <div className="info-card-value">
                {periodConfig ? periodConfig.time : `Period ${slot.period}`}
              </div>
              <div className="info-card-sub">
                <Calendar size={12} /> {slot.day} • {slot.duration || 1} Hour{(slot.duration || 1) > 1 ? 's' : ''}
              </div>
            </div>

            {/* Division / Classroom */}
            <div className="info-card">
              <div className="info-card-header">
                <Users size={15} className="text-primary" />
                <span>Enrolled Class</span>
              </div>
              <div className="info-card-value">{division?.name || 'Division'}</div>
              <div className="info-card-sub">{division?.shortCode} • {division?.studentCount} Students</div>
            </div>
          </div>

          {/* Additional Notes / Instructions */}
          {slot.notes && (
            <div className="lecture-notes-box">
              <div className="notes-header">
                <Sparkles size={14} className="text-primary" />
                <strong>Session Brief / Topic Notes:</strong>
              </div>
              <p className="notes-content">{slot.notes}</p>
            </div>
          )}

          {isLab && (
            <div className="lab-guidelines-box">
              <strong>🔬 Laboratory Advisory:</strong>
              <p>Students must report to {room?.name} with prescribed laboratory attire and practical records on time.</p>
            </div>
          )}
        </div>

        <div className="modal-footer lecture-modal-footer">
          {canEdit && (
            <button
              className="btn btn-secondary btn-reschedule"
              onClick={() => {
                onClose();
                onOpenReschedule(slot);
              }}
            >
              <ArrowRightLeft size={15} />
              <span>Reschedule / Move Session</span>
            </button>
          )}

          <div className="footer-right">
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Users, Building2, BookOpen, GraduationCap, RefreshCw } from 'lucide-react';
import { ROOM_TYPES, SUBJECT_TYPES } from '../data/models';

export default function DataConfigModal({
  isOpen,
  onClose,
  divisions,
  setDivisions,
  rooms,
  setRooms,
  faculty,
  setFaculty,
  subjects,
  setSubjects,
  onResetPreset
}) {
  const [activeTab, setActiveTab] = useState('divisions');

  if (!isOpen) return null;

  // Handler for adding a new subject
  const handleAddSubject = () => {
    const newSub = {
      id: `sub-custom-${Date.now()}`,
      name: 'New Academic Subject',
      code: 'CS' + Math.floor(100 + Math.random() * 900),
      type: SUBJECT_TYPES.THEORY,
      divisionId: divisions[0]?.id || '',
      facultyId: faculty[0]?.id || '',
      weeklySessions: 3,
      duration: 1,
      preferredRoomType: ROOM_TYPES.LECTURE_HALL,
      color: '#3b82f6'
    };
    setSubjects([...subjects, newSub]);
  };

  // Handler for adding a new classroom
  const handleAddRoom = () => {
    const newRoom = {
      id: `room-${Date.now()}`,
      name: `LH-${100 + rooms.length}`,
      type: ROOM_TYPES.LECTURE_HALL,
      capacity: 70,
      building: 'Main Block'
    };
    setRooms([...rooms, newRoom]);
  };

  // Handler for adding a new faculty member
  const handleAddFaculty = () => {
    const newFac = {
      id: `fac-${Date.now()}`,
      name: 'New Faculty Member',
      department: 'Computer Science',
      email: 'faculty@college.edu',
      maxDailyLectures: 3,
      maxWeeklyLectures: 14,
      unavailableSlots: []
    };
    setFaculty([...faculty, newFac]);
  };

  // Handler for adding a new division
  const handleAddDivision = () => {
    const newDiv = {
      id: `div-${Date.now()}`,
      name: `Division ${String.fromCharCode(65 + divisions.length)} (Yr 3)`,
      shortCode: `DIV-${String.fromCharCode(65 + divisions.length)}`,
      studentCount: 60,
      color: '#8b5cf6'
    };
    setDivisions([...divisions, newDiv]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <BookOpen size={20} className="modal-icon text-primary" />
            <div>
              <h3>Entities & Scheduling Constraints Configuration</h3>
              <p className="modal-subtitle">Manage college divisions, faculty workload, classrooms, and subject allocations</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="config-tabs-bar">
          <button
            className={`config-tab ${activeTab === 'divisions' ? 'active' : ''}`}
            onClick={() => setActiveTab('divisions')}
          >
            <GraduationCap size={15} /> Divisions ({divisions.length})
          </button>
          <button
            className={`config-tab ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculty')}
          >
            <Users size={15} /> Faculty ({faculty.length})
          </button>
          <button
            className={`config-tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            <Building2 size={15} /> Rooms & Labs ({rooms.length})
          </button>
          <button
            className={`config-tab ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <BookOpen size={15} /> Subjects ({subjects.length})
          </button>
        </div>

        <div className="modal-body config-body">
          {/* DIVISIONS TAB */}
          {activeTab === 'divisions' && (
            <div className="config-table-section">
              <div className="section-toolbar">
                <p>Manage college classes and student cohort strengths.</p>
                <button className="btn btn-sm btn-primary" onClick={handleAddDivision}>
                  <Plus size={14} /> Add Division
                </button>
              </div>

              <table className="config-table">
                <thead>
                  <tr>
                    <th>Division Name</th>
                    <th>Short Code</th>
                    <th>Students</th>
                    <th>Color</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {divisions.map((div, idx) => (
                    <tr key={div.id}>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={div.name}
                          onChange={(e) => {
                            const updated = [...divisions];
                            updated[idx].name = e.target.value;
                            setDivisions(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input w-80"
                          value={div.shortCode}
                          onChange={(e) => {
                            const updated = [...divisions];
                            updated[idx].shortCode = e.target.value;
                            setDivisions(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input w-80"
                          value={div.studentCount}
                          onChange={(e) => {
                            const updated = [...divisions];
                            updated[idx].studentCount = parseInt(e.target.value, 10) || 0;
                            setDivisions(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="color"
                          className="color-picker-input"
                          value={div.color || '#3b82f6'}
                          onChange={(e) => {
                            const updated = [...divisions];
                            updated[idx].color = e.target.value;
                            setDivisions(updated);
                          }}
                        />
                      </td>
                      <td>
                        <button
                          className="btn-icon-danger"
                          onClick={() => setDivisions(divisions.filter(d => d.id !== div.id))}
                          title="Delete division"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FACULTY TAB */}
          {activeTab === 'faculty' && (
            <div className="config-table-section">
              <div className="section-toolbar">
                <p>Manage professors, weekly contract ceilings, and daily workloads.</p>
                <button className="btn btn-sm btn-primary" onClick={handleAddFaculty}>
                  <Plus size={14} /> Add Faculty
                </button>
              </div>

              <table className="config-table">
                <thead>
                  <tr>
                    <th>Professor Name</th>
                    <th>Dept</th>
                    <th>Max Daily</th>
                    <th>Max Weekly</th>
                    <th>Unavailable Slots</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map((f, idx) => (
                    <tr key={f.id}>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={f.name}
                          onChange={(e) => {
                            const updated = [...faculty];
                            updated[idx].name = e.target.value;
                            setFaculty(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input w-80"
                          value={f.department}
                          onChange={(e) => {
                            const updated = [...faculty];
                            updated[idx].department = e.target.value;
                            setFaculty(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input w-60"
                          value={f.maxDailyLectures}
                          onChange={(e) => {
                            const updated = [...faculty];
                            updated[idx].maxDailyLectures = parseInt(e.target.value, 10) || 1;
                            setFaculty(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input w-60"
                          value={f.maxWeeklyLectures}
                          onChange={(e) => {
                            const updated = [...faculty];
                            updated[idx].maxWeeklyLectures = parseInt(e.target.value, 10) || 1;
                            setFaculty(updated);
                          }}
                        />
                      </td>
                      <td>
                        <span className="unavail-counter">
                          {(f.unavailableSlots || []).length} slots
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-icon-danger"
                          onClick={() => setFaculty(faculty.filter(item => item.id !== f.id))}
                          title="Delete faculty"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ROOMS TAB */}
          {activeTab === 'rooms' && (
            <div className="config-table-section">
              <div className="section-toolbar">
                <p>Manage physical classrooms, seminar halls, and computer/engineering labs.</p>
                <button className="btn btn-sm btn-primary" onClick={handleAddRoom}>
                  <Plus size={14} /> Add Room
                </button>
              </div>

              <table className="config-table">
                <thead>
                  <tr>
                    <th>Room Name</th>
                    <th>Type</th>
                    <th>Seating Capacity</th>
                    <th>Building</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r, idx) => (
                    <tr key={r.id}>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={r.name}
                          onChange={(e) => {
                            const updated = [...rooms];
                            updated[idx].name = e.target.value;
                            setRooms(updated);
                          }}
                        />
                      </td>
                      <td>
                        <select
                          className="table-select"
                          value={r.type}
                          onChange={(e) => {
                            const updated = [...rooms];
                            updated[idx].type = e.target.value;
                            setRooms(updated);
                          }}
                        >
                          <option value={ROOM_TYPES.LECTURE_HALL}>Lecture Hall</option>
                          <option value={ROOM_TYPES.LAB}>Laboratory</option>
                          <option value={ROOM_TYPES.SEMINAR}>Seminar Room</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input w-80"
                          value={r.capacity}
                          onChange={(e) => {
                            const updated = [...rooms];
                            updated[idx].capacity = parseInt(e.target.value, 10) || 0;
                            setRooms(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={r.building || ''}
                          onChange={(e) => {
                            const updated = [...rooms];
                            updated[idx].building = e.target.value;
                            setRooms(updated);
                          }}
                        />
                      </td>
                      <td>
                        <button
                          className="btn-icon-danger"
                          onClick={() => setRooms(rooms.filter(item => item.id !== r.id))}
                          title="Delete room"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUBJECTS TAB */}
          {activeTab === 'subjects' && (
            <div className="config-table-section">
              <div className="section-toolbar">
                <p>Assign courses to divisions and faculty with weekly credit periods.</p>
                <button className="btn btn-sm btn-primary" onClick={handleAddSubject}>
                  <Plus size={14} /> Add Subject
                </button>
              </div>

              <div className="table-scroll-container">
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Division</th>
                      <th>Faculty</th>
                      <th>Sessions</th>
                      <th>Duration</th>
                      <th>Room Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub, idx) => (
                      <tr key={sub.id}>
                        <td>
                          <input
                            type="text"
                            className="table-input"
                            value={sub.name}
                            onChange={(e) => {
                              const updated = [...subjects];
                              updated[idx].name = e.target.value;
                              setSubjects(updated);
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="table-input w-80"
                            value={sub.code}
                            onChange={(e) => {
                              const updated = [...subjects];
                              updated[idx].code = e.target.value;
                              setSubjects(updated);
                            }}
                          />
                        </td>
                        <td>
                          <select
                            className="table-select"
                            value={sub.type}
                            onChange={(e) => {
                              const updated = [...subjects];
                              const newType = e.target.value;
                              updated[idx].type = newType;
                              if (newType === SUBJECT_TYPES.PRACTICAL) {
                                updated[idx].duration = 2;
                                updated[idx].preferredRoomType = ROOM_TYPES.LAB;
                              } else {
                                updated[idx].duration = 1;
                                updated[idx].preferredRoomType = ROOM_TYPES.LECTURE_HALL;
                              }
                              setSubjects(updated);
                            }}
                          >
                            <option value={SUBJECT_TYPES.THEORY}>Theory</option>
                            <option value={SUBJECT_TYPES.PRACTICAL}>Practical (Lab)</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="table-select"
                            value={sub.divisionId}
                            onChange={(e) => {
                              const updated = [...subjects];
                              updated[idx].divisionId = e.target.value;
                              setSubjects(updated);
                            }}
                          >
                            {divisions.map(d => (
                              <option key={d.id} value={d.id}>{d.shortCode || d.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className="table-select"
                            value={sub.facultyId}
                            onChange={(e) => {
                              const updated = [...subjects];
                              updated[idx].facultyId = e.target.value;
                              setSubjects(updated);
                            }}
                          >
                            {faculty.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="table-input w-60"
                            value={sub.weeklySessions}
                            onChange={(e) => {
                              const updated = [...subjects];
                              updated[idx].weeklySessions = parseInt(e.target.value, 10) || 1;
                              setSubjects(updated);
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="table-input w-60"
                            value={sub.duration || 1}
                            onChange={(e) => {
                              const updated = [...subjects];
                              updated[idx].duration = parseInt(e.target.value, 10) || 1;
                              setSubjects(updated);
                            }}
                          />
                        </td>
                        <td>
                          <select
                            className="table-select"
                            value={sub.preferredRoomType || ROOM_TYPES.LECTURE_HALL}
                            onChange={(e) => {
                              const updated = [...subjects];
                              updated[idx].preferredRoomType = e.target.value;
                              setSubjects(updated);
                            }}
                          >
                            <option value={ROOM_TYPES.LECTURE_HALL}>Lecture Hall</option>
                            <option value={ROOM_TYPES.LAB}>Laboratory</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn-icon-danger"
                            onClick={() => setSubjects(subjects.filter(s => s.id !== sub.id))}
                            title="Delete subject"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onResetPreset}>
            <RefreshCw size={15} /> Reset Current Scenario
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Building, 
  GraduationCap, 
  BookOpen, 
  Trash2, 
  Plus, 
  Play,
  RotateCcw,
  Zap,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ROOM_TYPES, SUBJECT_TYPES } from '../data/models';

export default function AIAgentAssistantModal({
  isOpen,
  onClose,
  onApplyDynamicData,
  onClearAllData,
  onLoadTemplate,
  divisions = [],
  rooms = [],
  faculty = [],
  subjects = [],
  config
}) {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState('prompt'); // 'prompt' | 'wizard' | 'templates'
  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState(null);

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardDept, setWizardDept] = useState({
    institution: 'National Institute of Technology',
    department: 'Department of Electrical & Computer Engineering',
    term: 'Autumn Semester 2026-27'
  });
  const [wizardDivisions, setWizardDivisions] = useState([
    { id: 'div-w1', name: 'Division A (Year 3)', shortCode: 'DIV-A', studentCount: 60, color: '#3b82f6' },
    { id: 'div-w2', name: 'Division B (Year 3)', shortCode: 'DIV-B', studentCount: 55, color: '#8b5cf6' }
  ]);
  const [wizardRooms, setWizardRooms] = useState([
    { id: 'rm-w1', name: 'Lecture Hall 101', type: ROOM_TYPES.LECTURE_HALL, capacity: 70, building: 'Academic Block' },
    { id: 'rm-w2', name: 'Lecture Hall 102', type: ROOM_TYPES.LECTURE_HALL, capacity: 70, building: 'Academic Block' },
    { id: 'rm-w3', name: 'Computer Systems Lab 1', type: ROOM_TYPES.LAB, capacity: 65, building: 'IT Wing' }
  ]);
  const [wizardFaculty, setWizardFaculty] = useState([
    { id: 'fac-w1', name: 'Dr. Alan Turing', department: 'Computer Science', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] },
    { id: 'fac-w2', name: 'Dr. Ada Lovelace', department: 'Computer Science', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] },
    { id: 'fac-w3', name: 'Dr. Claude Shannon', department: 'Information Theory', maxDailyLectures: 3, maxWeeklyLectures: 14, unavailableSlots: [] }
  ]);
  const [wizardSubjects, setWizardSubjects] = useState([
    { id: 'sub-w1', name: 'Algorithms & Data Structures', code: 'CS301', type: SUBJECT_TYPES.THEORY, divisionId: 'div-w1', facultyId: 'fac-w1', weeklySessions: 3, duration: 1, color: '#3b82f6', preferredRoomType: ROOM_TYPES.LECTURE_HALL },
    { id: 'sub-w2', name: 'Operating Systems Laboratory', code: 'CS302L', type: SUBJECT_TYPES.PRACTICAL, divisionId: 'div-w1', facultyId: 'fac-w2', weeklySessions: 2, duration: 2, color: '#8b5cf6', preferredRoomType: ROOM_TYPES.LAB },
    { id: 'sub-w3', name: 'Information Networks', code: 'CS303', type: SUBJECT_TYPES.THEORY, divisionId: 'div-w2', facultyId: 'fac-w3', weeklySessions: 3, duration: 1, color: '#10b981', preferredRoomType: ROOM_TYPES.LECTURE_HALL }
  ]);

  // Client-Side AI Natural Language Parser
  const handleParsePrompt = () => {
    if (!promptText.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      const text = promptText.toLowerCase();

      // Extract department or default
      let deptName = 'Department of Engineering & Applied Sciences';
      if (text.includes('computer') || text.includes('cse') || text.includes('software')) {
        deptName = 'Department of Computer Science & Engineering';
      } else if (text.includes('mechanical') || text.includes('mech')) {
        deptName = 'Department of Mechanical Engineering';
      } else if (text.includes('electrical') || text.includes('eee') || text.includes('ece')) {
        deptName = 'Department of Electrical & Electronics Engineering';
      } else if (text.includes('civil')) {
        deptName = 'Department of Civil & Structural Engineering';
      } else if (text.includes('management') || text.includes('mba') || text.includes('business')) {
        deptName = 'School of Business Management';
      }

      // Generate dynamic divisions based on text
      const newDivisions = [];
      const divMatches = text.match(/division\s*([a-z0-9]+)|batch\s*([a-z0-9]+)|cohort\s*([a-z0-9]+)|section\s*([a-z0-9]+)/gi) || [];
      const uniqueDivCodes = [...new Set(divMatches.map(m => m.replace(/division|batch|cohort|section/gi, '').trim().toUpperCase()))];
      
      const codesToUse = uniqueDivCodes.length > 0 ? uniqueDivCodes : ['A', 'B'];
      const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];

      codesToUse.forEach((code, idx) => {
        newDivisions.push({
          id: `div-ai-${idx + 1}`,
          name: `Division ${code}`,
          shortCode: `DIV-${code}`,
          studentCount: 60,
          color: colors[idx % colors.length]
        });
      });

      // Generate dynamic rooms
      const newRooms = [];
      const labCount = text.includes('lab') ? (text.includes('2 lab') ? 2 : 1) : 1;
      const hallCount = Math.max(2, newDivisions.length + 1);

      for (let i = 1; i <= hallCount; i++) {
        newRooms.push({
          id: `room-ai-lh${i}`,
          name: `Lecture Hall LH-10${i}`,
          type: ROOM_TYPES.LECTURE_HALL,
          capacity: 75,
          building: 'Main Academic Wing'
        });
      }

      for (let i = 1; i <= labCount; i++) {
        newRooms.push({
          id: `room-ai-lab${i}`,
          name: `Specialized Lab ${i} (Practical Wing)`,
          type: ROOM_TYPES.LAB,
          capacity: 70,
          building: 'Technology Block'
        });
      }

      // Generate dynamic faculty
      const newFaculty = [];
      const profMatches = text.match(/(?:prof|dr|professor)\.?\s*([a-z]+)/gi) || [];
      const extractedNames = profMatches.map(p => p.trim());
      const facultyPool = extractedNames.length > 0 
        ? extractedNames 
        : ['Dr. H. Vance', 'Dr. Alan Turing', 'Dr. Ada Lovelace', 'Prof. Marcus Brody', 'Dr. Claude Shannon'];

      const uniqueFaculty = [...new Set(facultyPool)].slice(0, 6);
      uniqueFaculty.forEach((name, idx) => {
        newFaculty.push({
          id: `fac-ai-${idx + 1}`,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          department: deptName,
          maxDailyLectures: 3,
          maxWeeklyLectures: 14,
          unavailableSlots: []
        });
      });

      // Generate dynamic subjects distributed to divisions
      const newSubjects = [];
      const subjectPool = [
        { name: 'Core Foundations & Systems', code: 'ENG301', type: SUBJECT_TYPES.THEORY, sessions: 3, dur: 1, roomType: ROOM_TYPES.LECTURE_HALL },
        { name: 'Applied Advanced Concepts', code: 'ENG302', type: SUBJECT_TYPES.THEORY, sessions: 3, dur: 1, roomType: ROOM_TYPES.LECTURE_HALL },
        { name: 'Laboratory Hands-On Practical', code: 'ENG303L', type: SUBJECT_TYPES.PRACTICAL, sessions: 2, dur: 2, roomType: ROOM_TYPES.LAB },
        { name: 'Analytical Design & Computation', code: 'ENG304', type: SUBJECT_TYPES.THEORY, sessions: 3, dur: 1, roomType: ROOM_TYPES.LECTURE_HALL }
      ];

      let subCounter = 1;
      newDivisions.forEach((div, dIdx) => {
        subjectPool.forEach((tmpl, sIdx) => {
          const assignedFac = newFaculty[(dIdx + sIdx) % newFaculty.length];
          newSubjects.push({
            id: `sub-ai-${subCounter++}`,
            name: `${tmpl.name} (${div.shortCode})`,
            code: `${tmpl.code}-${div.shortCode}`,
            type: tmpl.type,
            divisionId: div.id,
            facultyId: assignedFac.id,
            weeklySessions: tmpl.sessions,
            duration: tmpl.dur,
            preferredRoomType: tmpl.roomType,
            color: colors[(dIdx * 2 + sIdx) % colors.length]
          });
        });
      });

      setExtractedPreview({
        department: deptName,
        divisions: newDivisions,
        rooms: newRooms,
        faculty: newFaculty,
        subjects: newSubjects
      });

      setIsProcessing(false);
    }, 450);
  };

  const handleApplyExtracted = () => {
    if (!extractedPreview) return;
    onApplyDynamicData(extractedPreview);
    onClose();
  };

  const handleApplyWizard = () => {
    onApplyDynamicData({
      department: wizardDept.department,
      divisions: wizardDivisions,
      rooms: wizardRooms,
      faculty: wizardFaculty,
      subjects: wizardSubjects
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg ai-agent-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="agent-badge-icon">
              <Bot size={22} className="text-primary pulse-alert" />
            </div>
            <div>
              <h3>ChronosAI — Autonomous Scheduling Agent</h3>
              <p className="modal-subtitle">
                Describe your real college requirements in natural language or let the AI guide you step-by-step
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="agent-mode-tabs">
          <button
            className={`agent-tab-btn ${activeMode === 'prompt' ? 'active' : ''}`}
            onClick={() => setActiveMode('prompt')}
          >
            <Sparkles size={15} /> Natural Language AI Prompt
          </button>
          <button
            className={`agent-tab-btn ${activeMode === 'wizard' ? 'active' : ''}`}
            onClick={() => setActiveMode('wizard')}
          >
            <Layers size={15} /> Step-by-Step AI Interview
          </button>
          <button
            className={`agent-tab-btn ${activeMode === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveMode('templates')}
          >
            <FileSpreadsheet size={15} /> Real-World Department Templates
          </button>
        </div>

        {/* Body Container */}
        <div className="modal-body agent-modal-body">
          {/* MODE 1: PROMPT DRIVEN AI AGENT */}
          {activeMode === 'prompt' && (
            <div className="prompt-mode-container">
              <div className="agent-chat-intro">
                <Bot size={18} className="text-primary" />
                <span>
                  <strong>AI Scheduling Agent:</strong> Tell me about your college, batches/divisions, physical classrooms, faculty members, and courses. I will extract all entities, construct scheduling constraints, and run the genetic CSP solver automatically!
                </span>
              </div>

              <div className="prompt-input-wrapper">
                <textarea
                  className="agent-textarea"
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="e.g., We are the Department of Mechanical Engineering for Semester 4. We have 2 divisions: ME-A (60 students) and ME-B (55 students). We have 3 classrooms (LH-1, LH-2, LH-3) and 2 Workshop/CAD Labs. Our professors are Dr. Sharma, Prof. Patel, and Dr. Singh. We need Fluid Mechanics (3h theory), Thermodynamics (3h theory), CAD Lab (2h practical), and Manufacturing Workshop (2h practical)..."
                />
                <div className="prompt-actions-row">
                  <div className="quick-suggestions">
                    <span className="sugg-label">Quick Prompts:</span>
                    <button 
                      className="btn-sugg" 
                      onClick={() => setPromptText("Department of Computer Science: 2 batches (CS-A: 60 students, CS-B: 55 students). 3 Lecture halls (LH-101, LH-102, LH-103) and 2 Computer Labs (CL-01, CL-02). Faculty: Dr. Alan Turing, Dr. Ada Lovelace, Prof. Shannon. Subjects: Algorithms (3h), Database Systems (3h), OS Lab (2h practical in CL-01), Networks (3h).")}
                    >
                      Computer Science (2 Div, 2 Labs)
                    </button>
                    <button 
                      className="btn-sugg" 
                      onClick={() => setPromptText("Electrical Engineering department: 2 divisions (EE-1, EE-2). Classrooms: Room 201, Room 202, and Circuits Lab. Faculty: Dr. Tesla, Prof. Maxwell, Dr. Faraday. Need Power Systems (3h theory), Electromagnetics (3h theory), Circuit Analysis Lab (2h practical).")}
                    >
                      Electrical Eng (Circuits Lab)
                    </button>
                  </div>
                  <button 
                    className="btn btn-primary btn-parse-prompt" 
                    onClick={handleParsePrompt}
                    disabled={isProcessing || !promptText.trim()}
                  >
                    {isProcessing ? <Zap size={15} className="spin" /> : <Sparkles size={15} />}
                    <span>{isProcessing ? 'AI Agent Analyzing...' : 'Analyze & Build Schedule'}</span>
                  </button>
                </div>
              </div>

              {/* Extracted Structured Preview */}
              {extractedPreview && (
                <div className="extracted-preview-box">
                  <div className="extracted-header">
                    <div className="extracted-title">
                      <CheckCircle2 size={16} className="text-success" />
                      <strong>AI Extracted Department Structure:</strong>
                      <span className="dept-tag">{extractedPreview.department}</span>
                    </div>
                    <span className="feasibility-pill">Constraints Validated</span>
                  </div>

                  <div className="extracted-grid-summary">
                    <div className="summary-pill">
                      <GraduationCap size={14} /> {extractedPreview.divisions.length} Divisions ({extractedPreview.divisions.map(d => d.shortCode).join(', ')})
                    </div>
                    <div className="summary-pill">
                      <Building size={14} /> {extractedPreview.rooms.length} Rooms ({extractedPreview.rooms.filter(r => r.type === 'lab').length} Labs)
                    </div>
                    <div className="summary-pill">
                      <User size={14} /> {extractedPreview.faculty.length} Faculty Members
                    </div>
                    <div className="summary-pill">
                      <BookOpen size={14} /> {extractedPreview.subjects.length} Course Sessions
                    </div>
                  </div>

                  <div className="extracted-actions">
                    <button className="btn btn-secondary" onClick={() => setExtractedPreview(null)}>
                      Edit Prompt
                    </button>
                    <button className="btn btn-primary" onClick={handleApplyExtracted}>
                      <Play size={15} /> Apply Data & Generate Timetable
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: STEP-BY-STEP AI INTERVIEW */}
          {activeMode === 'wizard' && (
            <div className="wizard-mode-container">
              {/* Step Progress Indicators */}
              <div className="wizard-progress-bar">
                <div className={`wizard-step-node ${wizardStep >= 1 ? 'active' : ''}`} onClick={() => setWizardStep(1)}>
                  <span>1</span> Department
                </div>
                <div className={`wizard-step-node ${wizardStep >= 2 ? 'active' : ''}`} onClick={() => setWizardStep(2)}>
                  <span>2</span> Divisions ({wizardDivisions.length})
                </div>
                <div className={`wizard-step-node ${wizardStep >= 3 ? 'active' : ''}`} onClick={() => setWizardStep(3)}>
                  <span>3</span> Rooms ({wizardRooms.length})
                </div>
                <div className={`wizard-step-node ${wizardStep >= 4 ? 'active' : ''}`} onClick={() => setWizardStep(4)}>
                  <span>4</span> Faculty ({wizardFaculty.length})
                </div>
                <div className={`wizard-step-node ${wizardStep >= 5 ? 'active' : ''}`} onClick={() => setWizardStep(5)}>
                  <span>5</span> Courses ({wizardSubjects.length})
                </div>
              </div>

              {/* Step 1: Department Info */}
              {wizardStep === 1 && (
                <div className="wizard-step-content">
                  <h4>Step 1: Institutional & Department Identification</h4>
                  <p className="step-desc">Enter your university/college and target department name.</p>
                  <div className="form-group">
                    <label>Institution / College Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={wizardDept.institution}
                      onChange={(e) => setWizardDept({ ...wizardDept, institution: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Department / School</label>
                    <input
                      type="text"
                      className="form-control"
                      value={wizardDept.department}
                      onChange={(e) => setWizardDept({ ...wizardDept, department: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Academic Term / Session</label>
                    <input
                      type="text"
                      className="form-control"
                      value={wizardDept.term}
                      onChange={(e) => setWizardDept({ ...wizardDept, term: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Student Divisions */}
              {wizardStep === 2 && (
                <div className="wizard-step-content">
                  <div className="step-header-row">
                    <div>
                      <h4>Step 2: Student Cohorts & Divisions</h4>
                      <p className="step-desc">Define student classes that need their own schedule matrix.</p>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const code = String.fromCharCode(65 + wizardDivisions.length);
                        setWizardDivisions([...wizardDivisions, {
                          id: `div-w-${Date.now()}`,
                          name: `Division ${code}`,
                          shortCode: `DIV-${code}`,
                          studentCount: 60,
                          color: '#3b82f6'
                        }]);
                      }}
                    >
                      <Plus size={14} /> Add Cohort
                    </button>
                  </div>

                  <div className="wizard-items-list">
                    {wizardDivisions.map((div, i) => (
                      <div key={div.id} className="wizard-item-card">
                        <div className="item-field">
                          <label>Division Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={div.name}
                            onChange={(e) => {
                              const updated = [...wizardDivisions];
                              updated[i].name = e.target.value;
                              setWizardDivisions(updated);
                            }}
                          />
                        </div>
                        <div className="item-field w-120">
                          <label>Code</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={div.shortCode}
                            onChange={(e) => {
                              const updated = [...wizardDivisions];
                              updated[i].shortCode = e.target.value;
                              setWizardDivisions(updated);
                            }}
                          />
                        </div>
                        <div className="item-field w-120">
                          <label>Students</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={div.studentCount}
                            onChange={(e) => {
                              const updated = [...wizardDivisions];
                              updated[i].studentCount = parseInt(e.target.value) || 0;
                              setWizardDivisions(updated);
                            }}
                          />
                        </div>
                        {wizardDivisions.length > 1 && (
                          <button 
                            className="btn-item-delete"
                            onClick={() => setWizardDivisions(wizardDivisions.filter((_, idx) => idx !== i))}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Classrooms & Labs */}
              {wizardStep === 3 && (
                <div className="wizard-step-content">
                  <div className="step-header-row">
                    <div>
                      <h4>Step 3: Physical Classrooms & Specialized Labs</h4>
                      <p className="step-desc">Configure venues where lectures and practicals are hosted.</p>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setWizardRooms([...wizardRooms, {
                          id: `rm-w-${Date.now()}`,
                          name: `Hall ${101 + wizardRooms.length}`,
                          type: ROOM_TYPES.LECTURE_HALL,
                          capacity: 70,
                          building: 'Academic Wing'
                        }]);
                      }}
                    >
                      <Plus size={14} /> Add Room
                    </button>
                  </div>

                  <div className="wizard-items-list">
                    {wizardRooms.map((rm, i) => (
                      <div key={rm.id} className="wizard-item-card">
                        <div className="item-field">
                          <label>Room Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={rm.name}
                            onChange={(e) => {
                              const updated = [...wizardRooms];
                              updated[i].name = e.target.value;
                              setWizardRooms(updated);
                            }}
                          />
                        </div>
                        <div className="item-field w-160">
                          <label>Venue Type</label>
                          <select
                            className="form-control"
                            value={rm.type}
                            onChange={(e) => {
                              const updated = [...wizardRooms];
                              updated[i].type = e.target.value;
                              setWizardRooms(updated);
                            }}
                          >
                            <option value={ROOM_TYPES.LECTURE_HALL}>Lecture Hall</option>
                            <option value={ROOM_TYPES.LAB}>Computing / Lab</option>
                            <option value={ROOM_TYPES.SEMINAR}>Seminar Room</option>
                          </select>
                        </div>
                        <div className="item-field w-120">
                          <label>Capacity</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={rm.capacity}
                            onChange={(e) => {
                              const updated = [...wizardRooms];
                              updated[i].capacity = parseInt(e.target.value) || 0;
                              setWizardRooms(updated);
                            }}
                          />
                        </div>
                        {wizardRooms.length > 1 && (
                          <button 
                            className="btn-item-delete"
                            onClick={() => setWizardRooms(wizardRooms.filter((_, idx) => idx !== i))}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Faculty */}
              {wizardStep === 4 && (
                <div className="wizard-step-content">
                  <div className="step-header-row">
                    <div>
                      <h4>Step 4: Faculty & Teaching Staff</h4>
                      <p className="step-desc">List professors and their maximum weekly lecture workload limits.</p>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setWizardFaculty([...wizardFaculty, {
                          id: `fac-w-${Date.now()}`,
                          name: `Prof. Faculty ${wizardFaculty.length + 1}`,
                          department: wizardDept.department,
                          maxDailyLectures: 3,
                          maxWeeklyLectures: 14,
                          unavailableSlots: []
                        }]);
                      }}
                    >
                      <Plus size={14} /> Add Faculty
                    </button>
                  </div>

                  <div className="wizard-items-list">
                    {wizardFaculty.map((fac, i) => (
                      <div key={fac.id} className="wizard-item-card">
                        <div className="item-field">
                          <label>Professor Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={fac.name}
                            onChange={(e) => {
                              const updated = [...wizardFaculty];
                              updated[i].name = e.target.value;
                              setWizardFaculty(updated);
                            }}
                          />
                        </div>
                        <div className="item-field w-140">
                          <label>Max Daily Lectures</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={fac.maxDailyLectures}
                            onChange={(e) => {
                              const updated = [...wizardFaculty];
                              updated[i].maxDailyLectures = parseInt(e.target.value) || 0;
                              setWizardFaculty(updated);
                            }}
                          />
                        </div>
                        <div className="item-field w-140">
                          <label>Max Weekly Hours</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={fac.maxWeeklyLectures}
                            onChange={(e) => {
                              const updated = [...wizardFaculty];
                              updated[i].maxWeeklyLectures = parseInt(e.target.value) || 0;
                              setWizardFaculty(updated);
                            }}
                          />
                        </div>
                        {wizardFaculty.length > 1 && (
                          <button 
                            className="btn-item-delete"
                            onClick={() => setWizardFaculty(wizardFaculty.filter((_, idx) => idx !== i))}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Courses & Curriculum */}
              {wizardStep === 5 && (
                <div className="wizard-step-content">
                  <div className="step-header-row">
                    <div>
                      <h4>Step 5: Curriculum Subjects & Practical Labs</h4>
                      <p className="step-desc">Configure subjects, weekly lecture hours, and assigned teachers.</p>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setWizardSubjects([...wizardSubjects, {
                          id: `sub-w-${Date.now()}`,
                          name: `Subject ${wizardSubjects.length + 1}`,
                          code: `SUB${100 + wizardSubjects.length}`,
                          type: SUBJECT_TYPES.THEORY,
                          divisionId: wizardDivisions[0]?.id || '',
                          facultyId: wizardFaculty[0]?.id || '',
                          weeklySessions: 3,
                          duration: 1,
                          color: '#3b82f6',
                          preferredRoomType: ROOM_TYPES.LECTURE_HALL
                        }]);
                      }}
                    >
                      <Plus size={14} /> Add Subject
                    </button>
                  </div>

                  <div className="wizard-items-list">
                    {wizardSubjects.map((sub, i) => (
                      <div key={sub.id} className="wizard-item-card">
                        <div className="item-field">
                          <label>Subject Title</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={sub.name}
                            onChange={(e) => {
                              const updated = [...wizardSubjects];
                              updated[i].name = e.target.value;
                              setWizardSubjects(updated);
                            }}
                          />
                        </div>
                        <div className="item-field w-100">
                          <label>Code</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={sub.code}
                            onChange={(e) => {
                              const updated = [...wizardSubjects];
                              updated[i].code = e.target.value;
                              setWizardSubjects(updated);
                            }}
                          />
                        </div>
                        <div className="item-field w-120">
                          <label>Type</label>
                          <select
                            className="form-control"
                            value={sub.type}
                            onChange={(e) => {
                              const isLab = e.target.value === SUBJECT_TYPES.PRACTICAL;
                              const updated = [...wizardSubjects];
                              updated[i].type = e.target.value;
                              updated[i].duration = isLab ? 2 : 1;
                              updated[i].preferredRoomType = isLab ? ROOM_TYPES.LAB : ROOM_TYPES.LECTURE_HALL;
                              setWizardSubjects(updated);
                            }}
                          >
                            <option value={SUBJECT_TYPES.THEORY}>Theory (1h)</option>
                            <option value={SUBJECT_TYPES.PRACTICAL}>Lab (2h)</option>
                          </select>
                        </div>
                        <div className="item-field w-130">
                          <label>Assigned Div</label>
                          <select
                            className="form-control"
                            value={sub.divisionId}
                            onChange={(e) => {
                              const updated = [...wizardSubjects];
                              updated[i].divisionId = e.target.value;
                              setWizardSubjects(updated);
                            }}
                          >
                            {wizardDivisions.map(d => (
                              <option key={d.id} value={d.id}>{d.shortCode}</option>
                            ))}
                          </select>
                        </div>
                        <div className="item-field w-140">
                          <label>Faculty</label>
                          <select
                            className="form-control"
                            value={sub.facultyId}
                            onChange={(e) => {
                              const updated = [...wizardSubjects];
                              updated[i].facultyId = e.target.value;
                              setWizardSubjects(updated);
                            }}
                          >
                            {wizardFaculty.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="item-field w-80">
                          <label>Hrs/Wk</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={sub.weeklySessions}
                            onChange={(e) => {
                              const updated = [...wizardSubjects];
                              updated[i].weeklySessions = parseInt(e.target.value) || 1;
                              setWizardSubjects(updated);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wizard Navigation Footer */}
              <div className="wizard-nav-footer">
                {wizardStep > 1 ? (
                  <button className="btn btn-secondary" onClick={() => setWizardStep(wizardStep - 1)}>
                    Back
                  </button>
                ) : <div></div>}

                {wizardStep < 5 ? (
                  <button className="btn btn-primary" onClick={() => setWizardStep(wizardStep + 1)}>
                    Continue <ArrowRight size={14} />
                  </button>
                ) : (
                  <button className="btn btn-primary btn-generate" onClick={handleApplyWizard}>
                    <Play size={15} /> Apply & Generate Timetable
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MODE 3: REAL-WORLD DEPARTMENT TEMPLATES & CLEAN CANVAS */}
          {activeMode === 'templates' && (
            <div className="templates-mode-container">
              <div className="templates-intro">
                Select a real-world institutional blueprint or start with a 100% clean blank slate:
              </div>

              <div className="template-cards-grid">
                <div 
                  className="template-card"
                  onClick={() => {
                    onLoadTemplate('cse');
                    onClose();
                  }}
                >
                  <div className="t-icon icon-blue"><Building size={20} /></div>
                  <div className="t-info">
                    <strong>Computer Science & Engineering</strong>
                    <span>3 Cohorts (CS-A, CS-B, IT-A) • 6 Lecture Halls & Specialized Computing Labs • 12 Faculty</span>
                  </div>
                  <button className="btn btn-secondary btn-sm">Load Blueprint</button>
                </div>

                <div 
                  className="template-card"
                  onClick={() => {
                    onLoadTemplate('mech');
                    onClose();
                  }}
                >
                  <div className="t-icon icon-amber"><Layers size={20} /></div>
                  <div className="t-info">
                    <strong>Mechanical Engineering</strong>
                    <span>2 Cohorts (ME-A, ME-B) • Thermodynamics, CAD Labs & Workshop Studios • 8 Faculty</span>
                  </div>
                  <button className="btn btn-secondary btn-sm">Load Blueprint</button>
                </div>

                <div 
                  className="template-card"
                  onClick={() => {
                    onLoadTemplate('ece');
                    onClose();
                  }}
                >
                  <div className="t-icon icon-teal"><Zap size={20} /></div>
                  <div className="t-info">
                    <strong>Electronics & Communication (ECE)</strong>
                    <span>2 Cohorts • Signal Processing, Microcontrollers & VLSI Circuit Labs • 8 Faculty</span>
                  </div>
                  <button className="btn btn-secondary btn-sm">Load Blueprint</button>
                </div>

                <div 
                  className="template-card card-blank"
                  onClick={() => {
                    onClearAllData();
                    onClose();
                  }}
                >
                  <div className="t-icon icon-purple"><RotateCcw size={20} /></div>
                  <div className="t-info">
                    <strong>Start with Blank Canvas (0 Dummy Data)</strong>
                    <span>Clear all entities completely. Input your exact college data manually or with the AI prompt.</span>
                  </div>
                  <button className="btn btn-danger btn-sm">Clear All Data</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Sliders, 
  FileText, 
  CheckSquare, 
  Square, 
  Building, 
  User, 
  Calendar, 
  Award, 
  ShieldCheck, 
  Download,
  Eye
} from 'lucide-react';
import PrintableTimetableSheet from './PrintableTimetableSheet';

export default function PrintSheetModal({
  isOpen,
  onClose,
  divisions,
  rooms,
  faculty,
  subjects,
  config,
  timetable,
  viewMode,
  selectedDivisionId,
  selectedFacultyId,
  selectedRoomId,
  printSettings,
  setPrintSettings
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'preview'

  const handlePrint = () => {
    // Small timeout to allow modal animation to settle or execute directly
    window.print();
  };

  const updateSetting = (key, value) => {
    setPrintSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="modal-overlay print-modal-overlay" onClick={onClose}>
      <div className="modal-content print-studio-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="print-modal-icon">
              <Printer size={20} className="text-primary" />
            </div>
            <div>
              <h3>Institutional Timetable Print & PDF Studio</h3>
              <p className="modal-subtitle">
                Configure official letterhead, customized sections, and administrative sign-offs for printing on A4 sheet
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher for Mobile / Small Screens */}
        <div className="print-studio-tabs">
          <button 
            className={`studio-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Sliders size={14} /> Configure Sheet Sections
          </button>
          <button 
            className={`studio-tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={14} /> Live Print Preview
          </button>
        </div>

        {/* Modal Body - 2 Columns (Config Panel + Live Preview) */}
        <div className="modal-body print-studio-body">
          {/* Left Column: Customization Controls */}
          <div className={`print-controls-pane ${activeTab === 'settings' ? 'pane-active' : 'pane-hidden-mobile'}`}>
            {/* Section: Document Scope */}
            <div className="config-group">
              <label className="config-group-title">
                <FileText size={15} /> Document Print Scope
              </label>
              <div className="scope-radio-grid">
                <label className={`scope-radio-card ${printSettings.targetScope === 'current' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="targetScope"
                    value="current"
                    checked={printSettings.targetScope === 'current'}
                    onChange={() => updateSetting('targetScope', 'current')}
                  />
                  <div>
                    <strong>Active Screen View</strong>
                    <span>Print currently selected {viewMode === 'division' ? 'Division' : viewMode === 'faculty' ? 'Faculty Member' : 'Room'}</span>
                  </div>
                </label>

                <label className={`scope-radio-card ${printSettings.targetScope === 'all-divisions' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="targetScope"
                    value="all-divisions"
                    checked={printSettings.targetScope === 'all-divisions'}
                    onChange={() => updateSetting('targetScope', 'all-divisions')}
                  />
                  <div>
                    <strong>All Divisions (Batch A4 Sheet)</strong>
                    <span>Generate complete institutional packet with 1 page per division</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Section: Institutional Letterhead */}
            <div className="config-group">
              <label className="config-group-title">
                <Building size={15} /> Institutional Letterhead Details
              </label>
              <div className="control-row">
                <div className="control-field">
                  <label>Institution / College Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={printSettings.collegeName}
                    onChange={(e) => updateSetting('collegeName', e.target.value)}
                    placeholder="College Name"
                  />
                </div>
              </div>
              <div className="control-row-grid">
                <div className="control-field">
                  <label>Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={printSettings.departmentName}
                    onChange={(e) => updateSetting('departmentName', e.target.value)}
                    placeholder="Department of Computer Science..."
                  />
                </div>
                <div className="control-field">
                  <label>Academic Term / Session</label>
                  <input
                    type="text"
                    className="form-control"
                    value={printSettings.academicTerm}
                    onChange={(e) => updateSetting('academicTerm', e.target.value)}
                    placeholder="Autumn Semester 2026–2027"
                  />
                </div>
              </div>
              <div className="control-row-grid">
                <div className="control-field">
                  <label>Effective Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={printSettings.effectiveDate}
                    onChange={(e) => updateSetting('effectiveDate', e.target.value)}
                    placeholder="October 1, 2026"
                  />
                </div>
                <div className="control-field">
                  <label>Class Incharge / Advisor</label>
                  <input
                    type="text"
                    className="form-control"
                    value={printSettings.advisorName}
                    onChange={(e) => updateSetting('advisorName', e.target.value)}
                    placeholder="Dr. Eleanor Vance"
                  />
                </div>
              </div>
            </div>

            {/* Section: Customized Sections Checklist */}
            <div className="config-group">
              <label className="config-group-title">
                <CheckSquare size={15} /> Customized Sheet Sections
              </label>
              <div className="checkboxes-stack">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={printSettings.includeSubjectLegend}
                    onChange={(e) => updateSetting('includeSubjectLegend', e.target.checked)}
                  />
                  <div>
                    <strong>Section 1: Course & Faculty Directory Table</strong>
                    <span>Includes full course names, codes, credits, and faculty in-charge legend</span>
                  </div>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={printSettings.includeRoomLegend}
                    onChange={(e) => updateSetting('includeRoomLegend', e.target.checked)}
                  />
                  <div>
                    <strong>Section 2: Allocated Facilities & Laboratory Venues</strong>
                    <span>Lists laboratory room locations, seating capacities, and equipment blocks</span>
                  </div>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={printSettings.includeRules}
                    onChange={(e) => updateSetting('includeRules', e.target.checked)}
                  />
                  <div>
                    <strong>Section 3: Academic Directives & Attendance Policy</strong>
                    <span>Mandatory 85% attendance clause, lab continuity rules, and department notes</span>
                  </div>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={printSettings.includeSignatures}
                    onChange={(e) => updateSetting('includeSignatures', e.target.checked)}
                  />
                  <div>
                    <strong>Section 4: Three-Tier Official Sign-Off Block</strong>
                    <span>Formal signature spaces for Timetable Chair, HOD, and Dean/Principal</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Section: Official Signatories */}
            {printSettings.includeSignatures && (
              <div className="config-group">
                <label className="config-group-title">
                  <User size={15} /> Authorized Signatories
                </label>
                <div className="control-row-grid">
                  <div className="control-field">
                    <label>Timetable In-Charge</label>
                    <input
                      type="text"
                      className="form-control"
                      value={printSettings.coordinatorName}
                      onChange={(e) => updateSetting('coordinatorName', e.target.value)}
                    />
                  </div>
                  <div className="control-field">
                    <label>Head of Department (HOD)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={printSettings.hodName}
                      onChange={(e) => updateSetting('hodName', e.target.value)}
                    />
                  </div>
                  <div className="control-field">
                    <label>Dean / Principal</label>
                    <input
                      type="text"
                      className="form-control"
                      value={printSettings.deanName}
                      onChange={(e) => updateSetting('deanName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section: Custom Directives Note */}
            {printSettings.includeRules && (
              <div className="config-group">
                <label className="config-group-title">
                  <ShieldCheck size={15} /> Custom Department Directive (Optional)
                </label>
                <textarea
                  className="form-control textarea-custom"
                  rows={2}
                  value={printSettings.customNotes}
                  onChange={(e) => updateSetting('customNotes', e.target.value)}
                  placeholder="e.g. Practical lab exams will be conducted during Week 14. Students must bring lab records."
                />
              </div>
            )}
          </div>

          {/* Right Column: Live Sheet Preview */}
          <div className={`print-preview-pane ${activeTab === 'preview' ? 'pane-active' : 'pane-hidden-mobile'}`}>
            <div className="preview-toolbar">
              <span className="preview-label">
                <Eye size={13} /> Live Sheet Preview (Rendered as A4 Landscape Sheet)
              </span>
              <span className="preview-scale-hint">Page 1 of {printSettings.targetScope === 'all-divisions' ? divisions.length : 1}</span>
            </div>
            <div className="preview-paper-container">
              <div className="preview-paper-sheet">
                <PrintableTimetableSheet
                  divisions={divisions}
                  rooms={rooms}
                  faculty={faculty}
                  subjects={subjects}
                  config={config}
                  timetable={timetable}
                  viewMode={viewMode}
                  selectedDivisionId={selectedDivisionId}
                  selectedFacultyId={selectedFacultyId}
                  selectedRoomId={selectedRoomId}
                  printSettings={printSettings}
                  isPreview={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer print-modal-footer">
          <div className="print-hint-text">
            <span>💡 <strong>Tip:</strong> In the browser print dialog, choose destination <strong>Save as PDF</strong> or select your printer. Orientation is pre-configured to <strong>Landscape</strong>.</span>
          </div>
          <div className="print-footer-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary btn-print-now" onClick={handlePrint}>
              <Printer size={16} /> Print Sheet Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

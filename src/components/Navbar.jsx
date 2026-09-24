import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Printer, 
  RefreshCw, 
  Sliders, 
  FileText,
  ShieldAlert
} from 'lucide-react';

export default function Navbar({
  presets,
  currentPresetId,
  onSelectPreset,
  onGenerate,
  isSolving,
  feasibility,
  onOpenFeasibilityDrawer,
  onOpenConfigModal,
  onExportCSV,
  onExportJSON,
  onPrint,
  hasTimetable
}) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <Sparkles size={22} className="sparkle-anim" />
          </div>
          <div className="brand-text">
            <span className="brand-title">ChronosAI</span>
            <span className="brand-subtitle">Intelligent College Timetable Generator</span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="navbar-center">
          <div className="preset-selector-wrapper">
            <label className="preset-label">Scenario Preset:</label>
            <select
              className="preset-select"
              value={currentPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              disabled={isSolving}
            >
              {presets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {!p.isFeasible ? '⚠️ (Impossible Constraints)' : '✅'}
                </option>
              ))}
            </select>
          </div>

          {/* Feasibility Alert Badge */}
          {feasibility && (
            <button 
              className={`feasibility-badge ${feasibility.isFeasible ? 'feasible' : 'infeasible'}`}
              onClick={onOpenFeasibilityDrawer}
              title="Click to view mathematical constraint analysis"
            >
              {feasibility.isFeasible ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Constraints Feasible</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={16} className="pulse-alert" />
                  <span>{feasibility.criticalErrors.length} Impossible Conflicts</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <button
            className="btn btn-secondary"
            onClick={onOpenConfigModal}
            title="Configure college entities, teachers, and rooms"
          >
            <Sliders size={16} />
            <span>Entities & Rules</span>
          </button>

          <div className="export-dropdown-wrapper">
            <button className="btn btn-secondary" onClick={onExportCSV} disabled={!hasTimetable} title="Export timetable as CSV">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onPrint} disabled={!hasTimetable} title="Print or save as PDF">
            <Printer size={16} />
            <span>Print / PDF</span>
          </button>

          <button
            className="btn btn-primary btn-generate"
            onClick={onGenerate}
            disabled={isSolving}
          >
            {isSolving ? (
              <>
                <RefreshCw size={18} className="spin" />
                <span>Solving CSP...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Timetable</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

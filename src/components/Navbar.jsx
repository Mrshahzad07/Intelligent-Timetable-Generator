import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Download, 
  Printer, 
  RefreshCw, 
  Sliders, 
  ShieldAlert,
  BarChart3,
  Moon,
  Sun,
  Bot,
  Play
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
  onOpenAnalyticsModal,
  onOpenAIAgentModal,
  onExportCSV,
  onPrint,
  hasTimetable,
  theme,
  onToggleTheme
}) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <Sparkles size={20} className="sparkle-anim" />
          </div>
          <div className="brand-text">
            <span className="brand-title">ChronosAI</span>
            <span className="brand-subtitle">College Timetable Generator</span>
          </div>
        </div>

        {/* Preset Selector & Feasibility Status */}
        <div className="navbar-center">
          <div className="preset-selector-wrapper">
            <label className="preset-label">Scenario:</label>
            <select
              className="preset-select"
              value={currentPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              disabled={isSolving}
            >
              {presets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {!p.isFeasible ? '⚠️ (Impossible)' : '✅'}
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
                  <CheckCircle2 size={15} />
                  <span className="badge-text-full">Constraints Feasible</span>
                  <span className="badge-text-short">Feasible</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={15} className="pulse-alert" />
                  <span className="badge-text-full">{feasibility.criticalErrors.length} Impossible Conflicts</span>
                  <span className="badge-text-short">{feasibility.criticalErrors.length} Conflicts</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          {/* AI Agent Assistant Button */}
          <button
            className="btn btn-ai-agent"
            onClick={onOpenAIAgentModal}
            title="Prompt the AI Agent to build your timetable or start a dynamic setup"
          >
            <Bot size={15} className="sparkle-anim" />
            <span className="btn-text-full">AI Agent</span>
            <span className="btn-text-short">AI</span>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            className="btn btn-icon-theme"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} className="sun-icon" /> : <Moon size={16} className="moon-icon" />}
          </button>

          {/* Analytics & Audit Modal */}
          <button
            className="btn btn-secondary"
            onClick={onOpenAnalyticsModal}
            title="Institutional constraints audit and facility utilization report"
          >
            <BarChart3 size={15} />
            <span className="btn-text-full">Audit & Stats</span>
            <span className="btn-text-short">Audit</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onOpenConfigModal}
            title="Configure college entities, teachers, and rooms"
          >
            <Sliders size={15} />
            <span className="btn-text-full">Entities & Rules</span>
            <span className="btn-text-short">Rules</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onExportCSV} 
            disabled={!hasTimetable} 
            title="Export timetable as CSV"
          >
            <Download size={15} />
            <span className="btn-text-full">Export CSV</span>
            <span className="btn-text-short">CSV</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onPrint} 
            disabled={!hasTimetable} 
            title="Print or save as PDF"
          >
            <Printer size={15} />
            <span className="btn-text-full">Print / PDF</span>
            <span className="btn-text-short">Print</span>
          </button>

          <button
            className="btn btn-primary btn-generate"
            onClick={onGenerate}
            disabled={isSolving}
          >
            {isSolving ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Solving...</span>
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" />
                <span className="btn-text-full">Generate Timetable</span>
                <span className="btn-text-short">Generate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

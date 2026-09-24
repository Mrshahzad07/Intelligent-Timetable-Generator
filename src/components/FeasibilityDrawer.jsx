import React from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Zap, 
  HelpCircle,
  BarChart3
} from 'lucide-react';

export default function FeasibilityDrawer({
  isOpen,
  onClose,
  feasibility,
  onApplyAutoFix
}) {
  if (!isOpen || !feasibility) return null;

  const { isFeasible, criticalErrors, warnings, autoFixSuggestions, metrics } = feasibility;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className={`status-badge-lg ${isFeasible ? 'feasible' : 'infeasible'}`}>
              {isFeasible ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
              <span>{isFeasible ? 'Feasibility Check Passed' : 'Impossible Constraints Detected'}</span>
            </div>
            <h2>Mathematical Feasibility & Conflict Analysis</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Executive Summary */}
          <div className={`feasibility-summary-box ${isFeasible ? 'box-feasible' : 'box-infeasible'}`}>
            <p>
              {isFeasible ? (
                <>
                  <strong>All hard constraints are mathematically satisfiable.</strong> The total academic hours, classroom capacities, faculty contracts, and laboratory hours fit within the physical dimensions of the college schedule without pigeonhole bottlenecks.
                </>
              ) : (
                <>
                  <strong>Notice:</strong> One or more constraints cannot be physically satisfied by any scheduling algorithm. The timetable solver will encounter mathematical dead-ends or unallocated classes until these contradictions are resolved.
                </>
              )}
            </p>
          </div>

          {/* Metrics Comparison Matrix */}
          <div className="metric-cards-grid">
            <div className="metric-stat-card">
              <span className="stat-label">Division Slot Capacity</span>
              <span className="stat-val">{metrics?.totalAvailableSlotsPerDivision || 0} slots/div</span>
              <span className="stat-sub">{metrics?.totalAcademicDays} days × {metrics?.totalAcademicPeriodsPerDay} periods</span>
            </div>

            <div className="metric-stat-card">
              <span className="stat-label">Lab Blocks Physical Limit</span>
              <span className="stat-val">{metrics?.totalLabBlocksCapacity || 0} blocks/wk</span>
              <span className="stat-sub">Max concurrent 2-hour sessions</span>
            </div>

            <div className="metric-stat-card">
              <span className="stat-label">Faculty Total Contract</span>
              <span className="stat-val">{metrics?.totalFacultyCapacity || 0} hours/wk</span>
              <span className="stat-sub">Sum of all faculty max limits</span>
            </div>
          </div>

          {/* Critical Impossible Constraints Section */}
          {criticalErrors.length > 0 && (
            <div className="conflicts-section">
              <h3 className="section-title text-danger">
                <ShieldAlert size={18} /> Critical Impossible Constraints ({criticalErrors.length})
              </h3>
              
              <div className="conflicts-list">
                {criticalErrors.map((err) => (
                  <div key={err.id} className="conflict-card-item">
                    <div className="conflict-card-top">
                      <span className="conflict-type-pill">{err.type}</span>
                      <h4 className="conflict-title">{err.title}</h4>
                    </div>

                    <p className="conflict-message">{err.message}</p>

                    {err.metric && (
                      <div className="conflict-metric-bar">
                        <div className="metric-item">
                          <span className="m-label">Required:</span>
                          <span className="m-val text-danger">{err.metric.required}</span>
                        </div>
                        <div className="metric-item">
                          <span className="m-label">Physical Capacity:</span>
                          <span className="m-val text-success">{err.metric.available}</span>
                        </div>
                        <div className="metric-item">
                          <span className="m-label">Deficit:</span>
                          <span className="m-val text-warning">+{err.metric.excess} periods</span>
                        </div>
                      </div>
                    )}

                    <div className="conflict-suggestion-box">
                      <strong>AI Recommendation:</strong> {err.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-Fix Resolution Actions */}
          {autoFixSuggestions.length > 0 && (
            <div className="autofix-section">
              <h3 className="section-title text-primary">
                <Wrench size={18} /> Automated Resolution Actions
              </h3>
              <p className="autofix-hint">
                Click below to instantly resolve mathematical conflicts and re-evaluate feasibility:
              </p>

              <div className="autofix-buttons-list">
                {autoFixSuggestions.map((fix) => (
                  <button
                    key={fix.id}
                    className="btn btn-autofix"
                    onClick={() => onApplyAutoFix(fix)}
                  >
                    <Zap size={16} />
                    <span>{fix.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Warnings Section */}
          {warnings.length > 0 && (
            <div className="warnings-section">
              <h3 className="section-title text-warning">
                <AlertTriangle size={18} /> Resource Warnings ({warnings.length})
              </h3>
              <div className="warnings-list">
                {warnings.map((warn) => (
                  <div key={warn.id} className="warning-card-item">
                    <span className="warning-title">{warn.title}</span>
                    <p className="warning-message">{warn.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
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
  Play,
  Key,
  Lock,
  ChevronDown,
  LogOut,
  UserCheck,
  PlusCircle
} from 'lucide-react';
import { AUTH_PROFILES, ROLES } from '../data/authProfiles';

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
  onToggleTheme,
  currentUser,
  onSwitchProfile,
  onLogout,
  onOpenAddSubject
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isStudent = currentUser?.role === ROLES.STUDENT;
  const isFaculty = currentUser?.role === ROLES.FACULTY;
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const canAdd = currentUser?.permissions?.canAddSubject;

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
            <span className="brand-subtitle">
              {isStudent ? 'Student Timetable Portal' : isFaculty ? 'Faculty Academic Portal' : 'College Timetable Generator'}
            </span>
          </div>
        </div>

        {/* Center Section: Scenario Selector & Feasibility (or Student Info) */}
        <div className="navbar-center">
          {!isStudent ? (
            <>
              <div className="preset-selector-wrapper">
                <label className="preset-label">Scenario:</label>
                <select
                  className="preset-select"
                  value={currentPresetId}
                  onChange={(e) => onSelectPreset(e.target.value)}
                  disabled={isSolving || isFaculty}
                  title={isFaculty ? 'Scenario presets can be altered by Administrator' : 'Select institutional scenario'}
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
            </>
          ) : (
            <div className="student-nav-banner">
              <span className="student-nav-pill">
                🎓 CSE Year 3 • Autumn Semester 2026-27 • Read-Only View
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons & Profile Controls */}
        <div className="navbar-actions">
          {/* Add Subject Button for Faculty & Principal */}
          {canAdd && (
            <button
              className="btn btn-add-subject-nav"
              onClick={onOpenAddSubject}
              title="Add a subject to any classroom timetable slot"
            >
              <PlusCircle size={15} className="add-icon-pulse" />
              <span className="btn-text-full">+ Add Subject</span>
              <span className="btn-text-short">+ Add</span>
            </button>
          )}

          {/* AI Agent Assistant Button (Admin & Faculty) */}
          {!isStudent && (
            <button
              className="btn btn-ai-agent"
              onClick={onOpenAIAgentModal}
              title="Prompt the AI Agent to build your timetable or start a dynamic setup"
            >
              <Bot size={15} className="sparkle-anim" />
              <span className="btn-text-full">AI Agent</span>
              <span className="btn-text-short">AI</span>
            </button>
          )}

          {/* Theme Toggle (Dark / Light) */}
          <button
            className="btn btn-icon-theme"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} className="sun-icon" /> : <Moon size={16} className="moon-icon" />}
          </button>

          {/* Analytics & Audit Modal (Admin & Faculty) */}
          {!isStudent && (
            <button
              className="btn btn-secondary"
              onClick={onOpenAnalyticsModal}
              title="Institutional constraints audit and facility utilization report"
            >
              <BarChart3 size={15} />
              <span className="btn-text-full">Audit & Stats</span>
              <span className="btn-text-short">Audit</span>
            </button>
          )}

          {/* Rules & Entities (Admin only) */}
          {isAdmin && (
            <button
              className="btn btn-secondary"
              onClick={onOpenConfigModal}
              title="Configure college entities, teachers, and rooms"
            >
              <Sliders size={15} />
              <span className="btn-text-full">Entities & Rules</span>
              <span className="btn-text-short">Rules</span>
            </button>
          )}

          {/* Export CSV (All Roles) */}
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

          {/* Print Timetable (All Roles) */}
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

          {/* Generate Timetable (Admin & Faculty) */}
          {!isStudent && (
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
          )}

          {/* User Profile Pill & Dropdown */}
          <div className="user-profile-menu-container" ref={profileMenuRef}>
            <button
              className={`user-profile-pill ${currentUser?.badgeClass || 'badge-admin'}`}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              title="Click to view profile or switch account"
            >
              <span className="pill-avatar">{currentUser?.avatar || '👤'}</span>
              <div className="pill-info">
                <span className="pill-name">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                <span className="pill-role">{currentUser?.badgeLabel || 'Profile'}</span>
              </div>
              <ChevronDown size={13} className={`chevron-icon ${isProfileMenuOpen ? 'rotated' : ''}`} />
            </button>

            {/* Profile Menu Popover */}
            {isProfileMenuOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="dropdown-avatar">{currentUser?.avatar}</div>
                  <div className="dropdown-user-meta">
                    <strong className="dropdown-name">{currentUser?.name}</strong>
                    <span className="dropdown-role">{currentUser?.title}</span>
                    <span className="dropdown-dept">{currentUser?.department}</span>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-section-title">
                  <span>Switch Profile (Password Required):</span>
                </div>
                <div className="dropdown-roles-list">
                  {AUTH_PROFILES.map(p => {
                    const isCurrent = currentUser?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        className={`role-switch-item ${isCurrent ? 'active' : ''}`}
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSwitchProfile(p.role);
                        }}
                      >
                        <span className="role-switch-avatar">{p.avatar}</span>
                        <div className="role-switch-meta">
                          <span className="role-switch-name">{p.badgeLabel}</span>
                          <span className="role-switch-user">{p.title?.split('&')[0] || p.title}</span>
                        </div>
                        <div className="role-switch-auth-indicator">
                          {isCurrent ? (
                            <span className="current-user-tag"><UserCheck size={13} /> Active</span>
                          ) : (
                            <span className="auth-needed-tag" title="Password verification required">
                              <Lock size={11} /> Auth
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-action-item dropdown-logout"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={14} />
                  <span>Log Out & Exit to Login Page</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Sign Out / Login Page Return Shortcut */}
          <button
            className="btn btn-icon-theme btn-logout-shortcut"
            onClick={onLogout}
            title="Log Out & Return to Login Page"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}

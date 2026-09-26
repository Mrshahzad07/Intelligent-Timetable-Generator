import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Eye,
  EyeOff,
  School
} from 'lucide-react';
import { AUTH_PROFILES, authenticateUser, ROLES } from '../data/authProfiles';

export default function LoginPage({ onLoginSuccess }) {
  // 3 Selectable Profile Options
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  
  // Clean manual credentials - absolutely no default data prefilled
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active role profile definition
  const activeProfile = AUTH_PROFILES.find(p => p.role === selectedRole) || AUTH_PROFILES[0];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    // Leave inputs completely blank for manual entry
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMessage('Please enter both your campus email/username and password.');
      return;
    }

    setIsLoading(true);

    // Verify credentials against backend auth service
    setTimeout(() => {
      const authenticatedUser = authenticateUser(cleanId, cleanPass);
      setIsLoading(false);

      if (!authenticatedUser) {
        setErrorMessage('Invalid credentials. Please verify your campus username and password.');
        return;
      }

      // Check if credentials match the selected portal
      if (authenticatedUser.role !== selectedRole) {
        // Automatically switch to user's registered role profile
        onLoginSuccess(authenticatedUser);
      } else {
        onLoginSuccess(authenticatedUser);
      }
    }, 250);
  };

  return (
    <div className="login-page-fullscreen">
      {/* Immersive Ambient Glows */}
      <div className="login-ambient-glow glow-1"></div>
      <div className="login-ambient-glow glow-2"></div>
      <div className="login-ambient-glow glow-3"></div>

      <div className="login-central-container">
        {/* Institutional Branding Header */}
        <div className="login-institution-header">
          <div className="institution-logo-badge">
            <School size={28} className="institution-icon" />
            <Sparkles size={16} className="logo-sparkle-dot" />
          </div>
          <span className="institution-pre-title">APEX INSTITUTE OF TECHNOLOGY & ENGINEERING</span>
          <h1 className="login-main-title">ChronosAI Campus Portal</h1>
          <p className="login-tagline">
            Role-Based Academic Scheduling & Timetable Management
          </p>
        </div>

        {/* 3 Profile Selection Tabs */}
        <div className="role-selection-wrapper">
          <div className="role-selection-heading">
            <span>Select Your Campus Login Profile:</span>
          </div>

          <div className="role-selection-grid">
            {/* Option 1: Principal / Admin */}
            <button
              type="button"
              className={`role-portal-card role-card-admin ${selectedRole === ROLES.ADMIN ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(ROLES.ADMIN)}
            >
              <div className="role-portal-icon icon-admin">
                <ShieldCheck size={22} />
              </div>
              <div className="role-portal-details">
                <span className="role-portal-name">Principal / Admin</span>
                <span className="role-portal-desc">Full Schedule & System Governance</span>
              </div>
              <div className="role-select-indicator"></div>
            </button>

            {/* Option 2: Faculty Member */}
            <button
              type="button"
              className={`role-portal-card role-card-faculty ${selectedRole === ROLES.FACULTY ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(ROLES.FACULTY)}
            >
              <div className="role-portal-icon icon-faculty">
                <GraduationCap size={22} />
              </div>
              <div className="role-portal-details">
                <span className="role-portal-name">Faculty Member</span>
                <span className="role-portal-desc">Curriculum & Manual Add Subjects</span>
              </div>
              <div className="role-select-indicator"></div>
            </button>

            {/* Option 3: Student */}
            <button
              type="button"
              className={`role-portal-card role-card-student ${selectedRole === ROLES.STUDENT ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(ROLES.STUDENT)}
            >
              <div className="role-portal-icon icon-student">
                <BookOpen size={22} />
              </div>
              <div className="role-portal-details">
                <span className="role-portal-name">Student</span>
                <span className="role-portal-desc">Division Schedule & Class Guide</span>
              </div>
              <div className="role-select-indicator"></div>
            </button>
          </div>
        </div>

        {/* Manual Credential Authentication Form */}
        <div className="login-auth-card">
          <div className="auth-card-top-bar">
            <span className={`active-portal-badge ${activeProfile.badgeClass}`}>
              {activeProfile.avatar} Logging in as: <strong>{activeProfile.badgeLabel}</strong>
            </span>
            <span className="auth-security-pill">Encrypted SSL Portal</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-content">
            {errorMessage && (
              <div className="auth-error-banner">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group-login">
              <label htmlFor="login-identifier">Campus Email or Username</label>
              <div className="input-field-wrap">
                <User size={16} className="field-adornment" />
                <input
                  id="login-identifier"
                  type="text"
                  className="auth-input-field"
                  placeholder="Enter your campus email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="form-group-login">
              <label htmlFor="login-password">Password</label>
              <div className="input-field-wrap">
                <Lock size={16} className="field-adornment" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-portal-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="btn-spinner-wrap">
                  <div className="btn-spinner"></div>
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In as {activeProfile.badgeLabel}</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="login-portal-footer">
          <span>Academic Year 2026–2027 • Apex Institute of Technology & Engineering</span>
          <span className="footer-bullet">•</span>
          <span>Institutional Access Only</span>
        </div>
      </div>
    </div>
  );
}

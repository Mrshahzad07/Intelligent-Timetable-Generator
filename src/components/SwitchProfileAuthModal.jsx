import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  AlertCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { AUTH_PROFILES, authenticateUser, ROLES } from '../data/authProfiles';

export default function SwitchProfileAuthModal({
  isOpen,
  onClose,
  targetRole,
  currentRole,
  onConfirmSwitch
}) {
  if (!isOpen || !targetRole) return null;

  const targetProfile = AUTH_PROFILES.find(p => p.role === targetRole) || AUTH_PROFILES[0];
  const currentProfile = AUTH_PROFILES.find(p => p.role === currentRole);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Reset form when modal opens or target changes
  useEffect(() => {
    setIdentifier('');
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
    setIsVerifying(false);
  }, [targetRole, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMessage('Please enter both campus email/username and password.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const authenticatedUser = authenticateUser(cleanId, cleanPass);
      setIsVerifying(false);

      if (!authenticatedUser) {
        setErrorMessage(`Invalid credentials. Access to ${targetProfile.badgeLabel} denied.`);
        return;
      }

      // Check if credentials belong to the target profile
      if (authenticatedUser.role !== targetRole) {
        setErrorMessage(
          `These credentials belong to ${authenticatedUser.badgeLabel}, not ${targetProfile.badgeLabel}. Please enter valid credentials for ${targetProfile.badgeLabel}.`
        );
        return;
      }

      // Success
      onConfirmSwitch(authenticatedUser);
      onClose();
    }, 250);
  };

  const getTargetIcon = () => {
    switch (targetProfile.role) {
      case ROLES.ADMIN:
        return <ShieldCheck size={26} className="text-primary" />;
      case ROLES.FACULTY:
        return <GraduationCap size={26} className="text-success" />;
      case ROLES.STUDENT:
        return <BookOpen size={26} className="text-info" />;
      default:
        return <KeyRound size={26} className="text-primary" />;
    }
  };

  return (
    <div className="modal-overlay switch-profile-overlay" onClick={onClose}>
      <div className="modal-content switch-profile-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header switch-modal-header">
          <div className="modal-title-group">
            <div className="switch-header-icon-wrap">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="compact-title">Security Authentication Required</h3>
              <p className="compact-subtitle">
                Verify credentials to switch from {currentProfile?.badgeLabel || 'Current Profile'}
              </p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Target Profile Card */}
        <div className="target-profile-card">
          <div className="target-profile-avatar-box">
            {targetProfile.avatar}
          </div>
          <div className="target-profile-meta">
            <div className="target-badge-row">
              <span className={`portal-badge ${targetProfile.badgeClass}`}>
                {targetProfile.badgeLabel}
              </span>
              <span className="target-role-indicator">Target Dashboard</span>
            </div>
            <strong className="target-profile-name">{targetProfile.name}</strong>
            <span className="target-profile-desc">{targetProfile.title}</span>
          </div>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="switch-auth-form">
          {errorMessage && (
            <div className="auth-error-banner">
              <AlertCircle size={16} className="text-danger flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="form-group-login">
            <label htmlFor="switch-identifier">Campus Email or Username</label>
            <div className="input-field-wrap">
              <User size={16} className="field-adornment" />
              <input
                id="switch-identifier"
                type="text"
                className="auth-input-field"
                placeholder={`Enter ${targetProfile.badgeLabel} email or username`}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="form-group-login">
            <label htmlFor="switch-password">Password</label>
            <div className="input-field-wrap">
              <Lock size={16} className="field-adornment" />
              <input
                id="switch-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input-field"
                placeholder={`Enter password for ${targetProfile.badgeLabel}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="modal-footer switch-modal-footer">
            <button type="button" className="btn btn-secondary compact-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary compact-btn btn-confirm-switch"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <div className="btn-spinner-wrap">
                  <div className="btn-spinner"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <>
                  <span>Verify & Switch to {targetProfile.badgeLabel}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import { CheckCircle2, ShieldAlert, Cpu, Activity, Building, Award, Clock } from 'lucide-react';

export default function StatsDashboard({ stats, quality }) {
  if (!stats) return null;

  const isHardCompliant = stats.hardViolations === 0;

  return (
    <div className="stats-dashboard-bar">
      {/* Constraint Compliance */}
      <div className={`stat-card ${isHardCompliant ? 'stat-card-success' : 'stat-card-danger'}`}>
        <div className="stat-card-icon">
          {isHardCompliant ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Hard Constraints</span>
          <span className="stat-card-value">
            {isHardCompliant ? '100% Conflict Free' : `${stats.hardViolations} Violations`}
          </span>
        </div>
      </div>

      {/* Fitness Quality Score */}
      <div className="stat-card">
        <div className="stat-card-icon icon-purple">
          <Award size={20} />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Optimization Fitness</span>
          <span className="stat-card-value">
            {quality?.fitnessScore || stats.fitnessScore || 0}%
          </span>
        </div>
      </div>

      {/* Sessions Placed */}
      <div className="stat-card">
        <div className="stat-card-icon icon-blue">
          <Activity size={20} />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Scheduled Sessions</span>
          <span className="stat-card-value">
            {stats.placedUnits} / {stats.totalUnits}
          </span>
        </div>
      </div>

      {/* Room Utilization */}
      <div className="stat-card">
        <div className="stat-card-icon icon-amber">
          <Building size={20} />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Room Utilization</span>
          <span className="stat-card-value">
            {quality?.roomUtilization || 0}%
          </span>
        </div>
      </div>

      {/* Solver Speed */}
      <div className="stat-card">
        <div className="stat-card-icon icon-teal">
          <Cpu size={20} />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">CSP Solver Time</span>
          <span className="stat-card-value">
            {stats.timeMs} ms <small className="stat-iter">({stats.iterations} steps)</small>
          </span>
        </div>
      </div>
    </div>
  );
}

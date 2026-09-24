import React from 'react';
import { Bot, Sparkles, Layers, Building, Plus, ArrowRight, RotateCcw } from 'lucide-react';

export default function EmptyStateControlCenter({
  onOpenAIAgent,
  onOpenConfig,
  onLoadTemplate
}) {
  return (
    <div className="empty-control-center">
      <div className="agent-hero-card">
        <div className="hero-icon-orbit">
          <Bot size={36} className="text-primary" />
          <Sparkles size={18} className="orbit-sparkle" />
        </div>
        <h2 className="hero-title">ChronosAI — Autonomous Timetable Generator</h2>
        <p className="hero-subtitle">
          All static dummy data has been removed. You are on a 100% clean, dynamic canvas.
          Provide your institution's real student cohorts, classrooms, faculty, and subjects,
          and the AI Agent will solve the timetable dynamically.
        </p>

        <div className="hero-actions-grid">
          <div className="hero-action-card" onClick={onOpenAIAgent}>
            <div className="action-card-top">
              <div className="action-icon icon-sparkle"><Sparkles size={20} /></div>
              <span className="badge-recom">Recommended</span>
            </div>
            <h3>Prompt AI Agent</h3>
            <p>Paste or describe your department curriculum, teachers, and rooms in natural language.</p>
            <button className="btn btn-primary btn-sm">
              Launch AI Prompt <ArrowRight size={14} />
            </button>
          </div>

          <div className="hero-action-card" onClick={onOpenAIAgent}>
            <div className="action-card-top">
              <div className="action-icon icon-layers"><Layers size={20} /></div>
            </div>
            <h3>Step-by-Step AI Interview</h3>
            <p>Let the AI Agent ask you for cohorts, rooms, faculty workload, and practical labs.</p>
            <button className="btn btn-secondary btn-sm">
              Start Interview <ArrowRight size={14} />
            </button>
          </div>

          <div className="hero-action-card" onClick={() => onLoadTemplate('cse')}>
            <div className="action-card-top">
              <div className="action-icon icon-building"><Building size={20} /></div>
            </div>
            <h3>Load Real Blueprint</h3>
            <p>Pre-fill with an engineering or science department template to test the solver.</p>
            <button className="btn btn-secondary btn-sm">
              Load Engineering <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

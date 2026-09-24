import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import ViewSelector from './components/ViewSelector';
import TimetableGrid from './components/TimetableGrid';
import StatsDashboard from './components/StatsDashboard';
import FeasibilityDrawer from './components/FeasibilityDrawer';
import ManualSwapModal from './components/ManualSwapModal';
import DataConfigModal from './components/DataConfigModal';
import AnalyticsModal from './components/AnalyticsModal';
import PrintSheetModal from './components/PrintSheetModal';
import PrintableTimetableSheet from './components/PrintableTimetableSheet';
import AIAgentAssistantModal from './components/AIAgentAssistantModal';
import EmptyStateControlCenter from './components/EmptyStateControlCenter';

import { DEFAULT_CONFIG, ROOM_TYPES, SUBJECT_TYPES } from './data/models';
import { ALL_PRESETS, PRESET_ENGINEERING, PRESET_MECHANICAL, PRESET_BLANK_CANVAS, PRESET_IMPOSSIBLE_CONFLICTS, PRESET_TIGHT_RESOURCE } from './data/presets';
import { checkFeasibility } from './solver/feasibilityChecker';
import { generateTimetable } from './solver/timetableSolver';
import { runGeneticAlgorithm } from './solver/geneticAlgorithmSolver';
import { exportToCSV, exportToJSON, triggerPrint } from './utils/exportUtils';
import './App.css';

export default function App() {
  // Theme State (Dark / Light)
  const [theme, setTheme] = useState('dark');

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Scenario Preset
  const [currentPresetId, setCurrentPresetId] = useState(PRESET_ENGINEERING.id);

  // Core College Entities
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [divisions, setDivisions] = useState(PRESET_ENGINEERING.divisions);
  const [rooms, setRooms] = useState(PRESET_ENGINEERING.rooms);
  const [faculty, setFaculty] = useState(PRESET_ENGINEERING.faculty);
  const [subjects, setSubjects] = useState(PRESET_ENGINEERING.subjects);

  // Timetable State
  const [timetable, setTimetable] = useState([]);
  const [stats, setStats] = useState(null);
  const [quality, setQuality] = useState(null);
  const [unallocated, setUnallocated] = useState([]);
  const [isSolving, setIsSolving] = useState(false);

  // View States
  const [viewMode, setViewMode] = useState('division'); // 'division' | 'faculty' | 'room' | 'master'
  const [selectedDivisionId, setSelectedDivisionId] = useState(PRESET_ENGINEERING.divisions[0]?.id);
  const [selectedFacultyId, setSelectedFacultyId] = useState(PRESET_ENGINEERING.faculty[0]?.id);
  const [selectedRoomId, setSelectedRoomId] = useState(PRESET_ENGINEERING.rooms[0]?.id);

  // UI Modals
  const [isFeasibilityOpen, setIsFeasibilityOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [aiAgentProgress, setAiAgentProgress] = useState(null);
  const [selectedSlotForEdit, setSelectedSlotForEdit] = useState(null);

  // Customized Print Settings
  const [printSettings, setPrintSettings] = useState({
    collegeName: 'APEX INSTITUTE OF TECHNOLOGY & ENGINEERING',
    departmentName: 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING',
    academicTerm: 'Autumn Semester 2026–2027',
    academicYear: '2026–2027',
    effectiveDate: 'October 1, 2026',
    advisorName: 'Dr. Eleanor Vance (Class Coordinator)',
    coordinatorName: 'Prof. Marcus Brody',
    hodName: 'Dr. Alan Turing',
    deanName: 'Dr. H. Vance',
    includeSubjectLegend: true,
    includeRoomLegend: true,
    includeRules: true,
    includeSignatures: true,
    customNotes: 'Students must strictly follow laboratory safety protocols and wear prescribed laboratory coats in CL-01 and CL-02.',
    targetScope: 'current'
  });

  // Feasibility Check
  const feasibility = useMemo(() => {
    if (divisions.length === 0 || subjects.length === 0) {
      return { isFeasible: true, criticalErrors: [], warnings: [], autoFixSuggestions: [] };
    }
    return checkFeasibility(divisions, rooms, faculty, subjects, config);
  }, [divisions, rooms, faculty, subjects, config]);

  // Load Preset or Custom Dataset
  const handleSelectPreset = (presetId) => {
    if (presetId === 'preset-blank') {
      handleClearAllData();
      return;
    }
    const found = ALL_PRESETS.find(p => p.id === presetId) || PRESET_ENGINEERING;
    setCurrentPresetId(found.id);
    setDivisions(JSON.parse(JSON.stringify(found.divisions)));
    setRooms(JSON.parse(JSON.stringify(found.rooms)));
    setFaculty(JSON.parse(JSON.stringify(found.faculty)));
    setSubjects(JSON.parse(JSON.stringify(found.subjects)));

    if (found.divisions[0]) setSelectedDivisionId(found.divisions[0].id);
    if (found.faculty[0]) setSelectedFacultyId(found.faculty[0].id);
    if (found.rooms[0]) setSelectedRoomId(found.rooms[0].id);

    // If switching to impossible preset, open the diagnostics drawer automatically!
    if (!found.isFeasible) {
      setIsFeasibilityOpen(true);
      setTimetable([]);
      setStats(null);
      setQuality(null);
      setUnallocated([]);
    } else {
      handleGenerate({
        divisions: found.divisions,
        rooms: found.rooms,
        faculty: found.faculty,
        subjects: found.subjects
      });
    }
  };

  // Generate Timetable with Intelligent Hybrid Genetic CSP Solver
  const handleGenerate = async (customDataset = null) => {
    const curDivs = customDataset?.divisions || divisions;
    const curRooms = customDataset?.rooms || rooms;
    const curFac = customDataset?.faculty || faculty;
    const curSubs = customDataset?.subjects || subjects;

    if (curDivs.length === 0 || curSubs.length === 0) {
      setTimetable([]);
      setStats(null);
      setQuality(null);
      return;
    }

    setIsSolving(true);
    try {
      const result = await runGeneticAlgorithm({
        divisions: curDivs,
        rooms: curRooms,
        faculty: curFac,
        subjects: curSubs,
        config,
        generations: 16
      }, (progress) => {
        setAiAgentProgress(progress);
      });

      setTimetable(result.timetable);
      setStats(result.stats);
      setQuality(result.quality);
      setUnallocated(result.unallocated || []);

      if (result.success && (result.stats?.hardViolations || 0) === 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Solver error:', err);
    } finally {
      setIsSolving(false);
      setAiAgentProgress(null);
    }
  };

  // Apply Data Extracted or Built by AI Agent
  const handleApplyDynamicData = (dataset) => {
    const newDivs = dataset.divisions || [];
    const newRooms = dataset.rooms || [];
    const newFac = dataset.faculty || [];
    const newSubs = dataset.subjects || [];

    setDivisions(newDivs);
    setRooms(newRooms);
    setFaculty(newFac);
    setSubjects(newSubs);
    setCurrentPresetId('custom-active');

    if (newDivs[0]) setSelectedDivisionId(newDivs[0].id);
    if (newFac[0]) setSelectedFacultyId(newFac[0].id);
    if (newRooms[0]) setSelectedRoomId(newRooms[0].id);

    // Update print settings department title
    if (dataset.department) {
      setPrintSettings(prev => ({
        ...prev,
        departmentName: dataset.department.toUpperCase()
      }));
    }

    // Immediately trigger evolutionary schedule solver
    handleGenerate({
      divisions: newDivs,
      rooms: newRooms,
      faculty: newFac,
      subjects: newSubs
    });
  };

  // Clear all data to start with clean canvas
  const handleClearAllData = () => {
    setDivisions([]);
    setRooms([]);
    setFaculty([]);
    setSubjects([]);
    setTimetable([]);
    setStats(null);
    setQuality(null);
    setUnallocated([]);
    setSelectedDivisionId(null);
    setSelectedFacultyId(null);
    setSelectedRoomId(null);
    setCurrentPresetId('preset-blank');
  };

  const handleLoadTemplate = (templateKey) => {
    if (templateKey === 'mech') {
      handleSelectPreset(PRESET_MECHANICAL.id);
    } else if (templateKey === 'cse') {
      handleSelectPreset(PRESET_ENGINEERING.id);
    } else {
      handleSelectPreset(PRESET_TIGHT_RESOURCE.id);
    }
  };

  // Initial Auto-Generation on Mount
  useEffect(() => {
    handleGenerate();
  }, []);

  // Auto-Fix Constraints
  const handleApplyAutoFix = (fix) => {
    if (fix.actionType === 'REDUCE_DIVISION_SESSIONS') {
      // Reduce sessions of lowest priority subjects
      const updatedSubjects = [...subjects];
      let remainingToTrim = fix.excessCount;
      for (let i = updatedSubjects.length - 1; i >= 0 && remainingToTrim > 0; i--) {
        if (updatedSubjects[i].divisionId === fix.divisionId && updatedSubjects[i].weeklySessions > 1) {
          const reduction = Math.min(remainingToTrim, updatedSubjects[i].weeklySessions - 1);
          updatedSubjects[i].weeklySessions -= reduction;
          remainingToTrim -= reduction;
        }
      }
      setSubjects(updatedSubjects);
    } else if (fix.actionType === 'INCREASE_FACULTY_LOAD') {
      const updatedFac = faculty.map(f => {
        if (f.id === fix.facultyId) {
          return { ...f, maxWeeklyLectures: fix.newLimit };
        }
        return f;
      });
      setFaculty(updatedFac);
    } else if (fix.actionType === 'CLEAR_FACULTY_UNAVAILABLE') {
      const updatedFac = faculty.map(f => {
        if (f.id === fix.facultyId) {
          return { ...f, unavailableSlots: [] };
        }
        return f;
      });
      setFaculty(updatedFac);
    } else if (fix.actionType === 'ADD_LAB_ROOM') {
      const newLab = {
        id: `room-lab-${Date.now()}`,
        name: `CL-0${rooms.filter(r => r.type === ROOM_TYPES.LAB).length + 1} (New Computing Lab)`,
        type: ROOM_TYPES.LAB,
        capacity: 75,
        building: 'Computer Wing'
      };
      setRooms([...rooms, newLab]);
    } else if (fix.actionType === 'EXPAND_ROOM_CAPACITY') {
      const updatedRooms = rooms.map(r => ({
        ...r,
        capacity: Math.max(r.capacity, fix.targetCapacity)
      }));
      setRooms(updatedRooms);
    }
  };

  // Handle Slot Move from Modal
  const handleSaveSlotMove = ({ slotId, day, period, roomId }) => {
    setTimetable(prev => prev.map(s => {
      if (s.id === slotId) {
        return { ...s, day, period, roomId };
      }
      return s;
    }));
  };

  // Handle Slot Delete
  const handleDeleteSlot = (slotId) => {
    setTimetable(prev => prev.filter(s => s.id !== slotId));
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        presets={ALL_PRESETS}
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onGenerate={handleGenerate}
        isSolving={isSolving}
        feasibility={feasibility}
        onOpenFeasibilityDrawer={() => setIsFeasibilityOpen(true)}
        onOpenConfigModal={() => setIsConfigOpen(true)}
        onOpenAnalyticsModal={() => setIsAnalyticsOpen(true)}
        onOpenAIAgentModal={() => setIsAIAgentOpen(true)}
        onExportCSV={() => exportToCSV(timetable, { divisions, rooms, faculty, subjects, config })}
        onExportJSON={() => exportToJSON({ divisions, rooms, faculty, subjects, config, timetable })}
        onPrint={() => setIsPrintModalOpen(true)}
        hasTimetable={timetable.length > 0}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {divisions.length === 0 || subjects.length === 0 ? (
          <EmptyStateControlCenter
            onOpenAIAgent={() => setIsAIAgentOpen(true)}
            onOpenConfig={() => setIsConfigOpen(true)}
            onLoadTemplate={handleLoadTemplate}
          />
        ) : (
          <>
            {/* Performance & Quality Stats Bar */}
            <StatsDashboard stats={stats} quality={quality} />

            {/* View Mode & Entity Selector */}
            <ViewSelector
              viewMode={viewMode}
              setViewMode={setViewMode}
              divisions={divisions}
              faculty={faculty}
              rooms={rooms}
              subjects={subjects}
              timetable={timetable}
              selectedDivisionId={selectedDivisionId}
              setSelectedDivisionId={setSelectedDivisionId}
              selectedFacultyId={selectedFacultyId}
              setSelectedFacultyId={setSelectedFacultyId}
              selectedRoomId={selectedRoomId}
              setSelectedRoomId={setSelectedRoomId}
            />

            {/* Calendar Matrix Timetable Grid */}
            <TimetableGrid
              viewMode={viewMode}
              timetable={timetable}
              divisions={divisions}
              rooms={rooms}
              faculty={faculty}
              subjects={subjects}
              config={config}
              selectedDivisionId={selectedDivisionId}
              selectedFacultyId={selectedFacultyId}
              selectedRoomId={selectedRoomId}
              onSlotClick={(slot) => setSelectedSlotForEdit(slot)}
              onEmptySlotClick={({ day, period, divisionId }) => {
                console.log('Empty slot clicked:', day, period, divisionId);
              }}
              unallocated={unallocated}
            />
          </>
        )}
      </main>

      {/* Live AI Evolutionary Generation Toast */}
      {aiAgentProgress && (
        <div className="ai-evolution-toast">
          <div className="toast-spinner"></div>
          <div className="toast-text">
            <strong>{aiAgentProgress.message}</strong>
            <span>Genetic Algorithm Evolution • Generation {aiAgentProgress.generation}/{aiAgentProgress.maxGenerations}</span>
          </div>
        </div>
      )}

      {/* Autonomous AI Agent Assistant Modal */}
      <AIAgentAssistantModal
        isOpen={isAIAgentOpen}
        onClose={() => setIsAIAgentOpen(false)}
        onApplyDynamicData={handleApplyDynamicData}
        onClearAllData={handleClearAllData}
        onLoadTemplate={handleLoadTemplate}
        divisions={divisions}
        rooms={rooms}
        faculty={faculty}
        subjects={subjects}
        config={config}
      />

      {/* Feasibility & Mathematical Conflict Drawer */}
      <FeasibilityDrawer
        isOpen={isFeasibilityOpen}
        onClose={() => setIsFeasibilityOpen(false)}
        feasibility={feasibility}
        onApplyAutoFix={handleApplyAutoFix}
      />

      {/* Interactive Slot Rescheduler / Swap Modal */}
      <ManualSwapModal
        isOpen={!!selectedSlotForEdit}
        onClose={() => setSelectedSlotForEdit(null)}
        slot={selectedSlotForEdit}
        timetable={timetable}
        divisions={divisions}
        rooms={rooms}
        faculty={faculty}
        subjects={subjects}
        config={config}
        onSaveMove={handleSaveSlotMove}
        onDeleteSlot={handleDeleteSlot}
      />

      {/* College Configuration & Entity Management Modal */}
      <DataConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        divisions={divisions}
        setDivisions={setDivisions}
        rooms={rooms}
        setRooms={setRooms}
        faculty={faculty}
        setFaculty={setFaculty}
        subjects={subjects}
        setSubjects={setSubjects}
        onResetPreset={() => handleSelectPreset(currentPresetId)}
      />

      {/* Institutional Analytics & Constraint Audit Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        stats={stats}
        quality={quality}
        timetable={timetable}
        rooms={rooms}
        faculty={faculty}
        divisions={divisions}
        config={config}
      />

      {/* Institutional Timetable Print & PDF Studio Modal */}
      <PrintSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
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
        setPrintSettings={setPrintSettings}
      />

      {/* Dedicated Physical Print Sheet Root (Activated during window.print()) */}
      <div id="print-sheet-root" className="print-sheet-root">
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
          isPreview={false}
        />
      </div>
    </div>
  );
}

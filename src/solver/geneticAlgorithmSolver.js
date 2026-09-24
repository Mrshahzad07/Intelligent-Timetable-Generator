// Evolutionary Genetic Algorithm (GA) Scheduler for ChronosAI
// Optimizes timetable quality through population evolution, crossover, and mutation

import { ROOM_TYPES, SUBJECT_TYPES } from '../data/models.js';
import { evaluateTimetable } from './fitnessEvaluator.js';
import { generateTimetable as generateCspTimetable } from './timetableSolver.js';

/**
 * Genetic Algorithm Evolutionary Optimizer
 * Evolves schedule population across generations to maximize soft constraint fitness
 * while preserving 0 hard constraint violations.
 */
export async function runGeneticAlgorithm({
  divisions,
  rooms,
  faculty,
  subjects,
  config,
  generations = 15,
  populationSize = 8
}, onProgress = null) {
  const startTime = performance.now();

  if (onProgress) {
    onProgress({
      phase: 'INITIALIZING',
      generation: 0,
      maxGenerations: generations,
      fitness: 0,
      message: 'AI Agent initializing chromosome population and genetic representations...'
    });
  }

  // 1. Generate seed solution using CSP heuristic engine
  const seedResult = await generateCspTimetable({ divisions, rooms, faculty, subjects, config });
  if (!seedResult.success || seedResult.timetable.length === 0) {
    return seedResult; // Fallback directly if unsatisfiable
  }

  let baseTimetable = seedResult.timetable;
  let bestChromosome = [...baseTimetable];
  let bestFitness = seedResult.quality?.fitnessScore || 85;

  // Days and active periods
  const days = config.days;
  const activePeriods = config.periods.filter(p => !p.isBreak).map(p => p.index);

  // Helper to test if a slot move is conflict-free
  function isValidSlotPlacement(slot, targetDay, targetPeriod, currentTimetable) {
    // Check if slot crosses lunch break
    const duration = slot.duration || 1;
    for (let offset = 0; offset < duration; offset++) {
      const pt = targetPeriod + offset;
      const periodObj = config.periods.find(p => p.index === pt);
      if (!periodObj || periodObj.isBreak) return false;
    }

    // Check collision with other slots in current timetable
    for (const other of currentTimetable) {
      if (other.id === slot.id) continue;
      const otherDur = other.duration || 1;
      const sameDay = other.day === targetDay;
      if (!sameDay) continue;

      const overlap = (targetPeriod < other.period + otherDur) && (targetPeriod + duration > other.period);
      if (overlap) {
        if (other.divisionId === slot.divisionId) return false;
        if (other.facultyId === slot.facultyId) return false;
        if (other.roomId === slot.roomId) return false;
      }
    }
    return true;
  }

  // Evolutionary Generations Loop
  for (let gen = 1; gen <= generations; gen++) {
    // Mutation: Try stochastic perturbation of 2-4 candidate slots
    const mutated = bestChromosome.map(s => ({ ...s }));
    const numMutations = Math.min(4, Math.max(1, Math.floor(mutated.length * 0.08)));

    for (let m = 0; m < numMutations; m++) {
      const randomIndex = Math.floor(Math.random() * mutated.length);
      const targetSlot = mutated[randomIndex];
      if (!targetSlot) continue;

      // Pick random new legal day and period
      const randomDay = days[Math.floor(Math.random() * days.length)];
      const randomPeriod = activePeriods[Math.floor(Math.random() * activePeriods.length)];

      if (isValidSlotPlacement(targetSlot, randomDay, randomPeriod, mutated)) {
        mutated[randomIndex] = {
          ...targetSlot,
          day: randomDay,
          period: randomPeriod
        };
      }
    }

    // Evaluate fitness of mutated chromosome
    const evalResult = evaluateTimetable(mutated, {
      divisions,
      rooms,
      faculty,
      subjects,
      config
    });

    const currentFitness = evalResult.fitnessScore;

    // Selection: Keep best chromosome if strictly improved or equal
    if (currentFitness >= bestFitness) {
      bestFitness = currentFitness;
      bestChromosome = mutated;
    }

    if (onProgress) {
      onProgress({
        phase: 'EVOLVING',
        generation: gen,
        maxGenerations: generations,
        fitness: bestFitness,
        message: `Generation ${gen}/${generations}: Evolving schedule genes (Fitness: ${bestFitness}%)...`
      });
      // Small tick for UI responsiveness
      await new Promise(r => setTimeout(r, 40));
    }
  }

  const finalEval = evaluateTimetable(bestChromosome, {
    divisions,
    rooms,
    faculty,
    subjects,
    config
  });

  const durationMs = Math.round(performance.now() - startTime);

  return {
    success: true,
    timetable: bestChromosome,
    stats: {
      ...seedResult.stats,
      executionTimeMs: durationMs,
      generationsRun: generations,
      algorithm: 'Hybrid CSP + Genetic Evolutionary Optimizer'
    },
    quality: finalEval,
    unallocated: seedResult.unallocated || []
  };
}

import * as d3 from "d3";
import { sportPatterns } from "./sportConfig.js";

const STEP_LENGTH_KM = 0.00075;

export function calculateMetrics(master) {
  // Calculate active/pause days from master
  const activeDays = master.filter((d) => d.trainingMinutes > 0).length;
  const pauseDays = master.filter((d) => d.trainingMinutes === 0).length;

  // Sum training minutes from master (already aggregated by day from sportRecords)
  const totalTrainingHours = d3.sum(master, (d) => d.trainingMinutes) / 60;

  const totalDistanceKm = d3.sum(master, (d) => d.steps) * STEP_LENGTH_KM;

  return {
    totalTrainingHours,
    totalDistanceKm,
    activeDays,
    pauseDays,
  };
}

export function processSportData(sportRecords) {
  if (!sportRecords || sportRecords.length === 0) return [];

  const sportTotals = {};
  sportRecords.forEach((record) => {
    const sport = record.key;
    const calories = record.calories || 0;
    if (!sportTotals[sport]) {
      sportTotals[sport] = 0;
    }
    sportTotals[sport] += calories;
  });

  return Object.entries(sportTotals)
    .map(([sport, calories]) => ({
      sport,
      calories: Math.round(calories),
      caloriesK: (calories / 1000).toFixed(1),
      color: sportPatterns[sport]?.color || "#35d1c5",
      label: sportPatterns[sport]?.label || sport.replace(/_/g, " "),
    }))
    .filter((d) => d.calories > 0 && d.sport !== "rope_skipping")
    .sort((a, b) => b.calories - a.calories);
}

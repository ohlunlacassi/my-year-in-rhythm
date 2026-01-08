import * as d3 from "d3";

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

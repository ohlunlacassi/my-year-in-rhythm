import * as d3 from "d3";

function toDay(date) {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dateKey(date) {
  return toDay(date).getTime();
}

function createDateRange(startDate, endDate) {
  const days = [];
  let current = toDay(startDate);

  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function toMap(data) {
  return new Map(data.map((d) => [dateKey(d.date), d]));
}

// =========================
// Dominant sport per day
// =========================
export function dominantSportPerDay(sportRecords) {
  const grouped = d3.group(sportRecords, (d) => {
    const date = d.time instanceof Date ? d.time : new Date(d.time);
    return toDay(date).getTime();
  });

  return Array.from(grouped, ([dayTimestamp, records]) => {
    const counts = d3.rollups(
      records,
      (v) => v.length,
      (d) => d.key
    );

    const dominantSport = counts.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      date: new Date(+dayTimestamp),
      dominantSport,
    };
  });
}

// =========================
// Training intensity (calories proxy)
// =========================
export function trainingMinutesPerDay(fitnessDaily) {
  const calories = fitnessDaily.filter((d) => d.key === "calories");

  const grouped = d3.group(calories, (d) => {
    const date = d.time instanceof Date ? d.time : new Date(d.time);
    return toDay(date).getTime();
  });

  return Array.from(grouped, ([dayTimestamp, records]) => ({
    date: new Date(+dayTimestamp),
    trainingMinutes: d3.sum(records, (d) => d.value),
  }));
}

// =========================
// Steps & calories per day
// =========================
export function stepsPerDay(fitnessDaily) {
  const steps = fitnessDaily.filter((d) => d.key === "steps");

  const grouped = d3.group(steps, (d) => {
    const date = d.time instanceof Date ? d.time : new Date(d.time);
    return toDay(date).getTime();
  });

  return Array.from(grouped, ([dayTimestamp, records]) => ({
    date: new Date(+dayTimestamp),
    steps: d3.sum(records, (d) => d.value),
  }));
}

export function caloriesPerDay(fitnessDaily) {
  const calories = fitnessDaily.filter((d) => d.key === "calories");

  const grouped = d3.group(calories, (d) => {
    const date = d.time instanceof Date ? d.time : new Date(d.time);
    return toDay(date).getTime();
  });

  return Array.from(grouped, ([dayTimestamp, records]) => ({
    date: new Date(+dayTimestamp),
    calories: d3.sum(records, (d) => d.value),
  }));
}

// =========================
// Calendar per day
// =========================
export function calendarPerDay(calendar) {
  const grouped = d3.group(calendar, (d) => {
    const date = d.start instanceof Date ? d.start : new Date(d.start);
    return toDay(date).getTime();
  });

  return Array.from(grouped, ([dayTimestamp, records]) => ({
    date: new Date(+dayTimestamp),
    event: records[0].eventCategory ?? records[0].eventType ?? null,
  }));
}

// =========================
// Master dataset
// =========================
export function createMasterDataset({
  stepsDaily,
  caloriesDaily,
  trainingDaily,
  dominantSportDaily,
  calendarDaily,
}) {
  const allDates = [
    ...stepsDaily,
    ...caloriesDaily,
    ...trainingDaily,
    ...dominantSportDaily,
    ...calendarDaily,
  ].map((d) => d.date);

  const startDate = new Date(2024, 9, 1);
  const endDate = new Date(Math.max(...allDates));
  const timeline = createDateRange(startDate, endDate);

  const stepsMap = toMap(stepsDaily);
  const caloriesMap = toMap(caloriesDaily);
  const trainingMap = toMap(trainingDaily);
  const sportMap = toMap(dominantSportDaily);
  const calendarMap = toMap(calendarDaily);

  return timeline.map((date) => {
    const key = dateKey(date);

    const steps = stepsMap.get(key)?.steps ?? 0;
    const calories = caloriesMap.get(key)?.calories ?? 0;
    const trainingMinutes = trainingMap.get(key)?.trainingMinutes ?? 0;
    const sportType = sportMap.get(key)?.dominantSport ?? null;
    const event = calendarMap.get(key)?.event ?? null;

    return {
      date,
      steps,
      calories,
      trainingMinutes,
      sportType,
      event,
      isPause: trainingMinutes === 0,
    };
  });
}

// =========================
// Main wrangling function - THIS WAS MISSING!
// =========================
export function wrangleData(fitnessDaily, sportRecords, calendar) {
  const stepsDaily = stepsPerDay(fitnessDaily);
  const caloriesDaily = caloriesPerDay(fitnessDaily);
  const trainingDaily = trainingMinutesPerDay(fitnessDaily);
  const dominantSportDaily = dominantSportPerDay(sportRecords);
  const calendarDaily = calendarPerDay(calendar);

  return createMasterDataset({
    stepsDaily,
    caloriesDaily,
    trainingDaily,
    dominantSportDaily,
    calendarDaily,
  });
}

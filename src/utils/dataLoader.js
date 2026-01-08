import * as d3 from "d3";

export async function loadData() {
  try {
    const fitnessDaily = await d3.csv("/data/fitness_daily.csv", (d) => {
      const parsedValue = JSON.parse(d.Value);
      return {
        uid: d.Uid,
        sid: d.Sid,
        key: d.Key,
        category: d.Category,
        time: new Date(+d.Time * 1000),
        value: parsedValue[d.Key],
        updateTime: new Date(+d.UpdateTime * 1000),
      };
    });

    const sportRecords = await d3.csv("/data/sport_record.csv", (d) => {
      const parsedValue = JSON.parse(d.Value);
      return {
        uid: d.Uid,
        sid: d.Sid,
        key: d.Key,
        time: new Date(+d.Time * 1000),
        calories: parsedValue.calories ?? 0,
        duration: parsedValue.duration ?? 0,
        distance: parsedValue.distance ?? 0,
        steps: parsedValue.steps ?? 0,
        updateTime: new Date(+d.UpdateTime * 1000),
      };
    });

    const calendar = await d3.csv("/data/calendar.csv", (d) => ({
      title: d.title,
      start: new Date(d.start),
      end: new Date(d.end),
      eventType: d.event_type,
      eventCategory: d.event_category,
    }));

    return {
      fitnessDaily,
      sportRecords,
      calendar,
    };
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
}

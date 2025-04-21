import { format, getYear, startOfWeek, endOfWeek } from "date-fns";

export const getChartTitle = (period) => {
  const now = new Date();

  switch (period) {
    case "weekly":
      return `Weekly Waste Collected (${format(startOfWeek(now, { weekStartsOn: 1 }), "MMM d")} - ${format(endOfWeek(now, { weekStartsOn: 1 }), "MMM d")})`;
    case "monthly":
      return `Monthly Waste Collected (${format(now, "MMMM yyyy")})`;
    case "yearly":
      return `Yearly Waste Collected (${format(now, "yyyy")})`;
    case "daily":
    default:
      return `Daily Waste Collected (${format(now, "EEEE")})`;
  }
};

export const getWasteDataByPeriod = (data, period) => {
  const now = new Date();
  const output = [];

  if (period === "daily") {
    const map = {};
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    data.forEach(({ date, weight }) => {
      if (date >= weekStart && date <= weekEnd) {
        const day = weekdays[date.getDay()];
        map[day] = (map[day] || 0) + weight;
      }
    });

    return weekdays.map(day => ({
      day,
      volume: map[day] || 0
    }));
  }

  if (period === "weekly") {
    const bins = { "Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0 };
    data.forEach(({ date, weight }) => {
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        const week = Math.ceil(date.getDate() / 7);
        bins[`Week ${week}`] += weight;
      }
    });
    return Object.entries(bins).map(([week, volume]) => ({ day: week, volume }));
  }

  if (period === "monthly") {
    const map = {};
    data.forEach(({ date, weight }) => {
      const month = format(date, "MMM");
      map[month] = (map[month] || 0) + weight;
    });

    return Array.from({ length: 12 }, (_, i) => {
      const month = format(new Date(0, i), "MMM");
      return { day: month, volume: map[month] || 0 };
    });
  }

  if (period === "yearly") {
    const map = {};
    data.forEach(({ date, weight }) => {
      const year = getYear(date);
      map[year] = (map[year] || 0) + weight;
    });

    return Object.entries(map).map(([year, volume]) => ({
      day: year.toString(),
      volume
    }));
  }

  return output;
};

import Event from "./event.model.js";

export const getMonthlyCalendarService = async (month, year) => {
  // month is 1-12 → convert to 0-11
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Fetch events
  const events = await Event.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .populate("organization", "name")
    .sort({ date: 1 });

  // Group by date
  const calendar = {};

  events.forEach((event) => {
    const dateKey = event.date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!calendar[dateKey]) {
      calendar[dateKey] = [];
    }

    calendar[dateKey].push(event);
  });

  return {
    month,
    year,
    events: calendar
  };
};
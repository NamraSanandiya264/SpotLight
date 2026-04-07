export const validateBookingInput = (data) => {
  const { room_id, date, start_time, end_time } = data;

  // Required fields
  if (!room_id || !date || !start_time || !end_time) {
    throw new Error("All fields are required");
  }

  // Validate date
  const bookingDate = new Date(date);
  if (isNaN(bookingDate)) {
    throw new Error("Invalid date format");
  }

  // Past date check
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    throw new Error("Cannot book past dates");
  }

  // Time format check (HH:mm)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    throw new Error("Time must be in HH:mm format");
  }

  // Logical check
  if (start_time >= end_time) {
    throw new Error("Start time must be before end time");
  }
};
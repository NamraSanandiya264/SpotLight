import Booking from "./booking.model.js";

// Create Booking
export const createBookingService = async (data, userId) => {
  const { room_id, date, start_time, end_time, purpose } = data;

  // 1. Check time validity
  if (start_time >= end_time) {
    throw new Error("Start time must be before end time");
  }

  // 2. Check for conflict (same room, same date, overlapping time)
  const existing = await Booking.findOne({
    room_id,
    date,
    $or: [
      {
        start_time: { $lt: end_time },
        end_time: { $gt: start_time },
      },
    ],
  });

  if (existing) {
    throw new Error("Room already booked for this time");
  }

  // 3. Create booking
  const booking = await Booking.create({
    room_id,
    user_id: userId,
    date,
    start_time,
    end_time,
    purpose,
  });

  return booking;
};

// 🔹 Get all bookings
export const getBookingsService = async () => {
  const bookings = await Booking.find()
    .populate("user_id")
    .populate("room_id");

  return bookings;
};

// 🔹 Update booking status
export const updateBookingStatusService = async (id, status, adminId) => {
  // ✅ Validate status
  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid status");
  }

  // ✅ Check if booking exists
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new Error("Booking not found");
  }

  // ✅ Update booking
  booking.status = status;
  booking.approved_by = adminId;

  await booking.save();

  return booking;
};
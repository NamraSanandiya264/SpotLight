import Booking from "./booking.model.js";

// Create Booking
export const createBookingService = async (data, userId) => {
  const { room_id, date, start_time, end_time, purpose } = data;

if (!room_id || !date || !start_time || !end_time) {
  throw new Error("All fields required");
}
  // 1. Check time validity
  if (start_time >= end_time) {
    throw new Error("Start time must be before end time");
  }

  // 2. Check for conflict (same room, same date, overlapping time)
  const existing = await Booking.findOne({
    room_id,
    date,
    status: { $in: ["pending", "approved"] },
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
  if (user.role === "sbg_core") {
    return await Booking.find().populate("user_id").populate("room_id");
  }
  const bookings = await Booking.find()
    .populate("user_id")
    .populate("room_id");

  return bookings;
};

// 🔹 Update booking status
export const updateBookingStatusService = async (id, status, user) => {

  if (user.role !== "sbg_core") {
  throw new Error("Only sbg_core can update booking status");
  }
  // ✅ Validate status
  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid status");
  }

  // ✅ Check if booking exists
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new Error("Booking not found");
  }
  if (booking.status !== "pending") {
  throw new Error("Booking already processed");
}

  // ✅ Update booking
  booking.status = status;
  booking.approved_by = user._id;

  await booking.save();

  return booking;
};
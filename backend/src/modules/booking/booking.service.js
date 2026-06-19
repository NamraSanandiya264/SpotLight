import Booking from "./booking.model.js";
import { validateBookingInput } from "../../utils/validators/booking.validator.js";

//Shared utility to check if a room is already reserved for a given slot 
export const checkRoomConflict = async (roomId, date, startTime, endTime) => {
  const normalizedDate = new Date(date);
  normalizedDate.setUTCHours(0, 0, 0, 0);

  return await Booking.findOne({
    room_id: roomId,
    date: normalizedDate,
    status: { $in: ["pending", "approved"] },
    $or: [
      {
        start_time: { $lt: endTime },
        end_time: { $gt: startTime },
      },
    ],
  }).populate("user_id", "name");
};

// Create Booking
export const createBookingService = async (data, userId) => {
  validateBookingInput(data);
  
  const { room_id, date, start_time, end_time, purpose } = data;

  if (start_time >= end_time) {
    throw new Error("Start time must be strictly before end time.");
  }

  //Max 3-hour duration enforcement
  const [startHrs, startMins] = start_time.split(":").map(Number);
  const [endHrs, endMins] = end_time.split(":").map(Number);
  const totalDurationMinutes = (endHrs * 60 + endMins) - (startHrs * 60 + startMins);

  if (totalDurationMinutes > 180) {
    throw new Error("Operational Policy Violation: Single reservations cannot exceed 3 hours.");
  }

  // Re-use centralized conflict check utility
  const isConflicted = await checkRoomConflict(room_id, date, start_time, end_time);
  if (isConflicted) {
    throw new Error("This room is already reserved for the selected time window.");
  }

  try {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    
    const booking = await Booking.create({
      room_id,
      user_id: userId,
      date: normalizedDate,
      start_time,
      end_time,
      purpose,
    });

    return booking;
  } catch (dbError) {
    if (dbError.code === 11000) {
      throw new Error("Concurrency Conflict: This slot was just reserved by another user. Please re-check availability.");
    }
    throw dbError;
  }
};

// Get all bookings
export const getBookingsService = async (user) => {
  if (user.role === "sbg_core") {
    return await Booking.find()
      .populate("user_id", "name email") 
      .populate("room_id", "name")
      .sort({ createdAt: -1 });
  }
  return await Booking.find({ user_id: user._id })
    .populate("user_id")
    .populate("room_id")
    .sort({ createdAt: -1 });
};

//Update booking status  -- only for sbg_core
export const updateBookingStatusService = async (id, status, user) => {

  // Validate status
  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid status");
  }

  // Check if booking exists
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new Error("Booking not found");
  }
  if (booking.status !== "pending") {
  throw new Error("Booking already processed");
}

  // Update booking
  booking.status = status;
  booking.approved_by = user._id;

  await booking.save();

  return booking;
};
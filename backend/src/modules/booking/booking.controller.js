import {
  createBookingService,
  getBookingsService,
  updateBookingStatusService,
  checkRoomConflict,
  cancelBookingService
} from "./booking.service.js";
import mongoose from "mongoose";
import Booking from "./booking.model.js";

//Create Booking
export const createBooking = async (req, res) => {
  try {
    const booking = await createBookingService(req.body, req.user.id);
    const result = await Booking.findById(booking._id).populate("room_id", "name");
    res.status(201).json({
      success: true,
      booking: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await getBookingsService(req.user); //pass user
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve / Reject booking
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const updatedBooking = await updateBookingStatusService(id, status, req.user);

    // Populate room info before sending back to keep UI from crashing
    const result = await updatedBooking.populate("room_id", "name");

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Check availability
export const checkAvailability = async (req, res) => {
  try {
    const { room_id, date, start_time, end_time } = req.body;
    
    if (!room_id || !date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: "Missing required lookup parameters." });
    }

    if (!mongoose.Types.ObjectId.isValid(room_id)) {
      return res.status(400).json({ message: "Invalid Room ID format" });
    }

    // Prevent past time slots on the current day
    const requestDate = new Date(date);
    requestDate.setUTCHours(0,0,0,0);
    
    const today = new Date();
    const todayMidnight = new Date(today);
    todayMidnight.setUTCHours(0,0,0,0);

    if (requestDate.getTime() === todayMidnight.getTime()) {
      const currentLocalTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
      if (start_time < currentLocalTime) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation Error: The requested start time has already passed today." 
        });
      }
    }

    const roomObjectId = new mongoose.Types.ObjectId(room_id);

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const existing = await checkRoomConflict(room_id, date, start_time, end_time);

    if (existing) {
      return res.json({ available: false });
    }

    res.json({ available: true });

  } catch (err) {
    console.error("DETAILED ERROR:", err.message); // This will show in terminal
    res.status(500).json({ message: err.message }); // This will show in the browser alert
  }
};

//get my bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user_id: req.user._id,
    })
      .populate("room_id", "name")
      .sort({ createdAt: -1 });

    res.json({ bookings });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBooking = await cancelBookingService(id, req.user);
    const result = await updatedBooking.populate("room_id", "name");

    res.status(200).json({
      success: true,
      message: "Booking canceled successfully",
      booking: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
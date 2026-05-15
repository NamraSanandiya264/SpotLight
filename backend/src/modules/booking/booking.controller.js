import {
  createBookingService,
  getBookingsService,
  updateBookingStatusService,
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
    
    // Log the incoming data to see if anything is missing
    console.log("Checking availability for:", { room_id, date, start_time, end_time });

    if (!mongoose.Types.ObjectId.isValid(room_id)) {
      return res.status(400).json({ message: "Invalid Room ID format" });
    }

    const roomObjectId = new mongoose.Types.ObjectId(room_id);

    const existing = await Booking.findOne({
      room_id: roomObjectId,
      date: new Date(date), // Ensure the date string is converted to a Date object
      status: { $in: ["pending", "approved"] },
      $or: [
        {
          start_time: { $lt: end_time },
          end_time: { $gt: start_time },
        },
      ],
    });

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
      .sort({ created_at: -1 });

    res.json({ bookings });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
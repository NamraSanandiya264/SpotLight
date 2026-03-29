import {
  createBookingService,
  getBookingsService,
  updateBookingStatusService,
} from "./booking.service.js";

// 🔹 Create Booking
export const createBooking = async (req, res) => {
  try {
    const booking = await createBookingService(req.body, req.user.id);

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🔹 Get all bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await getBookingsService();

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Approve / Reject booking
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await updateBookingStatusService(
      req.params.id,
      req.body.status,
      req.user.id
    );

    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
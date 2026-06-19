import express from "express";
import {
  createBooking,
  getBookings,
  updateBookingStatus,
  checkAvailability,
  getMyBookings,
  cancelBooking,
} from "./booking.controller.js";
import { protect , authorize } from "../../middleware/auth.middleware.js";
const router = express.Router();


router.post("/", protect, authorize("student"), createBooking);
router.get("/", protect, getBookings);
router.patch("/:id/status", protect, authorize("sbg_core"), updateBookingStatus);
router.post("/check", protect, checkAvailability);
router.get("/my", protect, getMyBookings);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
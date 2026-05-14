import express from "express";
import {
  createBooking,
  getBookings,
  updateBookingStatus,
  checkAvailability,
  getMyBookings,
} from "./booking.controller.js";
import { protect , authorize } from "../../middleware/auth.middleware.js";
const router = express.Router();


router.post("/", protect, authorize("student"), createBooking);
router.get("/", protect, getBookings);
router.patch("/:id/status", protect, authorize("sbg_core"), updateBookingStatus);
router.post("/check", protect, checkAvailability);
router.get("/my", protect, getMyBookings);

export default router;
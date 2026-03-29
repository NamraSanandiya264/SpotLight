import express from "express";
import {
  createBooking,
  getBookings,
  updateBookingStatus,
} from "./booking.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getBookings);
router.patch("/:id", protect, updateBookingStatus);

export default router;
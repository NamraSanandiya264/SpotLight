import express from "express";
import {
  createEvent,
  getEvents,
  updateEvent,
} from "./event.controller.js";
import { getMonthlyCalendar } from "./event.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createEvent);
router.get("/", protect , getEvents);
router.get("/org/:orgId", protect, getEvents);
router.patch("/:id", protect, updateEvent);
router.get("/calendar", protect, getMonthlyCalendar);


export default router;
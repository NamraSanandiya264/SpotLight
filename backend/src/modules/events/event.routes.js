import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { createEvent, updateEvent, getDeputyEvents , deleteEvent, publishEvent,getMonthlyCalendarData} from "./event.controller.js";
import { getUpcomingEvents } from "./event.controller.js";

const router = express.Router();

router.get("/deputy-view", protect, getDeputyEvents);
router.post("/create", protect, createEvent);
router.put("/update/:id", protect, updateEvent);
router.delete("/delete/:id", protect, deleteEvent);
router.patch("/publish/:id", protect, publishEvent); // Using PATCH since we're modifying a single field
router.get("/calendar", getMonthlyCalendarData);
router.get("/upcoming", getUpcomingEvents);

export default router;
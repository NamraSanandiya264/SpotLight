import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { createEvent, updateEvent, getDeputyEvents , deleteEvent} from "./event.controller.js";

const router = express.Router();

router.get("/deputy-view", protect, getDeputyEvents);
router.post("/create", protect, createEvent);
router.put("/update/:id", protect, updateEvent);
router.delete("/delete/:id", protect, deleteEvent);

export default router;
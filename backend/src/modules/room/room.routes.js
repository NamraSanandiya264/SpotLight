import express from "express";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "./room.controller.js";
import { protect , authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Create room
router.post("/", protect, authorize("sbg_core"), createRoom);

// Get all rooms
router.get("/", getRooms);

// Get single room
router.get("/:id", getRoomById);

// Update room
router.put("/:id", protect, authorize("sbg_core"), updateRoom);

// Delete room
router.delete("/:id", protect, authorize("sbg_core"), deleteRoom);

export default router;
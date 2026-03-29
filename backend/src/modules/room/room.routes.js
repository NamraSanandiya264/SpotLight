import express from "express";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "./room.controller.js";

const router = express.Router();

// Create room
router.post("/", createRoom);

// Get all rooms
router.get("/", getRooms);

// Get single room
router.get("/:id", getRoomById);

// Update room
router.put("/:id", updateRoom);

// Delete room
router.delete("/:id", deleteRoom);

export default router;
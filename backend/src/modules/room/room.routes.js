import express from "express";
import Room from "../models/Room.js";

const router = express.Router();

//
router.post("/addroom", async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.send("Room added successfully");
  } catch (error) {
    return res.status(400).json({ error });
  }
});
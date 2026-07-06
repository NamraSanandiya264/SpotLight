import express from "express";
import { getNotices, createNotice, deleteNotice } from "./notice.controller.js";
import { protect } from "../../middleware/auth.middleware.js"; 

const router = express.Router();

router.get("/", getNotices); 
router.post("/", protect, createNotice);
router.delete("/:id", protect, deleteNotice); 

export default router;
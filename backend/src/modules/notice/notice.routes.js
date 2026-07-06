import express from "express";
import { getNotices, createNotice } from "./notice.controller.js";
import { protect } from "../../middleware/auth.middleware.js"; 

const router = express.Router();

router.get("/", getNotices);
router.post("/", protect, createNotice);

export default router;
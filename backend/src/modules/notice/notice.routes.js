import express from "express";
import { getActiveNotices, createNotice } from "./notice.controller.js";

const router = express.Router();

router.get("/active", getActiveNotices);
router.post("/create", createNotice);

export default router;
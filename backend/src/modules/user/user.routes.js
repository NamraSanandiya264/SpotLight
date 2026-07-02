//It defines API endpoints (URLs) and tells Express which function to run

/*
Client (Postman)
   ↓
POST /api/users/register
   ↓
Routes (this file)
   ↓
Controller (register function)
   ↓
Service
   ↓
Database 
*/
import express from "express";
import multer from "multer";
import { getUserActivity, getSbgMetrics } from "./user.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

import {
   register,
   login,
   updateProfile,
   changePassword,
   uploadAvatar,
} from "./user.controller.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.put("/profile", protect, updateProfile);
router.put("/profile/password", protect, changePassword);
router.post(
   "/profile/avatar",
   protect,
   upload.single("avatar"),
   uploadAvatar
);
router.post("/registerUser", register);
router.post("/loginUser", login);
router.get("/profile", protect, (req, res) => {
   res.json({
      message: "Current user fetched",
      user: req.user,
   });
});
router.get('/sbg-metrics', protect, getSbgMetrics);
router.get('/activity', protect, getUserActivity);

export default router;
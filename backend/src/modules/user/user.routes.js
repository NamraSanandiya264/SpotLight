import express from "express";
import multer from "multer";
import { protect } from "../../middleware/auth.middleware.js";
import { authLimiter } from "../../middleware/rateLimiter.middleware.js";
import { register, login, updateProfile, changePassword, uploadAvatar, 
   forgotPassword, resetPassword, verifyRegistration, resendOTP } from "./user.controller.js";

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
router.post("/registerUser", authLimiter, register);
router.post("/verify-email", authLimiter, verifyRegistration);
router.post("/loginUser", authLimiter, login);
router.get("/profile", protect, (req, res) => {
   res.json({
      message: "Current user fetched",
      user: req.user,
   });
});
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/resend-otp", authLimiter, resendOTP);

export default router;
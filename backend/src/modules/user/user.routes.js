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
import express from "express"; // creates a router object 
import { register, login } from "./user.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/registerUser", register);
router.post("/loginUser", login);
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Current user fetched",
    user: req.user,
  });
});

export default router;
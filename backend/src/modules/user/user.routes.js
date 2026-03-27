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

const router = express.Router();

router.post("/registerUser", register);
router.post("/loginUser", login);

export default router;
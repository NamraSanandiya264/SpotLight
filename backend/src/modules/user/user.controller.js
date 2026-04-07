// It connects frontend request → service logic → response

/* 
Client (Postman)
   ↓
Controller (this file)
   ↓
Service (user.service.js)
   ↓
Database 
*/

import { registerUser, loginUser } from "./user.service.js";

export const register = async (req, res) => { //Runs when user hits /register API endpoint with POST method 
                                              // req.body contains the data sent by the frontend 
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  console.log(req.body);
};

export const login = async (req, res) => { // Runs when user hits /login API 
  try {
    const data = await loginUser(req.body);
    res.status(200).json({
      message: "Login successful",
      ...data,
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid credentials"
    });
    res.status(400).json({ error: error.message });
  }
};


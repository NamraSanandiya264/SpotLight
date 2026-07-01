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

import { registerUser, loginUser, generateAndSendOTP, resetPasswordWithOTP } from "./user.service.js";
console.log("USER CONTROLLER LOADED");
import User from "./user.model.js";
import bcrypt from "bcryptjs";

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
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, yearOfStudy, branch, phone } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.yearOfStudy = yearOfStudy || user.yearOfStudy;
    user.branch = branch || user.branch;
    user.phone = phone || user.phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find logged in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check old password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // Save image path
    user.avatar = req.file.path;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const response = await generateAndSendOTP(req.body.email);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const response = await resetPasswordWithOTP(email, otp, newPassword);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
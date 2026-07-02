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
import Event from "../events/event.model.js";
import bcrypt from "bcryptjs";
import Booking from "../booking/booking.model.js";
import Notification from "../notifications/notification.model.js";
import OrganizationMember from "../organizations/orgMember.model.js";

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


export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user's latest bookings
    const recentBookings = await Booking.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("room_id", "name");

    // 2. Fetch user's latest notifications
    const recentNotifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    let activities = [];

    // Push bookings to timeline
    recentBookings.forEach((b) => {
      activities.push({
        id: `booking_${b._id}`,
        title: `Requested room: ${b.room_id?.name || 'Unknown Room'}`,
        description: `Status: ${b.status}`,
        timestamp: b.createdAt,
        type: 'booking',
      });
    });

    // Push notifications to timeline
    recentNotifications.forEach((n) => {
      activities.push({
        id: `notif_${n._id}`,
        title: 'System Alert',
        description: n.message,
        timestamp: n.createdAt,
        type: 'notification',
      });
    });

    // 3.Fetch Club Events if user is a Leader
    const managedMemberships = await OrganizationMember.find({
      user: userId, 
      role: { $in: ["convenor", "deputy", "core"] }
    });

    if (managedMemberships.length > 0) {
      const orgIds = managedMemberships.map(m => m.organization);
      
      const recentEvents = await Event.find({ organization: { $in: orgIds } })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("organization", "name");

      recentEvents.forEach((e) => {
        activities.push({
          id: `event_${e._id}`,
          title: `Event Update: ${e.eventName}`,
          description: `${e.organization?.name || 'Your Club'}: ${e.isPublished ? 'Published to calendar' : 'Drafted / Pending'}`,
          timestamp: e.createdAt,
          type: 'club-event',
        });
      });
    }

    // 4. Sort all activities together by newest first and limit to top 5
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const finalTimeline = activities.slice(0, 5);

    res.status(200).json({ success: true, data: finalTimeline });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSbgMetrics = async (req, res) => {
  try {
    // Security check: Ensure only SBG Core can access this heavy query
    if (req.user.role !== 'sbg_core') {
      return res.status(403).json({ success: false, message: "Unauthorized. SBG Core access only." });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    // 1. Pending Room Requests (Purpose does NOT start with "Event:")
    const pendingRooms = await Booking.countDocuments({
      status: "pending",
      purpose: { $not: /^Event:/ }
    });

    // 2. Pending Event Approvals (Purpose starts with "Event:")
    const pendingEvents = await Booking.countDocuments({
      status: "pending",
      purpose: /^Event:/
    });

    // 3. Rooms Occupied Today
    const roomsOccupiedToday = await Booking.countDocuments({
      status: "approved",
      date: today
    });

    // 4. Live Events This Week
    const liveEventsThisWeek = await Event.countDocuments({
      isPublished: true,
      date: { $gte: today, $lte: endOfWeek }
    });

    res.status(200).json({
      success: true,
      metrics: {
        pendingRooms,
        pendingEvents,
        roomsOccupiedToday,
        liveEventsThisWeek,
        pendingClubs: 0 // Kept as an extensible placeholder for future organization modules
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
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
import User from "./user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const registerUser = async (data) => {
  const { studentID, name, email, password, yearOfStudy, role } = data;

  if (!studentID || !name || !email || !password || !yearOfStudy) {
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { studentID: Number(studentID) }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("This email is already registered. Please login.");
    }
    if (existingUser.studentID === Number(studentID)) {
      throw new Error("This Student ID is already registered.");
    }
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Generate 6-digit OTP for registration
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    studentID,
    name,
    email,
    password: hashedPassword,
    yearOfStudy,
    role,
    verificationOTP: otp,
    verificationOTPExpires: Date.now() + 10 * 60 * 1000, // 10 mins
    isVerified: false
  });

  // Send Email
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome! Verify your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Verify Your Account</h2>
        <p style="color: #555; font-size: 16px;">Hello ${name},</p>
        <p style="color: #555; font-size: 16px;">Welcome to the platform! Use the verification code below to complete your registration:</p>
        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #4f46e5;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          This code expires in 10 minutes.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return user;
};

export const verifyEmailOTP = async (email, otp) => {
  const user = await User.findOne({
    email,
    verificationOTP: otp,
    verificationOTPExpires: { $gt: Date.now() }, 
  });

  if (!user) {
    throw new Error("Invalid or expired OTP");
  }

  // Mark as verified and clear OTP fields
  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpires = undefined;
  await user.save();

  return { message: "Email verified successfully" };
};

export const loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent login if not verified
  if (!user.isVerified) {
    throw new Error("Please verify your email address before logging in");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { user, token };
};

export const generateAndSendOTP = async (email) => {

  console.log("EMAIL USER IS:", process.env.EMAIL_USER);
  console.log("EMAIL PASS IS:", process.env.EMAIL_PASS ? "LOADED" : "UNDEFINED");

  const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiration to 10 minutes from now
  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  // Send Email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Security Alert: Your Password Reset OTP",
    // Replace the 'text' property with this 'html' property
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">We received a request to reset your password. Use the verification code below to complete the process:</p>
        
        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #4f46e5;">${otp}</span>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { message: "OTP sent to email" };
};

export const resetPasswordWithOTP = async (email, otp, newPassword) => {
  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordOTPExpires: { $gt: Date.now() }, // Check if not expired
  });

  if (!user) {
    throw new Error("Invalid or expired OTP");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Clear OTP fields
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;
  await user.save();

  return { message: "Password reset successfully" };
};
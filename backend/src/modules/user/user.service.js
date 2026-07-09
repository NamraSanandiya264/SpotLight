import User from "./user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendVerificationOTP,
  sendPasswordResetOTP,
} from "../../services/email.service.js";

const OTP_RESEND_COOLDOWN = 60 * 1000;
export const registerUser = async (data) => {
  const { studentID, name, email, password, yearOfStudy, role } = data;

  if (!studentID || !name || !email || !password || !yearOfStudy) {
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { studentID: Number(studentID) }]
  });

  if (existingUser) {

    if (
      !existingUser.isVerified &&
      existingUser.verificationOTPExpires &&
      existingUser.verificationOTPExpires < new Date()
    ) {
      await User.findByIdAndDelete(existingUser._id);
    } else {

      if (existingUser.email === email) {
        throw new Error("This email is already registered. Please login.");
      }

      if (existingUser.studentID === Number(studentID)) {
        throw new Error("This Student ID is already registered.");
      }

    }
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Generate 6-digit OTP for registration
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOTP = await bcrypt.hash(otp, 10);
  const user = await User.create({
    studentID,
    name,
    email,
    password: hashedPassword,
    yearOfStudy,
    role,
    verificationOTP: hashedOTP,
    verificationOTPExpires: Date.now() + 10 * 60 * 1000, // 10 mins
    verificationOTPLastSent: new Date(),
    isVerified: false
  });

  // Send Email
  await sendVerificationOTP(email, name, otp);

  return user;
};

export const verifyEmailOTP = async (email, otp) => {

  const user = await User.findOne({
    email,
    verificationOTPExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error("Invalid or expired OTP");
  }

  if(user.verificationOTPAttempts>=3){

    throw new Error(
        "Maximum attempts reached. Please request a new OTP."
    );
  }

  const isMatch = await bcrypt.compare(
    otp,
    user.verificationOTP
  );

  if (!isMatch) {

    user.verificationOTPAttempts += 1;

    await user.save();

    throw new Error("Invalid or expired OTP");

  }

  user.verificationOTPAttempts = 0;
  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpires = undefined;

  await user.save();

  return {
    message: "Email verified successfully",
  };
};

export const loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent login if not verified
  if (!user.isVerified) {
    const error = new Error("Please verify your email address before logging in");
    error.code = "EMAIL_NOT_VERIFIED";
    error.email = user.email;
    throw error;
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
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

    if (
        user.resetPasswordOTPLastSent &&
        now - user.resetPasswordOTPLastSent < OTP_RESEND_COOLDOWN
    ) {
        throw new Error(
            "Please wait 60 seconds before requesting another OTP."
        );
    }
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP before saving
  const hashedOTP = await bcrypt.hash(otp, 10);

  // Save hashed OTP
  user.resetPasswordOTP = hashedOTP;
  user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
  user.resetPasswordOTPLastSent = now;

  user.resetPasswordOTPAttempts = 0;
  await user.save();

  // Send the plain OTP to the user
  await sendPasswordResetOTP(email, otp);

  return {
    message: "OTP sent to email",
  };
};

export const resetPasswordWithOTP = async (email, otp, newPassword) => {
  const user = await User.findOne({
    email,
    resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error("Invalid or expired OTP");
    }

    if (user.resetPasswordOTPAttempts >= 3) {
        throw new Error(
            "Maximum attempts reached. Please request a new OTP."
        );
    }
    const isMatch = await bcrypt.compare(
        otp,
        user.resetPasswordOTP
    );

    if (!isMatch) {

      user.resetPasswordOTPAttempts += 1;

      await user.save();

      throw new Error("Invalid or expired OTP");

  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Clear OTP fields
  user.resetPasswordOTPAttempts = 0;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;
  await user.save();

  return { message: "Password reset successfully" };
};

export const resendVerificationOTP = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified");
  }

  const now = new Date();

    if (
        user.verificationOTPLastSent &&
        now - user.verificationOTPLastSent < OTP_RESEND_COOLDOWN
    ) {
        throw new Error(
            "Please wait 60 seconds before requesting another OTP."
        );
    }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOTP = await bcrypt.hash(otp, 10);

  user.verificationOTP = hashedOTP;
  user.verificationOTPExpires = Date.now() + 10 * 60 * 1000;
  user.verificationOTPLastSent = now;

  user.verificationOTPAttempts = 0;
  await user.save();

  await sendVerificationOTP(user.email, user.name, otp);

  return {
    message: "OTP sent successfully",
  };
};
import mongoose from "mongoose";
import { valid } from "semver";

const userSchema = new mongoose.Schema(
  {
    studentID: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{9}$/.test(v);
        },
      },
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[0-9._%+-]+@(dau\.ac\.in)$/,
        "Use your university email only",
      ],
    },

    password: {
      type: String,
      required: true,
    },

    yearOfStudy: {
      type: String,
      required: true,
      enum: [
        "B.Tech - 1st Year",
        "B.Tech - 2nd Year",
        "B.Tech - 3rd Year",
        "B.Tech - 4th Year",
        "Masters - 1st Year",
        "Masters - 2nd Year",
      ],
    },

    branch: {
      type: String,
      enum: [
        "ICT",
        "ICT-CS",
        "EVD",
        "MNC",
        "MSCIT",
        "M. Tech"
      ],
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["student", "sbg_core"],
      default: "student",
    },

    resetPasswordOTP: {
      type: String,
    },
    resetPasswordOTPExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      type: String,
    },
    verificationOTPExpires: {
      type: Date,
    },
    verificationOTPAttempts: {
        type: Number,
        default: 0,
    },
    verificationOTPLastSent: {
      type: Date,
    },
    resetPasswordOTPAttempts:{
        type:Number,
        default:0,
    },
    resetPasswordOTPLastSent: {
      type: Date,
    },
  },

  { timestamps: true }
);

// Removes password from API response
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
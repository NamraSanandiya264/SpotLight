import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    studentID: {
      type: Number,
      required: true,
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
    },
    password: {
      type: String,
      required: true,
    },
    yearOfStudy: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "sbg_core"],
      default: "student",
    },
  },
  { timestamps: true }
);
// It removes the password when you send user data in API response
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id:{
        type: Number,
        required: true,
        unique: true,   
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    year_of_study:{
        type: Number,
        required: true,
    },
    role:{
        type: String,
        enum: ['SBG Core', 'Part of Club/Committee', 'None'],
        default: 'None',
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
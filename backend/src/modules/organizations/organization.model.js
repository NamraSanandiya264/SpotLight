// backend/src/modules/organizations/organization.model.js
import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["club", "committee"],
      required: true,
    },
    numofCoreMembers: {
      type: Number,
      default: 5,
    },
    description: {
      type: String,
      default: "",
    },
    photos: [
      {
        type: String, // image URLs
      }
    ],
    coverPhoto: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    totalBudget: {
      type: Number,
      default: 0,
    },
    remainingBudget: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
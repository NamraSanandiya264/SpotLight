import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date // Optional parameter to let notices drop off automatically
    }
  },
  { timestamps: true }
);

const Notice = mongoose.model("Notice", noticeSchema);
export default Notice;
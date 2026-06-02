import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A title/subject is mandatory for official notices."],
      trim: true
    },
    content: {
      type: String,
      required: [true, "Notice body content cannot be empty."],
      trim: true
    },
    postedBy: {
      type: String,
      default: "Student Representative Body"
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
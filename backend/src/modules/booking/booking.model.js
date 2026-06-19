import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room association is mandatory."],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User association is mandatory."],
    },
    date: {
      type: Date,
      required: [true, "Booking date is mandatory."],
    },
    start_time: {
      type: String,
      required: [true, "Start time is mandatory."],
    },
    end_time: {
      type: String,
      required: [true, "End time is mandatory."],
    },
    purpose: {
      type: String,
      trim: true,
      default: "General Meeting",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    contact_number: {
      type: String,
      required: [true, "Contact number is mandatory."],
    },
    organization: {
      type: String,
      default: "None",
    },
  },
  { 
    timestamps: true
  }
);

bookingSchema.index(
  { room_id: 1, date: 1, start_time: 1, end_time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
  }
);

export default mongoose.model("Booking", bookingSchema);
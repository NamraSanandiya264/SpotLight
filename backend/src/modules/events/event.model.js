import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., "18:00"
    endTime: { type: String, required: true },   // e.g., "21:00"
    venue: { type: String, required: true },
    organization: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Organization", 
      required: true 
    },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
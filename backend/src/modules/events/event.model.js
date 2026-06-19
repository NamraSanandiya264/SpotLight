import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true },   
    
    venue: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Room", 
      required: true 
    },
    
    organization: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Organization", 
      required: true 
    },
    
    bookingRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    },
    
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
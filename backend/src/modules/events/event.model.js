import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  event_name: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  startTime: {
    type: String,
    required: true
  },

  endTime: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

eventSchema.pre("save", async function () {
  const [startH, startM] = this.startTime.split(":").map(Number);
  const [endH, endM] = this.endTime.split(":").map(Number);

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  // ✅ Allow overnight (end < start means next day)
  if (start === end) {
    throw new Error("Event cannot have same start and end time");
  }
});

eventSchema.index({ organization: 1, date: 1 });

export default mongoose.model("Event", eventSchema);
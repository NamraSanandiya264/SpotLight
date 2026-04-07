import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ["club", "committee"],
    required: true
  },
  numOfCoreMembers: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

export default mongoose.model("Organization", organizationSchema);
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  Roomno: { 
    type: String, 
    required: true 
},
  Capacity: { 
    type: Number, 
    required: true 
},
  currentBookings: [],
}, { timestamps: true });

const roomModel = mongoose.model("rooms", roomSchema);
export default roomModel;
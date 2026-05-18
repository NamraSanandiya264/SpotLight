import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    itemName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    costPerItem: {
      type: Number,
      required: true,
    },

    totalCost: {
      type: Number,
      required: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);
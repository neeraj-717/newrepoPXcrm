import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    Deal_title: { type: String, required: true },
    Value: { type: Number, required: true },
    Close_date: { type: Date, required: true },
    description: { type: String },
    stage: {
      type: String,
      enum: ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"],
      default: "Prospecting",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

const Deal = mongoose.model("Deal", dealSchema);
export default Deal;

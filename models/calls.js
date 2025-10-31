import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    lead: { type: String, required: true },
    duration: { type: Number, required: true },
    outcome: { type: String, required: true },
    notes: { type: String, required: true },
    status: {
        type: String,
        enum: ["Scheduled", "Completed", "Cancelled"],
        default: "Scheduled",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);

export default Call;

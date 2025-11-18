import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true
    },
    phoneNumber: { type: String, required: true },
    callSid: { type: String }, // Twilio call SID
    messageSid: { type: String }, // Twilio message SID for SMS
    message: { type: String }, // SMS message content
    duration: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["initiated", "ringing", "answered", "completed", "busy", "failed", "sent", "delivered", "read"],
      default: "initiated"
    },
    type: {
      type: String,
      enum: ["call", "sms"],
      default: "call"
    },
    notes: { type: String },
    endTime: { type: Date },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);

export default Call;

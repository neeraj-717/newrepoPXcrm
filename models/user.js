import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    expiresAt: { type: Date },
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin"],
      default: "Admin",
    },
    permissions: {
      leads: { type: Boolean, default: true },
      deals: { type: Boolean, default: false },
      tasks: { type: Boolean, default: false },
      reports: { type: Boolean, default: false },
      telephony: { type: Boolean, default: false },
      automation: { type: Boolean, default: false },
    }
  },
  { timestamps: true }
);

let user= mongoose.model("User", userSchema);

export default user

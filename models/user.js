import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
   profileImage: { type: String, default: "" },
    expiresAt: { type: Date },
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin"],
      default: "Admin",
    },
    registrationDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    paymentStatus: { type: String, default: "Pending" },
    accessRevoked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

let user = mongoose.model("User", userSchema);

export default user

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
    activePlan: { type: String, enum: ["free", "premium", "3 Months Plan", "6 Months Plan", "1 Year Plan", "2 Year Plan"], default: "free" },
    planStartDate: { type: Date },
    planExpiryDate: { type: Date },
    paymentHistory: [{
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      planName: String,
      amount: Number,
      prefill: {
        name: String,
        email: String,
        contact: String
      },
      notes: {
        address: String
      },
      theme: {
        color: String
      },
      status: String,
      paymentDate: { type: Date, default: Date.now }
    }],
    accessRevoked: { type: Boolean, default: false },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    expiryDate: { type: Date }
  },
  { timestamps: true }
);

let user = mongoose.model("User", userSchema);

export default user

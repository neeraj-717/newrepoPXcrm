// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/payment.js";
import User from "../models/user.js"; // import your user model
// import dotenv from "dotenv";
// dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay configuration missing" });
    }

    const options = {
      amount: parseInt(amount) * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const verifyPayment = async (req, res) => {
  console.log(req.body)
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planName,
      amount,
      prefill,
      notes,
      theme
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // ✅ Save payment in user document
    const paymentData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planName,
      amount,
      prefill,
      notes,
      theme,
      status: "success",
      paymentDate: new Date()
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { paymentStatus: "Success", activePlan: planName },
        $push: { paymentHistory: paymentData }
      },
      { new: true }
    );

    res.json({ message: "Payment verified successfully", payment: paymentData, user: updatedUser });
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Fetch User Payment History
export const getUserPayments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('paymentHistory name email');
    const payments = user.paymentHistory.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

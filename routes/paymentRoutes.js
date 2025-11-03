import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,  // ₹ to paise
      currency: "INR"
    });

    const upiString = `upi://pay?pa=yourupiid@bank&pn=YourName&am=${amount}&cu=INR&tn=Subscription`;

    const qrImage = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${upiString}`;

    res.json({
      success: true,
      orderId: order.id,
      qr: qrImage
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Payment Error" });
  }
});

router.post("/payment-webhook", (req, res) => {
  const payment = req.body;
  if (payment.status === "captured") {
    // ✅ Update order in DB
  }
  res.sendStatus(200);
});




export default router;

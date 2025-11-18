import express from "express";
import { createOrder, verifyPayment, getUserPayments } from "../controllers/paymentController.js";
import { verifytoken } from "../Middleware/Middleware.js";

const router = express.Router();

router.post("/create-order",verifytoken, createOrder);
router.post("/verify", verifytoken, verifyPayment);
router.get("/user-payments", verifytoken, getUserPayments);

export default router;
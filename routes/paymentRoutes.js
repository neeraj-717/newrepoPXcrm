import express from "express";
import { createOrder, verifyPayment, getUserPayments } from "../controllers/paymentController.js";
import { verifyToken } from "../Middleware/Middleware.js";

const router = express.Router();

router.post("/create-order",verifyToken, createOrder);
router.post("/verify", verifyToken, verifyPayment);
router.get("/user-payments", verifyToken, getUserPayments);

export default router;
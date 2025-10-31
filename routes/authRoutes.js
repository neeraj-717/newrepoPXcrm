import express from "express";
import rateLimit from "express-rate-limit";
import { getUsers, login, resendOTP, signup, verifyOTP } from "../controllers/authController.js";
import { verifyToken } from "../Middleware/Middleware.js";
import User from "../models/user.js";

const router = express.Router();
const otpLimiter=rateLimit({
    windowMs: 60 * 1000,
    max:3,
    message:"Too many OTP requests. Try again later."
})

router.post("/signup",otpLimiter, signup);
router.post("/verify-otp",verifyOTP);
router.post("/login", login);
router.get("/getuser", getUsers);
router.post("/resend-otp", resendOTP);

router.put("/:id/permissions", verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { key, value } = req.body; // 👈 single permission laa rahe

    if (!key) return res.status(400).json({ message: "Permission key required" });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { [`permissions.${key}`]: value } },  // 👈 only that key update
      { new: true }
    );

    res.json({ message: "Permission updated ✅", updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/admins", verifyToken, async (req, res) => {
    // console.log("Allusersreq.user", req.user)
  try {
    const currentUser = await User.findById(req.user.id);
    console.log("AlluserscurrentUser", currentUser)
    if (!currentUser || currentUser.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    const admins = await User.find(
      { role: "Admin" },
      "name email permissions"
    );

    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ✅ Signup + Send OTP via Brevo
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, Email, and Password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const payload = {
      sender: { name: "YourCRM", email: process.env.SENDER_EMAIL },
      to: [{ email }],
      subject: "Your OTP Code",
      htmlContent: `<h2>Your OTP is: <b>${otp}</b></h2><p>Expires in 10 minutes.</p>`,
    };

    if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
      return res.status(500).json({ message: "Brevo not configured properly" });
    }

    await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      expiresAt,
      role: role || "admin",
      
    });

    return res.status(201).json({ message: "OTP sent. Verify to finish signup." });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
};

// ✅ Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });
    if (!user.expiresAt || user.expiresAt < new Date())
      return res.status(400).json({ msg: "OTP expired" });
    if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });

    user.otp = null;
    user.expiresAt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    return res.status(200).json({
      msg: "OTP verified, signup complete",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server error verifying OTP" });
  }
};


// ✅ Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & Password required" });

    const UserData = await User.findOne({ email });
    if (!UserData) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, UserData.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: UserData._id, role: UserData.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: UserData._id, name: UserData.name, email: UserData.email, role: UserData.role },
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

// ✅ Get All Users (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password -otp -expiresAt");
    console.log(users)
    return res.status(200).json({ success: true, data: users });

  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};


export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const UserData = await User.findOne({ email });
    if (!UserData) return res.status(400).json({ msg: "User not found" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const payload = {
      sender: { name: "YourCRM", email: process.env.SENDER_EMAIL },
      to: [{ email }],
      subject: "Your New OTP Code",
      htmlContent: `<h2>Your new OTP is: <b>${otp}</b></h2><p>Expires in 10 minutes.</p>`,
    };

    await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    UserData.otp = otp;
    UserData.expiresAt = expiresAt;
    await UserData.save();

    res.json({ message: "OTP Resent" });
  } catch (err) {
    res.status(500).json({ msg: "Error resending OTP" });
  }
};



export const toggleUserAccess = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.accessRevoked = !user.accessRevoked; 
    await user.save();

    res.json({
      message: user.accessRevoked ? "Access Revoked" : "Access Restored",
      accessRevoked: user.accessRevoked
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error toggling access" });
  }
};



export const userdata = async(req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user data" });
  }
}
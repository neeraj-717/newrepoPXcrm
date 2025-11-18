import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const verifytoken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: false, msg: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Skip plan expiry check for userdata endpoint
    if (req.path !== '/userdata') {
      // Check user plan expiry
      const user = await User.findById(decoded.id);
      if (user && user.planExpiryDate && new Date() > new Date(user.planExpiryDate)) {
        user.accessRevoked = true;
        await user.save();
        return res.status(403).json({ 
          status: false, 
          msg: "Your plan has expired. Please upgrade to continue.",
          planExpired: true 
        });
      }
      
      if (user && user.accessRevoked) {
        return res.status(403).json({ 
          status: false, 
          msg: "Access revoked. Contact support.",
          accessRevoked: true 
        });
      }
    }
    
    req.user = decoded; // add decoded token info to req
    next(); // allow request to proceed
  } catch (err) {
    return res.status(403).json({ status: false, msg: "Invalid or expired token." });
  }
};

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }
    
    // Check expiry
    if (user.expiryDate && new Date() > new Date(user.expiryDate)) {
      return res.status(403).json({ message: "Account expired. Contact admin." });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

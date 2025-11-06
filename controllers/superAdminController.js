import User from "../models/user.js";

// Get all users with status (SuperAdmin only)
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({ role: "Admin" })
      .select("name email status expiryDate isActive paymentStatus activePlan registrationDate")
      .sort({ registrationDate: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user expiry date (SuperAdmin only)
export const updateUserExpiry = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { userId, expiryDate } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { expiryDate: new Date(expiryDate) },
      { new: true }
    ).select("name email expiryDate");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle user active status (SuperAdmin only)
export const toggleUserStatus = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { userId } = req.params;
    
    const user = await User.findById(userId);
    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
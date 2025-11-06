import express from "express";
import { getAllUsers, updateUserExpiry, toggleUserStatus } from "../controllers/superAdminController.js";
import { protect } from "../Middleware/Middleware.js";

const router = express.Router();

router.get("/users", protect, getAllUsers);
router.put("/users/expiry", protect, updateUserExpiry);
router.put("/users/:userId/toggle", protect, toggleUserStatus);

export default router;
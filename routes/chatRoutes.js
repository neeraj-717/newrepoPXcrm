import express from "express";
import { sendMessage, getChat, getAllChats } from "../controllers/chatController.js";
import { verifyToken } from "../Middleware/Middleware.js";


const router = express.Router();

router.post("/send", verifyToken, sendMessage);
router.get("/user/:userId", verifyToken, getChat);
router.get("/all", getAllChats);

export default router;
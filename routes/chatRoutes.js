import express from "express";
import { sendMessage, getChat, getAllChats } from "../controllers/chatController.js";
import { verifytoken } from "../Middleware/Middleware.js";


const router = express.Router();

router.post("/send", verifytoken, sendMessage);
router.get("/user/:userId", verifytoken, getChat);
router.get("/all", getAllChats);

export default router;
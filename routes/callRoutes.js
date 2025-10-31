import express from "express";
import { createCall, deleteCall, getCalls } from "../controllers/callController.js";
import { verifyToken } from "../Middleware/Middleware.js";

const router = express.Router();

router.post("/", verifyToken, createCall);
router.get("/", verifyToken, getCalls);
router.delete("/:id", verifyToken, deleteCall);

export default router;

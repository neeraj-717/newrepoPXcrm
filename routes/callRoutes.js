import express from "express";
import { createCall, deleteCall, getCalls } from "../controllers/callController.js";
import { verifytoken } from "../Middleware/Middleware.js";

const router = express.Router();

router.post("/", verifytoken, createCall);
router.get("/", verifytoken, getCalls);
router.delete("/:id", verifytoken, deleteCall);

export default router;

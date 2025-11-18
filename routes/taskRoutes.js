import express from "express";
import { createTask, deleteTask, getTasks, updateTask, getCalendarData } from "../controllers/taskController.js";
import { verifytoken } from "../Middleware/Middleware.js";

const router = express.Router();

router.post("/", verifytoken, createTask);
router.get("/", verifytoken, getTasks);
router.get("/calendar", verifytoken, getCalendarData);
router.put("/:id", verifytoken, updateTask);
router.delete("/:id", verifytoken, deleteTask);

export default router;

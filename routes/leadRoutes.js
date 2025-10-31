import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "../controllers/leadController.js";
import { verifyToken } from "../Middleware/Middleware.js";

const router = express.Router();

router.route("/").post(verifyToken, createLead).get(verifyToken, getLeads);
router.route("/:id").get(verifyToken, getLeadById).put(verifyToken, updateLead).delete(verifyToken, deleteLead);

export default router;

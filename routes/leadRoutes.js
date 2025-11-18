import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "../controllers/leadController.js";
import { verifytoken } from "../Middleware/Middleware.js";

const router = express.Router();

router.route("/").post(verifytoken, createLead).get(verifytoken, getLeads);
router.route("/:id").get(verifytoken, getLeadById).put(verifytoken, updateLead).delete(verifytoken, deleteLead);

export default router;

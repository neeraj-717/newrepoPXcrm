import express from "express";
import { createDeal, getDeals, deleteDeal } from "../controllers/dealController.js";
import {  verifyToken } from "../Middleware/Middleware.js";
import Deal from "../models/desl.js";

const router = express.Router();

router.post("/", verifyToken, createDeal);
router.get("/", verifyToken, getDeals);
router.delete("/:id", verifyToken, deleteDeal);
// router.put("/:id", verifyToken, updateDeal);

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedDeal = await Deal.findByIdAndUpdate(
      req.params.id,
      { stage: req.body.stage },
      { new: true }
    );

    if (!updatedDeal)
      return res.status(404).json({ message: "Deal not found" });

    res.json(updatedDeal);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating deal" });
  }
});


export default router;

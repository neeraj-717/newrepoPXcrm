import express from "express";
import { createDeal, getDeals, deleteDeal } from "../controllers/dealController.js";
import {  verifytoken } from "../Middleware/Middleware.js";
import Deal from "../models/desl.js";

const router = express.Router();

router.post("/", verifytoken, createDeal);
router.get("/", verifytoken, getDeals);
router.delete("/:id", verifytoken, deleteDeal);
// router.put("/:id", verifytoken, updateDeal);

router.put("/:id", verifytoken, async (req, res) => {
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

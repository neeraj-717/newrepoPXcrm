import express from "express";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  makeCall,
  getTwiML,
  callStatusWebhook,
  getCallLogs
} from "../controllers/customerController.js";

const router = express.Router();

// Customer CRUD routes
router.get("/", getCustomers);
router.get("/:id", getCustomer);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

// Call routes
router.post("/call", makeCall);
router.get("/call/twiml", getTwiML);
router.post("/call/status", callStatusWebhook);
router.get("/call/logs/:customerId", getCallLogs);

export default router;
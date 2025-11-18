import express from 'express';
import * as leadManagerController from '../controllers/leadManagerController.js';
import { verifytoken as authMiddleware } from '../Middleware/Middleware.js';

const router = express.Router();

// Make call to lead
router.post('/make-call', authMiddleware, leadManagerController.makeCall);

// TwiML endpoint
router.post('/twiml', leadManagerController.getTwiML);

// Call status webhook
router.post('/call-status', leadManagerController.handleCallStatus);

// Get call history
router.get('/call-history', authMiddleware, leadManagerController.getCallHistory);

// Send SMS
router.post('/send-sms', authMiddleware, leadManagerController.sendSMS);

// Get SMS history
router.get('/sms-history', authMiddleware, leadManagerController.getSmsHistory);

// Dashboard data
router.get('/dashboard', authMiddleware, leadManagerController.getDashboardData);

export default router;
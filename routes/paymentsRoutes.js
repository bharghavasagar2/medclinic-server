const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentControllers.js');
const authController = require('../controllers/authController.js');
// GET all payments
router.get('/payments', authController.authenticateToken, paymentController.getAllPayments);

// GET a payment by ID
router.get('/payments/:id', authController.authenticateToken, paymentController.getPaymentById);

// POST create a new payment
router.post('/payments', authController.authenticateToken, paymentController.createPayment);

// PUT update a payment by ID
router.put('/payments/:id', authController.authenticateToken, paymentController.updatePayment);

// DELETE a payment by ID
router.delete('/payments/:id', authController.authenticateToken, paymentController.deletePayment);

module.exports = router;

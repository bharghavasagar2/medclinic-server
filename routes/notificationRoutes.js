const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController.js');
const authController = require('../controllers/authController.js');
// Get all appointments
router.get('/notifications', authController.authenticateToken, notificationController.getAllNotifications);

// Get an appointment by ID
router.get('/notifications/:user_id', authController.authenticateToken, notificationController.getNotificationById);

// Create a new appointment
router.post('/notifications', authController.authenticateToken, notificationController.createNotification);

// Update an appointment
router.put('/notifications/:id', authController.authenticateToken, notificationController.updateNotification);

// Delete an appointment
router.delete('/notifications/:id', authController.authenticateToken, notificationController.deleteNotification);

module.exports = router;

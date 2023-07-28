const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authController = require('../controllers/authController.js');
// Get all appointments
router.get('/appointments', authController.authenticateToken, appointmentController.getAllAppointments);

// Get an appointment by ID
router.get('/appointments/:id', authController.authenticateToken, appointmentController.getAppointmentById);

// Create a new appointment
router.post('/appointments', authController.authenticateToken, appointmentController.createAppointment);

// Update an appointment
router.put('/appointments/:id', authController.authenticateToken, appointmentController.updateAppointment);

// Delete an appointment
router.delete('/appointments/:id', authController.authenticateToken, appointmentController.deleteAppointment);

// Update an appointment
router.get('/api/getAllReports', authController.authenticateToken, appointmentController.getAllReports);

module.exports = router;

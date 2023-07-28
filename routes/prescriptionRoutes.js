const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController.js');
const authController = require('../controllers/authController.js');
// Get all prescriptions
router.get('/prescriptions', authController.authenticateToken, prescriptionController.getAllPrescriptions);

// Get a prescription by ID
router.get('/prescriptions/:id', authController.authenticateToken, prescriptionController.getPrescriptionById);

// Create a new prescription
router.post('/prescriptions', authController.authenticateToken, prescriptionController.createPrescription);

// Update a prescription
router.put('/prescriptions/:id', authController.authenticateToken, prescriptionController.updatePrescription);

//get by appoitnment id
router.get('/prescriptions/appointments/:appointment_id', authController.authenticateToken, prescriptionController.getPrescriptionByAppointmentById);

// Delete a prescription
router.delete('/prescriptions/:id', authController.authenticateToken, prescriptionController.deletePrescription);

module.exports = router;

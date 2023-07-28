const express = require('express');
const patientRouter = express.Router();
const patientController = require('../controllers/patientController');
const authController = require('../controllers/authController.js');
// Get all patients
patientRouter.get('/patients', authController.authenticateToken, patientController.getAllPatients);

// Get a patient by ID
patientRouter.get('/patients/:id', authController.authenticateToken, patientController.getPatientById);

// Create a new patient
patientRouter.post('/patients', authController.authenticateToken, patientController.createPatient);

// Update a patient
patientRouter.put('/patients/:id', authController.authenticateToken, patientController.updatePatient);

// Delete a patient
patientRouter.delete('/patients/:id', authController.authenticateToken, patientController.deletePatient);

patientRouter.get('/patients/appointmentDetails/:id', authController.authenticateToken, patientController.getPatientDetails);

module.exports = patientRouter;

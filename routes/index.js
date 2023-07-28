const express = require('express');
const router = express.Router();

const appointmentsRoutes = require('./appointmentRoutes.js');
const patientsRoutes = require('./patientRoutes.js');
const doctorsRoutes = require('./doctorRoutes.js');

const paymentRoutes = require('./paymentsRoutes.js');
const authRoutes = require('./authRoutes.js');
const prescriptionRoutes = require('./prescriptionRoutes.js');
const videoRoutes = require('./videoRoutes.js');



router.use('/appointments', appointmentsRoutes);
router.use('/patients', patientsRoutes);
router.use('/doctors', doctorsRoutes);
router.use('/login', authRoutes);
router.use('/video', videoRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;

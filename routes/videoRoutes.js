const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController.js');
const authController = require('../controllers/authController.js');
// GET all video consultations
router.get('/video', authController.authenticateToken, videoController.getAllVideoConsultations);

// GET a video consultation by ID
router.get('/video/:id', authController.authenticateToken, videoController.getVideoConsultationById);

// POST create a new video consultation
router.post('/video', authController.authenticateToken, videoController.createVideoConsultation);

// PUT update a video consultation by ID
router.put('/video/:id', authController.authenticateToken, videoController.updateVideoConsultation);

// DELETE a video consultation by ID
router.delete('/video/:id', authController.authenticateToken, videoController.deleteVideoConsultation);

router.get('/video/doctor/:doctor_id', authController.authenticateToken, videoController.getVideoConsultaionsByDoctorId);
router.get('/video/patient/:patient_id', authController.authenticateToken, videoController.getVideoConsultaionsByPatientId);

module.exports = router;

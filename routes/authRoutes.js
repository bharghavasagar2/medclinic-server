const express = require('express');
const authController = require('../controllers/authController.js');

const router = express.Router();

// Public route for user login
router.post('/login', authController.login);
router.post('/logout', authController.authenticateToken, authController.logout);
module.exports = router;

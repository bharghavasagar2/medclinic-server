const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/medclinic', require('../server/routes/patientRoutes.js'));
app.use('/medclinic', require('../server/routes/appointmentRoutes.js'));
app.use('/medclinic', require('../server/routes/authRoutes.js'));
app.use('/medclinic', require('../server/routes/doctorRoutes.js'));
app.use('/medclinic', require('../server/routes/videoRoutes.js'));
app.use('/medclinic', require('../server/routes/prescriptionRoutes.js'));
app.use('/medclinic', require('../server/routes/paymentsRoutes.js'));
app.use('/medclinic', require('../server/routes/notificationRoutes.js'));

// Route for root URL
app.get('/', (req, res) => {
  res.send('Welcome to the MedClinic backend API!');
});

// Export the Express app for use as a serverless function
module.exports = app;

const db = require('../db/db.js');
const _ = require('lodash');
const { VIDEO_CONSULTATION_STATUS } = require('../config.js')

exports.getVideoConsultaionsByDoctorId = (req, res) => {
  const doctor_id = req.params.doctor_id;
  const query = 'SELECT * FROM VideoConsultations WHERE doctor_id = ?';
  db.all(query, [doctor_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving doctors from the database' });
    } else {
      res.json(rows);
    }
  });
};

exports.getVideoConsultaionsByPatientId = (req, res) => {
  const patient_id = req.params.patient_id;
  const query = 'SELECT * FROM VideoConsultations WHERE patient_id = ?';
  db.all(query, [patient_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving doctors from the database' });
    } else {
      res.json(rows);
    }
  });
};


// Get all video consultations
exports.getAllVideoConsultations = (req, res) => {
  const sql = 'SELECT * FROM VideoConsultations';
  db.all(sql, (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to retrieve video consultations' });
    } else {
      res.json(rows);
    }
  });
};

// Get a video consultation by ID
exports.getVideoConsultationById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM VideoConsultations WHERE consultation_id = ?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to retrieve video consultation' });
    } else if (!row) {
      res.status(404).json({ error: 'Video consultation not found' });
    } else {
      res.json(row);
    }
  });
};

// Create a new video consultation
exports.createVideoConsultation = (req) => {
  try {
    const fetchMeetingLink = generateJitsiMeetLink();
    const {
      patient_id,
      doctor_id,
      patient_name,
      doctor_name,
      appointment_id,
      appointment_date,
      // consultation_status,
      appointment_time
    } = req;

    const sql = `INSERT INTO VideoConsultations (
      patient_id,
      doctor_id,
      patient_name,
      doctor_name,
      video_consultation_link,
      appointment_id,
      appointment_date,
      consultation_status,
      appointment_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      patient_id,
      doctor_id,
      patient_name,
      doctor_name,
      fetchMeetingLink,
      appointment_id,
      appointment_date,
      VIDEO_CONSULTATION_STATUS.PENDING_VIDEO_CONSULTATION,
      appointment_time
    ];

    return new Promise((resolve, reject) => {
      db.run(sql, values, function (err) {
        if (err) {
          console.error(err.message);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } catch (e) {
    console.log(e);
    return false;
  }
};


// Update a video consultation by ID
exports.updateVideoConsultation = (req, res) => {
  const { id } = req.params;
  const {
    patient_id,
    doctor_id,
    patient_name,
    doctor_name,
    video_consultation_link,
    appointment_id,
    appointment_date,
    appointment_time,
    consultation_status,
  } = req.body;//      appointment_time

  const sql = `UPDATE VideoConsultations SET
  patient_id = ?,
  doctor_id = ?,
  patient_name = ?,
  doctor_name = ?,
  video_consultation_link = ?,
  appointment_id = ?,
  appointment_date = ?,
  consultation_status = ?,
  appointment_time = ?
  WHERE consultation_id = ?`;


  const values = [
    patient_id,
    doctor_id,
    patient_name,
    doctor_name,
    video_consultation_link,
    appointment_id,
    appointment_date,
    consultation_status,
    appointment_time,
    id,
  ];

  db.run(sql, values, function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to update video consultation' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Video consultation not found' });
    } else {
      res.json({ message: 'Video consultation updated' });
    }
  });
};

// Delete a video consultation by ID
exports.deleteVideoConsultation = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM VideoConsultations WHERE consultation_id = ?';
  db.run(sql, [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to delete video consultation' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Video consultation not found' });
    } else {
      res.json({ message: 'Video consultation deleted' });
    }
  });
};



const generateJitsiMeetLink = () => {
  const jitsiMeetUrl = 'https://meet.jit.si'; // Change this if you have your own Jitsi Meet server

  // Generate a random room name or use a unique identifier for each meeting
  const roomName = generateRandomRoomName();

  // Construct the meeting link
  const meetingLink = `${jitsiMeetUrl}/${roomName}`;

  return meetingLink;
};

// Function to generate a random room name
const generateRandomRoomName = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let roomName = 'MedClinic';
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomName += characters.charAt(randomIndex);
  }
  return roomName;
};

// Example usage



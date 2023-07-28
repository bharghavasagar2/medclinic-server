const db = require('../db/db.js');

// Get all prescriptions
exports.getAllPrescriptions = (req, res) => {
  const query = 'SELECT * FROM Prescriptions';
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving prescriptions from the database' });
    } else {
      res.json(rows);
    }
  });
};

// Get a prescription by ID
exports.getPrescriptionById = (req, res) => {
  const prescriptionId = req.params.id;
  const query = 'SELECT * FROM Prescriptions WHERE prescription_id = ?';
  db.get(query, [prescriptionId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving prescription from the database' });
    } else if (!row) {
      res.status(404).json({ error: 'Prescription not found' });
    } else {
      res.json(row);
    }
  });
};

// Create a new prescription
exports.createPrescription = (req, res) => {
  const { patient_id, doctor_id, prescription_date, prescription_details, dosage, appointment_id } = req.body;
  const query = 'INSERT INTO Prescriptions (patient_id, doctor_id, prescription_date, prescription_details, dosage, appointment_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(query, [patient_id, doctor_id, prescription_date, prescription_details, dosage, appointment_id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Error creating prescription' });
    } else {
      res.json({ id: this.lastID });
    }
  });
};

// Update a prescription
exports.updatePrescription = (req, res) => {
  const prescriptionId = req.params.id;
  const { patient_id, doctor_id, prescription_date, prescription_details, dosage, appointment_id } = req.body;
  const query = 'UPDATE Prescriptions SET patient_id = ?, doctor_id = ?, prescription_date = ?, prescription_details = ?, dosage = ?, appointment_id = ? WHERE prescription_id = ?';
  db.run(query, [patient_id, doctor_id, prescription_date, prescription_details, dosage, appointment_id, prescriptionId], function (err) {
    if (err) {
      res.status(500).json({ error: 'Error updating prescription' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Prescription not found' });
    } else {
      res.sendStatus(200);
    }
  });
};

// Delete a prescription
exports.deletePrescription = (req, res) => {
  const prescriptionId = req.params.id;
  const query = 'DELETE FROM Prescriptions WHERE prescription_id = ?';
  db.run(query, [prescriptionId], (err) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting prescription' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Prescription not found' });
    } else {
      res.json({ message: 'Prescription deleted successfully' });
    }
  });
};


exports.getPrescriptionByAppointmentById = (req, res) => {
  const appointment_id = req.params.appointment_id;
  const query = 'SELECT * FROM Prescriptions WHERE appointment_id = ?';
  db.get(query, [appointment_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving prescription from the database' });
    } else if (!row) {
      res.json({});
    } else {
      res.json(row);
    }
  });
};
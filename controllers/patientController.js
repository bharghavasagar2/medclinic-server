const db = require('../db/db.js');

// Get all patients
exports.getAllPatients = (req, res) => {
  const query = 'SELECT * FROM patients';
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving patients from the database' });
    } else {
      res.json(rows);
    }
  });
};

// Get a patient by ID
exports.getPatientById = (req, res) => {
  const patientId = req.params.id;
  const query = 'SELECT * FROM patients WHERE patient_id = ?';
  db.get(query, [patientId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving patient from the database' });
    } else if (!row) {
      res.status(404).json({ error: 'Patient not found' });
    } else {
      res.json(row);
    }
  });
};

// Create a new patient
exports.createPatient = (req, res) => {
  console.log('hi')
  const { patient_name, patient_age, patient_gender, contact_number, address, user_id } = req.body;
  const query = 'INSERT INTO patients (patient_name, patient_age, patient_gender, contact_number, address, user_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(query, [patient_name, patient_age, patient_gender, contact_number, address, user_id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Error creating patient' });
    } else {
      res.json({ id: this.lastID });
    }
  });
};

// Update a patient
exports.updatePatient = (req, res) => {
  const patientId = req.params.id;
  const { patient_name, patient_age, patient_gender, contact_number, address } = req.body;
  const query = 'UPDATE patients SET patient_name = ?, patient_age = ?, patient_gender = ?, contact_number = ?, address = ? WHERE patient_id = ?';
  db.run(query, [patient_name, patient_age, patient_gender, contact_number, address, patientId], (err) => {
    if (err) {
      res.status(500).json({ error: 'Error updating patient' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Patient not found' });
    } else {
      res.sendStatus(200);
    }
  });
};

// Delete a patient
exports.deletePatient = (req, res) => {
  const patientId = req.params.id;
  const query = 'DELETE FROM patients WHERE patient_id = ?';
  db.run(query, [patientId], (err) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting patient' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Patient not found' });
    } else {
      res.json({ message: 'Patient deleted successfully' });
    }
  });
};


exports.getPatientDetails = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT
      p.patient_id,
      p.patient_name,
      p.patient_age,
      p.patient_gender,
      p.contact_number AS patient_contact_number,
      p.address AS patient_address,
      a.appointment_id,
      a.appointment_date,
      a.appointment_time,
      a.appointment_type,
      a.appointment_status,
      d.doctor_id,
      d.doctor_name,
      d.department_id,
      d.contact_number AS doctor_contact_number,
      d.email AS doctor_email,
      d.department_name
    FROM Patients AS p
    LEFT JOIN Appointments AS a ON p.patient_id = a.patient_id
    LEFT JOIN Doctors AS d ON a.doctor_id = d.doctor_id
    WHERE p.patient_id = ?;
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Error retrieving patient details from the database' });
    } else {
      const patientDetails = {
        patient: {},
        appointments: [],
      };

      if (rows.length > 0) {
        patientDetails.patient = {
          patient_id: rows[0].patient_id,
          patient_name: rows[0].patient_name,
          patient_age: rows[0].patient_age,
          patient_gender: rows[0].patient_gender,
          patient_contact_number: rows[0].patient_contact_number,
          patient_address: rows[0].patient_address,
        };

        rows.forEach((row) => {
          if (row.appointment_id) {
            const appointment = {
              appointment_id: row.appointment_id,
              appointment_date: row.appointment_date,
              appointment_time: row.appointment_time,
              appointment_type: row.appointment_type,
              appointment_status: row.appointment_status,
              doctor: {
                doctor_id: row.doctor_id,
                doctor_name: row.doctor_name,
                department_id: row.department_id,
                doctor_contact_number: row.doctor_contact_number,
                doctor_email: row.doctor_email,
                department_name: row.department_name,
              },
            };
            patientDetails.appointments.push(appointment);
          }
        });
      }

      res.json(patientDetails);
    }
  });
};

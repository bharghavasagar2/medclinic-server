const db = require('../db/db.js');

// Get all doctors
exports.getAllDoctors = (req, res) => {
  const query = 'SELECT * FROM Doctors';
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving doctors from the database' });
    } else {
      res.json(rows);
    }
  });
};

// Get a doctor by ID
exports.getDoctorById = (req, res) => {
  const doctorId = req.params.id;
  const query = 'SELECT * FROM Doctors WHERE doctor_id = ?';
  db.get(query, [doctorId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving doctor from the database' });
    } else if (!row) {
      res.status(404).json({ error: 'Doctor not found' });
    } else {
      res.json(row);
    }
  });
};

// Create a new doctor
exports.createDoctor = (req, res) => {
  const { doctor_name, department_id, contact_number, email, user_id } = req.body;
  const query = 'INSERT INTO Doctors (doctor_id, doctor_name, department_id, contact_number, email, user_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(query, [user_id, doctor_name, department_id, contact_number, email, user_id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Error creating doctor' });
    } else {
      res.json({ id: this.lastID });
    }
  });
};

// Update a doctor
exports.updateDoctor = (req, res) => {
  const doctorId = req.params.id;
  const { doctor_name, department_id, contact_number, email } = req.body;
  const query = 'UPDATE Doctors SET doctor_name = ?, department_id = ?, contact_number = ?, email = ? WHERE doctor_id = ?';
  db.run(query, [doctor_name, department_id, contact_number, email, doctorId], (err) => {
    if (err) {
      res.status(500).json({ error: 'Error updating doctor' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Doctor not found' });
    } else {
      res.sendStatus(200);
    }
  });
};

// Delete a doctor
exports.deleteDoctor = (req, res) => {
  const doctorId = req.params.id;
  const query = 'DELETE FROM Doctors WHERE doctor_id = ?';
  db.run(query, [doctorId], (err) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting doctor' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Doctor not found' });
    } else {
      res.json({ message: 'Doctor deleted successfully' });
    }
  });
};

exports.getDoctorsByDepartment = (req, res) => {
  const departmentId = req.params.department_id;
  const query = 'SELECT * FROM Doctors WHERE department_id = ?';
  db.all(query, [departmentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving doctors from the database' });
    } else {
      res.json(rows);
    }
  });
};

exports.getDoctorDetails = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT
      d.doctor_id,
      d.doctor_name,
      d.department_id,
      d.contact_number AS doctor_contact_number,
      d.email AS doctor_email,
      d.department_name,
      json_group_array(
        json_object(
          'appointment_id', a.appointment_id,
          'appointment_date', a.appointment_date,
          'appointment_time', a.appointment_time,
          'appointment_type', a.appointment_type,
          'appointment_status', a.appointment_status,
          'patient_details', 
          CASE WHEN p.patient_id IS NOT NULL THEN 
            json_object(
              'patient_id', p.patient_id,
              'patient_name', p.patient_name,
              'patient_age', p.patient_age,
              'patient_gender', p.patient_gender,
              'contact_number', p.contact_number,
              'address', p.address
            )
          ELSE
            json('[]')
          END
        )
      ) AS appointments
    FROM Doctors AS d
    LEFT JOIN Appointments AS a ON d.doctor_id = a.doctor_id
    LEFT JOIN Patients AS p ON a.patient_id = p.patient_id
    WHERE d.doctor_id = ?
    GROUP BY d.doctor_id;
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Error retrieving doctor details from the database' });
    } else {
      const doctorDetails = {
        doctor: {},
        patients: [],
      };

      if (rows.length > 0) {
        doctorDetails.doctor = {
          doctor_id: rows[0].doctor_id,
          doctor_name: rows[0].doctor_name,
          department_id: rows[0].department_id,
          doctor_contact_number: rows[0].doctor_contact_number,
          doctor_email: rows[0].doctor_email,
          department_name: rows[0].department_name,
        };

        rows[0].appointments = JSON.parse(rows[0].appointments);
        rows[0].appointments.forEach((appointment) => {
          if (!doctorDetails.patients.some((p) => p.patient_id === appointment.patient_details.patient_id)) {
            const patient = {
              patient_id: appointment.patient_details.patient_id,
              patient_name: appointment.patient_details.patient_name,
              patient_age: appointment.patient_details.patient_age,
              patient_gender: appointment.patient_details.patient_gender,
              patient_contact_number: appointment.patient_details.contact_number,
              patient_address: appointment.patient_details.address,
              appointments: [],
            };
            doctorDetails.patients.push(patient);
          }

          const patientIndex = doctorDetails.patients.findIndex(
            (p) => p.patient_id === appointment.patient_details.patient_id
          );

          const appointmentDetails = {
            appointment_id: appointment.appointment_id,
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            appointment_type: appointment.appointment_type,
            appointment_status: appointment.appointment_status,
          };
          doctorDetails.patients[patientIndex].appointments.push(appointmentDetails);
        });
      }
      res.json(doctorDetails);
    }
  });
};

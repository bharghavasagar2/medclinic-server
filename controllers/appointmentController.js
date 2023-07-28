const { APPOINTMENT_STATUS, appointmentTypeWalkIn, appointmentTypeOnline } = require('../config.js');
const db = require('../db/db.js');
const _ = require('lodash');


const { createVideoConsultation } = require('./videoController.js');

// Get all appointments
exports.getAllAppointments = (req, res) => {
  const query = 'SELECT * FROM Appointments';
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving appointments from the database' });
    } else {
      res.json(rows);
    }
  });
};

// Get an appointment by ID
exports.getAppointmentById = (req, res) => {
  const appointmentId = req.params.id;
  const query = 'SELECT * FROM Appointments WHERE appointment_id = ?';
  db.get(query, [appointmentId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving appointment from the database' });
    } else if (!row) {
      res.status(404).json({ error: 'Appointment not found' });
    } else {
      res.json(row);
    }
  });
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, appointment_status, department_id, appointment_type } = req.body;
  const query = 'INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_status, department_id, appointment_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.run(query, [patient_id, doctor_id, appointment_date, appointment_time, appointment_status, department_id, appointment_type], function (err) {
    if (err) {
      console.log(err)
      res.status(500).json({ error: 'Error creating appointment' });
    } else {
      res.json({ id: this.lastID });
    }
  });
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  const { patient_id, doctor_id, appointment_date, appointment_time, appointment_status, department_id, appointment_type } = req.body;

  try {
    const previousAppointment = await appointmentCheck(appointmentId);
    const isCreateVideoLink = appointment_status === APPOINTMENT_STATUS.APPROVED && appointmentTypeOnline === appointment_type && previousAppointment.appointment_status !== APPOINTMENT_STATUS.APPROVED;

    const query = 'UPDATE Appointments SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?, appointment_status = ?, department_id = ?, appointment_type = ? WHERE appointment_id = ?';
    const params = [patient_id, doctor_id, appointment_date, appointment_time, appointment_status, department_id, appointment_type, appointmentId];

    db.run(query, params, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating appointment' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Appointment not found' });
      } else {
        if (isCreateVideoLink) {
          const isSuccess = createVideoConsultation(req.body, res);
          res.sendStatus(isSuccess ? 200 : 500);
        } else {
          res.sendStatus(200);
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating appointment' });
  }
};

// Delete an appointment
exports.deleteAppointment = (req, res) => {
  const appointmentId = req.params.id;
  const query = 'DELETE FROM Appointments WHERE appointment_id = ?';
  db.run(query, [appointmentId], (err) => {
    if (err) {
      console.log(err)
      res.status(500).json({ error: 'Error deleting appointment' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Appointment not found' });
    } else {
      res.json({ message: 'Appointment deleted successfully' });
    }
  });
};



const appointmentCheck = (id, res) => {
  const appointmentId = id;
  const query = 'SELECT * FROM Appointments WHERE appointment_id = ?';

  return new Promise((resolve, reject) => {
    db.get(query, [appointmentId], (err, row) => {
      if (err) {
        reject({ error: 'Error retrieving appointment from the database' });
      } else if (!row) {
        reject({ error: 'Appointment not found' });
      } else {
        resolve(row);
      }
    });
  });


};




// API endpoint to fetch all reports
exports.getAllReports = (req, res) => {
  const query1 = `
  SELECT 
  CASE 
      WHEN substr(appointment_date, 4, 2) = '01' THEN 'Jan'
      WHEN substr(appointment_date, 4, 2) = '02' THEN 'Feb'
      WHEN substr(appointment_date, 4, 2) = '03' THEN 'Mar'
      WHEN substr(appointment_date, 4, 2) = '04' THEN 'Apr'
      WHEN substr(appointment_date, 4, 2) = '05' THEN 'May'
      WHEN substr(appointment_date, 4, 2) = '06' THEN 'Jun'
      WHEN substr(appointment_date, 4, 2) = '07' THEN 'Jul'
      WHEN substr(appointment_date, 4, 2) = '08' THEN 'Aug'
      WHEN substr(appointment_date, 4, 2) = '09' THEN 'Sep'
      WHEN substr(appointment_date, 4, 2) = '10' THEN 'Oct'
      WHEN substr(appointment_date, 4, 2) = '11' THEN 'Nov'
      WHEN substr(appointment_date, 4, 2) = '12' THEN 'Dec'
  END as month,
  SUM(payment_amount) as revenue
FROM 
  Appointments
JOIN Payments ON Appointments.appointment_id = Payments.appointment_id
WHERE 
  appointment_status = 'Scheduled'
GROUP BY 
  month
ORDER BY 
  appointment_date;
  `;

  const query2 = `
    SELECT 
        Departments.department_name as label,
        COUNT(*) as appointments
    FROM 
        Appointments
    JOIN Departments ON Appointments.department_id = Departments.department_id
    WHERE 
        Appointments.appointment_status = 'Scheduled'
    GROUP BY 
        Departments.department_name;
  `;

  const query3 = `
    SELECT 
        Doctors.doctor_name as doctor,
        COUNT(*) as appointments
    FROM 
        Appointments
    JOIN Doctors ON Appointments.doctor_id = Doctors.doctor_id
    WHERE 
        Appointments.appointment_status = 'Scheduled'
    GROUP BY 
        Doctors.doctor_name;
  `;

  const query4 = `
    SELECT 
        CASE
            WHEN patient_age < 18 THEN 'Children'
            WHEN patient_age >= 18 AND patient_age <= 65 THEN 'Adults'
            WHEN patient_age > 65 THEN 'Seniors'
            ELSE 'Unknown'
        END AS age_group,
        COUNT(*) AS appointments
    FROM 
        Appointments
    JOIN Patients ON Appointments.patient_id = Patients.patient_id
    WHERE 
        Appointments.appointment_status = 'Scheduled'
    GROUP BY 
        age_group;
  `;

  const queries = [query1, query2, query3, query4];

  // Execute all queries in parallel
  Promise.all(queries.map(query => executeQuery(query)))
    .then(results => {
      const [revenueData, departmentsData, doctorsData, ageGroupData] = results;
      const response = {
        revenue: revenueData,
        departments: departmentsData,
        doctors: doctorsData,
        ageGroup: ageGroupData
      };
      res.json(response);
    })
    .catch(error => {
      console.error(error.message);
      res.status(500).json({ error: 'Error fetching reports' });
    });
};

// Helper function to execute a single SQL query and return the result
const executeQuery = (query) => {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

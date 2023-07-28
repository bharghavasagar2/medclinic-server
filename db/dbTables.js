const { createTriggers } = require("./triggers");

const createDBTables = (db) => {
  // Table creation queries
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS Appointments (
      appointment_id INTEGER PRIMARY KEY,
      patient_id INTEGER,
      department_id INTEGER,
      doctor_id INTEGER,
      department_name TEXT,
      doctor_name TEXT,
      patient_name TEXT,
      appointment_date TEXT,
      appointment_time TEXT,
      appointment_type TEXT,
      appointment_status TEXT,     
      FOREIGN KEY (department_id) REFERENCES Departments(department_id),
      FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
      FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
    )`,
    `CREATE TABLE IF NOT EXISTS Patients (
      patient_id INTEGER PRIMARY KEY,
      patient_name TEXT,
      patient_age INTEGER,
      patient_gender TEXT,
      contact_number TEXT,
      address TEXT,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES AuthenticationUsers(user_id)
    )`,
    `CREATE TABLE IF NOT EXISTS Doctors (
      doctor_id INTEGER PRIMARY KEY,
      doctor_name TEXT,
      department_id INTEGER,
      contact_number TEXT,
      email TEXT,
      department_name TEXT,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES AuthenticationUsers(user_id),
      FOREIGN KEY (department_id) REFERENCES Departments(department_id)
    )`,
    `CREATE TABLE IF NOT EXISTS Notifications (
      notification_id INTEGER PRIMARY KEY,
      user_id INTEGER,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      viewed BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES Users(user_id)
    )`,
    `CREATE TABLE IF NOT EXISTS Prescriptions (
      prescription_id INTEGER PRIMARY KEY,
      patient_id INTEGER,
      appointment_id INTEGER,
      doctor_id INTEGER,
      prescription_date TEXT,
      prescription_details TEXT,    
      dosage TEXT,  
      FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id),
      FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
      FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
    )`,
    `CREATE TABLE IF NOT EXISTS Payments (
      payment_id INTEGER PRIMARY KEY,
      patient_id INTEGER,
      appointment_id INTEGER,
      card_number	TEXT,
      payment_date TEXT,
      payment_amount REAL,
      payment_status TEXT,       
      FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
      FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id)
    )`,
    `CREATE TABLE IF NOT EXISTS VideoConsultations (
      consultation_id INTEGER PRIMARY KEY,
      patient_id INTEGER,
      appointment_id INTEGER,
      patient_name TEXT,
      appointment_time	TEXT,
      doctor_name TEXT,
      doctor_id INTEGER,
      video_consultation_link TEXT,
      appointment_date TEXT,
      consultation_status TEXT,       
      FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
      FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
      FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id)
    )`,
    `CREATE TABLE IF NOT EXISTS AuthenticationUsers (
      user_id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS Departments (
      department_id INTEGER PRIMARY KEY,
      department_name TEXT
    )`
  ];

  // Execute table creation queries
  tableQueries.forEach((query) => {
    db.run(query, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  });

  // Populate Departments table if it's empty
  db.get("SELECT COUNT(*) AS count FROM Departments", (err, row) => {
    if (err) {
      console.error(err.message);
    } else {
      const count = row.count;
      if (count === 0) {
        const departments = ['Cardiology', 'Dermatology', 'Gastroenterology', 'Neurology', 'Orthopedics', 'General physician'];
        const insertQuery = "INSERT INTO Departments (department_name) VALUES (?)";
        departments.forEach((department) => {
          db.run(insertQuery, [department], (err) => {
            if (err) {
              console.error(err.message);
            } else {
              console.log(`Inserted department: ${department}`);
            }
          });
        });
      }
    }
  });

  // Create triggers
  createTriggers(db);
};

module.exports = { createDBTables };

const deleteTableActivityLog = (db) => {

  db.run(`
CREATE TRIGGER IF NOT EXISTS delete_associated_payment
AFTER DELETE ON Appointments
FOR EACH ROW
BEGIN
  DELETE FROM Payments
  WHERE appointment_id = OLD.appointment_id;
END;
`);

  // Trigger to move deleted appointments to a separate table and update appointment status
  db.run(`
CREATE TRIGGER IF NOT EXISTS move_deleted_appointments
AFTER DELETE ON Appointments
FOR EACH ROW
BEGIN
  INSERT INTO DeletedAppointments (appointment_id, patient_id, department_id, doctor_id, department_name, doctor_name, patient_name, appointment_date, appointment_time, appointment_type, appointment_status)
  SELECT appointment_id, patient_id, department_id, doctor_id, department_name, doctor_name, patient_name, appointment_date, appointment_time, appointment_type, 'Cancelled by Patient'
  FROM Appointments
  WHERE appointment_id = OLD.appointment_id;
END;
`);

  // Create DeletedAppointments table if not already present
  db.run(`
CREATE TABLE IF NOT EXISTS DeletedAppointments (
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
  appointment_status TEXT
);
`);

  // Trigger to move deleted payments to a separate table and update payment status
  db.run(`
CREATE TRIGGER IF NOT EXISTS move_deleted_payments
AFTER DELETE ON Payments
FOR EACH ROW
BEGIN
  INSERT INTO DeletedPayments (payment_id, patient_id, appointment_id, card_number, payment_date, payment_amount, payment_status)
  SELECT payment_id, patient_id, appointment_id, card_number, payment_date, payment_amount, 'Cancelled'
  FROM Payments
  WHERE appointment_id = OLD.appointment_id;
END;
`);

  // Create DeletedPayments table if not already present
  db.run(`
CREATE TABLE IF NOT EXISTS DeletedPayments (
  payment_id INTEGER PRIMARY KEY,
  patient_id INTEGER,
  appointment_id INTEGER,
  card_number TEXT,
  payment_date TEXT,
  payment_amount REAL,
  payment_status TEXT
);
`);

}

module.exports = {
  deleteTableActivityLog
}

const db = require('../db/db.js');

// Get all payments
exports.getAllPayments = (req, res) => {
  const sql = 'SELECT * FROM Payments';
  db.all(sql, (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to retrieve payments' });
    } else {
      res.json(rows);
    }
  });
};

// Get a payments by ID
exports.getPaymentById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM Payments WHERE payment_id = ?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to retrieve payments' });
    } else if (!row) {
      res.status(404).json({ error: 'Payment not found' });
    } else {
      res.json(row);
    }
  });
};

// Create a new payments
exports.createPayment = (req, res) => {
  const { patient_id, appointment_id, payment_date, payment_amount, payment_status, card_number } = req.body;
  const sql = 'INSERT INTO Payments (patient_id, appointment_id, payment_date, payment_amount, payment_status, card_number) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [patient_id, appointment_id, payment_date, payment_amount, payment_status, card_number], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to create payments' });
    } else {
      res.status(201).json({ id: this.lastID });
    }
  });
};

// Update a payments by ID
exports.updatePayment = (req, res) => {
  const { id } = req.params;
  const { patient_id, appointment_id, payment_date, payment_amount, payment_status, card_number } = req.body;
  const sql = 'UPDATE Payments SET patient_id = ?, appointment_id = ?, payment_date = ?, payment_amount = ?, payment_status = ?, card_number = ? WHERE payment_id = ?';
  db.run(sql, [patient_id, appointment_id, payment_date, payment_amount, payment_status, card_number, id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to update payments' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Payment not found' });
    } else {
      res.json({ message: 'Payment updated' });
    }
  });
};

// Delete a payments by ID
exports.deletePayment = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Payments WHERE payment_id = ?';
  db.run(sql, [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to delete payments' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Payment not found' });
    } else {
      res.json({ message: 'Payment deleted' });
    }
  });
};

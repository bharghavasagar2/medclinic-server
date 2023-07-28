const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db/db.js');
const { createDoctor } = require('./doctorController');

// Controller function to authenticate user and generate JWT token
const axios = require('axios');

const login = async (req, res) => {

  try {
    const { username, password, role, isSignUp, isWalkinPatient } = req.body;

    // Perform user authentication logic
    let user = await getUserByUsername(username);

    if ((!user || user.password !== password) && !isSignUp) {
      // Invalid credentials
      return res.status(401).json({ error: 'Invalid credentials' });
    } else if (!isSignUp && user?.role !== role) {
      return res.status(401).json({ error: 'Error: Invalid User Access' });
    }

    const token = !(!!isWalkinPatient) ? jwt.sign({ username }, config.jwtSecret, { expiresIn: '1h' }) : null;

    if (role === 'patient' && !!isSignUp) {
      await createUser({ username, password, role });
      user = await getUserByUsername(username);
      let isError = await createPatient({ ...req.body, user_id: user?.user_id }, res);
      if (!!isError) {
        return res.status(401).json({ error: 'Error Signing Up' });
      }
    }

    if (role === 'doctor' && !!isSignUp) {
      await createUser({ username, password, role });
      user = await getUserByUsername(username);
      createDoctor({ body: { ...req.body, user_id: user?.user_id } }, res);
      return;

    }

    res.json({ token, role: user.role, userId: user?.user_id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Middleware function to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Controller function to handle user logout
const logout = (req, res) => {
  // In a stateless JWT authentication setup, the client-side is responsible for managing the token.
  // To "logout" a user, the client-side can simply discard or delete the token.
  // There is no need to perform any server-side action.

  res.sendStatus(200);
};

// Function to get a user by their username from database
const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    // Query the database for the user with the given username
    db.get(
      'SELECT * FROM AuthenticationUsers WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

const createUser = (user) => {
  return new Promise((resolve, reject) => {
    // Insert the user into the AuthenticationUsers table
    db.run(
      'INSERT INTO AuthenticationUsers (username, password, role) VALUES (?, ?, ?)',
      [user.username, user.password, user.role],
      function (err) {
        if (err) {
          reject(err);
        } else {
          // Return the user ID of the newly created user
          resolve(this.lastID);
        }
      }
    );
  });
};

const updateUser = (user) => {
  return new Promise((resolve, reject) => {
    // Update the user in the AuthenticationUsers table
    db.run(
      'UPDATE AuthenticationUsers SET username = ?, password = ?, role = ? WHERE user_id = ?',
      [user.username, user.password, user.role, user.user_id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          // Return the number of rows affected by the update
          resolve(this.changes);
        }
      }
    );
  });
};

const createPatient = async (reqBody, res) => {
  const { patient_name, patient_age, patient_gender, contact_number, address, user_id } = reqBody;
  const query = 'INSERT INTO patients (patient_id, patient_name, patient_age, patient_gender, contact_number, address, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [user_id, patient_name, patient_age, patient_gender, contact_number, address, user_id];

  try {
    await new Promise((resolve, reject) => {
      db.run(query, values, function (err) {
        if (err) {
          console.error(err.message);
          reject(false);
        } else {
          resolve(true);
        }
      });
    });

    return false;

  } catch (error) {
    console.error(error);
    return true;
  }
};


module.exports = {
  login,
  authenticateToken, logout,
};

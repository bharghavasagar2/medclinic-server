const { createDBTables } = require('./dbTables');

const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database
const db = new sqlite3.Database('./db/medclinicDB.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  // Create the tables if they are empty
  createDBTables(db)
});


module.exports = db;

// const mysql = require("mysql2");
require('dotenv').config();

const mysql = require('mysql2');
const SocksConnection = require('socksjs');



const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  connectTimeout: 30000,
});


connection.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database!');
    connection.release(); // Release the connection back to the connection
  }
});


connection.on('acquire', function (connection) {
  console.log('Connection %d acquired', connection.threadId);
});

connection.on('release', function (connection) {
  console.log('Connection %d released', connection.threadId);
});


module.exports = connection;
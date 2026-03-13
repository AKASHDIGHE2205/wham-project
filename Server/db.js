// import mysql from "mysql";
// import dotenv from "dotenv";

// dotenv.config();

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 3306,
//   connectionLimit: 10,
//   connectTimeout: 20000,
//   dateStrings: true
// });

// // Test the connection
// db.getConnection((err, connection) => {
//   if (err) {
//     console.error("❌ Database connection failed:", err.code);
//   } else {
//     console.log("✅ Connected to MySQL database");
//     connection.release();
//   }
// });

// export default db;

import dotenv from "dotenv";
import mysql from "mysql";
import util from "util";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  connectTimeout: 20000,
  dateStrings: true
});

// Promisify pool.query
pool.query = util.promisify(pool.query);

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.code);
  } else {
    console.log("✅ Connected to MySQL database");
    connection.release();
  }
});

export default pool;
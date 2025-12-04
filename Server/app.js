// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import authRoutes from './routes/authRoutes.js';
// import calenderRoutes from './routes/calenderRoutes.js';
// import masterRoutes from './routes/masterRoutes.js';
// import DashboardRoutes from './routes/DashboardRoutes.js';
// import ReportRoutes from './routes/reportRoutes.js';
// import fs from 'fs';
// import https from "https";
// import http from "http";
// import path from "path";

// dotenv.config();
// const app = express();
// app.use('/uploads', express.static('uploads'));


// // PORTS
// const HTTPS_PORT = process.env.HTTPS_PORT || 5172;
// const HTTP_PORT = process.env.HTTP_PORT || 80;

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // CORS Headers
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// // Test route
// app.get('/api/test', (req, res) => {
//   res.send('HTTPS working!');
// });

// // Load SSL certificate files (use absolute paths for reliability)
// const sslOptions = {
//   key: fs.readFileSync(path.resolve("cert/server.key")),
//   cert: fs.readFileSync(path.resolve("cert/server.crt"))
// };

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/calendar', calenderRoutes);
// app.use('/api/master', masterRoutes);
// app.use('/api/dashboard', DashboardRoutes);
// app.use('/api/reports', ReportRoutes);

// // HTTPS Server
// https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
//   console.log(`🚀 HTTPS Server running on https://localhost:${HTTPS_PORT}`);
// });

// http.createServer((req, res) => {
//   const redirectUrl = `https://localhost:${HTTPS_PORT}${req.url}`;
//   res.writeHead(301, { Location: redirectUrl });
//   res.end();
// }).listen(HTTP_PORT);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import calenderRoutes from './routes/calenderRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import DashboardRoutes from './routes/DashboardRoutes.js';
import ReportRoutes from './routes/reportRoutes.js';
import fs from 'fs';
import https from "https";
import path from "path";

dotenv.config();
const app = express();
app.use('/uploads', express.static('uploads'));

// Use port from environment or default
const PORT = process.env.HTTPS_PORT || 5172;

// Middlewares
app.use(cors());
app.use(express.json());

// CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'HTTPS server is running!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Load SSL certificate files
const sslOptions = {
  key: fs.readFileSync(path.resolve("cert/server.key")),
  cert: fs.readFileSync(path.resolve("cert/server.crt"))
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calenderRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/dashboard', DashboardRoutes);
app.use('/api/reports', ReportRoutes);

// HTTPS Server ONLY - Skip HTTP for now
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🚀 HTTPS Server running on https://localhost:${PORT}`);
  console.log(`📊 Test the connection: https://localhost:${PORT}/api/test`);
});

// Optional: Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
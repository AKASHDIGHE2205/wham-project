import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import https from "https";
import path from "path";
import authRoutes from './routes/authRoutes.js';
import calenderRoutes from './routes/calenderRoutes.js';
import DashboardRoutes from './routes/DashboardRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import ReportRoutes from './routes/reportRoutes.js';
import TrainingRoutes from './routes/trainingRoutes.js';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5172;

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calenderRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/dashboard', DashboardRoutes);
app.use('/api/reports', ReportRoutes);
app.use('/api/training', TrainingRoutes);

// 🔹 Serve React build
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// SSL (only if you really want Node HTTPS)
const sslOptions = {
  key: fs.readFileSync(path.resolve("cert/server.key")),
  cert: fs.readFileSync(path.resolve("cert/server.crt"))
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🚀 Server running on https://localhost:${PORT}`);
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import calenderRoutes from './routes/calenderRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import DashboardController from './routes/DashboardRoutes.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// DEFINE ALL ROUTES HERE
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calenderRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/dashboard', DashboardController);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
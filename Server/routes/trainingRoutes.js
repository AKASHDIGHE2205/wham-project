import express from 'express';
import multer from 'multer';
import {
  addTraining,
  deactivateTraining,
  getActiveTrainings,
  getAllTrainings,
  getTrainingDetails,
  updateTraining
} from '../Controller/training/trainingController.js';
import { verifyToken } from '../middleware/verifyToken.js';
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/addTraining", verifyToken, upload.single("file"), addTraining);
router.get("/getAllTrainings", verifyToken, getAllTrainings);
router.get("/getTrainingDetails/:id", verifyToken, getTrainingDetails);
router.put("/updateTraining", verifyToken, updateTraining);
router.get("/getActiveTrainings", verifyToken, getActiveTrainings);
router.put("/deactivateTraining", verifyToken, deactivateTraining);

export default router;
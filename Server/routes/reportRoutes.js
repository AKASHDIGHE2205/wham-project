import express from 'express';
import { getMedia, report1 } from '../Controller/report/ReportController.js';
const router = express.Router();

router.post('/report1', report1)
router.post('/getMedia', getMedia)

export default router;
import express from "express";
import multer from "multer";
import { addAttendence, addSteps, getActiveEvents, getActiveSteps, getActiveTasks, getEventForAttend, getMemberDetailsForDashboard, getNotifyActivity, getUpcomingEvents, updateSteps } from "../Controller/dashboard/DashboardController.js";
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/getUpcomingEvents', verifyToken,getUpcomingEvents)
router.post('/getActiveEvents',verifyToken, getActiveEvents)
router.get('/getActiveSteps',verifyToken, getActiveSteps)
// router.get('/getActiveTasks/:Id', getActiveTasks)
router.get('/getActiveTasks',verifyToken, getActiveTasks)
router.post('/getEventForAttend',verifyToken, getEventForAttend)
router.post('/addAttendence',verifyToken, upload.single("media"), addAttendence);
router.post('/addSteps',verifyToken, addSteps);
router.put('/updateSteps',verifyToken, updateSteps);
router.get('/getMemberDetailsForDashboard/:id',verifyToken, getMemberDetailsForDashboard);
router.get("/getNotifyActivity", getNotifyActivity);

export default router;
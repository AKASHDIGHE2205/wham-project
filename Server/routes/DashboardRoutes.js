import express from "express";
import { addAttendence, addSteps, getActiveEvents, getActiveSteps, getActiveTasks, getEventForAttend, getUpcomingEvents, updateSteps } from "../Controller/dashboard/DashboardController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/getUpcomingEvents', getUpcomingEvents)
router.post('/getActiveEvents', getActiveEvents)
router.get('/getActiveSteps', getActiveSteps)
router.get('/getActiveTasks/:Id', getActiveTasks)
router.post('/getEventForAttend', getEventForAttend)
router.post('/addAttendence', upload.single("media"), addAttendence);
router.post('/addSteps', addSteps);
router.put('/updateSteps', updateSteps);

export default router;
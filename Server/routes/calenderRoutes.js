import express from "express";
import multer from "multer";
import { addActivity, addEvent, deleteEvent, getActiveCompaign, getActiveMembers, getActiveOccasions, getActiveTeams, getActivities, getActivityDetails, getEvents, updateActivity, updateEvent } from "../Controller/calender/calenderController.js";
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage });

router.post("/add-event", verifyToken, addEvent);
router.post("/get-event", verifyToken, getEvents);
router.put("/update-event", verifyToken, updateEvent);
router.put("/delete-event", verifyToken, deleteEvent);
router.get("/get-teams", verifyToken, getActiveTeams);
router.get("/get-members", verifyToken, getActiveMembers);

// -------------------------------------------------------------------
router.get("/getActiveOccasions", verifyToken, getActiveOccasions);
router.get("/getActiveCompaigns", verifyToken, getActiveCompaign);
router.post("/add-activity", verifyToken, upload.any(),addActivity);
router.post("/getActivities", verifyToken, getActivities);
router.post("/getActivitiesDetails", verifyToken, getActivityDetails);
router.post("/updateActivity", verifyToken, updateActivity);


export default router;
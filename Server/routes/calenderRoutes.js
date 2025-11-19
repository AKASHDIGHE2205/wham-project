import express from "express";
import { addEvent, getEvents, updateEvent, getActiveTeams, getActiveMembers } from "../Controller/calender/calenderController.js";
const router = express.Router();

router.post("/add-event", addEvent);
router.post("/get-event", getEvents);
router.put("/update-event", updateEvent);

router.get("/get-teams", getActiveTeams);
router.get("/get-members", getActiveMembers);



export default router;
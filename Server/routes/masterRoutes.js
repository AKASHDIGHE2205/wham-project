import express from 'express';
import { getAllmembers, getAllTeams, newTeam, updateTeam, addMember, getMemberDetails, getUsers, updateMember } from '../Controller/master/masterController.js';
const router = express.Router();

router.get('/getAllteams', getAllTeams);
router.post('/add-team', newTeam);
router.put('/edit-team', updateTeam);

router.get('/getAllmembers', getAllmembers);
router.get('/getUsers', getUsers);
router.post('/addMember', addMember);
router.get('/getmemberDetails/:id', getMemberDetails);
router.put('/update-member', updateMember)

export default router;
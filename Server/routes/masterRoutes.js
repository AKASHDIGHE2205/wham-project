import express from 'express';
import { getAllMembers, getAllTeams, newTeam, updateTeam, addMember, getMemberDetails, getUsers, updateMember, getAllSidebarMembers, getAllTasks, getAllSteps, addStep, updateStep, addTask, updateTask, getAllUsers, activateUser } from '../Controller/master/masterController.js';
const router = express.Router();

router.get('/getAllUsers', getAllUsers);
router.post('/activeUser', activateUser);

router.get('/getAllteams', getAllTeams);
router.post('/add-team', newTeam);
router.put('/edit-team', updateTeam);

router.get('/getAllmembers', getAllMembers);
router.get('/getUsers', getUsers);
router.post('/addMember', addMember);
router.get('/getmemberDetails/:id', getMemberDetails);
router.put('/update-member', updateMember)

router.get('/getAllTasks', getAllTasks);
router.post('/add-task', addTask);
router.put('/update-task', updateTask);


router.get('/getAllSteps', getAllSteps);
router.post('/add-step', addStep);
router.put('/update-step', updateStep);

router.post('/getAllSidebarMembers', getAllSidebarMembers);

export default router;
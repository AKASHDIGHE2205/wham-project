import express from 'express';
import { getAllMembers, getAllTeams, newTeam, updateTeam, addMember, getMemberDetails, getUsers, updateMember, getAllSidebarMembers, getAllTasks, getAllSteps, addStep, updateStep, addTask, updateTask, getAllUsers, activateUser, addUniversity, getAllUniversities, getUniversityDetails, updateUniversity, addCollege, getAllColleges, getCollegeDetails, updateCollege, getActiveUniversities, getAllDepartments, addDepartment, updateDepartment, getActiveColleges } from '../Controller/master/masterController.js';
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

router.post('/addUniversity', upload.single("photo"), addUniversity);
router.get('/getAllUniversities', getAllUniversities);
router.get('/getUniversityDetails/:id', getUniversityDetails);
router.put('/update-university', updateUniversity);
router.get('/getActiveUniversities', getActiveUniversities);

router.post('/addCollege', upload.single("photo"), addCollege);
router.get('/getAllColleges', getAllColleges);
router.get('/getCollegeDetails/:id', getCollegeDetails);
router.put('/update-College', updateCollege);
router.get('/getActiveColleges', getActiveColleges);

router.get('/getAlldepartments', getAllDepartments);
router.post('/add-department', addDepartment);
router.put('/update-department', updateDepartment);


export default router;
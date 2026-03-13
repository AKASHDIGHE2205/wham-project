import express from "express";
import multer from "multer";
import {
  activateUser,
  addCollege,
  addDepartment,
  addFaq,
  addMember,
  addStep,
  addTask,
  addUniversity,
  deactivateCollege,
  deactivateDepartment,
  deactivateMember,
  deactivateUniversity,
  getActiveColleges,
  getActiveDepartments,
  getActiveFaqs,
  getActiveUniversities,
  getAllColleges,
  getAllDepartments,
  getAllFaqs,
  getAllMembers,
  getAllSidebarMembers,
  getAllSteps,
  getAllTasks,
  getAllTeams,
  getAllUniversities,
  getAllUsers,
  getCollegeDetails,
  getMemberDetails,
  getUniversityDetails,
  getUsers,
  newTeam,
  updateCollege,
  updateDepartment,
  updateFaq,
  updateMember,
  updateStep,
  updateTask,
  updateTeam,
  updateUniversity
} from "../Controller/master/masterController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/getAllUsers", verifyToken, getAllUsers);
router.post("/activeUser", verifyToken, activateUser);

router.get("/getAllteams", verifyToken, getAllTeams);
router.post("/add-team", verifyToken, newTeam);
router.put("/edit-team", verifyToken, updateTeam);

router.get("/getAllmembers", verifyToken, getAllMembers);
router.get("/getUsers", verifyToken, getUsers);
router.post("/addMember", verifyToken, addMember);
router.get("/getmemberDetails/:id", verifyToken, getMemberDetails);
router.put("/update-member", verifyToken, updateMember);
router.put("/deactivateMember", verifyToken, deactivateMember);

router.get("/getAllTasks", verifyToken, getAllTasks);
router.post("/add-task", verifyToken, addTask);
router.put("/update-task", verifyToken, updateTask);

router.get("/getAllSteps", verifyToken, getAllSteps);
router.post("/add-step", verifyToken, addStep);
router.put("/update-step", verifyToken, updateStep);

router.post("/getAllSidebarMembers", verifyToken, getAllSidebarMembers);

router.post("/addUniversity", verifyToken, upload.single("photo"), addUniversity,);
router.get("/getAllUniversities", verifyToken, getAllUniversities);
router.get("/getUniversityDetails/:id", verifyToken, getUniversityDetails);
router.put("/update-university", verifyToken, updateUniversity);
router.get("/getActiveUniversities", verifyToken, getActiveUniversities);
router.put("/deactivateUniversity", verifyToken, deactivateUniversity);

router.post("/addCollege", verifyToken, upload.single("photo"), addCollege);
router.get("/getAllColleges", verifyToken, getAllColleges);
router.get("/getCollegeDetails/:id", verifyToken, getCollegeDetails);
router.put("/update-College", verifyToken, updateCollege);
router.get("/getActiveColleges", verifyToken, getActiveColleges);
router.put("/deactivateCollege", verifyToken, deactivateCollege);

router.get("/getAlldepartments", verifyToken, getAllDepartments);
router.post("/add-department", verifyToken, addDepartment);
router.put("/update-department", verifyToken, updateDepartment);
router.put("/deactivateDepartment", verifyToken, deactivateDepartment);
router.get("/getActiveDepartments", verifyToken, getActiveDepartments);

router.get("/getAllFaqs", verifyToken, getAllFaqs);
router.post("/add-faq", verifyToken, addFaq);
router.put("/update-faq", verifyToken, updateFaq);
router.get("/getActiveFaqs", verifyToken, getActiveFaqs);

export default router;

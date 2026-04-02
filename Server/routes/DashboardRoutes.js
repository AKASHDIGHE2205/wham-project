import express from "express";
import multer from "multer";
import { addAttendence, addSteps, ApproveRejectStock, getActiveEvents, getActiveSteps, getActiveTasks, GetAllStockLatest, getEventForAttend, getMemberDetailsForDashboard, getMyRequests, getNotifyActivity, GetNotifyStock, getUpcomingEvents, PurchaseStock, SaleStock, updateSteps } from "../Controller/dashboard/DashboardController.js";
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/getUpcomingEvents', verifyToken, getUpcomingEvents)
router.post('/getActiveEvents', verifyToken, getActiveEvents)
router.get('/getActiveSteps', verifyToken, getActiveSteps)
// router.get('/getActiveTasks/:Id', getActiveTasks)
router.get('/getActiveTasks', verifyToken, getActiveTasks)
router.post('/getEventForAttend', verifyToken, getEventForAttend)
router.post('/addAttendence', verifyToken, upload.single("media"), addAttendence);
router.post('/addSteps', verifyToken, addSteps);
router.put('/updateSteps', verifyToken, updateSteps);
router.get('/getMemberDetailsForDashboard/:id', verifyToken, getMemberDetailsForDashboard);
router.get("/getNotifyActivity", getNotifyActivity);
router.post("/purchaseStock", verifyToken, PurchaseStock);
router.post("/saleStock", verifyToken, SaleStock);
router.get("/getAllStockLatest/:userId", verifyToken, GetAllStockLatest);
router.get("/getMyRequests/:userId", verifyToken, getMyRequests);
router.get("/getNotifyStock", verifyToken, GetNotifyStock);
router.post("/approveRejectStock", verifyToken, ApproveRejectStock);

export default router;
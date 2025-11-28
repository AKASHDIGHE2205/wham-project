import express from 'express';
import { registerUser, loginUser, validateToken, sendOtp, validateOtp, updatePassword, getTeamMembers } from '../Controller/auth/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/validate-token', validateToken);
router.post('/getTeamMembers', getTeamMembers);

router.post('/sendotp', sendOtp);
router.post('/validateotp', validateOtp);
router.post('/updateotp', updatePassword);


export default router;
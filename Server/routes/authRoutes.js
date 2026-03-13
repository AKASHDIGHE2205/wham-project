import express from 'express';
import multer from 'multer';
import { getTeamMembers, loginUser, registerUser, sendOtp, updatePassword, validateOtp } from '../Controller/auth/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/register', upload.single('photo'), registerUser);
router.post('/login', loginUser);
router.get('/verify-token', verifyToken, (req, res) => {
  res.status(200).json({
    isValid: true,
    user: req.user,
    message: 'Token is valid'
  });
});


router.post('/getTeamMembers', getTeamMembers);

router.post('/sendotp', sendOtp);
router.post('/validateotp', validateOtp);
router.post('/updateotp', updatePassword);


export default router;
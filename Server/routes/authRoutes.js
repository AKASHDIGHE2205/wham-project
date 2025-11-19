import express from 'express';
import { registerUser, loginUser, validateToken } from '../Controller/auth/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/validate-token', validateToken);

export default router;
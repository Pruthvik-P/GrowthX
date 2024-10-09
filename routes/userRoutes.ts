import express from 'express';
import { registerUser, loginUser, uploadAssignment } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/upload', authenticate, uploadAssignment);

export default router;

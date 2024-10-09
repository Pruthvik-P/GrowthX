import express from 'express';
import { registerAdmin, loginAdmin, getAssignments, reviewAssignment } from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/assignments', authenticate, getAssignments);
router.post('/assignments/:id/review', authenticate, reviewAssignment);

export default router;

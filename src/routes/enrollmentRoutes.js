import express from 'express';
import { enroll, unenroll, getMyEnrollments, updateGrades, getEnrollmentsByCourse } from '../controllers/enrollmentController.js';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, enroll);
router.get('/me', authenticate, getMyEnrollments);
router.get('/course/:courseId', authenticate, getEnrollmentsByCourse);
router.delete('/:id', authenticate, unenroll);
router.put('/:id/grades', authenticate, updateGrades); // teachers or admin

export default router;

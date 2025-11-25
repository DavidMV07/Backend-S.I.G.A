import express from 'express';
import courseController from '../controllers/courseController.js';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: list courses
router.get('/', authenticate, courseController.getCourses);
router.get('/:id', authenticate, courseController.getCourseById);

// Admin: manage courses
router.post('/', authenticate, authorizeRole('admin'), courseController.createCourse);
router.put('/:id', authenticate, authorizeRole('admin'), courseController.updateCourse);
router.delete('/:id', authenticate, authorizeRole('admin'), courseController.deleteCourse);

// Admin: assign/remove teachers to a course
router.post('/:id/teachers', authenticate, authorizeRole('admin'), courseController.addTeacher);
router.delete('/:id/teachers/:teacherId', authenticate, authorizeRole('admin'), courseController.removeTeacher);

export default router;

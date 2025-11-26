import express from 'express';
import courseController from '../controllers/courseController.js';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ========================
// Public
// ========================
router.get('/', authenticate, courseController.getCourses);
router.get('/:id', authenticate, courseController.getCourseById);

// ========================
// Admin: Manage courses
// ========================
router.post('/', authenticate, authorizeRole('admin'), courseController.createCourse);
router.put('/:id', authenticate, authorizeRole('admin'), courseController.updateCourse);
router.delete('/:id', authenticate, authorizeRole('admin'), courseController.deleteCourse);

// ========================
// Admin: Teachers
// ========================
router.post('/:id/teachers', authenticate, authorizeRole('admin'), courseController.addTeacher);
router.delete('/:id/teachers/:teacherId', authenticate, authorizeRole('admin'), courseController.removeTeacher);

// ========================
// Admin: Students
// ========================
router.post('/:id/students', authenticate, authorizeRole('admin'), courseController.enrollStudent);
router.delete('/:id/students/:studentId', authenticate, authorizeRole('admin'), courseController.removeStudent);

// ========================
// Admin: Prerequisites
// ========================
router.post('/:id/prerequisites', authenticate, authorizeRole('admin'), courseController.addPrerequisite);
router.delete('/:id/prerequisites/:prerequisiteId', authenticate, authorizeRole('admin'), courseController.removePrerequisite);

export default router;

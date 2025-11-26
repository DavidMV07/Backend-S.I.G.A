import express from 'express';
import courseController from '../controllers/courseController.js';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/', authenticate, courseController.getCourses);
router.get('/:id', authenticate, courseController.getCourseById);


router.post('/', authenticate, authorizeRole('admin'), courseController.createCourse);
router.put('/:id', authenticate, authorizeRole('admin'), courseController.updateCourse);
router.delete('/:id', authenticate, authorizeRole('admin'), courseController.deleteCourse);



router.post('/:id/profesor', authenticate, authorizeRole('admin'), courseController.addTeacher);
router.delete('/:id/profesor/:profesorId', authenticate, authorizeRole('admin'), courseController.removeTeacher);

// ========================
// Admin: Students
// ========================
router.post('/:id/alumnos', authenticate, authorizeRole('admin'), courseController.enrollStudent);
router.delete('/:id/alumnos/:alumnoId', authenticate, authorizeRole('admin'), courseController.removeStudent);

// ========================
// Admin: Prerequisites
// ========================
router.post('/:id/prerequisites', authenticate, authorizeRole('admin'), courseController.addPrerequisite);
router.delete('/:id/prerequisites/:prerequisiteId', authenticate, authorizeRole('admin'), courseController.removePrerequisite);

export default router;

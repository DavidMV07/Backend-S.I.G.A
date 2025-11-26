import Course from '../models/courseModel.js';
import User from '../models/userModel.js';

const courseController = {
  // -------------------------------
  // CREATE
  // -------------------------------
  createCourse: async (req, res) => {
    try {
      const { title, code, description } = req.body;
      if (!title) return res.status(400).json({ message: 'Title is required' });

      const newCourse = new Course({ title, code, description });
      await newCourse.save();
      res.status(201).json({ message: 'Course created', course: newCourse });
    } catch (error) {
      res.status(500).json({ message: 'Error creating course', error });
    }
  },

  // -------------------------------
  // GET ALL
  // -------------------------------
  getCourses: async (req, res) => {
    try {
      const courses = await Course.find()
        .populate('teachers', 'firstName lastName email role')
        .populate('prerequisites', 'title code')
        .populate('students', 'firstName lastName email');

      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching courses', error });
    }
  },

  // -------------------------------
  // GET BY ID
  // -------------------------------
  getCourseById: async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate('teachers', 'firstName lastName email role')
        .populate('prerequisites', 'title code')
        .populate('students', 'firstName lastName email');

      if (!course) return res.status(404).json({ message: 'Course not found' });

      res.json(course);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching course', error });
    }
  },

  // -------------------------------
  // UPDATE
  // -------------------------------
  updateCourse: async (req, res) => {
    try {
      const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Course not found' });

      res.json({ message: 'Course updated', course: updated });
    } catch (error) {
      res.status(500).json({ message: 'Error updating course', error });
    }
  },

  // -------------------------------
  // DELETE
  // -------------------------------
  deleteCourse: async (req, res) => {
    try {
      const deleted = await Course.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Course not found' });

      res.json({ message: 'Course deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting course', error });
    }
  },

  // -------------------------------
  // ADD TEACHER
  // -------------------------------
  addTeacher: async (req, res) => {
    try {
      const { teacherId } = req.body;
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      const teacher = await User.findById(teacherId);
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

      if (course.teachers.includes(teacherId))
        return res.status(400).json({ message: 'Teacher already assigned' });

      course.teachers.push(teacherId);
      await course.save();

      const populated = await Course.findById(course._id)
        .populate('teachers', 'firstName lastName email role');

      res.json({ message: 'Teacher added', course: populated });
    } catch (error) {
      res.status(500).json({ message: 'Error adding teacher', error });
    }
  },

  // -------------------------------
  // REMOVE TEACHER
  // -------------------------------
  removeTeacher: async (req, res) => {
    try {
      const { teacherId } = req.params;

      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      course.teachers = course.teachers.filter(t => t.toString() !== teacherId);
      await course.save();

      const populated = await Course.findById(course._id)
        .populate('teachers', 'firstName lastName email role');

      res.json({ message: 'Teacher removed', course: populated });
    } catch (error) {
      res.status(500).json({ message: 'Error removing teacher', error });
    }
  },

  // -------------------------------
  // ADD PREREQUISITE
  // -------------------------------
  addPrerequisite: async (req, res) => {
    try {
      const { prereqId } = req.body;

      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      const prereqCourse = await Course.findById(prereqId);
      if (!prereqCourse) return res.status(404).json({ message: 'Prerequisite course not found' });

      if (course._id.toString() === prereqId)
        return res.status(400).json({ message: 'Course cannot be its own prerequisite' });

      if (course.prerequisites.includes(prereqId))
        return res.status(400).json({ message: 'Prerequisite already exists' });

      course.prerequisites.push(prereqId);
      await course.save();

      const populated = await Course.findById(course._id)
        .populate('prerequisites', 'title code');

      res.json({ message: 'Prerequisite added', course: populated });
    } catch (error) {
      res.status(500).json({ message: 'Error adding prerequisite', error });
    }
  },

  // -------------------------------
  // REMOVE PREREQUISITE
  // -------------------------------
  removePrerequisite: async (req, res) => {
    try {
      const { prereqId } = req.params;

      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      course.prerequisites = course.prerequisites.filter(
        p => p.toString() !== prereqId
      );
      await course.save();

      const populated = await Course.findById(course._id)
        .populate('prerequisites', 'title code');

      res.json({ message: 'Prerequisite removed', course: populated });
    } catch (error) {
      res.status(500).json({ message: 'Error removing prerequisite', error });
    }
  },

  // -------------------------------
  // ENROLL STUDENT WITH PREREQ VALIDATION
  // -------------------------------
  enrollStudent: async (req, res) => {
    try {
      const { studentId } = req.body;

      const course = await Course.findById(req.params.id).populate('prerequisites');
      if (!course) return res.status(404).json({ message: 'Course not found' });

      const student = await User.findById(studentId);
      if (!student) return res.status(404).json({ message: 'Student not found' });

      // verificar si ya está matriculado
      if (course.students.includes(studentId))
        return res.status(400).json({ message: 'Student already enrolled' });

      // validar prerrequisitos
      const completedCourses = student.completedCourses || []; // debes tener esto en tu UserModel

      const missing = course.prerequisites.filter(
        p => !completedCourses.includes(p._id.toString())
      );

      if (missing.length > 0) {
        return res.status(400).json({
          message: 'Prerequisites not met',
          missingPrerequisites: missing.map(m => m.title)
        });
      }

      // matricular
      course.students.push(studentId);
      await course.save();

      res.json({
        message: 'Student enrolled successfully',
        courseId: course._id,
        studentId
      });
    } catch (error) {
      res.status(500).json({ message: 'Error enrolling student', error });
    }
  },

  // -------------------------------
  // GET COURSES AVAILABLE FOR STUDENT
  // -------------------------------
  getEligibleCourses: async (req, res) => {
    try {
      const studentId = req.params.studentId;
      const student = await User.findById(studentId);

      if (!student) return res.status(404).json({ message: 'Student not found' });

      const completed = student.completedCourses || [];

      const allCourses = await Course.find().populate('prerequisites');

      const eligible = allCourses.filter(course =>
        course.prerequisites.every(pr =>
          completed.includes(pr._id.toString())
        )
      );

      res.json(eligible);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching eligible courses', error });
    }
  }
};

export default courseController;

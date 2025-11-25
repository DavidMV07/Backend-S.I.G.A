import Course from '../models/courseModel.js';
import User from '../models/userModel.js';

const courseController = {
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

  getCourses: async (req, res) => {
    try {
      const courses = await Course.find().populate('teachers', 'firstName lastName email role');
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching courses', error });
    }
  },

  getCourseById: async (req, res) => {
    try {
      const course = await Course.findById(req.params.id).populate('teachers', 'firstName lastName email role');
      if (!course) return res.status(404).json({ message: 'Course not found' });
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching course', error });
    }
  },

  updateCourse: async (req, res) => {
    try {
      const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Course not found' });
      res.json({ message: 'Course updated', course: updated });
    } catch (error) {
      res.status(500).json({ message: 'Error updating course', error });
    }
  },

  deleteCourse: async (req, res) => {
    try {
      const deleted = await Course.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Course not found' });
      res.json({ message: 'Course deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting course', error });
    }
  },

  addTeacher: async (req, res) => {
    try {
      const { teacherId } = req.body;
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      const teacher = await User.findById(teacherId);
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

      // Avoid duplicates
      if (course.teachers.includes(teacherId)) return res.status(400).json({ message: 'Teacher already assigned' });

      course.teachers.push(teacherId);
      await course.save();
      const populated = await Course.findById(course._id).populate('teachers', 'firstName lastName email role');
      res.json({ message: 'Teacher added', course: populated });
    } catch (error) {
      res.status(500).json({ message: 'Error adding teacher', error });
    }
  },

  removeTeacher: async (req, res) => {
    try {
      const { teacherId } = req.params;
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      course.teachers = course.teachers.filter(t => t.toString() !== teacherId);
      await course.save();
      const populated = await Course.findById(course._id).populate('teachers', 'firstName lastName email role');
      res.json({ message: 'Teacher removed', course: populated });
    } catch (error) {
      res.status(500).json({ message: 'Error removing teacher', error });
    }
  }
};

export default courseController;

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
      const courses = await Course.find()
        .populate('profesor', 'firstName lastName email role')
        .populate('prerequisites', 'title code')
        .populate('alumno', 'firstName lastName email');

      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching courses', error });
    }
  },


  getCourseById: async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate('profesor', 'firstName lastName email role')
        .populate('prerequisites', 'title code')
        .populate('alumno', 'firstName lastName email');

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
      const { id } = req.params;
      const course = await Course.findByIdAndDelete(id);

      if (!course) {
        return res.status(404).json({ msg: "Curso no encontrado" });
      }

      res.json({ msg: "Curso eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error al eliminar curso" });
    }
  },


  addTeacher: async (req, res) => {
    try {
      const { profesorId } = req.body;
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      const teacher = await User.findById(profesorId);
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

      if (course.profesor.includes(profesorId))
        return res.status(400).json({ message: 'Teacher already assigned' });

      course.profesor.push(profesorId);
      await course.save();

      const populated = await Course.findById(course._id)
        .populate('profesor', 'firstName lastName email role');
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

      course.profesor = course.profesor.filter(t => t.toString() !== profesorId);
      await course.save();

      const populated = await Course.findById(course._id)
        .populate('profesor', 'firstName lastName email role');

      res.json({ message: 'Teacher removed', course: populated });
    } catch (error) {
      res.status(500).json({ message: 'Error removing teacher', error });
    }
  },


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


  enrollStudent: async (req, res) => {
    try {
      const { alumnoId } = req.body;

      const course = await Course.findById(req.params.id).populate('prerequisites');
      if (!course) return res.status(404).json({ message: 'Course not found' });

      const alumno = await User.findById(alumnoId);
      if (!alumno) return res.status(404).json({ message: 'Student not found' });

      // verificar si ya está matriculado
      if (course.alumno.includes(alumnoId))
        return res.status(400).json({ message: 'Student already enrolled' });

      // validar prerrequisitos
      const completedCourses = alumno.completedCourses || [];
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
      course.alumno.push(alumnoId);
      await course.save();

      res.json({
        message: 'Student enrolled successfully',
        courseId: course._id,
        alumnoId
      });
    } catch (error) {
      res.status(500).json({ message: 'Error enrolling student', error });
    }
  },


  getEligibleCourses: async (req, res) => {
    try {
      const alumnoId = req.params.alumnoId;
      const alumno = await User.findById(alumnoId);

      if (!alumno) return res.status(404).json({ message: 'Student not found' });

      const completed = alumno.completedCourses || [];

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
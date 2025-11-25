import Enrollment from '../models/enrollmentModel.js';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';

export const enroll = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id || req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });

    const enrollment = await Enrollment.create({ student: studentId, course: courseId });
    res.status(201).json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const unenroll = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id || req.user._id;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    if (enrollment.student.toString() !== studentId.toString()) return res.status(403).json({ message: 'Not authorized' });

    await enrollment.remove();
    res.json({ message: 'Unenrolled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({ path: 'course', populate: { path: 'teachers', select: 'firstName lastName email role' } })
      .populate({ path: 'student', select: 'firstName lastName email' });

    // For classmates, fetch other enrollments in same courses
    const courseIds = enrollments.map(e => e.course._id);
    const classmatesMap = {};
    if (courseIds.length) {
      const classmates = await Enrollment.find({ course: { $in: courseIds } })
        .populate('student', 'firstName lastName email');

      courseIds.forEach(cid => {
        classmatesMap[cid.toString()] = classmates
          .filter(c => c.course.toString() === cid.toString() && (c.student._id || c.student.id).toString() !== studentId.toString())
          .map(c => c.student);
      });
    }

    const result = enrollments.map(e => ({
      _id: e._id,
      course: e.course,
      grades: e.grades,
      classmates: classmatesMap[e.course._id.toString()] || []
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getEnrollmentsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'firstName lastName email role')
      .populate('course', 'title description');

    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateGrades = async (req, res) => {
  try {
    const { id } = req.params; // enrollment id
    const { grades } = req.body; // full grades array

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    // Only allow teachers of the course or admin
    const course = await Course.findById(enrollment.course);
    const userId = (req.user.id || req.user._id).toString();
    const isTeacher = course.teachers.map(t => t.toString()).includes(userId);
    if (!isTeacher && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

    enrollment.grades = grades;
    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

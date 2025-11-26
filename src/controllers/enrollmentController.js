import Enrollment from "../models/enrollmentModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";

// =======================
//  GET MIS MATRICULAS
// =======================
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.find({ alumno: userId })
      .populate({
        path: "course",
        populate: [
          {
            path: "profesor",
            select: "firstName lastName email"
          }
        ],
      })
      .lean();

    // AGREGAR COMPAÑEROS
    for (let e of enrollments) {
      const classmates = await Enrollment.find({
        course: e.course._id,
        alumno: { $ne: userId }
      })
        .populate({
          path: "alumno",
          select: "firstName lastName email"
        })
        .lean();

      e.classmates = classmates.map(c => c.alumno);
    }

    return res.json(enrollments);

  } catch (err) {
    console.error("Error getMyEnrollments:", err);
    res.status(500).json({ msg: "Error obteniendo enrolamientos" });
  }
};

// =======================
//  ENROLL
// =======================
export const enroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    const exists = await Enrollment.findOne({ alumno: userId, course: courseId });
    if (exists) return res.status(400).json({ msg: "Ya estás inscrito en este curso" });

    const enrollment = await Enrollment.create({
      alumno: userId,
      course: courseId,
      grades: []
    });

    res.json(enrollment);

  } catch (err) {
    res.status(500).json({ msg: "Error al inscribir" });
  }
};

// =======================
//  UNENROLL
// =======================
export const unenroll = async (req, res) => {
  try {
    await Enrollment.findByIdAndDelete(req.params.id);
    res.json({ msg: "Matrícula eliminada" });
  } catch (err) {
    res.status(500).json({ msg: "Error al eliminar matrícula" });
  }
};

// =======================
//  GET BY COURSE (PROF/ADMIN)
// =======================
export const getEnrollmentsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const enrollments = await Enrollment.find({ course: courseId })
      .populate({
        path: "alumno",
        select: "firstName lastName email"
      });

    res.json(enrollments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error obteniendo matriculados" });
  }
};

// =======================
//  UPDATE GRADES
// =======================
export const updateGrades = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { grades: req.body.grades },
      { new: true }
    );

    res.json(enrollment);

  } catch (err) {
    res.status(500).json({ msg: "Error al actualizar notas" });
  }
};

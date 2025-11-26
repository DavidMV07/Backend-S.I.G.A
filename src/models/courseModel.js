import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String },

  description: { type: String },

  // Profesores asignados
  profesor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // 🔥 Prerrequisitos
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    default: []
  }],

  // 🏫 Salón asignado
  classroom: { type: String },

  // ⏰ Horario del curso
  schedule: {
    day: { type: String },          // Lunes, Martes, etc.
    startTime: { type: String },    // "08:00"
    endTime: { type: String }        // "10:00"
  },

  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);
export default Course;

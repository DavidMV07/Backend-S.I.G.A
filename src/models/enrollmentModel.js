import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true }
}, { _id: false });

const enrollmentSchema = new mongoose.Schema({
  alumno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  grades: [gradeSchema],
  createdAt: { type: Date, default: Date.now }
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;

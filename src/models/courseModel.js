import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: false },
  description: { type: String, required: false },
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.model('Course', courseSchema);
export default Course;

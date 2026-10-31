import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: { type: String, required: [true, 'title is required'], trim: true },
    units: { type: Number, required: true, min: 1, max: 6 },
    semester: { type: String, required: true, trim: true },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

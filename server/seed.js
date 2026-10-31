import 'dotenv/config';
import mongoose from 'mongoose';
import { Course } from './models/Course.js';
import { COURSES } from './data/courses.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/itelect4';

try {
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);

  for (const course of COURSES) {
    await Course.updateOne({ code: course.code }, course, { upsert: true });
  }

  console.log(`${COURSES.length} courses in ${mongoose.connection.name}`);
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

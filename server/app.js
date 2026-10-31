import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';
import { connectDB } from './config/db.js';
import { Course } from './models/Course.js';
import { Submission } from './models/Submission.js';
import { TimingLap } from './models/TimingLap.js';
import { User } from './models/User.js';
import { aiPromptSchema } from './schemas/aiReview.js';
import { reviewProject } from './services/aiReview.js';

const app = express();
const jwtSecret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production' ? undefined : randomBytes(32).toString('hex'));
const allowedOrigins = (process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173'))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set in the environment before starting the API.');
}
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn('JWT_SECRET is unset; using a temporary secret for local development.');
}
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGIN must list the deployed frontend origin in production.');
}

app.use(
  cors({
    origin(origin, callback) {
      const localDevelopmentOrigin =
        process.env.NODE_ENV !== 'production' &&
        origin &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (!origin || allowedOrigins.includes(origin) || localDevelopmentOrigin) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin "${origin}" is not allowed by CORS_ORIGIN.`));
    },
  }),
);
app.use(express.json({ limit: '10kb' }));

const requireDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection unavailable:', error.message);
    res.status(503).json({ message: 'Database is not connected.' });
  }
};

const requireAuth = (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'No token. Send Authorization: Bearer <token>.' });
  }

  try {
    req.auth = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const aiReviewRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => req.auth.sub,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Five reviews a minute is the limit. Try again shortly.',
    });
  },
});

app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Health check could not connect to MongoDB:', error.message);
  }
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.post('/api/ai', requireAuth, aiReviewRateLimit, async (req, res) => {
  const parsed = aiPromptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: parsed.error.issues.map((issue) => issue.message),
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: 'AI review is not configured on the server.' });
  }

  try {
    const review = await reviewProject(parsed.data.prompt, apiKey);
    return res.json(review);
  } catch (error) {
    console.error('AI review failed:', error.message);
    return res.status(502).json({ message: 'AI review could not produce a valid response. Try again shortly.' });
  }
});

app.get('/api/courses', requireDatabase, async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ code: 1 });
    return res.json(courses);
  } catch (error) {
    next(error);
  }
});

app.get('/api/courses/:code', requireDatabase, async (req, res, next) => {
  try {
    const course = await Course.findOne({ code: req.params.code.toUpperCase() });
    if (!course) {
      return res.status(404).json({
        message: `No course with code "${req.params.code}"`,
      });
    }
    return res.json(course);
  } catch (error) {
    next(error);
  }
});

app.get('/api/timing/laps', requireAuth, requireDatabase, async (req, res, next) => {
  try {
    const laps = await TimingLap.find().sort({ createdAt: -1 }).limit(200).lean();
    return res.json(
      laps.map(({ _id, __v, ...fields }) => ({ ...fields, id: String(_id) })),
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/timing/laps', requireAuth, requireDatabase, async (req, res, next) => {
  try {
    const lap = await TimingLap.create({
      driverName: req.body?.driverName,
      carModel: req.body?.carModel,
      bestLapTime: req.body?.bestLapTime,
      recordedBy: req.auth.sub,
    });
    const { _id, __v, ...fields } = lap.toObject();
    return res.status(201).json({ ...fields, id: String(_id) });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const message = Object.values(error.errors)[0]?.message || 'Invalid lap record.';
      return res.status(400).json({ message });
    }
    next(error);
  }
});

app.post('/api/auth/register', requireDatabase, async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: 'Provide a name, valid email, and password of at least 8 characters.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    next(error);
  }
});

app.post('/api/auth/login', requireDatabase, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '2h' });
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
});

const serializeSubmission = (submission) => {
  const { _id, __v, ...fields } = submission;
  return { ...fields, id: String(_id) };
};

app.get('/api/submissions', requireAuth, requireDatabase, async (req, res, next) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 }).lean();
    return res.json(submissions.map(serializeSubmission));
  } catch (error) {
    next(error);
  }
});

app.get('/api/submissions/:id', requireAuth, requireDatabase, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    const submission = await Submission.findById(req.params.id).lean();
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    return res.json(serializeSubmission(submission));
  } catch (error) {
    next(error);
  }
});

app.post('/api/submissions', requireAuth, requireDatabase, async (req, res, next) => {
  try {
    const submission = await Submission.create({
      repoUrl: req.body?.repoUrl,
      studentId: req.auth.sub,
    });
    return res.status(201).json(submission);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const message = Object.values(error.errors)[0]?.message || 'Invalid submission.';
      return res.status(400).json({ message });
    }
    next(error);
  }
});

app.delete('/api/submissions/:id', requireAuth, requireDatabase, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    const submission = await Submission.findOneAndDelete({
      _id: req.params.id,
      studentId: req.auth.sub,
    });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error('API request failed:', error);
  if (res.headersSent) return next(error);
  const isCorsError = error.message.startsWith('Origin "') && error.message.endsWith('" is not allowed by CORS_ORIGIN.');
  return res.status(isCorsError ? 403 : 500).json({
    message: isCorsError ? 'This website is not allowed to access the API.' : 'An unexpected server error occurred.',
  });
});

export { app };

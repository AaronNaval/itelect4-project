import mongoose from 'mongoose';

const isGithubRepositoryUrl = (value) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'github.com' &&
      !url.username &&
      !url.password &&
      /^\/[^/]+\/[^/]+\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
};

const submissionSchema = new mongoose.Schema(
  {
    repoUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isGithubRepositoryUrl,
        message: 'Repository URL must be a valid HTTPS GitHub repository URL.',
      },
    },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Submission =
  mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

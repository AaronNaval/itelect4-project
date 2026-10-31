export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface Course {
  code: string;
  title: string;
  units: number;
  semester: string;
}

export interface Submission {
  id: string;
  studentId: string;
  repoUrl: string;
  createdAt: string;
}

export interface TimingLap {
  id: string;
  driverName: string;
  carModel: string;
  bestLapTime: string;
  recordedBy: string;
  createdAt: string;
}

export type AiReviewReadiness = 'ready' | 'needs-work' | 'not-ready';

export interface AiReview {
  summary: string;
  strengths: string[];
  improvements: string[];
  readiness: AiReviewReadiness;
}
// ==========================================
// 1. BASE ENTITIES (From Session 1)
// ==========================================
export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin" | "instructor";
  isActive: boolean;
}

export interface Course {
  id: number;
  name: string;
  units: number;
  semester: string;
}

export interface Submission {
  id: number;
  studentId: number;
  courseCode: string;
  submittedAt: Date;
}

// ==========================================
// 2. ADVANCED TYPES (Session 2 Requirements)
// ==========================================

// A. Generic Interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// B. Utility Types (At least 2 required)
export type UserUpdate = Partial<User>; // Makes all fields optional for edits[cite: 1]
export type UserPreview = Pick<User, "id" | "name" | "role">; // Lean profile preview[cite: 1]
export type PublicUser = Omit<User, "email" | "isActive">; // Excludes sensitive data[cite: 1]

// C. Enums (At least 1 required)[cite: 1]
export enum SubmissionStatus {
  Pending,
  Graded,
  Late,
}
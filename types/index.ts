// ===== INTERFACES =====
export interface User {
  id:       number;
  name:     string;
  email:    string;
  role:     "student" | "admin" | "instructor"; 
  isActive: boolean;
}

export interface Course {
  code:     string;
  title:    string;
  units:    number;
  semester: string;
}

export interface Submission {
  id:          number;
  studentId:   number;
  courseCode:  string;
  repoUrl:     string;
  submittedAt: Date;
  score?:      number;  // Optional field
}

// ===== TYPE ALIASES & UNIONS =====
export type StringOrNumber = string | number;
export type Status         = "pending" | "active" | "inactive";
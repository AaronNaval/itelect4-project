import { 
  User, 
  Course, 
  ApiResponse, 
  UserUpdate, 
  UserPreview, 
  SubmissionStatus 
} from "../types/index";

// ==========================================
// 1. GENERIC FUNCTIONS[cite: 1]
// ==========================================

// Generic function 1: Get first item of any array[cite: 1]
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

// Generic function 2: Get item by ID constraint[cite: 1]
function getById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

// Mock Data for Testing
const sampleUser: User = {
  id: 1,
  name: "Juan dela Cruz",
  email: "juan@example.com",
  role: "student",
  isActive: true,
};

// ==========================================
// 2. RUNNING AND LOGGING VALUES
// ==========================================

// Testing Generic Functions[cite: 1]
const firstUser = getFirst<User>([sampleUser]);
const foundUser = getById<User>([sampleUser], 1);
console.log("Generic Function Output:", firstUser?.name);

// Testing Generic Interface[cite: 1]
const userResponse: ApiResponse<User> = {
  success: true,
  data: sampleUser,
};
console.log("Generic Interface Response:", userResponse.data.email);

// Testing Utility Types[cite: 1]
const updatedProfile: UserUpdate = { name: "Juan D. Cruz" };
const previewProfile: UserPreview = { id: 1, name: "Juan dela Cruz", role: "student" };
console.log("Utility Type Pick Role:", previewProfile.role);

// Testing Enums[cite: 1]
let currentStatus: SubmissionStatus = SubmissionStatus.Pending;
console.log("Enum Runtime Name Mapping:", SubmissionStatus[currentStatus]); // Outputs: "Pending"[cite: 1]
import type { User, Course, Submission, StringOrNumber } from "../types/index";
import "./sample";

const projectName: string  = "itelect4-project";
const currentYear: number  = 2026;
const isFullStack: boolean = true;
const nothing:     null    = null;
const notSet:      undefined = undefined;

function greet(name: string, year: number): string {
  return `Welcome to ${name} -- AY ${year}!`;
}

function logMessage(message: string): void {
  console.log(message);
}

logMessage(greet(projectName, currentYear));

let userInput: unknown = "test";
if (typeof userInput === "string") {
  console.log(userInput.toUpperCase()); 
}

const student: User = {
  id:       1,
  name:     "Juan dela Cruz",
  email:    "juan@example.com",
  role:     "student",
  isActive: true,
};

const course: Course = {
  code:     "ITELECT4",
  title:    "IT Elective 4",
  units:    3,
  semester: "1st Semester 2026-2027",
};

console.log(student);
console.log(course);

function processInput(input: StringOrNumber): string {
  if (typeof input === "string") {
    return input.toUpperCase();  
  }
  return input.toFixed(2);       
}

function formatDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toLocaleDateString(); 
  }
  return value;                         
}

console.log(processInput("hello"));
console.log(formatDate(new Date()));
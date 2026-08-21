import { useState, useEffect, useRef } from "react";
import type { User, Course } from "./types/index";
import UserCard from "./components/UserCard";
import CourseCard from "./components/CourseCard";
import useToggle from "./hooks/useToggle";
import usePrevious from "./hooks/usePrevious";

const student: User = {
  id: 1,
  name: "Juan dela Cruz",
  email: "juan@example.com",
  role: "student",
  isActive: true,
};

const course: Course = {
  code: "ITELECT4",
  title: "IT Elective 4",
  units: 3,
  semester: "1st Semester 2026-2027",
};

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showDetails, toggleDetails] = useToggle(false);
  const previousSearch = usePrevious(searchTerm);

  useEffect(() => {
    setTimeout(() => {
      setCourses([course]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(e.target.value);
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <p>Loading courses...</p>;

  return (
    <div className="app">
      <input
        ref={searchInputRef}
        value={searchTerm}
        type="text"
        placeholder="Search courses..."
        onChange={handleSearchChange}
      />
      {previousSearch !== undefined && previousSearch !== searchTerm && (
        <p>Previous search: "{previousSearch}"</p>
      )}
      <UserCard user={student} onSelect={setSelectedUser} />
      {selectedUser && <p>Selected: {selectedUser.name}</p>}
      <button onClick={toggleDetails}>
        {showDetails ? "Hide" : "Show"} Details
      </button>
      {filteredCourses.map((c) => (
        <CourseCard key={c.code} course={c} />
      ))}
    </div>
  );
}

export default App;
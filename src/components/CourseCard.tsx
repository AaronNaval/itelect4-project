import type { Course } from "../types/index";

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact";
}

function CourseCard({ course, variant = "default" }: CourseCardProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${
        isCompact ? "p-3" : "p-5"
      }`}
    >
      <h3
        className={`font-bold text-gray-900 dark:text-white ${
          isCompact ? "text-sm" : "text-lg"
        }`}
      >
        {course.code}
      </h3>
      {!isCompact && (
        <p className="text-gray-600 dark:text-gray-300">{course.title}</p>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {course.units} units -- {course.semester}
      </p>
    </div>
  );
}

export default CourseCard;
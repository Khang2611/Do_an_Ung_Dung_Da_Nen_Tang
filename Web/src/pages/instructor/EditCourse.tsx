import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseById, updateCourse } from "../../api/courseApi";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { CourseForm } from "../../components/course/CourseForm";
import type { Course } from "../../types/course";

export function EditCourse() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourseById(id).then(setCourse).catch((err) => setError(err instanceof Error ? err.message : "Không thể tải khóa học."));
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!course) return <Loading />;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">Sửa khóa học</h1>
      <CourseForm
        initialValue={course}
        submitLabel="Cập nhật"
        onSubmit={async (value) => {
          const lessons = value.chapters.flatMap((chapter) => chapter.lessons);
          await updateCourse(course.id, { ...course, ...value, lessons, totalLessons: lessons.length });
          navigate("/instructor/courses");
        }}
      />
    </div>
  );
}

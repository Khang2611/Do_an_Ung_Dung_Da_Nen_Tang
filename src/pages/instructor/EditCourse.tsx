import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseById, updateCourse } from "../../api/courseApi";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import { CourseForm } from "../../components/course/CourseForm";
import type { Course } from "../../types/course";

export function EditCourse() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourseById(id).then(setCourse).catch((err) => setError(err instanceof Error ? err.message : "Khong the tai khoa hoc."));
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!course) return <Loading />;

  return (
    <div>
      <PageHeader title="Sửa khóa học" description="Cập nhật thông tin khóa học, chương và bài học." />
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

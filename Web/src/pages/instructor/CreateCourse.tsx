import { useNavigate } from "react-router-dom";
import { createCourse } from "../../api/courseApi";
import { CourseForm } from "../../components/course/CourseForm";

export function CreateCourse() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">Tạo khóa học</h1>
      <CourseForm
        submitLabel="Lưu khóa học"
        onSubmit={async (value) => {
          const lessons = value.chapters.flatMap((chapter) => chapter.lessons);
          await createCourse({ ...value, lessons, totalLessons: lessons.length, duration: "Đang cập nhật", instructorName: "Giảng viên", rating: 0, studentsCount: 0 });
          navigate("/instructor/courses");
        }}
      />
    </div>
  );
}

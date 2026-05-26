import { useNavigate } from "react-router-dom";
import { createCourse } from "../../api/courseApi";
import { PageHeader } from "../../components/common/PageHeader";
import { CourseForm } from "../../components/course/CourseForm";

export function CreateCourse() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Tạo khóa học" description="Xây dựng thông tin, nội dung bài học và trạng thái xuất bản cho khóa học mới." />
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

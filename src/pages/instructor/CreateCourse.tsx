import { X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createCourse } from "../../api/courseApi";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { CourseForm } from "../../components/course/CourseForm";
import { showToast } from "../../components/common/Toast";

export function CreateCourse() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo khóa học"
        description="Xây dựng thông tin, nội dung bài học và trạng thái xuất bản cho khóa học mới."
        action={<Link to="/instructor/courses"><Button variant="secondary"><X size={16} />Hủy</Button></Link>}
      />
      <CourseForm
        submitLabel="Lưu khóa học"
        onSubmit={async (value) => {
          const lessons = value.chapters.flatMap((chapter) => chapter.lessons);
          await createCourse({
            ...value,
            lessons,
            totalLessons: lessons.length,
            duration: "Đang cập nhật",
            instructorName: "Giảng viên",
            rating: 0,
            studentsCount: 0,
          });
          showToast(value.status === "PENDING_REVIEW" ? "Đã tạo khóa học và gửi chờ duyệt." : "Đã lưu bản nháp khóa học.", "success");
          navigate("/instructor/courses");
        }}
      />
    </div>
  );
}

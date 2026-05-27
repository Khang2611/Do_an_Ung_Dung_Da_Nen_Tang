import { X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createCourse } from "../../api/courseApi";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { showToast } from "../../components/common/Toast";
import { CourseForm } from "../../components/course/CourseForm";

export function CreateCourse() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo khóa học"
        description="Tạo thông tin khóa học trước, sau đó hệ thống sẽ mở màn sửa khóa học để giảng viên tải video lên từng bài học."
        action={<Link to="/instructor/courses"><Button variant="secondary"><X size={16} />Hủy</Button></Link>}
      />
      <CourseForm
        submitLabel="Lưu và tải video"
        onSubmit={async (value) => {
          const lessons = value.chapters.flatMap((chapter) => chapter.lessons);
          const created = await createCourse({
            ...value,
            lessons,
            totalLessons: lessons.length,
            duration: "Đang cập nhật",
            instructorName: "Giảng viên",
            rating: 0,
            studentsCount: 0,
          });
          showToast("Đã tạo khóa học. Bạn có thể tải video lên từng bài học.", "success");
          navigate(`/instructor/courses/${created.id}/edit`);
        }}
      />
    </div>
  );
}

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
        title="Tao khoa hoc"
        description="Nhap thong tin khoa hoc, bai hoc, video va tai lieu dinh kem."
        action={<Link to="/instructor/courses"><Button variant="secondary"><X size={16} />Huy</Button></Link>}
      />
      <CourseForm
        submitLabel="Luu khoa hoc"
        onSubmit={async (value) => {
          const lessons = value.chapters.flatMap((chapter) => chapter.lessons);
          const created = await createCourse({
            ...value,
            lessons,
            totalLessons: lessons.length,
            duration: "Dang cap nhat",
            instructorName: "Giang vien",
            rating: 0,
            studentsCount: 0,
          });

          showToast(`Đã tạo khóa học "${created.title}".`, "success");
          navigate("/instructor/courses");
        }}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { getCourses } from "../../api/courseApi";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import { CourseCard } from "../../components/course/CourseCard";
import { CourseFilter } from "../../components/course/CourseFilter";
import type { Course, CourseFilters } from "../../types/course";

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<CourseFilters>({ category: "Tất cả", level: "Tất cả" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getCourses(filters)
      .then(setCourses)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải khóa học."))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title="Danh sách khóa học" description="Tìm kiếm khóa học phù hợp theo danh mục, trình độ và mục tiêu học tập của bạn." />
      <CourseFilter filters={filters} categories={["Tất cả", "Lập trình Web", "Backend", "Thiết kế"]} levels={["Tất cả", "Cơ bản", "Trung cấp", "Nâng cao"]} onChange={setFilters} />
      {loading ? <Loading /> : error ? <div className="mt-6"><ErrorMessage message={error} /></div> : courses.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
      ) : (
        <div className="mt-6"><EmptyState title="Không tìm thấy khóa học" description="Hãy thử đổi từ khóa, danh mục hoặc trình độ." /></div>
      )}
    </div>
  );
}

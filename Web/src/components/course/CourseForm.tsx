import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Chapter, Course } from "../../types/course";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";

type CourseFormValue = Pick<Course, "title" | "description" | "category" | "level" | "price" | "thumbnail" | "status" | "chapters">;

interface Props {
  initialValue?: Partial<Course>;
  submitLabel: string;
  onSubmit: (value: CourseFormValue) => Promise<void>;
}

const defaultChapter = (): Chapter => ({
  id: `ch-${Date.now()}`,
  title: "Chương mới",
  lessons: [{ id: `ls-${Date.now()}`, title: "Bài học mới", duration: "10 phút", content: "" }],
});

export function CourseForm({ initialValue, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<CourseFormValue>({
    title: initialValue?.title || "",
    description: initialValue?.description || "",
    category: initialValue?.category || "Lập trình Web",
    level: initialValue?.level || "Cơ bản",
    price: initialValue?.price || 0,
    thumbnail: initialValue?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    status: initialValue?.status || "draft",
    chapters: initialValue?.chapters?.length ? initialValue.chapters : [defaultChapter()],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const totalLessons = useMemo(() => form.chapters.flatMap((chapter) => chapter.lessons).length, [form.chapters]);

  const updateChapter = (chapterIndex: number, patch: Partial<Chapter>) => {
    setForm((current) => ({
      ...current,
      chapters: current.chapters.map((chapter, index) => (index === chapterIndex ? { ...chapter, ...patch } : chapter)),
    }));
  };

  const updateLesson = (chapterIndex: number, lessonIndex: number, patch: Partial<Chapter["lessons"][number]>) => {
    setForm((current) => ({
      ...current,
      chapters: current.chapters.map((chapter, index) =>
        index === chapterIndex
          ? { ...chapter, lessons: chapter.lessons.map((lesson, innerIndex) => (innerIndex === lessonIndex ? { ...lesson, ...patch } : lesson)) }
          : chapter,
      ),
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Tên khóa học không được rỗng.");
    if (!form.description.trim()) return setError("Mô tả khóa học không được rỗng.");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu khóa học.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-5xl">
      {error && <div className="mb-5"><ErrorMessage title="Không thể lưu" message={error} /></div>}
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <Input label="Tên khóa học" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input label="Danh mục" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <Input label="Trình độ" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
        <Input label="Giá" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <Input label="Thumbnail URL" className="sm:col-span-2" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả</span>
          <textarea className="min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Trạng thái</span>
          <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Bản nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="published">Đã xuất bản</option>
          </select>
        </label>
        <div className="flex items-end text-sm text-slate-500">Tổng số bài học: <strong className="ml-1 text-slate-900">{totalLessons}</strong></div>
      </div>

      <div className="mt-6 space-y-4">
        {form.chapters.map((chapter, chapterIndex) => (
          <section key={chapter.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Input className="min-w-0 flex-1" value={chapter.title} onChange={(e) => updateChapter(chapterIndex, { title: e.target.value })} />
              <Button type="button" variant="danger" onClick={() => setForm({ ...form, chapters: form.chapters.filter((_, index) => index !== chapterIndex) })}>
                <Trash2 size={16} /> Xóa chương
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {chapter.lessons.map((lesson, lessonIndex) => (
                <div key={lesson.id} className="grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_140px_auto]">
                  <Input placeholder="Tên bài học" value={lesson.title} onChange={(e) => updateLesson(chapterIndex, lessonIndex, { title: e.target.value })} />
                  <Input placeholder="Thời lượng" value={lesson.duration} onChange={(e) => updateLesson(chapterIndex, lessonIndex, { duration: e.target.value })} />
                  <Button type="button" variant="ghost" onClick={() => updateChapter(chapterIndex, { lessons: chapter.lessons.filter((_, index) => index !== lessonIndex) })}>
                    <Trash2 size={16} />
                  </Button>
                  <textarea className="rounded-lg border border-slate-200 p-3 text-sm outline-none md:col-span-3" placeholder="Nội dung bài học" value={lesson.content || ""} onChange={(e) => updateLesson(chapterIndex, lessonIndex, { content: e.target.value })} />
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" className="mt-4" onClick={() => updateChapter(chapterIndex, { lessons: [...chapter.lessons, { id: `ls-${Date.now()}`, title: "Bài học mới", duration: "10 phút", content: "" }] })}>
              <Plus size={16} /> Thêm bài học
            </Button>
          </section>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={() => setForm({ ...form, chapters: [...form.chapters, defaultChapter()] })}>
          <Plus size={16} /> Thêm chương
        </Button>
        <Button disabled={saving}>{saving ? "Đang lưu..." : submitLabel}</Button>
      </div>
    </form>
  );
}

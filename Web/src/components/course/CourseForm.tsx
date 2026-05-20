import { BookOpen, FileText, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Controller, useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import type { Chapter, Course } from "../../types/course";
import { formatStatus } from "../../utils/format";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";

type CourseFormValue = Pick<Course, "title" | "description" | "category" | "level" | "price" | "thumbnail" | "status" | "chapters">;

interface Props {
  initialValue?: Partial<Course>;
  submitLabel: string;
  onSubmit: (value: CourseFormValue) => Promise<void>;
}

const defaultLesson = () => ({ id: `ls-${Date.now()}-${Math.random()}`, title: "", duration: "10", content: "" });

const defaultChapter = (): Chapter => ({
  id: `ch-${Date.now()}-${Math.random()}`,
  title: "",
  lessons: [defaultLesson()],
});

function normalizeDuration(duration?: string) {
  const match = String(duration || "").match(/\d+/);
  return match ? match[0] : "";
}

function LessonFields({
  chapterIndex,
  control,
  register,
  errors,
}: {
  chapterIndex: number;
  control: Control<CourseFormValue>;
  register: UseFormRegister<CourseFormValue>;
  errors: FieldErrors<CourseFormValue>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: `chapters.${chapterIndex}.lessons` });
  const lessonErrors = errors.chapters?.[chapterIndex]?.lessons;

  return (
    <div className="mt-4 space-y-3">
      {fields.map((lesson, lessonIndex) => (
        <div key={lesson.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_150px_auto]">
            <Input
              placeholder="Tên bài học"
              error={lessonErrors?.[lessonIndex]?.title?.message}
              {...register(`chapters.${chapterIndex}.lessons.${lessonIndex}.title`, { required: "Vui lòng nhập tên bài học." })}
            />
            <Input
              placeholder="Thời lượng (phút)"
              type="number"
              min={1}
              error={lessonErrors?.[lessonIndex]?.duration?.message}
              {...register(`chapters.${chapterIndex}.lessons.${lessonIndex}.duration`, {
                required: "Vui lòng nhập thời lượng.",
                validate: (value) => Number(value) > 0 || "Thời lượng phải là số lớn hơn 0.",
              })}
            />
            <Button type="button" variant="ghost" className="h-11 px-3 text-rose-600 hover:bg-rose-50" onClick={() => remove(lessonIndex)} disabled={fields.length === 1} title="Xóa bài học">
              <Trash2 size={17} />
            </Button>
          </div>
          <textarea
            className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
            placeholder="Nội dung bài học"
            {...register(`chapters.${chapterIndex}.lessons.${lessonIndex}.content`)}
          />
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => append(defaultLesson())}>
        <Plus size={16} /> Thêm bài học
      </Button>
    </div>
  );
}

export function CourseForm({ initialValue, submitLabel, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValue>({
    defaultValues: {
      title: initialValue?.title || "",
      description: initialValue?.description || "",
      category: initialValue?.category || "Lập trình Web",
      level: initialValue?.level || "Cơ bản",
      price: initialValue?.price ?? 0,
      thumbnail: initialValue?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      status: initialValue?.status || "draft",
      chapters: initialValue?.chapters?.length
        ? initialValue.chapters.map((chapter) => ({
            ...chapter,
            title: chapter.title || "",
            lessons: chapter.lessons.map((lesson) => ({ ...lesson, duration: normalizeDuration(lesson.duration) })),
          }))
        : [defaultChapter()],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "chapters" });
  const totalLessons = useMemo(() => fields.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0), [fields]);

  const submit = async (values: CourseFormValue) => {
    try {
      await onSubmit({
        ...values,
        price: Number(values.price),
        chapters: values.chapters.map((chapter) => ({
          ...chapter,
          title: chapter.title.trim(),
          lessons: chapter.lessons.map((lesson) => ({
            ...lesson,
            title: lesson.title.trim(),
            duration: `${Number(lesson.duration)} phút`,
          })),
        })),
      });
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Không thể lưu khóa học." });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-6xl space-y-6">
      {errors.root?.message && <ErrorMessage title="Không thể lưu" message={errors.root.message} />}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><FileText size={20} /></div>
          <div>
            <h2 className="font-bold text-slate-950">Thông tin khóa học</h2>
            <p className="text-sm text-slate-500">Nhập thông tin hiển thị trong danh sách và trang chi tiết.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tên khóa học" error={errors.title?.message} {...register("title", { required: "Vui lòng nhập tên khóa học." })} />
          <Input label="Danh mục" error={errors.category?.message} {...register("category", { required: "Vui lòng nhập danh mục." })} />
          <Input label="Trình độ" {...register("level")} />
          <Input
            label="Giá"
            type="number"
            min={0}
            error={errors.price?.message}
            {...register("price", {
              valueAsNumber: true,
              validate: (value) => Number(value) >= 0 || "Giá phải là số và lớn hơn hoặc bằng 0.",
            })}
          />
          <Input
            label="Thumbnail URL"
            className="sm:col-span-2"
            error={errors.thumbnail?.message}
            {...register("thumbnail", {
              validate: (value) => {
                if (!value) return true;
                try {
                  new URL(value);
                  return true;
                } catch {
                  return "Thumbnail phải là URL hợp lệ.";
                }
              },
            })}
          />
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả</span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
              {...register("description", { required: "Vui lòng nhập mô tả khóa học." })}
            />
            {errors.description?.message && <span className="mt-1 block text-sm text-rose-600">{errors.description.message}</span>}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><BookOpen size={20} /></div>
            <div>
              <h2 className="font-bold text-slate-950">Nội dung khóa học</h2>
              <p className="text-sm text-slate-500">Tổ chức chương và bài học. Tổng số bài: <strong className="text-slate-900">{totalLessons}</strong></p>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={() => append(defaultChapter())}>
            <Plus size={16} /> Thêm chương
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((chapter, chapterIndex) => (
            <div key={chapter.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <Input
                    label={`Chương ${chapterIndex + 1}`}
                    placeholder="Tên chương"
                    error={errors.chapters?.[chapterIndex]?.title?.message}
                    {...register(`chapters.${chapterIndex}.title`, { required: "Vui lòng nhập tên chương." })}
                  />
                </div>
                <Button type="button" variant="danger" className="mt-6" onClick={() => remove(chapterIndex)} disabled={fields.length === 1}>
                  <Trash2 size={16} /> Xóa chương
                </Button>
              </div>
              <LessonFields chapterIndex={chapterIndex} control={control} register={register} errors={errors} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-950">Trạng thái xuất bản</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[260px_1fr]">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Trạng thái</span>
                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25" {...field}>
                  <option value="draft">{formatStatus("draft")}</option>
                  <option value="pending">{formatStatus("pending")}</option>
                  <option value="published">{formatStatus("published")}</option>
                </select>
              </label>
            )}
          />
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Chọn bản nháp khi đang biên soạn, chờ duyệt khi gửi quản trị viên, hoặc đã xuất bản khi khóa học sẵn sàng.</div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : submitLabel}</Button>
      </div>
    </form>
  );
}

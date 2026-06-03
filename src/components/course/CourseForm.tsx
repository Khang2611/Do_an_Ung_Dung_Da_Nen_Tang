import { BookOpen, CheckCircle2, FileText, Image, Plus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { createCategory, getCategories, type CategoryItem } from "../../api/categoryApi";
import type { Chapter, Course } from "../../types/course";
import { formatCurrency } from "../../utils/format";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";
import { VideoUploadWidget } from "../video/VideoUploadWidget";
import { ResourceUploadWidget } from "./ResourceUploadWidget";

type CourseFormValue = Pick<Course, "title" | "description" | "category" | "categoryId" | "level" | "price" | "thumbnail" | "chapters">;

interface Props {
  initialValue?: Partial<Course>;
  submitLabel?: string;
  onSubmit: (value: CourseFormValue) => Promise<void>;
}

const fallbackThumb = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";
const MAX_THUMBNAIL_SIZE = 3 * 1024 * 1024;
const defaultLesson = () => ({ id: `ls-${Date.now()}-${Math.random()}`, title: "", duration: "10", content: "", description: "", isPreview: false, hasVideo: false, videoStatus: "missing" as const, videoUrl: "", resources: [], pendingResourceFiles: [] });
const defaultChapter = (): Chapter => ({ id: `ch-${Date.now()}-${Math.random()}`, title: "", lessons: [defaultLesson()] });

function normalizeDuration(duration?: string) {
  const match = String(duration || "").match(/\d+/);
  return match ? match[0] : "10";
}

function getVideoCount(chapters: Chapter[] = []) {
  const lessons = chapters.flatMap((chapter) => chapter.lessons || []);
  return lessons.filter((lesson) => lesson.hasVideo || lesson.videoStatus === "ready" || lesson.videoUrl).length;
}

function LessonFields({
  chapterIndex,
  control,
  register,
  setValue,
  errors,
}: {
  chapterIndex: number;
  control: Control<CourseFormValue>;
  register: UseFormRegister<CourseFormValue>;
  setValue: UseFormSetValue<CourseFormValue>;
  errors: FieldErrors<CourseFormValue>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: `chapters.${chapterIndex}.lessons`, keyName: "fieldId" });
  const lessonErrors = errors.chapters?.[chapterIndex]?.lessons;

  return (
    <div className="mt-4 space-y-3">
      {fields.map((lesson, lessonIndex) => (
        <div key={lesson.fieldId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_minmax(240px,320px)_auto]">
            <Input
              label="Tên bài học"
              placeholder="Ví dụ: JSX và Props"
              error={lessonErrors?.[lessonIndex]?.title?.message}
              {...register(`chapters.${chapterIndex}.lessons.${lessonIndex}.title`, { required: "Vui lòng nhập tên bài học." })}
            />
            <input type="hidden" {...register(`chapters.${chapterIndex}.lessons.${lessonIndex}.duration`)} />
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Video</span>
              <Badge variant={lesson.hasVideo ? "success" : "slate"}>{lesson.hasVideo ? "Đã upload" : "Chưa có video"}</Badge>
              <Controller
                control={control}
                name={`chapters.${chapterIndex}.lessons.${lessonIndex}.videoUrl`}
                render={({ field }) => (
                  <VideoUploadWidget
                    lessonId={String(lesson.id)}
                    lessonTitle={lesson.title || `Bài ${lessonIndex + 1}`}
                    initialVideoUrl={field.value}
                    initialPendingFile={lesson.pendingVideoFile}
                    onUploadSuccess={(url) => {
                      field.onChange(url);
                      setValue(`chapters.${chapterIndex}.lessons.${lessonIndex}.hasVideo`, Boolean(url), { shouldDirty: true });
                      setValue(`chapters.${chapterIndex}.lessons.${lessonIndex}.videoStatus`, url ? "ready" : "missing", { shouldDirty: true });
                    }}
                    onPendingFileSelected={(file) => {
                      setValue(`chapters.${chapterIndex}.lessons.${lessonIndex}.pendingVideoFile`, file || undefined, { shouldDirty: true });
                      setValue(`chapters.${chapterIndex}.lessons.${lessonIndex}.hasVideo`, Boolean(file || field.value), { shouldDirty: true });
                      setValue(`chapters.${chapterIndex}.lessons.${lessonIndex}.videoStatus`, file || field.value ? "ready" : "missing", { shouldDirty: true });
                    }}
                    onClear={() => {
                      field.onChange("");
                      setValue(`chapters.${chapterIndex}.lessons.${lessonIndex}.pendingVideoFile`, undefined, { shouldDirty: true });
                      setValue(`chapters.${chapterIndex}.lessons.${lessonIndex}.hasVideo`, false, { shouldDirty: true });
                      setValue(`chapters.${chapterIndex}.lessons.${lessonIndex}.videoStatus`, "missing", { shouldDirty: true });
                    }}
                  />
                )}
              />
            </div>
            <div className="flex items-start gap-2 pt-7">
              <Button type="button" variant="ghost" className="h-11 px-3 text-rose-600 hover:bg-rose-50" onClick={() => remove(lessonIndex)} disabled={fields.length === 1}>
                <Trash2 size={17} />
              </Button>
            </div>
          </div>
          <textarea
            className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
            placeholder="Mô tả ngắn hoặc nội dung bài học"
            {...register(`chapters.${chapterIndex}.lessons.${lessonIndex}.content`)}
          />
          <Controller
            control={control}
            name={`chapters.${chapterIndex}.lessons.${lessonIndex}.resources`}
            render={({ field }) => (
              <ResourceUploadWidget
                lessonId={String(lesson.id)}
                resources={field.value || []}
                pendingFiles={lesson.pendingResourceFiles || []}
                onResourcesChange={(resources) => field.onChange(resources)}
                onPendingFilesChange={(files) => setValue(`chapters.${chapterIndex}.lessons.${lessonIndex}.pendingResourceFiles`, files, { shouldDirty: true })}
              />
            )}
          />
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" {...register(`chapters.${chapterIndex}.lessons.${lessonIndex}.isPreview`)} />
            Cho phép học thử miễn phí
          </label>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => append(defaultLesson())}>
        <Plus size={16} /> Thêm bài học
      </Button>
    </div>
  );
}

export function CourseForm({ initialValue, submitLabel = "Lưu khóa học", onSubmit }: Props) {
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValue>({
    defaultValues: {
      title: initialValue?.title || "",
      description: initialValue?.description || "",
      category: initialValue?.category || "Lập trình Web",
      categoryId: initialValue?.categoryId,
      level: initialValue?.level || "Cơ bản",
      price: initialValue?.price ?? 0,
      thumbnail: initialValue?.thumbnail || fallbackThumb,
      chapters: initialValue?.chapters?.length
        ? initialValue.chapters.map((chapter) => ({
            ...chapter,
            title: chapter.title || "",
            lessons: chapter.lessons.map((lesson) => ({
              ...lesson,
              duration: normalizeDuration(lesson.duration),
              description: lesson.description || lesson.content || "",
              videoUrl: lesson.videoUrl || "",
              pendingVideoFile: lesson.pendingVideoFile,
              resources: lesson.resources || [],
              pendingResourceFiles: lesson.pendingResourceFiles || [],
              hasVideo: Boolean(lesson.hasVideo || lesson.videoStatus === "ready" || lesson.pendingVideoFile),
              videoStatus: lesson.videoStatus || (lesson.hasVideo ? "ready" : "missing"),
            })),
          }))
        : [defaultChapter()],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "chapters", keyName: "fieldId" });
  const values = useWatch({ control });
  const chapters = (values.chapters || []) as Chapter[];
  const totalLessons = chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0);
  const totalMinutes = chapters.flatMap((chapter) => chapter.lessons || []).reduce((sum, lesson) => sum + (Number(String(lesson.duration).match(/\d+/)?.[0]) || 0), 0);
  const videoCount = getVideoCount(chapters);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!categories.length || values.categoryId) return;
    const match = categories.find((item) => item.name === values.category);
    if (match) setValue("categoryId", match.categoryId, { shouldDirty: false, shouldValidate: true });
  }, [categories, setValue, values.category, values.categoryId]);

  const selectCategory = (category?: CategoryItem) => {
    setValue("categoryId", category?.categoryId, { shouldDirty: true, shouldValidate: true });
    setValue("category", category?.name || "", { shouldDirty: true, shouldValidate: true });
    if (category) clearErrors("categoryId");
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setError("categoryId", { message: "Nhập tên danh mục mới hoặc chọn danh mục có sẵn." });
      return;
    }

    const existing = categories.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      selectCategory(existing);
      setNewCategoryName("");
      return;
    }

    try {
      setCreatingCategory(true);
      const created = await createCategory(name);
      setCategories((items) => {
        if (items.some((item) => item.categoryId === created.categoryId)) return items;
        return [...items, created];
      });
      selectCategory(created);
      setNewCategoryName("");
    } catch (err) {
      setError("categoryId", { message: err instanceof Error ? err.message : "Không thể tạo danh mục." });
    } finally {
      setCreatingCategory(false);
    }
  };

  const checklist = useMemo(
    () => [
      ["Có tên khóa học", Boolean(values.title?.trim())],
      ["Có mô tả", Boolean(values.description?.trim())],
      ["Có ít nhất 1 bài học", totalLessons > 0],
      ["Có thumbnail", Boolean(values.thumbnail?.trim())],
      ["Có giá hợp lệ", Number(values.price) >= 0],
    ],
    [values.title, values.description, values.thumbnail, values.price, totalLessons],
  );

  const submit = async (formValues: CourseFormValue) => {
    try {
      if (!formValues.chapters?.length) {
        setError("root", { message: "Khóa học cần có ít nhất 1 chương." });
        return;
      }
      const hasLesson = formValues.chapters.some((chapter) => chapter.lessons?.length);
      if (!hasLesson) {
        setError("root", { message: "Khóa học cần có ít nhất 1 bài học." });
        return;
      }
      if (!formValues.categoryId) {
        setError("categoryId", { message: "Vui lòng chọn danh mục." });
        return;
      }
      await onSubmit({
        ...formValues,
        price: Number(formValues.price),
        chapters: formValues.chapters.map((chapter) => ({
          ...chapter,
          title: chapter.title.trim(),
          lessons: chapter.lessons.map((lesson) => ({
            ...lesson,
            title: lesson.title.trim(),
            duration: `${Number(lesson.duration || 10)} phút`,
            description: lesson.description || lesson.content || "",
            videoUrl: lesson.videoUrl || "",
            pendingVideoFile: lesson.pendingVideoFile,
            resources: lesson.resources || [],
            pendingResourceFiles: lesson.pendingResourceFiles || [],
            hasVideo: Boolean(lesson.hasVideo || lesson.videoUrl || lesson.pendingVideoFile),
            videoStatus: lesson.videoUrl || lesson.pendingVideoFile ? "ready" : lesson.videoStatus,
          })),
        })),
      });
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Không thể lưu khóa học." });
    }
  };

  const handleThumbnailFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("thumbnail", { message: "Vui lòng chọn file ảnh." });
      return;
    }
    if (file.size > MAX_THUMBNAIL_SIZE) {
      setError("thumbnail", { message: "Ảnh thumbnail không được vượt quá 3MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setValue("thumbnail", String(reader.result || ""), { shouldDirty: true, shouldValidate: true });
      clearErrors("thumbnail");
    };
    reader.onerror = () => setError("thumbnail", { message: "Không thể đọc file ảnh." });
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        {errors.root?.message && <ErrorMessage title="Không thể lưu" message={errors.root.message} />}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><FileText size={20} /></div>
            <div>
              <h2 className="font-bold text-slate-950">Thông tin cơ bản</h2>
              <p className="text-sm text-slate-500">Thiết lập thông tin hiển thị trên marketplace và trang chi tiết.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Tên khóa học" error={errors.title?.message} {...register("title", { required: "Vui lòng nhập tên khóa học." })} />
            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Danh mục</span>
              <input type="hidden" {...register("categoryId", { valueAsNumber: true, required: "Vui lòng chọn danh mục." })} />
              <select
                value={values.categoryId ? String(values.categoryId) : ""}
                onChange={(event) => {
                  const selected = categories.find((item) => String(item.categoryId) === event.target.value);
                  selectCategory(selected);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleCreateCategory();
                    }
                  }}
                  placeholder="Hoặc nhập danh mục mới"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                />
                <Button type="button" variant="secondary" size="sm" disabled={creatingCategory} onClick={() => void handleCreateCategory()}>
                  <Plus size={14} /> {creatingCategory ? "Đang tạo" : "Tạo"}
                </Button>
              </div>
              {errors.categoryId?.message && <span className="mt-1 block text-sm text-rose-600">{errors.categoryId.message}</span>}
            </label>
            <Input label="Trình độ" {...register("level")} />
            <Input
              label="Giá"
              type="number"
              min={0}
              error={errors.price?.message}
              {...register("price", {
                valueAsNumber: true,
                validate: (value) => Number(value) >= 0 || "Giá phải lớn hơn hoặc bằng 0.",
              })}
            />
            <input type="hidden" {...register("thumbnail", { required: "Vui lòng tải thumbnail." })} />
            <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleThumbnailFile(event.target.files?.[0])} />
            <div className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Thumbnail khóa học</span>
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <UploadCloud size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900">Tải ảnh từ máy</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-500">JPG, PNG hoặc WEBP, tối đa 3MB. Ảnh sẽ được lưu cùng dữ liệu khóa học.</div>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => thumbnailInputRef.current?.click()}>
                  <Image size={14} /> Chọn ảnh
                </Button>
              </div>
              {errors.thumbnail?.message && <span className="mt-1 block text-sm text-rose-600">{errors.thumbnail.message}</span>}
            </div>
            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả chi tiết</span>
              <textarea
                className="min-h-32 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                {...register("description", { required: "Vui lòng nhập mô tả khóa học." })}
              />
              {errors.description?.message && <span className="mt-1 block text-sm text-rose-600">{errors.description.message}</span>}
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><BookOpen size={20} /></div>
              <div>
                <h2 className="font-bold text-slate-950">Nội dung khóa học</h2>
                <p className="text-sm text-slate-500">{fields.length} chương · {totalLessons} bài học · {videoCount}/{totalLessons || 0} video đã upload</p>
              </div>
            </div>
            <Button type="button" variant="secondary" onClick={() => append(defaultChapter())}><Plus size={16} /> Thêm chương</Button>
          </div>

          <div className="space-y-4">
            {fields.map((chapter, chapterIndex) => (
              <div key={chapter.fieldId} className="rounded-2xl border border-slate-200 p-4">
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
                <LessonFields chapterIndex={chapterIndex} control={control} register={register} setValue={setValue} errors={errors} />
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : submitLabel}</Button>
        </div>
      </div>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-8">
        <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100">
          <img src={values.thumbnail || fallbackThumb} alt={values.title || "Preview"} className="h-full w-full object-cover" />
        </div>
        <div className="mt-4">
          <h3 className="mt-3 line-clamp-2 text-lg font-extrabold text-slate-950">{values.title || "Tên khóa học"}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{values.category || "Danh mục"} · {values.level || "Trình độ"}</p>
          <div className="mt-3 text-2xl font-extrabold text-indigo-700">{formatCurrency(Number(values.price || 0))}</div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-slate-50 p-3"><div className="font-bold text-slate-950">{fields.length}</div><div className="text-slate-500">Chương</div></div>
          <div className="rounded-2xl bg-slate-50 p-3"><div className="font-bold text-slate-950">{totalLessons}</div><div className="text-slate-500">Bài học</div></div>
          <div className="rounded-2xl bg-slate-50 p-3"><div className="font-bold text-slate-950">{totalMinutes}</div><div className="text-slate-500">Phút</div></div>
          <div className="rounded-2xl bg-slate-50 p-3"><div className="font-bold text-slate-950">{videoCount}</div><div className="text-slate-500">Video</div></div>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="font-bold text-slate-950">Checklist hoàn thiện</h4>
          <div className="mt-3 space-y-2">
            {checklist.map(([label, done]) => (
              <div key={String(label)} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <CheckCircle2 size={16} className={done ? "text-emerald-600" : "text-slate-300"} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </form>
  );
}

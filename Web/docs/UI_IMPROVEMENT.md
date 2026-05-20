# Tiến độ cải thiện UI EduFlow

## Màn hình đã cải thiện

- Login và Register: bố cục hiện đại, card form rõ ràng, responsive, tài khoản demo dễ đọc.
- CourseList, CourseDetail và Learning: card khóa học, hero chi tiết, sidebar bài học, progress bar và CTA được làm lại.
- Student Dashboard, MyCourses và Profile: hero chào người dùng, stat card, profile card và badge vai trò.
- Instructor Dashboard, Instructor Courses, Create/Edit Course: dashboard, bảng quản lý, form chia section thông tin/nội dung/trạng thái.
- Admin Dashboard, Manage Users, Manage Courses, Manage Enrollments: stat card, bảng có hover, overflow-x, badge trạng thái/vai trò và nút thao tác.

## Component dùng chung đã thêm/sửa

- `Button.tsx`
- `Input.tsx`
- `Badge.tsx`
- `StatCard.tsx`
- `PageHeader.tsx`
- `ErrorMessage.tsx`
- `EmptyState.tsx`
- `Loading.tsx`

## Form đã thêm React Hook Form validate

- `Login.tsx`: username/email bắt buộc, password bắt buộc và tối thiểu 6 ký tự.
- `Register.tsx`: họ tên, email, username, password, confirm password và role.
- `CourseForm.tsx`: title, description, price, category, thumbnail URL, chương, bài học và duration.

## Việt hóa status/role

Đã bổ sung helper trong `src/utils/format.ts`:

- `formatRole()`
- `formatStatus()`
- `getStatusBadgeVariant()`
- `formatCurrency()`
- `formatDuration()`

Các trạng thái/vai trò hiển thị đã được chuyển sang tiếng Việt: Người học, Giảng viên, Quản trị viên, Đã xuất bản, Chờ duyệt, Bản nháp, Đã duyệt, Từ chối, Hoạt động, Tạm khóa.

## Việc backend làm ở bước sau

- Kết nối và kiểm thử API thật cho auth, course, enrollment, user.
- Đồng bộ validate backend với validate frontend.
- Xử lý upload thumbnail/video thật nếu backend hỗ trợ.
- Hoàn thiện progress học tập theo enrollment/progress API thật.

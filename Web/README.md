# EduFlow Web Frontend

Web frontend riêng cho hệ thống quản lý khóa học online, dùng ReactJS + Vite + TypeScript + Tailwind CSS.

## Chạy bằng mock data

Tạo file `.env` trong thư mục `Web`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=true
```

Sau đó chạy:

```bash
npm install
npm run dev
```

## Chạy với backend thật

Tạo hoặc sửa file `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=false
```

Khi `VITE_USE_MOCK=false`, app sẽ gọi backend thật và hiển thị lỗi API nếu backend trả lỗi. App không tự fallback sang mock data.

## Tài khoản mock demo

- Student: `student@eduflow.vn` / `123456`
- Instructor: `instructor@eduflow.vn` / `123456`
- Admin: `admin@eduflow.vn` / `123456`

## Route chính

- Public: `/`, `/login`, `/register`, `/courses`, `/courses/:id`
- Student: `/student`, `/student/my-courses`, `/student/learning/:courseId`, `/student/profile`
- Instructor: `/instructor`, `/instructor/courses`, `/instructor/courses/create`, `/instructor/courses/:id/edit`
- Admin: `/admin`, `/admin/users`, `/admin/courses`, `/admin/enrollments`
- Error: `/403`, `*` hiển thị trang 404

## API backend cần cung cấp

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `GET /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/enrollments/:courseId`
- `GET /api/enrollments/me`
- `GET /api/enrollments/me/:courseId`
- `PATCH /api/enrollments/:courseId/progress`
- `GET /api/enrollments`
- `PATCH /api/enrollments/:id/approve`
- `PATCH /api/enrollments/:id/reject`

## Ghi chú response đăng nhập

`authApi` đã normalize các dạng response phổ biến:

- `{ token, user }`
- `{ accessToken, user }`
- `{ data: { token, user } }`
- `{ result: { token, user } }`
- `{ token, id, username, email, fullName, role }`

Token được đọc từ `token`, `accessToken`, `access_token`, hoặc `jwt`.

import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../components/layout/AdminLayout";
import { InstructorLayout } from "../components/layout/InstructorLayout";
import { MainLayout } from "../components/layout/MainLayout";
import { ProtectedRoute } from "../components/route/ProtectedRoute";
import { RoleRoute } from "../components/route/RoleRoute";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { Forbidden } from "../pages/Forbidden";
import { NotFound } from "../pages/NotFound";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { ManageCourses } from "../pages/admin/ManageCourses";
import { ManageEnrollments } from "../pages/admin/ManageEnrollments";
import { ManageUsers } from "../pages/admin/ManageUsers";
import { CreateCourse } from "../pages/instructor/CreateCourse";
import { EditCourse } from "../pages/instructor/EditCourse";
import { InstructorCourses } from "../pages/instructor/InstructorCourses";
import { InstructorDashboard } from "../pages/instructor/InstructorDashboard";
import { CourseDetail } from "../pages/student/CourseDetail";
import { CourseList } from "../pages/student/CourseList";
import { Home } from "../pages/student/Home";
import { Learning } from "../pages/student/Learning";
import { MyCourses } from "../pages/student/MyCourses";
import { PaymentFailed } from "../pages/student/PaymentFailed";
import { PaymentReturn } from "../pages/student/PaymentReturn";
import { PaymentSuccess } from "../pages/student/PaymentSuccess";
import { Profile } from "../pages/student/Profile";
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="/403" element={<Forbidden />} />
      <Route element={<MainLayout />}>
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/student/profile" element={<Navigate to="/profile" replace />} />
          <Route element={<RoleRoute allowed={["student"]} />}>
            <Route path="/student" element={<Home />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/student/my-courses" element={<MyCourses />} />
            <Route path="/student/learning/:courseId" element={<Learning />} />
            <Route path="/student/learning/:courseId/lesson/:lessonId" element={<Learning />} />
          </Route>
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowed={["instructor"]} />}>
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<InstructorDashboard />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCourses />} />
            <Route path="courses/create" element={<CreateCourse />} />
            <Route path="courses/:id/edit" element={<EditCourse />} />
            <Route path="courses/:courseId/lessons" element={<Navigate to="/instructor/courses" replace />} />
          </Route>
        </Route>
        <Route element={<RoleRoute allowed={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="enrollments" element={<ManageEnrollments />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

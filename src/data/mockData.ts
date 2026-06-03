import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";
import type { Course, Enrollment, Chapter, Lesson, PaymentOrder } from "../types/course";
import type { User } from "../types/user";

export const mockUsers: User[] = [
  {
    id: "u1",
    fullName: "Nguyễn Minh Anh",
    email: "student@eduflow.vn",
    username: "student",
    role: "student",
    status: "active",
    createdAt: "2026-04-02",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u2",
    fullName: "Trần Quốc Huy",
    email: "instructor@eduflow.vn",
    username: "instructor",
    role: "instructor",
    status: "active",
    createdAt: "2026-03-12",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u3",
    fullName: "Lê Thanh Admin",
    email: "admin@eduflow.vn",
    username: "admin",
    role: "admin",
    status: "active",
    createdAt: "2026-02-18",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u4",
    fullName: "Phạm Gia Bảo",
    email: "bao@student.vn",
    username: "bao",
    role: "student",
    status: "active",
    createdAt: "2026-05-01",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u5",
    fullName: "Nguyễn Hải Nam",
    email: "nam@instructor.vn",
    username: "nam",
    role: "instructor",
    status: "active",
    createdAt: "2026-01-20",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u6",
    fullName: "Hoàng Linh",
    email: "linh@instructor.vn",
    username: "linh",
    role: "instructor",
    status: "active",
    createdAt: "2026-03-05",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u7",
    fullName: "Lê Thị Mai",
    email: "mai@student.vn",
    username: "mai",
    role: "student",
    status: "active",
    createdAt: "2026-05-10",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u8",
    fullName: "Vũ Hoàng Long",
    email: "long@student.vn",
    username: "long",
    role: "student",
    status: "locked",
    createdAt: "2026-04-15",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u9",
    fullName: "Đặng Minh Tuấn",
    email: "tuan@instructor.vn",
    username: "tuan",
    role: "instructor",
    status: "locked",
    createdAt: "2026-02-10",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u10",
    fullName: "Trần Thu Thảo",
    email: "thao@student.vn",
    username: "thao",
    role: "student",
    status: "active",
    createdAt: "2026-05-18",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u11",
    fullName: "Phan Anh Tuấn",
    email: "tuan.phan@student.vn",
    username: "tuanphan",
    role: "student",
    status: "active",
    createdAt: "2026-05-20",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: "u12",
    fullName: "Nguyễn Thị Quản Lý",
    email: "quanly@eduflow.vn",
    username: "quanly",
    role: "admin",
    status: "active",
    createdAt: "2026-01-05",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80",
  },
];

mockUsers.splice(
  0,
  mockUsers.length,
  {
    id: "u3",
    fullName: "Lê Thanh Admin",
    email: "admin@eduflow.vn",
    username: "admin",
    role: "admin",
    status: "active",
    createdAt: "2026-02-18",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    recentActivities: ["Đăng nhập hệ thống admin", "Duyệt khóa học mới"],
  },
  {
    id: "u1",
    fullName: "Nguyễn Minh Anh",
    email: "student@eduflow.vn",
    username: "student",
    role: "student",
    status: "active",
    createdAt: "2026-04-02",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    enrolledCourses: 4,
    recentActivities: ["Tiếp tục học ReactJS", "Đăng ký khóa Spring Boot"],
  },
  {
    id: "u4",
    fullName: "Phạm Gia Bảo",
    email: "bao@student.vn",
    username: "bao",
    role: "student",
    status: "active",
    createdAt: "2026-05-01",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    enrolledCourses: 2,
  },
  {
    id: "u7",
    fullName: "Lê Thị Mai",
    email: "mai@student.vn",
    username: "mai",
    role: "student",
    status: "active",
    createdAt: "2026-05-10",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    enrolledCourses: 2,
  },
  {
    id: "u8",
    fullName: "Vũ Hoàng Long",
    email: "long@student.vn",
    username: "long",
    role: "student",
    status: "locked",
    createdAt: "2026-04-15",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
    enrolledCourses: 2,
  },
  {
    id: "u10",
    fullName: "Trần Thu Thảo",
    email: "thao@student.vn",
    username: "thao",
    role: "student",
    status: "active",
    createdAt: "2026-05-18",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
    enrolledCourses: 1,
  },
  {
    id: "u2",
    fullName: "Trần Quốc Huy",
    email: "instructor@eduflow.vn",
    username: "instructor",
    role: "instructor",
    status: "active",
    createdAt: "2026-03-12",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    teachingCourses: 3,
    recentActivities: ["Cập nhật bài học ReactJS", "Phản hồi học viên"],
  },
  {
    id: "u5",
    fullName: "Nguyễn Hải Nam",
    email: "nam@instructor.vn",
    username: "nam",
    role: "instructor",
    status: "active",
    createdAt: "2026-01-20",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    teachingCourses: 3,
  },
  {
    id: "u6",
    fullName: "Hoàng Linh",
    email: "linh@instructor.vn",
    username: "linh",
    role: "instructor",
    status: "active",
    createdAt: "2026-03-05",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    teachingCourses: 2,
  },
  {
    id: "u9",
    fullName: "Đặng Minh Tuấn",
    email: "tuan@instructor.vn",
    username: "tuan",
    role: "instructor",
    status: "locked",
    createdAt: "2026-02-10",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    teachingCourses: 0,
  },
);

export const mockCourses: Course[] = [
  {
    id: "c1",
    title: "ReactJS từ cơ bản đến thực chiến",
    description: "Xây dựng nền tảng React vững chắc, làm việc với component, state, routing và gọi API trong dự án thực tế.",
    category: "Lập trình Web",
    level: "Cơ bản",
    price: 499000,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Trần Quốc Huy",
    totalLessons: 6,
    duration: "4 giờ",
    rating: 4.8,
    studentsCount: 1260,
    status: "published",
    progress: 58,
    chapters: [
      {
        id: "ch1",
        title: "Khởi động với React",
        lessons: [
          { id: "l1", title: "React là gì?", duration: "12 phút", content: "Tổng quan React và cách tổ chức giao diện theo component." },
          { id: "l2", title: "JSX và Props", duration: "18 phút", content: "Cách truyền dữ liệu và tái sử dụng UI." },
        ],
      },
      {
        id: "ch2",
        title: "State và API",
        lessons: [
          { id: "l3", title: "useState, useEffect", duration: "22 phút", content: "Quản lý trạng thái và vòng đời component." },
          { id: "l4", title: "Gọi API với Axios", duration: "20 phút", content: "Kết nối backend và xử lý lỗi." },
        ],
      },
      {
        id: "ch3",
        title: "Dự án thực tế",
        lessons: [
          { id: "l5", title: "Tổ chức Router", duration: "25 phút", content: "Định tuyến trang trong React." },
          { id: "l6", title: "Deploy dự án", duration: "15 phút", content: "Đưa dự án lên Vercel/Netlify." },
        ],
      },
    ],
    lessons: [],
  },
  {
    id: "c2",
    title: "Spring Boot REST API cho hệ thống khóa học",
    description: "Thiết kế API chuyên nghiệp, JWT authentication, phân quyền người dùng và CRUD dữ liệu tối ưu phục vụ hệ thống học online.",
    category: "Backend",
    level: "Trung cấp",
    price: 699000,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Nguyễn Hải Nam",
    totalLessons: 4,
    duration: "3 giờ",
    rating: 4.7,
    studentsCount: 840,
    status: "published",
    progress: 20,
    chapters: [
      {
        id: "ch_b1",
        title: "Tổng quan Spring Boot & RESTful",
        lessons: [
          { id: "l_b1", title: "Tạo dự án Spring Boot", duration: "25 phút", content: "Khởi động dự án và cấu hình maven." },
          { id: "l_b2", title: "Controller và DTO", duration: "30 phút", content: "Tổ chức request/response rõ ràng và chuẩn REST." },
        ],
      },
      {
        id: "ch_b2",
        title: "Security & Database",
        lessons: [
          { id: "l_b3", title: "Cấu hình JPA & Hibernate", duration: "35 phút", content: "Kết nối MySQL và quản lý thực thể." },
          { id: "l_b4", title: "JWT Security", duration: "40 phút", content: "Bảo vệ API bằng token xác thực." },
        ],
      },
    ],
    lessons: [],
  },
  {
    id: "c3",
    title: "UI/UX Dashboard quản trị hiện đại",
    description: "Thiết kế giao diện dashboard rõ ràng, responsive, tối ưu cho thao tác quản trị và theo dõi trực quan dữ liệu lớn.",
    category: "Thiết kế",
    level: "Cơ bản",
    price: 0,
    thumbnail: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Hoàng Linh",
    totalLessons: 2,
    duration: "1.5 giờ",
    rating: 4.6,
    studentsCount: 520,
    status: "pending",
    progress: 0,
    chapters: [
      {
        id: "ch_d1",
        title: "Nền tảng dashboard",
        lessons: [
          { id: "l_d1", title: "Layout và hierarchy", duration: "20 phút", content: "Xây dựng bố cục lưới dễ quét thông tin." },
          { id: "l_d2", title: "Lựa chọn Typography & Color", duration: "25 phút", content: "Phối hợp màu sắc và kiểu chữ chuyên nghiệp." },
        ],
      },
    ],
    lessons: [],
  },
  {
    id: "c4",
    title: "Lập trình Java Core & OOP hướng đối tượng",
    description: "Nắm vững cú pháp Java, các nguyên lý lập trình hướng đối tượng (OOP) kinh điển và cấu trúc dữ liệu cơ bản.",
    category: "Backend",
    level: "Cơ bản",
    price: 399000,
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Nguyễn Hải Nam",
    totalLessons: 4,
    duration: "3.5 giờ",
    rating: 4.9,
    studentsCount: 950,
    status: "published",
    progress: 75,
    chapters: [
      {
        id: "ch_j1",
        title: "Cơ bản về Java",
        lessons: [
          { id: "l_j1", title: "Biến và Kiểu dữ liệu", duration: "15 phút", content: "Khai báo biến, hằng và ép kiểu." },
          { id: "l_j2", title: "Cấu trúc rẽ nhánh & Lặp", duration: "25 phút", content: "If-else, switch-case và vòng lặp for, while." },
        ],
      },
      {
        id: "ch_j2",
        title: "Lập trình hướng đối tượng (OOP)",
        lessons: [
          { id: "l_j3", title: "4 tính chất của OOP", duration: "40 phút", content: "Đóng gói, Kế thừa, Đa hình và Trừu tượng." },
          { id: "l_j4", title: "Interface & Abstract Class", duration: "30 phút", content: "Thiết kế lớp trừu tượng và giao tiếp." },
        ],
      },
    ],
    lessons: [],
  },
  {
    id: "c5",
    title: "Làm chủ cơ sở dữ liệu MySQL",
    description: "Học cách thiết kế database, viết câu lệnh SQL từ cơ bản đến phức tạp, tối ưu hóa index và bảo mật dữ liệu.",
    category: "Backend",
    level: "Cơ bản",
    price: 299000,
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Trần Quốc Huy",
    totalLessons: 3,
    duration: "2 giờ",
    rating: 4.5,
    studentsCount: 680,
    status: "published",
    progress: 100,
    chapters: [
      {
        id: "ch_m1",
        title: "Thiết kế Database & DDL",
        lessons: [
          { id: "l_m1", title: "Lược đồ quan hệ ERD", duration: "20 phút", content: "Vẽ lược đồ thực thể quan hệ." },
          { id: "l_m2", title: "Khởi tạo Table & Ràng buộc", duration: "25 phút", content: "Primary Key, Foreign Key, Unique và Not Null." },
        ],
      },
      {
        id: "ch_m2",
        title: "Truy vấn dữ liệu nâng cao",
        lessons: [
          { id: "l_m3", title: "Join bảng & Group By", duration: "35 phút", content: "Inner Join, Left Join, Right Join và các hàm tổng hợp." },
        ],
      },
    ],
    lessons: [],
  },
  {
    id: "c6",
    title: "Mobile App với React Native Expo",
    description: "Xây dựng ứng dụng di động đa nền tảng iOS & Android nhanh chóng bằng Expo, UI đẹp mắt và tích hợp phần cứng điện thoại.",
    category: "Mobile",
    level: "Nâng cao",
    price: 899000,
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Trần Quốc Huy",
    totalLessons: 3,
    duration: "4 giờ",
    rating: 4.8,
    studentsCount: 420,
    status: "published",
    progress: 0,
    chapters: [
      {
        id: "ch_rn1",
        title: "Làm quen với React Native Expo",
        lessons: [
          { id: "l_rn1", title: "Cài đặt môi trường Expo Go", duration: "20 phút", content: "Tạo dự án đầu tiên và chạy thử trên điện thoại thật." },
          { id: "l_rn2", title: "Style trong React Native", duration: "30 phút", content: "Sử dụng StyleSheet và Flexbox trong giao diện mobile." },
        ],
      },
      {
        id: "ch_rn2",
        title: "Navigation & API",
        lessons: [
          { id: "l_rn3", title: "React Navigation", duration: "35 phút", content: "Tạo Stack Navigation và Tab Navigation." },
        ],
      },
    ],
    lessons: [],
  },
  {
    id: "c7",
    title: "Trí tuệ nhân tạo Python AI cơ bản",
    description: "Khám phá thế giới AI thông qua ngôn ngữ Python, học các thuật toán Học máy (Machine Learning) cơ bản và xử lý ảnh số.",
    category: "AI & Data",
    level: "Trung cấp",
    price: 1299000,
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Nguyễn Hải Nam",
    totalLessons: 2,
    duration: "5 giờ",
    rating: 4.7,
    studentsCount: 310,
    status: "pending",
    progress: 0,
    chapters: [
      {
        id: "ch_ai1",
        title: "Nền tảng Python & Thư viện toán",
        lessons: [
          { id: "l_ai1", title: "Numpy & Pandas", duration: "30 phút", content: "Xử lý mảng và phân tích bảng dữ liệu." },
          { id: "l_ai2", title: "Hồi quy tuyến tính", duration: "40 phút", content: "Xây dựng mô hình AI dự báo đầu tiên." },
        ],
      },
    ],
    lessons: [],
  },
  {
    id: "c8",
    title: "DevOps với Docker & Kubernetes",
    description: "Đóng gói ứng dụng vào container với Docker, cấu hình CI/CD và quản lý hệ thống tự động mở rộng trên cụm Kubernetes.",
    category: "DevOps",
    level: "Nâng cao",
    price: 0,
    thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Hoàng Linh",
    totalLessons: 2,
    duration: "6 giờ",
    rating: 4.9,
    studentsCount: 750,
    status: "draft",
    progress: 0,
    chapters: [
      {
        id: "ch_dev1",
        title: "Containerization Docker",
        lessons: [
          { id: "l_dev1", title: "Dockerfile là gì?", duration: "25 phút", content: "Viết Dockerfile để đóng gói app Spring Boot/ReactJS." },
          { id: "l_dev2", title: "Docker Compose", duration: "30 phút", content: "Khởi chạy nhiều container cùng lúc (App, Database)." },
        ],
      },
    ],
    lessons: [],
  },
];

// Link chapters to lessons flat map
mockCourses.forEach((course) => {
  course.lessons = course.chapters.flatMap((chapter) => chapter.lessons);
});

export const mockEnrollments: Enrollment[] = [
  { id: "e1", courseId: "c1", courseTitle: "ReactJS từ cơ bản đến thực chiến", studentName: "Nguyễn Minh Anh", studentEmail: "student@eduflow.vn", status: "approved", createdAt: "2026-05-02" },
  { id: "e2", courseId: "c2", courseTitle: "Spring Boot REST API cho hệ thống khóa học", studentName: "Nguyễn Minh Anh", studentEmail: "student@eduflow.vn", status: "approved", createdAt: "2026-05-04" },
  { id: "e3", courseId: "c4", courseTitle: "Lập trình Java Core & OOP hướng đối tượng", studentName: "Nguyễn Minh Anh", studentEmail: "student@eduflow.vn", status: "approved", createdAt: "2026-05-12" },
  { id: "e4", courseId: "c5", courseTitle: "Làm chủ cơ sở dữ liệu MySQL", studentName: "Nguyễn Minh Anh", studentEmail: "student@eduflow.vn", status: "approved", createdAt: "2026-05-15" },
  { id: "e5", courseId: "c1", courseTitle: "ReactJS từ cơ bản đến thực chiến", studentName: "Phạm Gia Bảo", studentEmail: "bao@student.vn", status: "approved", createdAt: "2026-05-01" },
  { id: "e6", courseId: "c3", courseTitle: "UI/UX Dashboard quản trị hiện đại", studentName: "Phạm Gia Bảo", studentEmail: "bao@student.vn", status: "pending", createdAt: "2026-05-08" },
  { id: "e7", courseId: "c2", courseTitle: "Spring Boot REST API cho hệ thống khóa học", studentName: "Lê Thị Mai", studentEmail: "mai@student.vn", status: "approved", createdAt: "2026-05-10" },
  { id: "e8", courseId: "c4", courseTitle: "Lập trình Java Core & OOP hướng đối tượng", studentName: "Lê Thị Mai", studentEmail: "mai@student.vn", status: "approved", createdAt: "2026-05-11" },
  { id: "e9", courseId: "c1", courseTitle: "ReactJS từ cơ bản đến thực chiến", studentName: "Vũ Hoàng Long", studentEmail: "long@student.vn", status: "approved", createdAt: "2026-04-16" },
  { id: "e10", courseId: "c2", courseTitle: "Spring Boot REST API cho hệ thống khóa học", studentName: "Vũ Hoàng Long", studentEmail: "long@student.vn", status: "approved", createdAt: "2026-04-18" },
  { id: "e11", courseId: "c5", courseTitle: "Làm chủ cơ sở dữ liệu MySQL", studentName: "Trần Thu Thảo", studentEmail: "thao@student.vn", status: "approved", createdAt: "2026-05-19" },
  { id: "e12", courseId: "c6", courseTitle: "Mobile App với React Native Expo", studentName: "Phan Anh Tuấn", studentEmail: "tuan.phan@student.vn", status: "approved", createdAt: "2026-05-21" },
];

export const mockPayments: PaymentOrder[] = [
  { id: "p1", userId: "u1", courseId: "c1", amount: 499000, method: "DEMO", status: "PAID", createdAt: "2026-05-02" },
  { id: "p2", userId: "u1", courseId: "c2", amount: 699000, method: "DEMO", status: "PAID", createdAt: "2026-05-04" },
];

const MOCK_ENROLLMENT_KEY = "mock_enrollments";

function getCurrentMockUser() {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function readStoredEnrollments(): Enrollment[] {
  const raw = localStorage.getItem(MOCK_ENROLLMENT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Enrollment[];
  } catch {
    return [];
  }
}

function writeStoredEnrollments(items: Enrollment[]) {
  localStorage.setItem(MOCK_ENROLLMENT_KEY, JSON.stringify(items));
}

export function getAllMockEnrollments() {
  const stored = readStoredEnrollments();
  const map = new Map<string, Enrollment>();
  [...mockEnrollments, ...stored].forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export function isMockCourseEnrolled(courseId: string) {
  const user = getCurrentMockUser();
  if (!user) return false;
  const email = String(user.email || "").toLowerCase();
  return getAllMockEnrollments().some((item) => item.courseId === courseId && ["approved", "ACTIVE"].includes(String(item.status)) && item.studentEmail.toLowerCase() === email);
}

export function addMockEnrollment(courseId: string) {
  const user = getCurrentMockUser();
  if (!user) throw new Error("Vui lòng đăng nhập trước khi đăng ký khóa học.");
  const course = mockCourses.find((item) => item.id === courseId);
  if (!course) throw new Error("Không tìm thấy khóa học.");
  if (isMockCourseEnrolled(courseId)) {
    return getAllMockEnrollments().find((item) => item.courseId === courseId && item.studentEmail === user.email);
  }
  const enrollment: Enrollment = {
    id: `e${Date.now()}`,
    userId: String(user.id || ""),
    courseId,
    courseTitle: course.title,
    studentName: user.fullName || user.name || user.username,
    studentEmail: user.email || user.username,
    status: "ACTIVE",
    paymentStatus: "PAID",
    paymentMethod: "DEMO",
    amount: 0,
    enrolledAt: new Date().toISOString().slice(0, 10),
    progress: 0,
    completedLessons: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const stored = readStoredEnrollments();
  stored.push(enrollment);
  writeStoredEnrollments(stored);
  return enrollment;
}

export function getMockMyCourses() {
  const user = getCurrentMockUser();
  if (!user) return [];
  const email = String(user.email || "").toLowerCase();
  const ids = new Set(
    getAllMockEnrollments()
      .filter((item) => item.studentEmail.toLowerCase() === email && ["approved", "ACTIVE"].includes(String(item.status)))
      .map((item) => item.courseId),
  );
  return mockCourses.filter((course) => ids.has(course.id));
}

export function addMockPaidEnrollment(courseId: string, paymentMethod: PaymentOrder["method"] = "DEMO") {
  const user = getCurrentMockUser();
  if (!user) throw new Error("Vui lòng đăng nhập trước khi thanh toán.");
  const course = mockCourses.find((item) => item.id === courseId);
  if (!course) throw new Error("Không tìm thấy khóa học.");

  const existing = getAllMockEnrollments().find(
    (item) => item.courseId === courseId && item.studentEmail.toLowerCase() === String(user.email || "").toLowerCase() && ["approved", "ACTIVE"].includes(String(item.status)),
  );
  if (existing) return { enrollment: existing, payment: null };

  const today = new Date().toISOString().slice(0, 10);
  const payment: PaymentOrder = {
    id: `p${Date.now()}`,
    userId: String(user.id || ""),
    courseId,
    amount: course.discountPrice ?? course.price,
    method: paymentMethod,
    status: "PAID",
    createdAt: today,
  };
  const enrollment: Enrollment = {
    id: `e${Date.now()}`,
    userId: String(user.id || ""),
    courseId,
    courseTitle: course.title,
    studentName: user.fullName || user.name || user.username,
    studentEmail: user.email || user.username,
    status: "ACTIVE",
    paymentStatus: "PAID",
    paymentMethod,
    amount: payment.amount,
    enrolledAt: today,
    progress: 0,
    completedLessons: [],
    createdAt: today,
  };

  const stored = readStoredEnrollments();
  stored.push(enrollment);
  writeStoredEnrollments(stored);
  mockPayments.push(payment);
  return { enrollment, payment };
}

export async function mockLogin(data: LoginPayload): Promise<{ user: AuthUser; token: string }> {
  const key = data.username.trim().toLowerCase();
  const user = mockUsers.find((item) => item.email.toLowerCase() === key || item.username.toLowerCase() === key);
  
  if (!user || (data.password !== "123456" && key !== "student" && key !== "instructor" && key !== "admin")) {
    throw new Error("Sai tài khoản hoặc mật khẩu. Bạn có thể đăng nhập bằng bất kỳ tài khoản mock nào (ví dụ: student, instructor, admin) với mật khẩu là 123456.");
  }
  
  const token = `mock-token-${user.role}-${Date.now()}`;
  return { user: { ...user, name: user.fullName, accessToken: token }, token };
}

export async function mockRegister(data: RegisterPayload) {
  const exists = mockUsers.some((user) => user.email.toLowerCase() === data.email.toLowerCase() || user.username.toLowerCase() === data.username.toLowerCase());
  if (exists) throw new Error("Email hoặc username đã tồn tại.");
  const user: User = {
    id: `u${mockUsers.length + 1}`,
    fullName: data.fullName,
    email: data.email,
    username: data.username,
    role: "student",
    status: "active",
    createdAt: new Date().toISOString().slice(0, 10),
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
  };
  mockUsers.push(user);
  return user;
}

export type HomeCategoryKey =
  | "all"
  | "ielts"
  | "toeic"
  | "communication"
  | "business"
  | "kids"
  | "grammar";

export type HomeCategory = {
  key: HomeCategoryKey;
  label: string;
  icon: string;
};

export type FeaturedCourse = {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<HomeCategoryKey, "all">;
  mentor: string;
  price: string;
  rating: string;
  lessons: string;
  learners: string;
  coverLabel: string;
  gradient: readonly [string, string];
};

export type BenefitItem = {
  title: string;
  description: string;
  icon: string;
  accent: string;
};

export type FooterGroup = {
  title: string;
  items: string[];
};

export const HOME_CATEGORIES: HomeCategory[] = [
  { key: "all", label: "Tất cả", icon: "apps-outline" },
  { key: "ielts", label: "IELTS", icon: "ribbon-outline" },
  { key: "toeic", label: "TOEIC", icon: "document-text-outline" },
  { key: "communication", label: "Giao tiếp", icon: "chatbubble-ellipses-outline" },
  { key: "business", label: "Business", icon: "briefcase-outline" },
  { key: "kids", label: "Thiếu nhi", icon: "happy-outline" },
  { key: "grammar", label: "Ngữ pháp", icon: "create-outline" },
];

export const HERO_TAGS: Exclude<HomeCategoryKey, "all">[] = [
  "ielts",
  "toeic",
  "communication",
  "business",
];

export const FEATURED_COURSES: FeaturedCourse[] = [
  {
    id: "ielts-band-70",
    title: "IELTS Band 7.0+ Toàn Diện",
    subtitle: "Mất gốc đến mục tiêu 7.0",
    category: "ielts",
    mentor: "Ms. Sarah Johnson",
    price: "1.290.000 đ",
    rating: "4.9",
    lessons: "42 bài",
    learners: "118 học viên",
    coverLabel: "Band Boost",
    gradient: ["#B96C42", "#7C2D12"],
  },
  {
    id: "toeic-900",
    title: "TOEIC 900+ Chiến Lược Thực Chiến",
    subtitle: "Luyện đề và phản xạ đề thi thật",
    category: "toeic",
    mentor: "Thầy David Nguyen",
    price: "890.000 đ",
    rating: "4.8",
    lessons: "35 bài",
    learners: "95 học viên",
    coverLabel: "Score Up",
    gradient: ["#3B82F6", "#0F172A"],
  },
  {
    id: "giao-tiep",
    title: "Tiếng Anh Giao Tiếp Thực Tế",
    subtitle: "Phản xạ nhanh trong công việc và đời sống",
    category: "communication",
    mentor: "Ms. Anna Tran",
    price: "690.000 đ",
    rating: "4.7",
    lessons: "28 bài",
    learners: "84 học viên",
    coverLabel: "Talk Everyday",
    gradient: ["#F97316", "#7C2D12"],
  },
  {
    id: "business-english",
    title: "Business English Thương Mại",
    subtitle: "Email, meeting, presentation chuẩn quốc tế",
    category: "business",
    mentor: "Thầy Minh Hoang",
    price: "1.190.000 đ",
    rating: "4.9",
    lessons: "31 bài",
    learners: "67 học viên",
    coverLabel: "Lead Meetings",
    gradient: ["#FACC15", "#B45309"],
  },
  {
    id: "grammar-a-z",
    title: "Ngữ Pháp Tiếng Anh Từ A-Z",
    subtitle: "Hệ thống lại nền tảng cho mọi trình độ",
    category: "grammar",
    mentor: "Ms. Susan Watson",
    price: "490.000 đ",
    rating: "4.8",
    lessons: "24 bài",
    learners: "124 học viên",
    coverLabel: "Grammar Lab",
    gradient: ["#0F172A", "#2563EB"],
  },
  {
    id: "kids-english",
    title: "Tiếng Anh Cho Trẻ Em 6-12 Tuổi",
    subtitle: "Học qua hoạt động, truyện kể và phản xạ",
    category: "kids",
    mentor: "Cô Emily Vu",
    price: "590.000 đ",
    rating: "4.9",
    lessons: "26 bài",
    learners: "72 học viên",
    coverLabel: "Kids Fun",
    gradient: ["#F59E0B", "#166534"],
  },
];

export const BENEFITS: BenefitItem[] = [
  {
    title: "Xác thực JWT",
    description:
      "Đăng nhập bảo mật với token JWT, kiểm soát role rõ ràng cho admin, giảng viên và học sinh.",
    icon: "shield-checkmark-outline",
    accent: "#2563EB",
  },
  {
    title: "Thanh toán giả lập",
    description:
      "Luồng đăng ký khóa học mô phỏng giống môi trường production để kiểm thử end-to-end.",
    icon: "card-outline",
    accent: "#0EA5E9",
  },
  {
    title: "HLS Streaming",
    description:
      "Video bài giảng tối ưu cho web và mobile, tải nhanh và xem ổn định trong nhiều điều kiện mạng.",
    icon: "play-circle-outline",
    accent: "#8B5CF6",
  },
  {
    title: "Theo dõi tiến độ",
    description:
      "Học viên nhìn thấy phần trăm hoàn thành, bài tập và lịch sử học tập ngay trên dashboard.",
    icon: "bar-chart-outline",
    accent: "#14B8A6",
  },
  {
    title: "Đa vai trò",
    description:
      "Admin quản trị hệ thống, giảng viên vận hành nội dung, học sinh tập trung học tập.",
    icon: "people-outline",
    accent: "#7C3AED",
  },
  {
    title: "Responsive đa nền tảng",
    description:
      "Giao diện hoạt động mượt trên web, iOS và Android với cùng luồng trải nghiệm.",
    icon: "phone-portrait-outline",
    accent: "#F97316",
  },
];

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Khóa học",
    items: [
      "IELTS Band 7+",
      "TOEIC 900+",
      "Tiếng Anh giao tiếp",
      "Business English",
      "Ngữ pháp từ A-Z",
    ],
  },
  {
    title: "Hệ thống",
    items: [
      "Về chúng tôi",
      "Đội ngũ giảng viên",
      "Chính sách bảo mật",
      "Điều khoản sử dụng",
      "API Documentation",
    ],
  },
  {
    title: "Liên hệ",
    items: [
      "123 Nguyễn Huệ, Quận 1, TP.HCM",
      "1900 8888",
      "support@engpro.vn",
      "Tư vấn hợp tác doanh nghiệp",
    ],
  },
];

export const TECH_STACK = ["React", "React Native", "Spring Boot", "JWT", "MySQL", "HLS"];

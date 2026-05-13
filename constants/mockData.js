export const MOCK_USER = {
  id: 'u1',
  name: 'Nguyễn Văn An',
  email: 'an@example.com',
  avatar: 'https://i.pravatar.cc/150?img=3',
  role: 'STUDENT',
};

export const CATEGORIES = [
  { id: 'c1', name: 'Giao tiếp', icon: '🗣️' },
  { id: 'c2', name: 'IELTS', icon: '🎓' },
  { id: 'c3', name: 'TOEIC', icon: '📝' },
  { id: 'c4', name: 'Từ vựng', icon: '📚' },
  { id: 'c5', name: 'Ngữ pháp', icon: '✍️' },
];

export const COURSES = [
  {
    id: 'k1',
    title: 'Tiếng Anh Giao Tiếp Căn Bản',
    instructor: 'GV. Sarah Smith',
    category: 'Giao tiếp',
    level: 'Beginner',
    price: 499000,
    rating: 4.8,
    students: 1240,
    duration: '24h 30m',
    thumbnail: 'https://picsum.photos/seed/eng1/400/220',
    description: 'Khóa học tiếng Anh giao tiếp toàn diện cho người mới bắt đầu. Tự tin giao tiếp trong các tình huống thực tế hằng ngày.',
    chapters: [
      {
        id: 'ch1', title: 'Chào hỏi cơ bản', lessons: [
          { id: 'l1', title: 'Cách chào hỏi thông dụng', duration: '8:30', isFree: true, isCompleted: true },
          { id: 'l2', title: 'Tự giới thiệu bản thân', duration: '12:00', isFree: true, isCompleted: true },
          { id: 'l3', title: 'Hỏi thăm sức khỏe', duration: '10:15', isFree: false, isCompleted: false },
        ]
      },
      {
        id: 'ch2', title: 'Giao tiếp tại nhà hàng', lessons: [
          { id: 'l4', title: 'Cách gọi món', duration: '15:20', isFree: false, isCompleted: false },
          { id: 'l5', title: 'Yêu cầu thanh toán', duration: '18:45', isFree: false, isCompleted: false },
          { id: 'l6', title: 'Phàn nàn và khen ngợi', duration: '20:10', isFree: false, isCompleted: false },
        ]
      },
      {
        id: 'ch3', title: 'Hỏi đường', lessons: [
          { id: 'l7', title: 'Các từ vựng chỉ hướng', duration: '11:00', isFree: false, isCompleted: false },
          { id: 'l8', title: 'Hội thoại hỏi đường thực tế', duration: '14:30', isFree: false, isCompleted: false },
        ]
      },
    ],
  },
  {
    id: 'k2',
    title: 'Luyện thi IELTS 6.5+ Tốc Tốc',
    instructor: 'Thầy David',
    category: 'IELTS',
    level: 'Intermediate',
    price: 899000,
    rating: 4.7,
    students: 890,
    duration: '48h 00m',
    thumbnail: 'https://picsum.photos/seed/ielts/400/220',
    description: 'Bứt phá điểm IELTS của bạn với các chiến thuật làm bài hiệu quả từ cựu giám khảo IELTS. Tập trung vào Speaking và Writing.',
    chapters: [
      {
        id: 'ch4', title: 'IELTS Speaking Part 1', lessons: [
          { id: 'l9', title: 'Tổng quan và tiêu chí chấm điểm', duration: '9:00', isFree: true, isCompleted: true },
          { id: 'l10', title: 'Các chủ đề phổ biến: Hometown, Work', duration: '11:30', isFree: false, isCompleted: true },
          { id: 'l11', title: 'Mở rộng câu trả lời', duration: '16:00', isFree: false, isCompleted: false },
        ]
      },
      {
        id: 'ch5', title: 'IELTS Writing Task 1', lessons: [
          { id: 'l12', title: 'Phân tích biểu đồ đường (Line Graph)', duration: '13:20', isFree: false, isCompleted: false },
          { id: 'l13', title: 'Từ vựng miêu tả xu hướng', duration: '22:00', isFree: false, isCompleted: false },
        ]
      },
    ],
  },
  {
    id: 'k3',
    title: '1000 Từ Vựng Tiếng Anh Thông Dụng',
    instructor: 'Cô Mai Anh',
    category: 'Từ vựng',
    level: 'Beginner',
    price: 0,
    rating: 4.5,
    students: 3200,
    duration: '12h 00m',
    thumbnail: 'https://picsum.photos/seed/vocab/400/220',
    description: 'Khóa học miễn phí giúp bạn ghi nhớ 1000 từ vựng cốt lõi nhất để đọc hiểu 80% văn bản tiếng Anh thông thường.',
    chapters: [
      {
        id: 'ch6', title: 'Chủ đề: Gia đình & Bạn bè', lessons: [
          { id: 'l14', title: 'Từ vựng về thành viên gia đình', duration: '7:00', isFree: true, isCompleted: false },
          { id: 'l15', title: 'Các mối quan hệ xã hội', duration: '10:00', isFree: true, isCompleted: false },
        ]
      },
    ],
  },
  {
    id: 'k4',
    title: 'Ngữ Pháp Tiếng Anh Nâng Cao',
    instructor: 'ThS. John Doe',
    category: 'Ngữ pháp',
    level: 'Advanced',
    price: 599000,
    rating: 4.9,
    students: 2100,
    duration: '30h 00m',
    thumbnail: 'https://picsum.photos/seed/grammar/400/220',
    description: 'Nắm vững các cấu trúc ngữ pháp phức tạp: câu điều kiện hỗn hợp, đảo ngữ, mệnh đề quan hệ rút gọn.',
    chapters: [
      {
        id: 'ch7', title: 'Đảo ngữ (Inversion)', lessons: [
          { id: 'l16', title: 'Đảo ngữ với trạng từ phủ định', duration: '15:00', isFree: true, isCompleted: false },
          { id: 'l17', title: 'Đảo ngữ trong câu điều kiện', duration: '20:00', isFree: false, isCompleted: false },
        ]
      },
    ],
  },
];

export const ENROLLMENTS = ['k1', 'k2']; // id các khóa đã đăng ký

export const PROGRESS = {
  k1: { completed: 2, total: 8, percent: 25 },
  k2: { completed: 2, total: 5, percent: 40 },
};

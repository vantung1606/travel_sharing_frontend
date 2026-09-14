export const INITIAL_DESTINATIONS = [
  {
    id: 'dest-1',
    name: 'Đà Nẵng & Hội An',
    tagline: 'Thành phố đáng sống & Phố cổ đèn lồng',
    category: 'Biển & Văn Hoá',
    rating: 4.9,
    reviewsCount: 1240,
    priceEstimate: '3.500.000đ - 6.000.000đ',
    duration: '4 ngày 3 đêm',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    tags: ['Biển Mỹ Khê', 'Bà Nà Hills', 'Phố cổ Hội An', 'Cầu Vàng'],
    aiHighlights: 'Phù hợp nhóm bạn & gia đình, tối ưu chi phí với AI itinerary',
    coordinates: { lat: 16.0544, lng: 108.2022 },
    isVerified: true
  },
  {
    id: 'dest-2',
    name: 'Đảo Ngọc Phú Quốc',
    tagline: 'Thiên đường nghỉ dưỡng biển xanh cát trắng',
    category: 'Nghỉ Dưỡng Sang Trọng',
    rating: 4.8,
    reviewsCount: 980,
    priceEstimate: '5.000.000đ - 12.000.000đ',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    tags: ['Bãi Sao', 'Grand World', 'Hòn Thơm', 'Sunset Sanato'],
    aiHighlights: 'Hoàng hôn đẹp nhất Việt Nam, cáp treo vượt biển kỷ lục',
    coordinates: { lat: 10.2899, lng: 103.9840 },
    isVerified: true
  },
  {
    id: 'dest-3',
    name: 'Hà Giang Phượt Loop',
    tagline: 'Hùng vĩ đèo Mã Pí Lèng & Bán đảo đá Đồng Văn',
    category: 'Mạo Hiểm & Khám Phá',
    rating: 4.95,
    reviewsCount: 2150,
    priceEstimate: '2.800.000đ - 4.500.000đ',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    tags: ['Sông Nho Quế', 'Đèo Mã Pí Lèng', 'Cột cờ Lũng Cú', 'Yên Minh'],
    aiHighlights: 'Cung đường phượt xe máy đẹp nhất Đông Nam Á',
    coordinates: { lat: 22.8233, lng: 104.9839 },
    isVerified: true
  },
  {
    id: 'dest-4',
    name: 'Sapa sương mù',
    tagline: 'Chinh phục đỉnh Fansipan & Rộng mở ruộng bậc thang',
    category: 'Núi & Sinh Thái',
    rating: 4.7,
    reviewsCount: 1560,
    priceEstimate: '3.000.000đ - 5.500.000đ',
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1570784409178-be94786231ba?auto=format&fit=crop&w=800&q=80',
    tags: ['Fansipan Legend', 'Bản Cát Cát', 'Thung lũng Mường Hoa'],
    aiHighlights: 'Mùa lúa chín vàng ươm rực rỡ tháng 9 - 10',
    coordinates: { lat: 22.3364, lng: 103.8438 },
    isVerified: true
  }
];

export const INITIAL_POSTS = [
  {
    id: 'post-101',
    author: {
      name: 'Minh Anh Travel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      badge: 'Chuyên gia WanderAI'
    },
    location: 'Sông Nho Quế, Hà Giang',
    timeAgo: '2 giờ trước',
    content: 'Chuyến đi Hà Giang do AI Wander gợi ý lịch trình siêu đỉnh! Vừa tránh được giờ cao điểm chèo thuyền sông Nho Quế, vừa săn được mây đỉnh Mã Pí Lèng cực chill 🍃🛵.',
    images: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    likes: 342,
    commentsCount: 28,
    savedCount: 95,
    isLiked: false,
    aiItineraryLinked: 'Lịch trình Hà Giang 3N2Đ mạo hiểm'
  },
  {
    id: 'post-102',
    author: {
      name: 'Hoàng Bách',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Phượt thủ'
    },
    location: 'Bà Nà Hills, Đà Nẵng',
    timeAgo: '5 giờ trước',
    content: 'Review nhẹ check-in Cầu Vàng lúc 6h30 sáng theo tips WanderAI. Không một bóng người luôn nha mọi người, chụp hình cứ gọi là nét căng!',
    images: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'
    ],
    likes: 518,
    commentsCount: 42,
    savedCount: 180,
    isLiked: true,
    aiItineraryLinked: 'Check-in Đà Nẵng trọn gói AI Budget'
  }
];

export const INITIAL_ITINERARIES = [
  {
    id: 'itin-1',
    title: 'Đà Nẵng - Hội An: Lịch Trình Tối Ưu AI 4N3Đ',
    destination: 'Đà Nẵng & Hội An',
    budgetTotal: '4.200.000đ',
    daysCount: 4,
    pace: 'Cân bằng',
    style: 'Nghỉ dưỡng & Check-in',
    days: [
      {
        dayNumber: 1,
        title: 'Đón sân bay - Check-in Biển Mỹ Khê & Ăn hải sản',
        activities: [
          { time: '09:00', title: 'Đáp sân bay Đà Nẵng', note: 'Xe đón về khách sạn sát biển Mỹ Khê' },
          { time: '12:00', title: 'Ăn trưa Mì Quảng Bà Mua', note: 'Món ngon nổi tiếng chuẩn vị Trung' },
          { time: '15:30', title: 'Tắm biển Mỹ Khê & Chụp hình', note: 'Top bãi biển quyến rũ nhất hành tinh' },
          { time: '19:00', title: 'Thưởng thức Hải Sản Phố', note: 'AI Gợi ý: Đặt bàn trước giảm 15%' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Chinh phục Bà Nà Hills & Cầu Vàng',
        activities: [
          { time: '07:30', title: 'Khởi hành lên Bà Nà Hills', note: 'Đi cáp treo tránh xếp hàng muộn' },
          { time: '09:00', title: 'Săn ảnh Cầu Vàng & Làng Pháp', note: 'Khí hậu 4 mùa trong 1 ngày' },
          { time: '12:30', title: 'Buffet trưa tại nhà hàng Beer Plaza', note: 'Đa dạng ẩm thực Á - Âu' }
        ]
      },
      {
        dayNumber: 3,
        title: 'Khám phá Phố Cổ Hội An & Thả đèn lồng',
        activities: [
          { time: '14:00', title: 'Di chuyển Hội An', note: 'Ghé lò gạch cũ chụp ảnh chill' },
          { time: '18:00', title: 'Thuyền thúng Rừng dừa Bảy Mẫu & Thả hoa đăng', note: 'Kinh nghiệm đặt vé rẻ qua app WanderAI' }
        ]
      }
    ]
  }
];

export const ADMIN_STATS = {
  totalUsers: 48290,
  activeTrips: 1420,
  aiGenerationsToday: 3850,
  revenueMonthly: '185.400.000đ',
  systemStatus: 'Hoạt động ổn định (99.98%)',
  pendingCheckins: 14,
  reportedContent: 3
};

export const INITIAL_PENDING_PLACES = [
  {
    id: 'place-req-1',
    name: 'Quán Cafe Tiệm Cà Phê Mây Đỉnh Mã Pí Lèng',
    submittedBy: 'NguyenVanA',
    category: 'Quán Cafe / Check-in',
    location: 'Mèo Vạc, Hà Giang',
    description: 'Quán view 360 độ ngắm trọn hẻm Tu Sản và sông Nho Quế.',
    submittedDate: '2026-09-14 14:20',
    status: 'PENDING'
  },
  {
    id: 'place-req-2',
    name: 'Homestay Rừng Thông Sương Mờ',
    submittedBy: 'SapaExplorer',
    category: 'Homestay / Lưu Trụ',
    location: 'Tả Van, Sapa',
    description: 'Homestay gỗ mộc mạc view ruộng bậc thang bao la.',
    submittedDate: '2026-09-14 16:05',
    status: 'PENDING'
  }
];

export const INITIAL_USER_LIST = [
  { id: 'usr-1', name: 'Nguyễn Văn Anh', email: 'vananh@gmail.com', role: 'User', tripsCount: 12, status: 'Active' },
  { id: 'usr-2', name: 'Lê Thu Trang', email: 'thutrang.travel@gmail.com', role: 'VIP Member', tripsCount: 28, status: 'Active' },
  { id: 'usr-3', name: 'Trần Đình Nam', email: 'nam.phuot@yahoo.com', role: 'User', tripsCount: 2, status: 'Warning' },
  { id: 'usr-4', name: 'Phạm Minh Admin', email: 'admin@wanderai.com', role: 'Admin', tripsCount: 45, status: 'Active' }
];

export const INITIAL_REPORTS = [
  {
    id: 'rep-1',
    type: 'Bài viết quảng cáo rác',
    target: 'Bài viết #post-99 của user spamer123',
    reporter: 'Minh Anh Travel',
    reason: 'Đăng tải thông tin lừa đảo tour du lịch giá rẻ 50k',
    status: 'Pending'
  }
];

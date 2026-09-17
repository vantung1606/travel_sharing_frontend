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
    title: 'Khám phá trọn vẹn Đà Nẵng – Phố cổ Hội An',
    destination: 'Đà Nẵng • Quảng Nam',
    region: 'Miền Trung di sản',
    coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
    duration: '3N2Đ',
    daysCount: 3,
    status: 'upcoming',
    isAiGenerated: true,
    countdown: 'Sắp khởi hành • Còn 4 ngày',
    departureDate: '15/11/2026 – 17/11/2026',
    groupType: 'Nhóm 4 người (Bạn bè)',
    placesCount: 11,
    placesList: ['Bà Nà Hills', 'Cầu Rồng', 'Chùa Cầu Hội An', 'Bán đảo Sơn Trà', 'Biển Mỹ Khê', 'Rừng dừa Bảy Mẫu'],
    budgetPerPerson: 3850000,
    totalBudget: 15400000,
    budgetProgress: 78,
    budgetNote: 'Tổng nhóm: 15.400.000đ • Đã chốt khách sạn',
    pace: 'Cân bằng',
    style: '🏖️ Nghỉ dưỡng biển, 🏛️ Văn hóa di sản',
    days: [
      {
        dayNumber: 1,
        title: 'Ngày 1: Biển Mỹ Khê - Bán đảo Sơn Trà & Check-in Cầu Rồng',
        activities: [
          { time: '08:30', title: 'Đáp sân bay Đà Nẵng & Nhận phòng khách sạn', note: 'Xe đưa đón riêng về khách sạn Monarque Biển Mỹ Khê', cost: '350.000đ' },
          { time: '11:30', title: 'Thưởng thức Mì Quảng Bà Mua & Bánh tráng thịt heo', note: 'Quán ăn bản địa đánh giá 4.8*, không gian sạch sẽ', cost: '120.000đ' },
          { time: '14:30', title: 'Bán đảo Sơn Trà & Chùa Linh Ứng', note: 'Chiêm bái tượng Phật Bà 67m, góc chụp toàn cảnh vịnh Đà Nẵng', cost: 'Miễn phí' },
          { time: '17:00', title: 'Tắm biển Mỹ Khê & Thưởng thức dừa tươi', note: 'Khung giờ vàng hoàng hôn biển tuyệt đẹp', cost: '60.000đ' },
          { time: '19:30', title: 'Ăn tối Hải Sản Phố & Xem Cầu Rồng phun lửa', note: 'AI Tip: Đặt bàn view cầu trước 18:00 để có chỗ đẹp nhất', cost: '450.000đ' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Ngày 2: Chinh phục Sun World Bà Nà Hills & Cầu Vàng',
        activities: [
          { time: '07:30', title: 'Lên cáp treo Bà Nà Hills đón bình minh mây', note: 'Quét mã QR vé điện tử WanderAI tiết kiệm 30 phút xếp hàng', cost: '900.000đ' },
          { time: '09:00', title: 'Check-in Cầu Vàng Bàn Tay Khổng Lồ', note: 'Khung giờ vắng khách nhất trong ngày, ánh sáng lý tưởng săn ảnh', cost: 'Bao gồm vé' },
          { time: '12:00', title: 'Buffet trưa bốn mùa tại Beer Plaza', note: 'Hơn 100 món Á - Âu đặc sắc kèm bia tươi', cost: '350.000đ' },
          { time: '15:00', title: 'Khám phá Làng Pháp & Hầm rượu Debay', note: 'Không gian kiến trúc Gothic cổ kính lãng mạn', cost: 'Miễn phí' },
          { time: '18:30', title: 'Xuống núi về trung tâm & Trải nghiệm chợ đêm Helio', note: 'Thưởng thức ẩm thực đường phố và nghe nhạc acoustic', cost: '200.000đ' }
        ]
      },
      {
        dayNumber: 3,
        title: 'Ngày 3: Phố Cổ Hội An lung linh đèn lồng & Thuyền thúng',
        activities: [
          { time: '08:30', title: 'Di chuyển Hội An & Ghé Lò Gạch Cũ chụp ảnh', note: 'Cung đường ven biển thoáng đãng, cafe view đồng lúa bao la', cost: '80.000đ' },
          { time: '10:30', title: 'Chèo thuyền thúng Rừng Dừa Bảy Mẫu', note: 'Trải nghiệm múa thúng cảm giác mạnh và giăng lưới bắt cá', cost: '150.000đ' },
          { time: '13:00', title: 'Cơm gà Bà Buội & Nước Mót Hội An', note: 'Hương vị thảo mộc thanh mát đặc trưng phố Hội', cost: '95.000đ' },
          { time: '16:00', title: 'Dạo bộ Chùa Cầu, Nhà cổ Tấn Ký & Thả hoa đăng sông Hoài', note: 'Khoảnh khắc phố cổ lên đèn rực rỡ lãng mạn nhất Việt Nam', cost: '100.000đ' }
        ]
      }
    ]
  },
  {
    id: 'itin-2',
    title: 'Đà Lạt Mùa Đông – Săn Mây, Cafe & Đồi Thông',
    destination: 'Đà Lạt • Lâm Đồng',
    region: 'Tây Nguyên lãng mạn',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    duration: '4N3Đ',
    daysCount: 4,
    status: 'upcoming',
    isAiGenerated: true,
    countdown: 'Khởi hành 24/12/2026',
    departureDate: '24/12/2026 – 27/12/2026',
    groupType: 'Cặp đôi (2 người)',
    placesCount: 14,
    placesList: ['Đồi chè Cầu Đất', 'Hồ Tuyền Lâm', 'Thung lũng Dasar', 'Tiệm Cà Phê Túi Mơ To', 'Dinh III Bảo Đại'],
    budgetPerPerson: 4200000,
    totalBudget: 8400000,
    budgetProgress: 50,
    budgetNote: 'Tổng hành trình: 8.400.000đ',
    pace: 'Thư thả',
    style: '☕ Săn mây, 🌸 Check-in sống ảo, 🍜 Ẩm thực se lạnh',
    days: [
      {
        dayNumber: 1,
        title: 'Ngày 1: Check-in Homestay view thung lũng & Lẩu gà lá é',
        activities: [
          { time: '11:00', title: 'Nhận phòng Homestay Hoàng Hôn Dasar', note: 'Căn phòng kính ngắm trọn thung lũng thông reo', cost: '600.000đ' },
          { time: '14:30', title: 'Cafe Tiệm Cà Phê Túi Mơ To', note: 'Vườn cúc họa mi nở rộ, view nhà lồng lên đèn thơ mộng', cost: '85.000đ' },
          { time: '18:30', title: 'Lẩu gà lá é Tao Ngộ đường 3/4', note: 'Nước dùng chua thanh the cay ấm lòng đêm đông', cost: '150.000đ' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Ngày 2: Săn mây Đồi chè Cầu Đất & Vườn hồng treo gió',
        activities: [
          { time: '04:45', title: 'Khởi hành săn mây thảm gỗ Cầu Đất', note: 'Nhiệt độ 12°C, mang áo ấm dày và găng tay', cost: '120.000đ' },
          { time: '08:30', title: 'Ăn sáng Bánh mì xíu mại Hoàng Diệu', note: 'Chén xíu mại nóng hổi thơm nồng ớt cay', cost: '40.000đ' },
          { time: '14:00', title: 'Tham quan cơ sở sản xuất hồng treo gió công nghệ Nhật', note: 'Thử hồng mật dẻo ngọt và mua quà lưu niệm', cost: '200.000đ' }
        ]
      }
    ]
  },
  {
    id: 'itin-3',
    title: 'Phượt Mùa Hoa Tam Giác Mạch & Đèo Mã Pí Lèng',
    destination: 'Đồng Văn • Hà Giang',
    region: 'Đông Bắc hùng vĩ',
    coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    duration: '4N3Đ',
    daysCount: 4,
    status: 'upcoming',
    isAiGenerated: false,
    countdown: 'Khởi hành 15/01/2026',
    departureDate: '15/01/2026 – 18/01/2026',
    groupType: 'Nhóm 6 phượt thủ',
    placesCount: 9,
    placesList: ['Cột cờ Lũng Cú', 'Sông Nho Quế', 'Dinh Họ Vương', 'Đèo Mã Pí Lèng', 'Cổng trời Quản Bạ'],
    budgetPerPerson: 2950000,
    totalBudget: 17700000,
    budgetProgress: 35,
    budgetNote: 'Tổng nhóm: 17.700.000đ • Tiết kiệm',
    pace: 'Trải nghiệm mạo hiểm',
    style: '🏍️ Phượt xe máy, 🏞️ Cảnh quan thiên nhiên',
    days: [
      {
        dayNumber: 1,
        title: 'Ngày 1: Hà Giang City - Cổng Trời Quản Bạ - Rừng Thông Yên Minh',
        activities: [
          { time: '07:30', title: 'Thuê xe máy cào cào và trang bị giáp bảo hộ', note: 'Kiểm tra lốp, phanh và đèn sương mù cẩn thận', cost: '200.000đ' },
          { time: '11:00', title: 'Check-in Dốc Bắc Sum & Cổng Trời Quản Bạ', note: 'Chiêm ngưỡng Núi Đôi Cô Tiên giữa trập trùng thung lũng', cost: 'Miễn phí' },
          { time: '17:30', title: 'Đến Phố Cáo & Nghỉ đêm tại Homestay nhà trình tường', note: 'Ăn tối Thắng Dền và rượu ngô men lá cùng đồng bào Mông', cost: '250.000đ' }
        ]
      }
    ]
  },
  {
    id: 'itin-4',
    title: 'Kỳ Nghỉ Thiên Đường Phú Quốc – Sunset Sanato & Bãi Sao',
    destination: 'Phú Quốc • Kiên Giang',
    region: 'Đảo Ngọc phương Nam',
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    duration: '3N2Đ',
    daysCount: 3,
    status: 'drafts',
    isAiGenerated: true,
    countdown: 'Bản nháp AI • Chưa đặt ngày',
    departureDate: 'Ngày khởi hành linh hoạt (Dự kiến T2/2026)',
    groupType: 'Gia đình (4 người)',
    placesCount: 8,
    placesList: ['Bãi Sao', 'Sunset Sanato', 'Cáp treo Hòn Thơm', 'Grand World', 'Làng chài Hàm Ninh'],
    budgetPerPerson: 5600000,
    totalBudget: 22400000,
    budgetProgress: 20,
    budgetNote: 'Cần chốt vé máy bay & resort',
    pace: 'Nghỉ dưỡng sang trọng',
    style: '🏖️ Biển đảo, 🍹 Sunset Cocktail, 🦞 Hải sản cao cấp',
    days: [
      {
        dayNumber: 1,
        title: 'Ngày 1: Nhận phòng Resort Bãi Dài & Ngắm hoàng hôn Sunset Sanato',
        activities: [
          { time: '14:00', title: 'Check-in Vinpearl Resort & Spa Phú Quốc', note: 'Hồ bơi vô cực hướng biển bãi Dài nguyên sơ', cost: '1.800.000đ' },
          { time: '17:00', title: 'Check-in Sunset Sanato Beach Club', note: 'Biểu tượng đàn voi chân dài và cổng trời bí ẩn hoàng hôn', cost: '100.000đ' }
        ]
      }
    ]
  },
  {
    id: 'itin-5',
    title: 'Ninh Bình Non Nước Tràng An – Tuyệt Tình Cốc',
    destination: 'Tràng An • Ninh Bình',
    region: 'Cố Đô Hoa Lư',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    duration: '2N1Đ',
    daysCount: 2,
    status: 'completed',
    isAiGenerated: true,
    countdown: 'Đã hoàn thành • Tháng 09/2025',
    departureDate: '10/09/2025 – 11/09/2025',
    groupType: 'Bạn thân (2 người)',
    placesCount: 7,
    placesList: ['Hang Múa', 'Tràng An Tuyến 2', 'Động Am Tiên', 'Cố đô Hoa Lư', 'Chùa Bái Đính'],
    budgetPerPerson: 2150000,
    totalBudget: 4300000,
    budgetProgress: 100,
    budgetNote: 'Đã chi tiêu: 2.150.000đ/người • Đánh giá 5.0 ⭐',
    pace: 'Check-in danh thắng',
    style: '🚣 Thuyền nan, ⛰️ Leo núi săn mây, 🐐 Đặc sản dê núi',
    photoReel: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400&q=80'
    ],
    photosCount: 24,
    days: [
      {
        dayNumber: 1,
        title: 'Ngày 1: Chinh phục đỉnh Ngọa Long Hang Múa & Tuyến thuyền 2 Tràng An',
        activities: [
          { time: '08:30', title: 'Leo 486 bậc đá đỉnh Ngọa Long Hang Múa', note: 'Chiêm ngưỡng toàn cảnh sông Ngô Đồng uốn lượn tuyệt mỹ', cost: '100.000đ' },
          { time: '12:00', title: 'Ăn trưa Dê núi Chính Thư', note: 'Thịt dê tái chanh + Cơm cháy ruốc giòn tan sốt đậm đà', cost: '220.000đ' },
          { time: '14:30', title: 'Ngồi thuyền nan Tràng An (Tuyến 2)', note: 'Thăm hang Lam, hang Vạng và phim trường Kong Skull Island', cost: '250.000đ' }
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

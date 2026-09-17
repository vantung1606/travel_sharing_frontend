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
          {
            time: '08:30 – 10:30',
            category: 'Văn hóa & Tâm linh',
            title: 'Check-in & Viếng Chùa Linh Ứng – Bán đảo Sơn Trà',
            location: 'Chùa Linh Ứng Sơn Trà',
            address: 'Bán đảo Sơn Trà, P. Thọ Quang, Q. Sơn Trà, TP. Đà Nẵng',
            note: 'Chiêm bái tượng Phật Bà Quan Âm cao 67m hướng nhìn trọn vẹn vịnh biển Đà Nẵng tuyệt đẹp.',
            aiTip: 'Nên đến trước 09:30 để ngắm trọn vẹn biển biếc và tránh nắng gắt trưa.',
            cost: 'Miễn phí vé',
            image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
            transit: 'Đón xe từ sân bay Đà Nẵng: 14.5 km ~ 25 phút qua Cầu Rồng'
          },
          {
            time: '11:30 – 13:00',
            category: 'Ẩm thực bản địa',
            title: 'Ăn trưa Đặc sản Bánh tráng cuốn thịt heo Quán Trần',
            location: 'Đặc sản Quán Trần',
            address: '04 Lê Duẩn, P. Hải Châu 1, Q. Hải Châu, TP. Đà Nẵng',
            note: 'Món bánh tráng cuốn thịt heo 2 đầu da nổi tiếng kèm mắm nêm đậm đà thơm lừng xứ Quảng.',
            aiTip: 'Nên gọi thêm đĩa Mì Quảng tôm thịt ăn kèm để thưởng thức trọn vị miền Trung.',
            cost: '140.000đ/người',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
            transit: 'Di chuyển theo Cung đường Hoàng Sa: 8.5 km ~ 18 phút ngắm biển'
          },
          {
            time: '14:30 – 16:30',
            category: 'Nghỉ ngơi & Lưu trú',
            title: 'Nhận phòng & Nghỉ ngơi tại Resort Biển Mỹ Khê',
            location: 'Monarque Hotel / Resort Mỹ Khê',
            address: '238 Võ Nguyên Giáp, P. Phước Mỹ, Q. Sơn Trà, TP. Đà Nẵng',
            note: 'Nghỉ ngơi nạp năng lượng, phòng hướng biển ngắm trọn cảnh bình minh và sóng vỗ.',
            aiTip: 'Khách sạn có hồ bơi vô cực tầng thượng view 360 độ toàn thành phố Đà Nẵng.',
            cost: 'Đã thanh toán',
            image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80',
            transit: 'Di chuyển từ trung tâm qua Cầu Sông Hàn: 4.2 km ~ 10 phút'
          },
          {
            time: '17:00 – 18:30',
            category: 'Check-in & Sống ảo',
            title: 'Thư giãn tắm biển Mỹ Khê & Chill cafe ngắm hoàng hôn',
            location: 'Sơn Trà Marina Cafe',
            address: 'Đường Hồ Xanh, Bán đảo Sơn Trà, P. Thọ Quang, TP. Đà Nẵng',
            note: 'Check-in quán cafe ven bờ biển Sơn Trà Marina phong cách Santorini ngắm chiều tà lãng mạn.',
            aiTip: 'Khung giờ vàng từ 17:00 – 17:45 ánh sáng hoàng hôn tím hồng đẹp nhất để chụp ảnh.',
            cost: '75.000đ/người',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            transit: 'Đi dọc bãi tắm Võ Nguyên Giáp: 6 km ~ 12 phút'
          },
          {
            time: '19:30 – 21:30',
            category: 'Ẩm thực & Đêm',
            title: 'Ăn tối Hải sản Bé Mặn ven biển & Xem Cầu Rồng phun lửa',
            location: 'Hải Sản Bé Mặn & Cầu Rồng',
            address: 'Lô 11 Võ Nguyên Giáp, P. Mạn Thái, Q. Sơn Trà, TP. Đà Nẵng',
            note: 'Thưởng thức tôm hùm baby, cua rang me tươi sống và ngắm Cầu Rồng phun lửa lúc 21:00 cuối tuần.',
            aiTip: 'Nên đặt bàn trước 18:30 và có mặt tại Cầu Rồng lúc 20:45 để chọn góc ngắm đẹp nhất.',
            cost: '350.000đ/người',
            image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
            transit: 'Di chuyển từ bãi biển về Cầu Rồng: 3.5 km ~ 8 phút'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Ngày 2: Chinh phục Sun World Bà Nà Hills & Cầu Vàng',
        activities: [
          {
            time: '07:30 – 09:00',
            category: 'Trải nghiệm cáp treo',
            title: 'Lên cáp treo Bà Nà Hills đón bình minh mây bồng bềnh',
            location: 'Ga Cáp Treo Suối Mơ - Bà Nà Hills',
            address: 'Thôn An Sơn, Xã Hòa Ninh, Huyện Hòa Vang, TP. Đà Nẵng',
            note: 'Tuyến cáp treo đạt nhiều kỷ lục thế giới băng qua cánh rừng nguyên sinh đại ngàn.',
            aiTip: 'Quét mã QR vé điện tử WanderAI để đi thẳng qua cổng soát vé, tiết kiệm 30 phút.',
            cost: '900.000đ/vé',
            image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
            transit: 'Xe đưa đón từ khách sạn lên Bà Nà: 28 km ~ 45 phút'
          },
          {
            time: '09:00 – 11:30',
            category: 'Danh thắng biểu tượng',
            title: 'Check-in Cầu Vàng Bàn Tay Khổng Lồ & Vườn hoa Le Jardin',
            location: 'Cầu Vàng (Golden Bridge)',
            address: 'Đỉnh Bà Nà Hills, Xã Hòa Ninh, Huyện Hòa Vang, TP. Đà Nẵng',
            note: 'Kiến trúc kỳ quan được truyền thông quốc tế ca ngợi, ngắm trọn mây trời bao la.',
            aiTip: 'Đến đây lúc 09:00 là thời điểm sương vừa tan, nắng nhẹ chưa bị sương mù che khuất.',
            cost: 'Bao gồm vé cáp',
            image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
            transit: 'Đi bộ từ Ga Marseille qua Cầu Vàng: 200m ~ 5 phút'
          },
          {
            time: '12:00 – 14:00',
            category: 'Ẩm thực quốc tế',
            title: 'Buffet trưa bốn mùa tại Beer Plaza Làng Pháp',
            location: 'Nhà hàng Beer Plaza',
            address: 'Quảng trường Làng Pháp, Đỉnh Núi Chúa, Bà Nà Hills, TP. Đà Nẵng',
            note: 'Thưởng thức đại tiệc buffet hơn 100 món Á - Âu cùng chương trình vũ hội bia Đức náo nhiệt.',
            aiTip: 'Khu vực tầng 2 có tầm nhìn bao quát sân khấu biểu diễn nghệ thuật rất đẹp.',
            cost: '350.000đ/người',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
            transit: 'Tàu hỏa leo núi lên Làng Pháp: 1.2 km ~ 5 phút'
          },
          {
            time: '18:30 – 21:00',
            category: 'Chợ đêm & Giải trí',
            title: 'Xuống núi về trung tâm & Trải nghiệm Chợ đêm Helio',
            location: 'Chợ đêm Helio Center',
            address: 'Đường 2 Tháng 9, P. Hòa Cường Bắc, Q. Hải Châu, TP. Đà Nẵng',
            note: 'Thiên đường ẩm thực đêm lớn nhất Đà Nẵng với hàng trăm gian hàng đặc sản và âm nhạc live.',
            aiTip: 'Đừng bỏ qua món ốc hút cay nồng và bánh tráng nướng Đà Nẵng tại đây.',
            cost: '180.000đ/người',
            image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
            transit: 'Xe đưa đón về trung tâm: 29 km ~ 45 phút'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Ngày 3: Phố Cổ Hội An lung linh đèn lồng & Thuyền thúng',
        activities: [
          {
            time: '08:30 – 10:00',
            category: 'Check-in cảnh quan',
            title: 'Ghé check-in Lò Gạch Cũ Duy Xuyên trên đường đi Hội An',
            location: 'Lò Gạch Cũ Farmstay',
            address: 'Thôn Vĩnh Nam, Xã Duy Vinh, Huyện Duy Xuyên, Tỉnh Quảng Nam',
            note: 'Cây cầu tre uốn lượn giữa đồng lúa bát ngát dẫn vào lò gạch cổ kính rêu phong.',
            aiTip: 'Thưởng thức cà phê sữa đá nông sản hữu cơ nguyên chất tại quán cafe view lúa.',
            cost: '65.000đ/người',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            transit: 'Di chuyển theo đường Lạc Long Quân ven biển: 24 km ~ 35 phút'
          },
          {
            time: '10:30 – 12:30',
            category: 'Trải nghiệm sông nước',
            title: 'Chèo thuyền thúng Rừng Dừa Bảy Mẫu Cẩm Thanh',
            location: 'Khu du lịch sinh thái Rừng Dừa Bảy Mẫu',
            address: 'Thôn Vạn Lăng, Xã Cẩm Thanh, TP. Hội An, Tỉnh Quảng Nam',
            note: 'Trải nghiệm ngồi thuyền thúng len lỏi qua rặng dừa nước ngập mặn và xem màn múa thúng xoay tít.',
            aiTip: 'Nên mang mũ rộng vành và chuẩn bị tiền boa nhỏ cho bác lái thúng nhiệt tình.',
            cost: '150.000đ/người',
            image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
            transit: 'Di chuyển từ Duy Xuyên qua Cẩm Thanh: 7 km ~ 15 phút'
          },
          {
            time: '13:00 – 14:30',
            category: 'Ẩm thực phố cổ',
            title: 'Ăn trưa Cơm gà Bà Buội & Thưởng thức Nước Mót Hội An',
            location: 'Cơm gà Bà Buội & Trà Mót',
            address: '22 Phan Chu Trinh & 150 Trần Phú, P. Minh An, TP. Hội An, Quảng Nam',
            note: 'Thịt gà ta thả vườn vàng ươm, cơm dẻo nấu nước luộc gà thơm lừng, tráng miệng nước mót hoa sen.',
            aiTip: 'Quán rất đông vào giờ trưa, nên ghé sau 13:00 để có chỗ ngồi mát mẻ.',
            cost: '95.000đ/người',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
            transit: 'Di chuyển vào phố cổ Hội An: 4 km ~ 10 phút'
          },
          {
            time: '16:00 – 21:00',
            category: 'Di sản văn hóa',
            title: 'Dạo bộ Chùa Cầu, Nhà cổ Tấn Ký & Thả hoa đăng Sông Hoài',
            location: 'Chùa Cầu & Sông Hoài Phố Cổ',
            address: 'Đường Nguyễn Thị Minh Khai & Bạch Đằng, P. Minh An, TP. Hội An',
            note: 'Ngắm phố cổ lung linh hàng vạn đèn lồng khi hoàng hôn buông xuống, thả hoa đăng nguyện ước may mắn.',
            aiTip: 'Thuê thuyền gỗ ngắm phố cổ từ lòng sông Hoài lúc 18:30 khi các dãy nhà cổ đồng loạt thắp đèn lồng.',
            cost: '120.000đ/người',
            image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
            transit: 'Dạo bộ trong khu phố cổ đi bộ: 1.5 km'
          }
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
          {
            time: '11:00 – 13:00',
            category: 'Nghỉ dưỡng & Homestay',
            title: 'Nhận phòng Homestay Hoàng Hôn Dasar view đồi thông',
            location: 'Dasar Hill Homestay',
            address: 'Thôn 1, Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng',
            note: 'Căn phòng kính ngắm trọn thung lũng thông reo, không khí se lạnh 16°C trong lành.',
            aiTip: 'Nên đặt trước phòng áp mái hướng đông để đón trọn bình minh thung lũng.',
            cost: '600.000đ/đêm',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            transit: 'Từ bến xe liên tỉnh về Homestay: 12 km ~ 20 phút'
          },
          {
            time: '14:30 – 17:00',
            category: 'Check-in cafe chill',
            title: 'Thưởng thức cafe & ngắm cúc họa mi tại Tiệm Cà Phê Túi Mơ To',
            location: 'Tiệm Cà Phê Túi Mơ To',
            address: 'Hẻm 31 Sào Nam, Phường 11, TP. Đà Lạt, Tỉnh Lâm Đồng',
            note: 'Vườn cúc họa mi trắng muốt nở rộ, view nhìn xuống thung lũng nhà lồng trồng hoa thơ mộng.',
            aiTip: 'Đến lúc 16:00 để chụp cả ban ngày và đón khoảnh khắc nhà lồng bật đèn vàng rực rỡ.',
            cost: '85.000đ/người',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            transit: 'Đi theo QL20 vào Hẻm Sào Nam: 6.8 km ~ 15 phút'
          },
          {
            time: '18:30 – 20:30',
            category: 'Ẩm thực ấm nóng',
            title: 'Ăn tối Lẩu gà lá é Tao Ngộ đường 3 Tháng 4 chuẩn vị',
            location: 'Lẩu gà lá é Tao Ngộ',
            address: 'Số 05 Đường 3 Tháng 4, Phường 3, TP. Đà Lạt, Tỉnh Lâm Đồng',
            note: 'Nồi lẩu gà nóng hổi bốc khói, thịt gà ta chắc ngọt và vị the the chua thanh ấm nồng đêm lạnh.',
            aiTip: 'Quán rất đông vào mùa đông, nên đến lúc 18:00 để không phải xếp hàng chờ bàn.',
            cost: '150.000đ/người',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
            transit: 'Từ Sào Nam về trung tâm đường 3/4: 5.5 km ~ 12 phút'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Ngày 2: Săn mây Đồi chè Cầu Đất & Vườn hồng treo gió',
        activities: [
          {
            time: '04:45 – 07:30',
            category: 'Thiên nhiên & Săn mây',
            title: 'Khởi hành săn biển mây thảm gỗ Đồi chè Cầu Đất Farm',
            location: 'Thiên Đường Săn Mây Cầu Đất',
            address: 'Thôn Trường Thọ, Xã Trạm Hành, TP. Đà Lạt, Tỉnh Lâm Đồng',
            note: 'Biển mây bồng bềnh cuồn cuộn dưới ánh bình minh xuyên qua đồi chè xanh mướt ngút ngàn.',
            aiTip: 'Nhiệt độ sáng sớm chỉ 12°C - 14°C, hãy mặc áo phao dày, găng tay và khăn quàng cổ.',
            cost: '120.000đ/người',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            transit: 'Cung đường QL20 uốn lượn sương mù: 24 km ~ 40 phút'
          },
          {
            time: '08:30 – 09:30',
            category: 'Điểm tâm sáng',
            title: 'Ăn sáng Bánh mì xíu mại chén Hoàng Diệu thơm cay',
            location: 'Bánh mì xíu mại Hoàng Diệu',
            address: '26 Hoàng Diệu, Phường 5, TP. Đà Lạt, Tỉnh Lâm Đồng',
            note: 'Chén xíu mại nóng hổi thơm nồng ớt sa tế, chấm kèm bánh mì giòn tan sưởi ấm sáng sớm.',
            aiTip: 'Nên gọi thêm ly sữa đậu nành nóng hổi ăn kèm bánh mì xíu mại chuẩn gu người Đà Lạt.',
            cost: '40.000đ/người',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
            transit: 'Từ Cầu Đất quay về trung tâm Hoàng Diệu: 22 km ~ 35 phút'
          },
          {
            time: '14:00 – 16:30',
            category: 'Nông nghiệp trải nghiệm',
            title: 'Tham quan cơ sở sản xuất Hồng treo gió công nghệ Nhật',
            location: 'Vườn hồng Lễ Vân',
            address: '45 Khe Sanh, Phường 10, TP. Đà Lạt, Tỉnh Lâm Đồng',
            note: 'Chiêm ngưỡng giàn hồng treo gió vàng ươm mật dẻo tự nhiên, thử hồng và trà atiso miễn phí.',
            aiTip: 'Mua hồng treo gió làm quà nên chọn gói hút chân không để giữ được độ dẻo thơm lâu nhất.',
            cost: '200.000đ',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            transit: 'Di chuyển theo cung đường Khe Sanh: 4.5 km ~ 10 phút'
          }
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
          {
            time: '07:30 – 09:00',
            category: 'Chuẩn bị phượt',
            title: 'Thuê xe máy cào cào và trang bị giáp bảo hộ phượt',
            location: 'Dịch vụ thuê xe Giang Sơn',
            address: 'Km3 Cầu Mè, Xã Phương Thiện, TP. Hà Giang, Tỉnh Hà Giang',
            note: 'Kiểm tra kỹ lưỡng phanh, lốp gai, đèn sương mù và nhận áo mưa bộ phản quang.',
            aiTip: 'Kiểm tra kỹ giấy tờ xe và đổ đầy bình xăng trước khi bắt đầu leo dốc núi.',
            cost: '200.000đ/xe',
            image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
            transit: 'Khởi hành từ trung tâm TP. Hà Giang'
          },
          {
            time: '11:00 – 12:30',
            category: 'Kỳ quan đèo dốc',
            title: 'Chinh phục Dốc Bắc Sum & Check-in Cổng Trời Quản Bạ',
            location: 'Cổng Trời Quản Bạ & Núi Đôi Cô Tiên',
            address: 'Quốc lộ 4C, Xã Quyết Tiến, Huyện Quản Bạ, Tỉnh Hà Giang',
            note: 'Cung đường đèo uốn lượn ngoạn mục, ngắm Núi Đôi Cô Tiên trù phú giữa lòng thung lũng Tam Sơn.',
            aiTip: 'Ghé quán cafe đỉnh đèo Quản Bạ để có góc máy chụp bao quát toàn bộ Dốc Bắc Sum từ trên cao.',
            cost: 'Miễn phí vé',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            transit: 'Vượt Dốc Bắc Sum trên QL4C: 46 km ~ 1.5 giờ lái xe máy'
          },
          {
            time: '17:30 – 21:00',
            category: 'Văn hóa bản địa',
            title: 'Đến Phố Cáo & Nghỉ đêm tại Homestay nhà trình tường',
            location: 'A Páo Homestay Phố Cáo',
            address: 'Thôn Sảng Pả, Xã Phố Cáo, Huyện Đồng Văn, Tỉnh Hà Giang',
            note: 'Trải nghiệm ngủ nhà đất trình tường ấm áp của người Mông, quây quần bên bếp lửa thưởng thức Thắng Cố.',
            aiTip: 'Thử một chén rượu ngô men lá thơm nồng của gia chủ để xua tan cái lạnh vùng cao.',
            cost: '250.000đ/người',
            image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
            transit: 'Đi qua rừng thông Yên Minh: 75 km ~ 2.5 giờ lái xe'
          }
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

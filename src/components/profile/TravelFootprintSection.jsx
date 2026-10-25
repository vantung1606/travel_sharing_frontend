import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  Compass,
  Award,
  Sparkles,
  Share2,
  Check,
  Plus,
  Flame,
  Globe,
  Route,
  FileText,
  TrendingUp,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { provinceApi } from '../../services/api';
import { useApp } from '../../context/AppContext';

// Vùng miền for UI pills (tổng số tính ĐỘNG từ danh mục tỉnh server)
const REGION_META = [
  { id: 'all', label: 'Toàn quốc' },
  { id: 'north', label: 'Miền Bắc' },
  { id: 'central', label: 'Miền Trung' },
  { id: 'highlands', label: 'Tây Nguyên' },
  { id: 'south', label: 'Miền Nam' }
];

// FALLBACK danh mục 63 tỉnh cũ khi chưa lấy được danh mục từ server /api/provinces
export const VIETNAM_PROVINCES = [
  // MIỀN BẮC (25)
  { id: 'HN', name: 'Hà Nội', region: 'north', aliases: ['hà nội', 'ha noi', 'hanoi', 'thủ đô'], highlight: 'Hồ Gươm & Phố Cổ' },
  { id: 'HP', name: 'Hải Phòng', region: 'north', aliases: ['hải phòng', 'hai phong', 'cát bà', 'đồ sơn'], highlight: 'Đảo Cát Bà' },
  { id: 'QN', name: 'Quảng Ninh', region: 'north', aliases: ['quảng ninh', 'quang ninh', 'hạ long', 'ha long', 'cô tô'], highlight: 'Vịnh Hạ Long' },
  { id: 'HG', name: 'Hà Giang', region: 'north', aliases: ['hà giang', 'ha giang', 'mã pí lèng', 'đồng văn', 'lũng cú'], highlight: 'Đèo Mã Pí Lèng' },
  { id: 'LC', name: 'Lào Cai', region: 'north', aliases: ['lào cai', 'lao cai', 'sa pa', 'sapa', 'fansipan'], highlight: 'Thị xã Sa Pa' },
  { id: 'NB', name: 'Ninh Bình', region: 'north', aliases: ['ninh bình', 'ninh binh', 'tràng an', 'tam cốc', 'bái đính'], highlight: 'Quần thể Tràng An' },
  { id: 'CB', name: 'Cao Bằng', region: 'north', aliases: ['cao bằng', 'cao bang', 'bản giốc', 'pac bo'], highlight: 'Thác Bản Giốc' },
  { id: 'BK', name: 'Bắc Kạn', region: 'north', aliases: ['bắc kạn', 'bac kan', 'ba bể', 'ba be'], highlight: 'Hồ Ba Bể' },
  { id: 'TQ', name: 'Tuyên Quang', region: 'north', aliases: ['tuyên quang', 'tuyen quang', 'na hang'], highlight: 'Hồ Na Hang' },
  { id: 'YB', name: 'Yên Bái', region: 'north', aliases: ['yên bái', 'yen bai', 'mù cang chải', 'mu cang chai', 'thác bà'], highlight: 'Ruộng Mù Cang Chải' },
  { id: 'TN', name: 'Thái Nguyên', region: 'north', aliases: ['thái nguyên', 'thai nguyen', 'hồ núi cốc'], highlight: 'Đồi Chè Tân Cương' },
  { id: 'LS', name: 'Lạng Sơn', region: 'north', aliases: ['lạng sơn', 'lang son', 'mẫu sơn', 'mau son'], highlight: 'Đỉnh Mẫu Sơn' },
  { id: 'BG', name: 'Bắc Giang', region: 'north', aliases: ['bắc giang', 'bac giang', 'tây yên tử'], highlight: 'Khu Tây Yên Tử' },
  { id: 'PT', name: 'Phú Thọ', region: 'north', aliases: ['phú thọ', 'phu tho', 'đền hùng', 'xuân sơn'], highlight: 'Đền Hùng' },
  { id: 'VP', name: 'Vĩnh Phúc', region: 'north', aliases: ['vĩnh phúc', 'vinh phuc', 'tam đảo', 'tam dao'], highlight: 'Thị trấn Tam Đảo' },
  { id: 'BN', name: 'Bắc Ninh', region: 'north', aliases: ['bắc ninh', 'bac ninh', 'kinh bắc'], highlight: 'Chùa Dâu & Quan Họ' },
  { id: 'HD', name: 'Hải Dương', region: 'north', aliases: ['hải dương', 'hai duong', 'côn sơn', 'kiếp bạc'], highlight: 'Côn Sơn Kiếp Bạc' },
  { id: 'HY', name: 'Hưng Yên', region: 'north', aliases: ['hưng yên', 'hung yen', 'phố hiến'], highlight: 'Phố Hiến Cổ Kính' },
  { id: 'TB', name: 'Thái Bình', region: 'north', aliases: ['thái bình', 'thai binh', 'đồng châu', 'cồn vành'], highlight: 'Bãi Biển Cồn Vành' },
  { id: 'HNAM', name: 'Hà Nam', region: 'north', aliases: ['hà nam', 'ha nam', 'tam chúc', 'tam chuc'], highlight: 'Chùa Tam Chúc' },
  { id: 'ND', name: 'Nam Định', region: 'north', aliases: ['nam định', 'nam dinh', 'quất lâm', 'xuân thủy'], highlight: 'Nhà Thờ Đổ Hải Lý' },
  { id: 'DB', name: 'Điện Biên', region: 'north', aliases: ['điện biên', 'dien bien', 'mường thanh', 'a1'], highlight: 'Đồi A1 Lịch Sử' },
  { id: 'LCU', name: 'Lai Châu', region: 'north', aliases: ['lai châu', 'lai chau', 'ô quy hồ', 'sin suối hồ'], highlight: 'Đèo Ô Quy Hồ' },
  { id: 'SL', name: 'Sơn La', region: 'north', aliases: ['sơn la', 'son la', 'mộc châu', 'moc chau', 'tà xùa', 'ta xua'], highlight: 'Thiên Đường Tà Xùa' },
  { id: 'HB', name: 'Hòa Bình', region: 'north', aliases: ['hòa bình', 'hoa binh', 'mai châu', 'mai chau', 'thung nai'], highlight: 'Thung Lũng Mai Châu' },

  // MIỀN TRUNG (14)
  { id: 'DN', name: 'Đà Nẵng', region: 'central', aliases: ['đà nẵng', 'da nang', 'danang', 'bà nà', 'bana', 'ngũ hành sơn'], highlight: 'Cầu Vàng Bà Nà' },
  { id: 'TTH', name: 'Thừa Thiên Huế', region: 'central', aliases: ['thừa thiên huế', 'huế', 'hue', 'cố đô', 'sông hương', 'lăng cô'], highlight: 'Đại Nội Kinh Thành' },
  { id: 'QNA', name: 'Quảng Nam', region: 'central', aliases: ['quảng nam', 'quang nam', 'hội an', 'hoi an', 'mỹ sơn'], highlight: 'Phố Cổ Hội An' },
  { id: 'QT', name: 'Quảng Trị', region: 'central', aliases: ['quảng trị', 'quang tri', 'cửa tùng', 'thành cổ'], highlight: 'Địa Đạo Vịnh Mốc' },
  { id: 'QB', name: 'Quảng Bình', region: 'central', aliases: ['quảng bình', 'quang binh', 'phong nha', 'sơn đoòng', 'kẻ bàng'], highlight: 'Hang Sơn Đoòng' },
  { id: 'HT', name: 'Hà Tĩnh', region: 'central', aliases: ['hà tĩnh', 'ha tinh', 'thiên cầm', 'ngã ba đồng lộc'], highlight: 'Biển Thiên Cầm' },
  { id: 'NA', name: 'Nghệ An', region: 'central', aliases: ['nghệ an', 'nghe an', 'cửa lò', 'nam đàn', 'pù mát'], highlight: 'Bãi Biển Cửa Lò' },
  { id: 'TH', name: 'Thanh Hóa', region: 'central', aliases: ['thanh hóa', 'thanh hoa', 'sầm sơn', 'pù luông', 'pu luong'], highlight: 'Khu Bảo Tồn Pù Luông' },
  { id: 'QNG', name: 'Quảng Ngãi', region: 'central', aliases: ['quảng ngãi', 'quang ngai', 'lý sơn', 'ly son'], highlight: 'Đảo Ngọc Lý Sơn' },
  { id: 'BD', name: 'Bình Định', region: 'central', aliases: ['bình định', 'binh dinh', 'quy nhơn', 'quy nhon', 'kỳ co', 'eo gió'], highlight: 'Eo Gió Quy Nhơn' },
  { id: 'PY', name: 'Phú Yên', region: 'central', aliases: ['phú yên', 'phu yen', 'ghềnh đá đĩa', 'tuy hòa', 'mũi điện'], highlight: 'Ghềnh Đá Đĩa' },
  { id: 'KH', name: 'Khánh Hòa', region: 'central', aliases: ['khánh hòa', 'khanh hoa', 'nha trang', 'cam ranh', 'điệp sơn'], highlight: 'Vịnh Biển Nha Trang' },
  { id: 'NT', name: 'Ninh Thuận', region: 'central', aliases: ['ninh thuận', 'ninh thuan', 'vĩnh hy', 'phan rang', 'núi chúa'], highlight: 'Vịnh Vĩnh Hy' },
  { id: 'BTH', name: 'Bình Thuận', region: 'central', aliases: ['bình thuận', 'binh thuan', 'mũi né', 'mui ne', 'phan thiết', 'cù lao câu'], highlight: 'Đồi Cát Mũi Né' },

  // TÂY NGUYÊN (5)
  { id: 'LD', name: 'Lâm Đồng', region: 'highlands', aliases: ['lâm đồng', 'lam dong', 'đà lạt', 'da lat', 'dalat', 'bảo lộc'], highlight: 'Xứ Mộng Mơ Đà Lạt' },
  { id: 'DLK', name: 'Đắk Lắk', region: 'highlands', aliases: ['đắk lắk', 'dak lak', 'buôn ma thuột', 'bmt', 'hồ lắk', 'buôn đôn'], highlight: 'Thủ Phủ Cà Phê BMT' },
  { id: 'GL', name: 'Gia Lai', region: 'highlands', aliases: ['gia lai', 'pleiku', 'biển hồ', 'chư đăng ya'], highlight: 'Biển Hồ T’Nưng' },
  { id: 'KT', name: 'Kon Tum', region: 'highlands', aliases: ['kon tum', 'măng đen', 'mang den', 'ngọc hồi'], highlight: 'Xứ Lạnh Măng Đen' },
  { id: 'DKN', name: 'Đắk Nông', region: 'highlands', aliases: ['đắk nông', 'dak nong', 'tà đùng', 'ta dung'], highlight: 'Hồ Tà Đùng' },

  // MIỀN NAM & ĐBSCL (19)
  { id: 'SG', name: 'TP. Hồ Chí Minh', region: 'south', aliases: ['hồ chí minh', 'ho chi minh', 'sài gòn', 'sai gon', 'tphcm', 'hcm'], highlight: 'Phố Đi Bộ & Chợ Bến Thành' },
  { id: 'KG', name: 'Kiên Giang', region: 'south', aliases: ['kiên giang', 'kien giang', 'phú quốc', 'phu quoc', 'nam du', 'hà tiên'], highlight: 'Đảo Ngọc Phú Quốc' },
  { id: 'CT', name: 'Cần Thơ', region: 'south', aliases: ['cần thơ', 'can tho', 'cái răng', 'bến ninh kiều'], highlight: 'Chợ Nổi Cái Răng' },
  { id: 'VT', name: 'Bà Rịa - Vũng Tàu', region: 'south', aliases: ['bà rịa', 'vũng tàu', 'vung tau', 'côn đảo', 'con dao', 'hồ tràm'], highlight: 'Bãi Sau & Côn Đảo' },
  { id: 'AG', name: 'An Giang', region: 'south', aliases: ['an giang', 'châu đốc', 'trà sư', 'thất sơn', 'núi sam'], highlight: 'Rừng Tràm Trà Sư' },
  { id: 'DT', name: 'Đồng Tháp', region: 'south', aliases: ['đồng tháp', 'dong thap', 'sa đéc', 'tràm chim', 'sen hồng'], highlight: 'Làng Hoa Sa Đéc' },
  { id: 'TG', name: 'Tiền Giang', region: 'south', aliases: ['tiền giang', 'tien giang', 'mỹ tho', 'thới sơn', 'cái bè'], highlight: 'Cù Lao Thới Sơn' },
  { id: 'BTRE', name: 'Bến Tre', region: 'south', aliases: ['bến tre', 'ben tre', 'xứ dừa', 'châu thành'], highlight: 'Xứ Sở Dừa Bến Tre' },
  { id: 'VL', name: 'Vĩnh Long', region: 'south', aliases: ['vĩnh long', 'vinh long', 'an bình'], highlight: 'Cù Lao An Bình' },
  { id: 'TV', name: 'Trà Vinh', region: 'south', aliases: ['trà vinh', 'tra vinh', 'ba động', 'chùa hang'], highlight: 'Biển Ba Động' },
  { id: 'HG', name: 'Hậu Giang', region: 'south', aliases: ['hậu giang', 'hau giang', 'ngã bảy', 'lung ngọc hoàng'], highlight: 'Lung Ngọc Hoàng' },
  { id: 'ST', name: 'Sóc Trăng', region: 'south', aliases: ['sóc trăng', 'soc trang', 'chùa dơi', 'chùa chén kiểu'], highlight: 'Chùa Dơi Kỳ Bí' },
  { id: 'BL', name: 'Bạc Liêu', region: 'south', aliases: ['bạc liêu', 'bac lieu', 'công tử bạc liêu', 'điện gió'], highlight: 'Cánh Đồng Điện Gió' },
  { id: 'CM', name: 'Cà Mau', region: 'south', aliases: ['cà mau', 'ca mau', 'đất mũi', 'u minh hạ'], highlight: 'Mốc Tọa Độ Đất Mũi' },
  { id: 'BDG', name: 'Bình Dương', region: 'south', aliases: ['bình dương', 'binh duong', 'đại nam', 'dĩ an'], highlight: 'Khu DL Đại Nam' },
  { id: 'BP', name: 'Bình Phước', region: 'south', aliases: ['bình phước', 'binh phuoc', 'bù gia mập', 'núi bà rá'], highlight: 'Vườn QG Bù Gia Mập' },
  { id: 'TNINH', name: 'Tây Ninh', region: 'south', aliases: ['tây ninh', 'tay ninh', 'bà đen', 'ba den', 'tòa thánh'], highlight: 'Đỉnh Núi Bà Đen' },
  { id: 'DNAI', name: 'Đồng Nai', region: 'south', aliases: ['đồng nai', 'dong nai', 'cát tiên', 'bửu long', 'trị an'], highlight: 'Vườn QG Cát Tiên' },
  { id: 'LA', name: 'Long An', region: 'south', aliases: ['long an', 'tân lập', 'đồng tháp mười'], highlight: 'Làng Nổi Tân Lập' }
];

export const TravelFootprintSection = ({ posts = [], itineraries = [], userId = 1, userName = 'Bạn' }) => {
  const toast = useToast();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvinceForStories, setSelectedProvinceForStories] = useState(null);

  // Lưu trữ danh sách tỉnh đã check-in thủ công
  const storageKey = `wayfare_travel_footprints_${userId}`;
  const [manualVisitedIds, setManualVisitedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Danh mục tỉnh thành THẬT từ server (bảng provinces — 34 đơn vị 2025), fallback danh sách cũ
  const { currentUser } = useApp();
  const [serverProvinces, setServerProvinces] = useState(null);
  const [serverVisited, setServerVisited] = useState(null); // mã tỉnh từ DB (user đang đăng nhập)

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await provinceApi.getProvinces();
      if (alive && Array.isArray(list) && list.length > 0) {
        setServerProvinces(list.map(p => ({
          id: p.code,
          name: p.name,
          region: p.region,
          aliases: [...(p.aliases || []), (p.name || '').toLowerCase()],
          highlight: `Khám phá ${p.name}`
        })));
      }
      // dấu chân lưu DB — chỉ đồng bộ cho profile của chính mình khi đã đăng nhập
      const me = currentUser?.id != null && Number(userId) === Number(currentUser.id);
      if (me) {
        const visited = await provinceApi.getMyVisited();
        if (alive && Array.isArray(visited)) {
          setServerVisited(visited);
        }
      }
    })();
    return () => { alive = false; };
  }, [userId, currentUser?.id, currentUser?.token]);

  // Danh sách dùng render: server nếu có, không thì fallback hardcode
  const provinceList = serverProvinces || VIETNAM_PROVINCES;

  // Hợp nhất dấu chân: server DB (ưu tiên khi dùng được) + tự nhận diện từ bài viết
  const manualVisitedIdsMerged = useMemo(() => {
    if (Array.isArray(serverVisited)) {
      const set = new Set([...serverVisited, ...(currentUser?.id != null && Number(userId) === Number(currentUser.id) ? [] : manualVisitedIds)]);
      return Array.from(set);
    }
    return manualVisitedIds;
  }, [serverVisited, manualVisitedIds, userId, currentUser?.id]);

  // Tự động quét từ các bài viết và lịch trình để nhận diện tỉnh thành đã đặt chân tới
  const detectedProvinceIds = useMemo(() => {
    const ids = new Set();

    const checkTextAgainstProvinces = (text) => {
      if (!text) return;
      const lower = text.toLowerCase();
      provinceList.forEach(prov => {
        if (prov.aliases.some(alias => lower.includes(alias))) {
          ids.add(prov.id);
        }
      });
    };

    posts.forEach(p => {
      checkTextAgainstProvinces(p.title);
      checkTextAgainstProvinces(p.content);
      checkTextAgainstProvinces(p.locationTag);
      checkTextAgainstProvinces(p.destination);
    });

    itineraries.forEach(itin => {
      checkTextAgainstProvinces(itin.title);
      checkTextAgainstProvinces(itin.destination);
    });

    return Array.from(ids);
  }, [posts, itineraries, provinceList]);

  // Hợp nhất các tỉnh được tự động nhận diện và các tỉnh người dùng đánh dấu
  const allVisitedIds = useMemo(() => {
    const set = new Set([...detectedProvinceIds, ...manualVisitedIdsMerged]);
    return Array.from(set);
  }, [detectedProvinceIds, manualVisitedIdsMerged]);

  // Check-in thủ công: lưu lên SERVER (bảng user_provinces_visited); fallback localStorage khi chưa đăng nhập
  const handleToggleCheckin = async (provinceId, e) => {
    e?.stopPropagation();
    const isAdding = !manualVisitedIdsMerged.includes(provinceId);
    const updated = isAdding
      ? [...manualVisitedIdsMerged, provinceId]
      : manualVisitedIdsMerged.filter(id => id !== provinceId);

    setManualVisitedIds(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save footprint to localStorage:', err);
    }

    if (Array.isArray(serverVisited) || (currentUser?.token && Number(userId) === Number(currentUser.id))) {
      const res = await provinceApi.setVisited(provinceId, isAdding);
      if (Array.isArray(res)) {
        setServerVisited(res);
        toast.showSuccess?.(isAdding ? '🎉 Đã lưu dấu chân vào tài khoản!' : 'Đã gỡ dấu chân tỉnh thành');
        return;
      }
      toast.showError?.('Không lưu được dấu chân (chưa đăng nhập hoặc lỗi kết nối)');
    }

    if (isAdding) {
      toast.showSuccess?.(`🎉 Đã thêm dấu chân mới! Tiếp tục khám phá Việt Nam nào!`);
    } else {
      toast.showInfo?.(`Đã gỡ dấu chân tỉnh thành`);
    }
  };

  // Thống kê tiến độ (tổng cấp đầu động từ danh mục server)
  const totalCount = provinceList.length;
  const visitedCount = allVisitedIds.length;
  const progressPercent = Math.min(100, Math.round((visitedCount / totalCount) * 100));

  // Cấp bậc Blogger Explorer
  const explorerRank = useMemo(() => {
    if (visitedCount >= 50) return { title: 'Bậc Thầy Chinh Phục Việt Nam', badge: '👑 Master Explorer', color: 'from-amber-500 to-rose-600', level: 5 };
    if (visitedCount >= 30) return { title: 'Blogger Du Lịch Kỳ Cựu', badge: '🌟 Pro Explorer', color: 'from-purple-600 to-indigo-600', level: 4 };
    if (visitedCount >= 15) return { title: 'Phượt Thủ Đam Mê', badge: '🎒 Passionate Rider', color: 'from-sky-500 to-blue-600', level: 3 };
    if (visitedCount >= 5) return { title: 'Lãng Tử Khám Phá', badge: '🧭 Wanderer', color: 'from-emerald-500 to-teal-600', level: 2 };
    return { title: 'Tập Sự Khởi Hành', badge: '🌿 Novice Traveler', color: 'from-slate-600 to-slate-800', level: 1 };
  }, [visitedCount]);

  // Thống kê theo từng miền (tong đếm ĐỘNG từ danh sách hiện tại)
  const regionStats = useMemo(() => {
    const stats = {
      north: { total: 0, visited: 0 },
      central: { total: 0, visited: 0 },
      highlands: { total: 0, visited: 0 },
      south: { total: 0, visited: 0 }
    };
    provinceList.forEach(p => {
      if (stats[p.region]) {
        stats[p.region].total += 1;
        if (allVisitedIds.includes(p.id)) {
          stats[p.region].visited += 1;
        }
      }
    });
    return stats;
  }, [allVisitedIds, provinceList]);

  // Lọc danh sách tỉnh thành theo tab và tìm kiếm
  const filteredProvinces = useMemo(() => {
    return provinceList.filter(p => {
      const matchRegion = selectedRegion === 'all' || p.region === selectedRegion;
      const matchQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.highlight.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.aliases.some(a => a.includes(searchQuery.toLowerCase()));
      return matchRegion && matchQuery;
    });
  }, [selectedRegion, searchQuery, provinceList]);

  // Đếm bài viết & lịch trình liên quan đến một tỉnh
  const getProvinceStories = (prov) => {
    const matchedPosts = posts.filter(p => {
      const text = `${p.title || ''} ${p.content || ''} ${p.locationTag || ''}`.toLowerCase();
      return prov.aliases.some(a => text.includes(a));
    });
    const matchedItins = itineraries.filter(itin => {
      const text = `${itin.title || ''} ${itin.destination || ''}`.toLowerCase();
      return prov.aliases.some(a => text.includes(a));
    });
    return { posts: matchedPosts, itineraries: matchedItins };
  };

  const selectedStories = useMemo(() => {
    if (!selectedProvinceForStories) return null;
    return getProvinceStories(selectedProvinceForStories);
  }, [selectedProvinceForStories, posts, itineraries]);

  const handleShareFootprint = () => {
    const text = `Tôi đã đặt chân đến ${visitedCount}/${totalCount} tỉnh thành Việt Nam (${progressPercent}% đất nước) trên Wayfare!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.showSuccess?.('Đã sao chép liên kết dấu chân du lịch của bạn! 🚀');
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* HEADER BENTO: PROGRESS HERO & BADGE                       */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-[6px] bg-gradient-to-br from-ink-950 via-ink-900 to-clay-950 text-white p-6 sm:p-8 shadow-sm border border-ink-700/60">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-clay-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-clay-500/20 text-clay-300 text-xs font-bold border border-clay-400/30 mb-2.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Bản Đồ Dấu Chân Du Lịch Việt Nam</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                Hành Trình Khám Phá {totalCount} Tỉnh Thành
              </h2>
              <p className="text-ink-300 text-xs sm:text-sm mt-1 max-w-xl font-serif leading-relaxed">
                Ghi dấu mọi tọa độ bạn từng đi qua. Kết nối các bài blog, lịch trình AI và chia sẻ cột mốc chinh phục dải đất hình chữ S cùng cộng đồng Wayfare.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareFootprint}
                className="px-3.5 py-2 rounded-[5px] bg-[#FFFDF8]/10 hover:bg-[#FFFDF8]/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ dấu chân</span>
              </button>
            </div>
          </div>

          {/* Progress Bar & Big Counters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-ink-900/60 border border-ink-700/70 rounded-[6px] p-4 sm:p-5 backdrop-blur-sm">
            <div className="md:col-span-5 flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[6px] bg-gradient-to-br from-clay-600 to-clay-800 flex flex-col items-center justify-center text-white shrink-0 shadow-md border border-clay-500/30">
                <span className="text-2xl sm:text-3xl font-black font-display leading-none">{visitedCount}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-clay-200 mt-1">/ {totalCount} Tỉnh</span>
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-[4px] text-xs font-black bg-clay-500 text-white shadow-2xs border border-clay-400/40">
                  {explorerRank.badge}
                </span>
                <h4 className="text-base sm:text-lg font-black font-display text-white mt-1">
                  {explorerRank.title}
                </h4>
                <p className="text-xs text-clay-200/90 font-serif">
                  Đã đặt chân qua {progressPercent}% lãnh thổ Việt Nam
                </p>
              </div>
            </div>

            <div className="md:col-span-7 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-ink-300">
                <span>Tiến độ khám phá toàn quốc</span>
                <span className="text-clay-300 font-black">{visitedCount}/{totalCount} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-ink-950 rounded-[4px] overflow-hidden p-0.5 border border-ink-800">
                <div
                  className="h-full bg-gradient-to-r from-clay-500 via-amber-500 to-emerald-500 rounded-[3px] transition-all duration-700 ease-out shadow-xs"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>

              {/* 4 Regions Small Counters */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-[11px]">
                <div className="bg-ink-900/90 rounded-[5px] p-2 text-center border border-ink-800">
                  <span className="text-ink-400 block text-[10px] font-serif">Miền Bắc</span>
                  <span className="font-black text-white text-xs">{regionStats.north.visited}/{regionStats.north.total}</span>
                </div>
                <div className="bg-ink-900/90 rounded-[5px] p-2 text-center border border-ink-800">
                  <span className="text-ink-400 block text-[10px] font-serif">Miền Trung</span>
                  <span className="font-black text-white text-xs">{regionStats.central.visited}/{regionStats.central.total}</span>
                </div>
                <div className="bg-ink-900/90 rounded-[5px] p-2 text-center border border-ink-800">
                  <span className="text-ink-400 block text-[10px] font-serif">Tây Nguyên</span>
                  <span className="font-black text-white text-xs">{regionStats.highlands.visited}/{regionStats.highlands.total}</span>
                </div>
                <div className="bg-ink-900/90 rounded-[5px] p-2 text-center border border-ink-800">
                  <span className="text-ink-400 block text-[10px] font-serif">Miền Nam</span>
                  <span className="font-black text-white text-xs">{regionStats.south.visited}/{regionStats.south.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FILTER & SEARCH CONTROLS                                  */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF8] p-3.5 sm:p-4 rounded-[6px] border border-ink-200/80 shadow-2xs">
        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {REGION_META.map(reg => {
            const isActive = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-clay-600 text-white shadow-xs font-bold'
                    : 'bg-[#F8F4EC] hover:bg-[#EFE9DC] text-ink-700 border border-ink-200/80'
                }`}
              >
                <span>{reg.label}</span>
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-[3px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-ink-200 text-ink-700'
                }`}>
                  {reg.id === 'all'
                    ? `${visitedCount}/${totalCount}`
                    : `${regionStats[reg.id]?.visited || 0}/${regionStats[reg.id]?.total || 0}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search province input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tỉnh, điểm đến..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] text-xs font-medium text-ink-800 placeholder-ink-400 focus:outline-hidden focus:ring-1 focus:ring-clay-500/20 focus:border-clay-500 transition-all"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* PROVINCES GRID TILES */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredProvinces.map(prov => {
          const isVisited = allVisitedIds.includes(prov.id);
          const isAutoDetected = detectedProvinceIds.includes(prov.id);
          const { posts: matchedPosts, itineraries: matchedItins } = getProvinceStories(prov);
          const storyCount = matchedPosts.length + matchedItins.length;

          return (
            <div
              key={prov.id}
              onClick={() => {
                if (storyCount > 0) {
                  setSelectedProvinceForStories(prov);
                } else {
                  handleToggleCheckin(prov.id);
                }
              }}
              className={`group relative p-3.5 rounded-[6px] border transition-all cursor-pointer select-none flex flex-col justify-between min-h-[115px] ${
                isVisited
                  ? 'bg-[#FFFDF8] border-clay-300 shadow-2xs hover:shadow-xs hover:border-clay-500'
                  : 'bg-[#FDFBF7] hover:bg-[#F8F4EC] border-ink-200/60 hover:border-ink-300 opacity-90 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] border ${
                    isVisited
                      ? 'bg-clay-50 text-clay-700 border-clay-200/60'
                      : 'bg-ink-100 text-ink-600 border-ink-200/60'
                  }`}>
                    {prov.region === 'north' ? 'Bắc' : prov.region === 'central' ? 'Trung' : prov.region === 'highlands' ? 'T.Nguyên' : 'Nam'}
                  </span>

                  {/* Checkmark Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleCheckin(prov.id, e)}
                    className={`w-6 h-6 rounded-[4px] flex items-center justify-center transition-all cursor-pointer ${
                      isVisited
                        ? 'bg-clay-600 text-white shadow-2xs hover:bg-clay-700'
                        : 'bg-ink-100 text-ink-500 hover:bg-clay-50 hover:text-clay-600 border border-ink-200/60'
                    }`}
                    title={isVisited ? 'Bấm để gỡ dấu chân' : 'Bấm để đánh dấu đã từng đến'}
                  >
                    {isVisited ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className={`font-black font-display text-sm leading-snug ${isVisited ? 'text-ink-800' : 'text-ink-700'}`}>
                  {prov.name}
                </h4>
                <p className="text-[11px] text-ink-500 mt-0.5 line-clamp-1 font-serif">
                  {prov.highlight}
                </p>
              </div>

              {/* Footer Story badge or Check-in status */}
              <div className="pt-2 border-t border-ink-200/60 flex items-center justify-between text-[10px]">
                {storyCount > 0 ? (
                  <span className="font-bold text-clay-700 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-clay-600" />
                    {storyCount} kỷ niệm
                  </span>
                ) : isVisited ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã đến
                  </span>
                ) : (
                  <span className="text-ink-400 font-serif">Chưa ghé</span>
                )}

                {isAutoDetected && (
                  <span className="text-clay-600 font-bold" title="Tự động nhận diện từ bài viết/tour">
                    Tự động
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MODAL: PROVINCE STORIES & ITINERARIES DRAWER              */}
      {/* ========================================================= */}
      {selectedProvinceForStories && selectedStories && (
        <div className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-ink-200/80 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-ink-200/80 bg-[#F8F4EC] rounded-t-[6px] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[5px] bg-clay-50 text-clay-700 border border-clay-200 flex items-center justify-center font-black">
                  <MapPin className="w-4 h-4 text-clay-600" />
                </div>
                <div>
                  <h3 className="font-black font-display text-base text-ink-800">
                    Dấu chân tại {selectedProvinceForStories.name}
                  </h3>
                  <p className="text-xs text-ink-500 font-serif">
                    {selectedProvinceForStories.highlight}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProvinceForStories(null)}
                className="w-7 h-7 rounded-[4px] bg-[#FFFDF8] hover:bg-ink-100 flex items-center justify-center text-ink-600 border border-ink-200/80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Lịch trình liên quan */}
              {selectedStories.itineraries.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-ink-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5 text-clay-600" />
                    Lịch trình du lịch ({selectedStories.itineraries.length})
                  </span>
                  <div className="space-y-2">
                    {selectedStories.itineraries.map(itin => (
                      <div key={itin.id} className="p-3 rounded-[5px] border border-ink-200/80 bg-[#F8F4EC]/60 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-ink-800 truncate">{itin.title}</h5>
                          <span className="text-[10px] text-ink-500 font-serif">{itin.destination || selectedProvinceForStories.name}</span>
                        </div>
                        <span className="text-xs font-bold text-clay-700 shrink-0">Xem tour &rarr;</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bài viết liên quan */}
              {selectedStories.posts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-ink-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-clay-600" />
                    Bài viết chia sẻ ({selectedStories.posts.length})
                  </span>
                  <div className="space-y-2">
                    {selectedStories.posts.map(p => (
                      <div key={p.id} className="p-3 rounded-[5px] border border-ink-200/80 bg-[#F8F4EC]/60 space-y-1">
                        <h5 className="font-bold text-xs text-ink-800">{p.title || 'Chia sẻ chuyến đi'}</h5>
                        <p className="text-[11px] text-ink-600 line-clamp-2 font-serif">{p.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 sm:p-4 border-t border-ink-200/80 flex items-center justify-between bg-[#F8F4EC] rounded-b-[6px]">
              <button
                onClick={(e) => {
                  handleToggleCheckin(selectedProvinceForStories.id, e);
                  setSelectedProvinceForStories(null);
                }}
                className="px-3.5 py-1.5 rounded-[5px] text-xs font-bold bg-[#FFFDF8] hover:bg-ink-100 text-ink-700 border border-ink-200/80 transition-colors cursor-pointer"
              >
                {allVisitedIds.includes(selectedProvinceForStories.id) ? 'Gỡ dấu chân tỉnh này' : 'Đánh dấu đã ghé'}
              </button>
              <button
                onClick={() => setSelectedProvinceForStories(null)}
                className="px-4 py-1.5 rounded-[5px] bg-clay-600 text-white text-xs font-bold hover:bg-clay-700 transition-colors cursor-pointer shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

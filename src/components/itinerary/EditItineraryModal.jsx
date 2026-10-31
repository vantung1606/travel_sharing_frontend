import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, Users, Compass, Globe, Lock, Image as ImageIcon, Sparkles, Check, Bus, Utensils, Hotel, UserCheck, ShieldCheck, AlertCircle, FileText, Backpack, Briefcase, Tag } from 'lucide-react';
import { useToast } from '../common/Toast';
import { useApp } from '../../context/AppContext';

const PRESET_COVERS = [
  { label: 'Đà Nẵng Biển Xanh', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Đà Lạt Ngàn Hoa', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Phú Quốc Hoàng Hôn', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Hà Giang Hùng Vĩ', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Ninh Bình Non Nước', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sa Pa Ruộng Bậc Thang', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' }
];

const TRAVEL_STYLES = [
  { id: 'Nghỉ dưỡng & Khám phá', label: 'Nghỉ dưỡng & Khám phá', desc: 'Thư giãn, thưởng ngoạn cảnh quan nhẹ nhàng' },
  { id: 'Phượt bụi & Khám phá mạo hiểm', label: 'Phượt bụi & Mạo hiểm', desc: 'Chinh phục cung đường, trekking, cắm trại' },
  { id: 'Ẩm thực & Check-in sống ảo', label: 'Ẩm thực & Check-in', desc: 'Quán ăn đặc sản, địa điểm chụp hình ấn tượng' },
  { id: 'Văn hóa & Di sản lịch sử', label: 'Văn hóa & Lịch sử', desc: 'Đền chùa, bảo tàng, làng nghề truyền thống' },
  { id: 'Gia đình & Thư giãn', label: 'Gia đình & Thư giãn', desc: 'Lộ trình thoải mái, an toàn cho mọi lứa tuổi' },
  { id: 'Sinh thái & Thiên nhiên', label: 'Sinh thái & Thiên nhiên', desc: 'Rừng quốc gia, suối thác, đồi chè bình yên' }
];

const GROUP_TYPES = ['Cá nhân', 'Cặp đôi', 'Bạn bè', 'Gia đình'];

export const EditItineraryModal = ({ itinerary, isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const { updateItineraryInBackend } = useApp();

  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'tourStandard'

  // 1. Thông tin cơ bản
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetTotal, setBudgetTotal] = useState(5000000);
  const [budgetFormatted, setBudgetFormatted] = useState('5,000,000');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [groupType, setGroupType] = useState('Cá nhân');
  const [travelStyle, setTravelStyle] = useState('Nghỉ dưỡng & Khám phá');
  const [isPublic, setIsPublic] = useState(true);

  // 2. 15 Tiêu chí Tour chuẩn lữ hành chuyên nghiệp
  const [tourCode, setTourCode] = useState('');
  const [departureLocation, setDepartureLocation] = useState('Hà Nội / TP. Hồ Chí Minh');
  const [endingLocation, setEndingLocation] = useState('');
  const [targetAudience, setTargetAudience] = useState('Đa dạng đối tượng (Gia đình, Thanh niên, Bạn bè)');
  const [maxGroupSize, setMaxGroupSize] = useState(15);
  const [transportation, setTransportation] = useState('Ô tô du lịch đời mới / Máy bay');
  const [mealPlan, setMealPlan] = useState('');
  const [accommodationInfo, setAccommodationInfo] = useState('');
  const [tourGuideInfo, setTourGuideInfo] = useState('Hướng dẫn viên nhiệt tình, vui vẻ, thuyết minh và hỗ trợ đoàn suốt tuyến');
  const [childPrice, setChildPrice] = useState('');
  const [singleRoomSurcharge, setSingleRoomSurcharge] = useState('');
  const [servicesIncluded, setServicesIncluded] = useState('');
  const [servicesExcluded, setServicesExcluded] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [packingNotes, setPackingNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itinerary && isOpen) {
      setTitle(itinerary.title || '');
      setDestination(itinerary.destination || '');
      setStartDate(itinerary.startDate || '');
      setEndDate(itinerary.endDate || '');
      const rawBudget = Number(itinerary.totalBudget || itinerary.budgetTotal || 5000000);
      setBudgetTotal(rawBudget);
      setBudgetFormatted(rawBudget.toLocaleString('en-US'));
      setCoverImageUrl(itinerary.coverImage || itinerary.coverImageUrl || PRESET_COVERS[0].url);
      setGroupType(itinerary.groupType || 'Cá nhân');
      setTravelStyle(itinerary.travelStyle || itinerary.style || 'Nghỉ dưỡng & Khám phá');
      setIsPublic(itinerary.isPublic !== false);

      // Tour standard fields
      setTourCode(itinerary.tourCode || '');
      setDepartureLocation(itinerary.departureLocation || 'Hà Nội / TP. Hồ Chí Minh');
      setEndingLocation(itinerary.endingLocation || itinerary.destination || '');
      setTargetAudience(itinerary.targetAudience || 'Đa dạng đối tượng (Gia đình, Thanh niên, Bạn bè)');
      setMaxGroupSize(itinerary.maxGroupSize || 15);
      setTransportation(itinerary.transportation || 'Ô tô du lịch đời mới / Máy bay');
      setMealPlan(itinerary.mealPlan || '');
      setAccommodationInfo(itinerary.accommodationInfo || '');
      setTourGuideInfo(itinerary.tourGuideInfo || 'Hướng dẫn viên nhiệt tình, chu đáo, thuyết minh suốt tuyến');
      setChildPrice(itinerary.childPrice ? Number(itinerary.childPrice).toLocaleString('en-US') : '');
      setSingleRoomSurcharge(itinerary.singleRoomSurcharge ? Number(itinerary.singleRoomSurcharge).toLocaleString('en-US') : '');
      setServicesIncluded(itinerary.servicesIncluded || '');
      setServicesExcluded(itinerary.servicesExcluded || '');
      setCancellationPolicy(itinerary.cancellationPolicy || '');
      setPackingNotes(itinerary.packingNotes || '');
    }
  }, [itinerary, isOpen]);

  if (!isOpen || !itinerary) return null;

  const handleBudgetChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = Number(rawVal) || 0;
    setBudgetTotal(num);
    setBudgetFormatted(num > 0 ? num.toLocaleString('en-US') : '');
  };

  // AI Tự Động Chuẩn Hóa 15 Tiêu Chí Tour Lữ Hành
  const handleAutoFillTourStandard = () => {
    const dest = destination.trim() || 'Việt Nam';
    const destCode = dest.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'VN') || 'TRIP';
    const code = tourCode || `TOUR-${destCode}-${Math.floor(1000 + Math.random() * 9000)}`;

    setTourCode(code);
    setDepartureLocation('Sân bay Nội Bài (Hà Nội) / Tân Sơn Nhất (TP.HCM)');
    setEndingLocation(dest);
    setTargetAudience('Khách du lịch tự do, Gia đình có trẻ em, Nhóm bạn trẻ yêu thích khám phá');
    setMaxGroupSize(20);
    setTransportation('Vé máy bay khứ hồi (Vietnam Airlines / Vietjet Air) + Xe du lịch Universe 29-45 chỗ máy lạnh đón tiễn');
    setMealPlan(`• Bữa sáng: Buffet tiêu chuẩn tại khách sạn\n• Bữa trưa & tối: Thưởng thức đặc sản ${dest} tại nhà hàng tiêu chuẩn (150.000đ - 250.000đ/suất)\n• Nước suối tinh khiết: 01 chai 500ml/người/ngày`);
    setAccommodationInfo(`Khách sạn tiêu chuẩn 3 - 4 sao trung tâm ${dest} (hoặc resort ven biển), phòng 2 khách/phòng (lẻ nam/nữ ngủ phòng 3 tiện nghi hiện đại)`);
    setTourGuideInfo('Hướng dẫn viên tiếng Việt chuyên nghiệp, kinh nghiệm, nhiệt tình và am hiểu văn hóa bản địa phục vụ đoàn suốt tuyến');
    
    // Tính giá trẻ em mẫu bằng 75% giá người lớn
    const rawChild = Math.round(Number(budgetTotal) * 0.75);
    setChildPrice(rawChild.toLocaleString('en-US'));
    setSingleRoomSurcharge(Math.round(Number(budgetTotal) * 0.35).toLocaleString('en-US'));

    setServicesIncluded(`✅ Vé máy bay khứ hồi kèm 07kg hành lý xách tay\n✅ Khách sạn tiêu chuẩn 3-4 sao tiện nghi (2 khách/phòng)\n✅ Các bữa ăn theo chương trình ẩm thực địa phương\n✅ Vé vào cổng tham quan tất cả các điểm trong lịch trình\n✅ Xe du lịch đời mới máy lạnh đưa đón đúng giờ\n✅ Hướng dẫn viên chu đáo, giàu kinh nghiệm\n✅ Bảo hiểm du lịch nội địa mức bồi thường tối đa 50.000.000đ/vụ\n✅ Quà tặng nón du lịch Wayfare`);
    
    setServicesExcluded(`❌ Thuế VAT 8% (nếu lấy hóa đơn đỏ)\n❌ Chi phí cá nhân: giặt là, điện thoại, đồ uống trong bữa ăn, minibar\n❌ Phụ thu phòng đơn (nếu yêu cầu ở 1 mình/phòng)\n❌ Tiền tip bồi dưỡng cho Hướng dẫn viên và tài xế (tùy tâm)\n❌ Vé các trò chơi giải trí cảm giác mạnh hoặc chi phí tự túc ngoài chương trình`);

    setCancellationPolicy(`• Hủy trước ngày khởi hành 07 ngày: Hoàn lại 100% chi phí cọc\n• Hủy trước ngày khởi hành 03 - 06 ngày: Phí phạt 50% tổng giá trị tour\n• Hủy trong vòng 24 - 48 giờ trước giờ khởi hành: Phí phạt 80% tổng giá trị\n• Hủy vào ngày khởi hành hoặc vắng mặt: Phí phạt 100% giá trị tour`);

    setPackingNotes(`• Giấy tờ tùy thân bắt buộc: CCCD/Hộ chiếu bản gốc còn hạn trên 6 tháng\n• Trang phục: Mang trang phục gọn nhẹ, giày thể thao êm chân; trang phục lịch sự kín đáo khi viếng đền chùa, di tích tôn nghiêm\n• Đồ dùng cá nhân: Kem chống nắng, kính râm, thuốc chống say xe, sạc dự phòng`);

    toast.showSuccess(`✨ WanderAI đã tự động chuẩn hóa đầy đủ 15 tiêu chí tour cho điểm đến ${dest}! 🎉`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) {
      toast.showWarning('Vui lòng nhập tên chuyến đi và điểm đến chính!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        destination: destination.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
        budgetTotal: Number(budgetTotal),
        coverImageUrl: coverImageUrl.trim(),
        groupType,
        travelStyle,
        isPublic,
        // 15 Tiêu chí Tour chuẩn lữ hành
        tourCode: tourCode.trim(),
        departureLocation: departureLocation.trim(),
        endingLocation: endingLocation.trim(),
        targetAudience: targetAudience.trim(),
        maxGroupSize: maxGroupSize ? Number(maxGroupSize) : null,
        transportation: transportation.trim(),
        mealPlan: mealPlan.trim(),
        accommodationInfo: accommodationInfo.trim(),
        tourGuideInfo: tourGuideInfo.trim(),
        childPrice: childPrice ? Number(childPrice.replace(/\D/g, '')) : null,
        singleRoomSurcharge: singleRoomSurcharge ? Number(singleRoomSurcharge.replace(/\D/g, '')) : null,
        servicesIncluded: servicesIncluded.trim(),
        servicesExcluded: servicesExcluded.trim(),
        cancellationPolicy: cancellationPolicy.trim(),
        packingNotes: packingNotes.trim()
      };

      let updated = null;
      if (typeof itinerary.id === 'number' || !String(itinerary.id).startsWith('itin-')) {
        updated = await updateItineraryInBackend(itinerary.id, payload);
      } else {
        // Fallback for local mock item
        updated = {
          ...itinerary,
          ...payload,
          coverImage: payload.coverImageUrl,
          style: payload.travelStyle,
          totalBudget: payload.budgetTotal
        };
      }

      toast.showSuccess(`Đã lưu đầy đủ hồ sơ tour "${title.trim()}" đạt chuẩn lữ hành! 🎉`);
      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      toast.showError('Không thể cập nhật lịch trình: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fade-in font-display">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">Chỉnh Sửa Hồ Sơ Tour & Lịch Trình</h3>
              <p className="text-xs text-slate-500">Chuẩn hóa 15 tiêu chí tour lữ hành & tối ưu hóa trải nghiệm</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="px-6 pt-3 pb-2 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'basic'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              <span>1. Thông Tin Cơ Bản</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tourStandard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tourStandard'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Chuẩn Lữ Hành (15 Tiêu Chí)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">Hot</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAutoFillTourStandard}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="WanderAI tự động điền mẫu chuẩn 15 tiêu chí tour theo điểm đến"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">WanderAI Tự Động Điền</span>
            <span className="sm:hidden">AI Điền</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'basic' ? (
            <>
              {/* Tên chuyến đi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tên Chuyến Đi / Tour *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Khám phá biển đảo & Cù Lao Chàm 3N2Đ"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                  required
                />
              </div>

              {/* Điểm đến chính & Dự toán ngân sách */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    <span>Điểm Đến Chính *</span>
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ví dụ: Đà Nẵng, Phú Quốc, Sa Pa..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dự Toán Ngân Sách (VNĐ)</span>
                  </label>
                  <input
                    type="text"
                    value={budgetFormatted}
                    onChange={handleBudgetChange}
                    placeholder="5,000,000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              {/* Thời gian khởi hành & kết thúc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ngày Khởi Hành</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ngày Kết Thúc</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                </div>
              </div>

              {/* Nhóm du lịch (groupType) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hình Thức Đi Cùng</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GROUP_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setGroupType(type)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        groupType === type
                          ? 'bg-sky-50 border-sky-400 text-sky-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gu / Phong cách chuyến đi */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>Gu Du Lịch & Phong Cách Trải Nghiệm</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRAVEL_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTravelStyle(style.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        travelStyle === style.id
                          ? 'bg-sky-50/80 border-sky-400 text-sky-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-bold">{style.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chế độ hiển thị (Public vs Private) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quyền Riêng Tư Lịch Trình
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isPublic
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isPublic ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Công Khai 🌐</p>
                      <p className="text-[11px] text-slate-500">Mọi thành viên trên Wayfare đều xem & sao chép được</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      !isPublic
                        ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      !isPublic ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Riêng Tư 🔒</p>
                      <p className="text-[11px] text-slate-500">Chỉ riêng bạn có quyền xem & chỉnh sửa</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Link ảnh bìa & preset */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ảnh Bìa Chuyến Đi (URL)</span>
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                />

                <div className="pt-1">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">Hoặc chọn nhanh ảnh tiêu biểu:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_COVERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCoverImageUrl(preset.url)}
                        className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all cursor-pointer group ${
                          coverImageUrl === preset.url ? 'border-sky-500 ring-2 ring-sky-200' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-bold py-0.5 px-1 truncate block text-center">
                          {preset.label.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* TAB 2: CHUẨN LỮ HÀNH 15 TIÊU CHÍ */
            <div className="space-y-6">
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Khung Chuẩn Tour Lữ Hành:</strong> Giúp lịch trình của bạn trở nên chuyên nghiệp, minh bạch và hoàn thiện như các chương trình tour chào bán của công ty du lịch quốc tế.
                </div>
              </div>

              {/* Khối 1: Thông tin Mã Tour & Lộ Trình Vận Chuyển */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-sky-600" />
                  <span>1. Mã Tour, Điểm Đón & Vận Chuyển</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">1. Mã Tour (Code)</label>
                    <input
                      type="text"
                      value={tourCode}
                      onChange={(e) => setTourCode(e.target.value)}
                      placeholder="VD: WAY-DN-01"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold uppercase text-sky-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">3. Điểm Xuất Phát / Đón Khách</label>
                    <input
                      type="text"
                      value={departureLocation}
                      onChange={(e) => setDepartureLocation(e.target.value)}
                      placeholder="Hà Nội / TP.HCM..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">3. Điểm Kết Thúc / Trả Khách</label>
                    <input
                      type="text"
                      value={endingLocation}
                      onChange={(e) => setEndingLocation(e.target.value)}
                      placeholder="Đà Nẵng / Sân bay..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-sky-600" />
                    <span>5. Phương Tiện Di Chuyển Chính</span>
                  </label>
                  <input
                    type="text"
                    value={transportation}
                    onChange={(e) => setTransportation(e.target.value)}
                    placeholder="Máy bay khứ hồi Vietnam Airlines + Xe du lịch Universe 29 chỗ đời mới..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* Khối 2: Phân Khúc Khách & Hướng Dẫn Viên */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>2. Phân Khúc Khách & Hướng Dẫn Viên</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">4. Phân Khúc / Độ Tuổi Khách</label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Gia đình, Thanh niên, Trung niên..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">4. Số Lượng Khách Tối Đa (Người)</label>
                    <input
                      type="number"
                      value={maxGroupSize}
                      onChange={(e) => setMaxGroupSize(e.target.value)}
                      placeholder="15"
                      min={1}
                      max={100}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>10. Hướng Dẫn Viên & Nhiệm Vụ</span>
                  </label>
                  <textarea
                    rows={2}
                    value={tourGuideInfo}
                    onChange={(e) => setTourGuideInfo(e.target.value)}
                    placeholder="Thông tin HDV và phạm vi hỗ trợ suốt tuyến..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium resize-none"
                  />
                </div>
              </div>

              {/* Khối 3: Ăn Uống, Lưu Trú & Biểu Giá */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  <span>3. Ăn Uống, Khách Sạn & Biểu Phí Chi Tiết</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-amber-600" />
                      <span>7. Kế Hoạch Bữa Ăn & Thực Đơn</span>
                    </label>
                    <textarea
                      rows={3}
                      value={mealPlan}
                      onChange={(e) => setMealPlan(e.target.value)}
                      placeholder="Bữa sáng buffet tại KS, các bữa chính ăn đặc sản địa phương..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Hotel className="w-3 h-3 text-sky-600" />
                      <span>8. Tiêu Chuẩn Lưu Trú & Khách Sạn</span>
                    </label>
                    <textarea
                      rows={3}
                      value={accommodationInfo}
                      onChange={(e) => setAccommodationInfo(e.target.value)}
                      placeholder="Khách sạn 4 sao gần biển, tiêu chuẩn 2 khách/phòng..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">11. Giá Tour Trẻ Em (VNĐ)</label>
                    <input
                      type="text"
                      value={childPrice}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setChildPrice(raw ? Number(raw).toLocaleString('en-US') : '');
                      }}
                      placeholder="Ví dụ: 3,500,000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-amber-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">11. Phụ Thu Phòng Đơn (VNĐ)</label>
                    <input
                      type="text"
                      value={singleRoomSurcharge}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setSingleRoomSurcharge(raw ? Number(raw).toLocaleString('en-US') : '');
                      }}
                      placeholder="Ví dụ: 1,200,000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Khối 4: Dịch Vụ Bao Gồm & Không Bao Gồm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <label className="text-xs font-black uppercase text-emerald-900 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>12. Dịch Vụ Bao Gồm (Included)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={servicesIncluded}
                    onChange={(e) => setServicesIncluded(e.target.value)}
                    placeholder="✅ Vé tham quan, khách sạn, các bữa ăn, xe đưa đón, bảo hiểm..."
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-xs font-medium leading-relaxed resize-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                  <label className="text-xs font-black uppercase text-rose-900 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-600" />
                    <span>13. Dịch Vụ Không Bao Gồm (Excluded)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={servicesExcluded}
                    onChange={(e) => setServicesExcluded(e.target.value)}
                    placeholder="❌ Thuế VAT, chi phí cá nhân, đồ uống, phụ thu phòng đơn..."
                    className="w-full px-3 py-2 rounded-lg border border-rose-300 bg-white text-xs font-medium leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Khối 5: Chính Sách Hủy Tour & Lưu Ý Hành Lý */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>14. Chính Sách Cọc & Hoàn Hủy</span>
                  </label>
                  <textarea
                    rows={4}
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    placeholder="Quy định đặt cọc, hoàn tiền trước ngày khởi hành..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium leading-relaxed resize-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <Backpack className="w-4 h-4 text-sky-600" />
                    <span>15. Lưu Ý Hành Lý & Giấy Tờ</span>
                  </label>
                  <textarea
                    rows={4}
                    value={packingNotes}
                    onChange={(e) => setPackingNotes(e.target.value)}
                    placeholder="CCCD/Hộ chiếu bản gốc, trang phục đi chùa, kem chống nắng..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            {activeTab === 'basic' ? 'Đang chỉnh sửa Thông tin cơ bản' : 'Đang chuẩn hóa 15 tiêu chí tour lữ hành'}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu Hồ Sơ Tour</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

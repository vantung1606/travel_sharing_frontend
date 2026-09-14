import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, MapPin, Calendar, DollarSign, Activity, Compass, Loader2 } from 'lucide-react';

export const AITripGeneratorModal = () => {
  const { isAIGeneratorOpen, setIsAIGeneratorOpen, generateAITrip } = useApp();

  const [destination, setDestination] = useState('Đà Nẵng & Hội An');
  const [daysCount, setDaysCount] = useState('3');
  const [budget, setBudget] = useState('3.500.000đ - 5.000.000đ');
  const [pace, setPace] = useState('Cân bằng');
  const [style, setStyle] = useState('Biển & Ẩm thực');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isAIGeneratorOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      generateAITrip({
        destination,
        daysCount,
        budget,
        pace,
        style
      });
      setIsGenerating(false);
      setIsAIGeneratorOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
        
        {/* Glow Header Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={() => setIsAIGeneratorOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl sparkle-btn flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">Trợ Lý Lập Lịch Trình AI</h3>
            <p className="text-xs text-slate-500">Thiết kế tour cá nhân hóa trọn gói chỉ trong 3 giây</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-600" />
              Điểm Đến Mong Muốn
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
            >
              <option value="Đà Nẵng & Hội An">Đà Nẵng & Phố Cổ Hội An</option>
              <option value="Đảo Ngọc Phú Quốc">Đảo Ngọc Phú Quốc</option>
              <option value="Hà Giang Phượt Loop">Hà Giang Phượt Loop</option>
              <option value="Sapa Sương Mờ">Sapa Sương Mờ & Fansipan</option>
              <option value="Đà Lạt Ngàn Hoa">Đà Lạt Ngàn Hoa</option>
              <option value="Nha Trang Biển Xanh">Nha Trang Biển Xanh</option>
            </select>
          </div>

          {/* Days Count & Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-600" />
                Số Ngày Đi
              </label>
              <select
                value={daysCount}
                onChange={(e) => setDaysCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              >
                <option value="2">2 Ngày 1 Đêm</option>
                <option value="3">3 Ngày 2 Đêm</option>
                <option value="4">4 Ngày 3 Đêm</option>
                <option value="5">5 Ngày 4 Đêm</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Ngân Sách Dự Kiến
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              >
                <option value="2.000.000đ - 3.500.000đ">Tiết kiệm (2M - 3.5M)</option>
                <option value="3.500.000đ - 5.000.000đ">Tiêu chuẩn (3.5M - 5M)</option>
                <option value="5.000.000đ - 10.000.000đ">Cao cấp (5M - 10M)</option>
              </select>
            </div>
          </div>

          {/* Pace & Style */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-orange-500" />
                Nhịp Độ Chuyến Đi
              </label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              >
                <option value="Nghỉ dưỡng thư thái">Nghỉ dưỡng thư thái</option>
                <option value="Cân bằng">Cân bằng hài hoà</option>
                <option value="Khám phá năng động">Khám phá tối đa điểm</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                Phong Cách Du Lịch
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              >
                <option value="Biển & Ẩm thực">Biển & Ẩm thực</option>
                <option value="Văn hoá & Di tích">Văn hoá & Di tích</option>
                <option value="Phượt & Sinh thái">Phượt & Sinh thái</option>
                <option value="Sống ảo & Check-in">Sống ảo & Check-in</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sparkle-btn py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>AI Đang Tính Toán Lịch Trình Tối Ưu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>Tạo Lịch Trình Ngay Với AI</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

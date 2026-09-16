import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import {
  Sparkles,
  X,
  MapPin,
  Calendar,
  DollarSign,
  Bike,
  Car,
  Bus,
  Loader2,
  Check,
  ShieldCheck
} from 'lucide-react';

export const AITripGeneratorModal = () => {
  const { isAIGeneratorOpen, setIsAIGeneratorOpen, generateAITrip } = useApp();
  const toast = useToast();

  const [destination, setDestination] = useState('Đà Nẵng & Hội An, Miền Trung');
  const [daysCount, setDaysCount] = useState('3');
  const [budgetVal, setBudgetVal] = useState(4500000);
  const [budgetTier, setBudgetTier] = useState('Tiêu chuẩn');
  const [selectedStyles, setSelectedStyles] = useState([
    '🏖️ Nghỉ dưỡng & Biển',
    '🍜 Ẩm thực địa phương'
  ]);
  const [transport, setTransport] = useState('Taxi / Công nghệ');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isAIGeneratorOpen) return null;

  const toggleStyle = (st) => {
    setSelectedStyles(prev =>
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  };

  const handleSelectTier = (tier) => {
    setBudgetTier(tier);
    if (tier === 'Tiết kiệm') setBudgetVal(2500000);
    else if (tier === 'Tiêu chuẩn') setBudgetVal(4500000);
    else if (tier === 'Cao cấp') setBudgetVal(8500000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      generateAITrip({
        destination,
        daysCount: Number(daysCount),
        budget: `${budgetVal.toLocaleString('vi-VN')}đ`,
        style: selectedStyles.join(', '),
        transport,
        notes
      });
      setIsGenerating(false);
      setIsAIGeneratorOpen(false);
      toast.success(`WanderAI đã tạo thành công lịch trình ${daysCount} ngày cho chuyến đi ${destination}!`);
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Glow Header Accents */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={() => setIsAIGeneratorOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mb-1">
              WanderAI v3.5
            </div>
            <h3 className="text-lg font-bold text-slate-900">Trợ Lý Lập Lịch Trình AI</h3>
            <p className="text-xs text-slate-500">Tối ưu cung đường, dự trù ngân sách & thời gian thực</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Destination */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                Điểm đến mong muốn
              </span>
              <span className="text-[10px] text-sky-600 font-semibold">Đã nhận diện vị trí</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ví dụ: Đà Nẵng, Đà Lạt, Phú Quốc..."
                className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20"
                required
              />
              {destination && (
                <button
                  type="button"
                  onClick={() => setDestination('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              Thời gian chuyến đi
            </label>
            <select
              value={daysCount}
              onChange={(e) => setDaysCount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="2">2 Ngày 1 Đêm</option>
              <option value="3">3 Ngày 2 Đêm</option>
              <option value="4">4 Ngày 3 Đêm</option>
              <option value="5">5 Ngày 4 Đêm</option>
            </select>
          </div>

          {/* Budget Range & Tiers */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Ngân sách dự kiến
              </span>
              <span className="font-bold text-sky-700 text-xs">
                {budgetVal.toLocaleString('vi-VN')}đ <span className="text-[10px] text-slate-400 font-normal">/ người</span>
              </span>
            </div>
            <input
              type="range"
              min={1500000}
              max={15000000}
              step={250000}
              value={budgetVal}
              onChange={(e) => setBudgetVal(Number(e.target.value))}
              className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex items-center gap-1.5 pt-0.5">
              {['Tiết kiệm', 'Tiêu chuẩn', 'Cao cấp'].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleSelectTier(tier)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    budgetTier === tier
                      ? 'bg-sky-700 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style Chips */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Phong cách chuyến đi</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                '🏖️ Nghỉ dưỡng & Biển',
                '🍜 Ẩm thực địa phương',
                '📸 Check-in sống ảo',
                '🏛️ Văn hóa & Lịch sử',
                '⛺ Khám phá mạo hiểm'
              ].map((st) => {
                const active = selectedStyles.includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleStyle(st)}
                    className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      active
                        ? 'bg-sky-100 text-sky-900 border border-sky-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    <span>{st}</span>
                    {active && <Check className="w-3 h-3 text-sky-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transport */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Phương tiện ưu tiên</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Xe máy', icon: Bike },
                { name: 'Taxi / Công nghệ', icon: Car },
                { name: 'Xe tự lái', icon: Bus }
              ].map((item) => {
                const Icon = item.icon;
                const active = transport === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setTransport(item.name)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-sky-700 text-white font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 font-medium'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px]">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Ghi chú cho AI</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Yêu cầu cụ thể (VD: Thích ngắm hoàng hôn, ăn hải sản tươi ngon, v.v.)..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 resize-none"
            />
          </div>

          {/* Meta badge */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
            <span>Tự động tối ưu theo dữ liệu Google Places & thời tiết 2026.</span>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-75"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>AI Đang Tính Toán Lộ Trình Tối Ưu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
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

export default AITripGeneratorModal;

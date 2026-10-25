import React from 'react';
import { X, Sparkles, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const TierPromotionModal = ({ promotion, user, onClose, onViewBadges }) => {
  if (!promotion || !promotion.newTier) return null;

  const { newTier, oldTier } = promotion;

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] max-w-md w-full p-6 sm:p-7 text-ink-800 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-center space-y-5">
        
        {/* Subtle decorative warm clay glows */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-clay-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-[4px] bg-[#F8F4EC] hover:bg-ink-100 text-ink-600 border border-ink-200/80 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge & Title */}
        <div className="space-y-1.5 pt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-clay-50 border border-clay-200 text-clay-700 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-clay-600" />
            Vinh Danh Thăng Cấp Lữ Hành
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-ink-800">
            CHÚC MỪNG BẠN! 🎉
          </h2>
          <p className="text-xs text-ink-500 font-serif leading-relaxed">
            Bạn đã thăng hạng thành công lên cấp bậc danh dự mới trên hệ thống Wayfare
          </p>
        </div>

        {/* Avatar Showcase with New Tier Frame */}
        <div className="py-2 flex flex-col items-center justify-center space-y-3">
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <UserAvatar user={user} size="hero" showBadge={true} />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-sm font-black text-ink-800 shadow-2xs">
              <span>{newTier.icon}</span>
              <span className="text-clay-700 font-display">
                {newTier.name}
              </span>
            </div>
            <p className="text-xs text-ink-500 font-mono">
              {newTier.nameEn} • Cấp {newTier.level}
            </p>
          </div>
        </div>

        {/* Unlocked Perks */}
        <div className="p-4 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-left space-y-2">
          <h4 className="text-xs font-bold text-clay-700 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Đặc quyền vừa mở khóa:
          </h4>
          <ul className="text-xs text-ink-700 space-y-1.5 font-serif">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Khung Avatar <strong>{newTier.name}</strong> phát sáng toàn hệ thống</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Huy hiệu danh vị gắn liền trên mọi bài viết & bình luận</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tăng điểm uy tín & quyền đề xuất gợi ý tour du lịch AI</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={() => {
              onClose();
              if (onViewBadges) onViewBadges();
            }}
            className="flex-1 py-2.5 px-3 rounded-[5px] text-xs font-bold bg-[#FFFDF8] hover:bg-ink-100 text-ink-700 border border-ink-200/80 transition-all cursor-pointer"
          >
            Xem kho huy hiệu
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-[5px] text-xs font-bold bg-clay-600 hover:bg-clay-700 text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
          >
            <span>Đã hiểu & Khoe ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
export default TierPromotionModal;

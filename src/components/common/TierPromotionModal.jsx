import React from 'react';
import { X, Sparkles, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const TierPromotionModal = ({ promotion, user, onClose, onViewBadges }) => {
  if (!promotion || !promotion.newTier) return null;

  const { newTier, oldTier } = promotion;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-center space-y-6">
        
        {/* Decorative background glows */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-amber-500/20 blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge & Title */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Vinh Danh Thăng Cấp Lữ Hành
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            CHÚC MỪNG BẠN! 🎉
          </h2>
          <p className="text-xs text-slate-300">
            Bạn đã thăng hạng thành công lên cấp bậc danh dự mới trên Wayfare
          </p>
        </div>

        {/* Avatar Showcase with New Tier Frame */}
        <div className="py-2 flex flex-col items-center justify-center space-y-3">
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <UserAvatar user={user} size="hero" showBadge={true} />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-base font-black">
              <span>{newTier.icon}</span>
              <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
                {newTier.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {newTier.nameEn} • Cấp {newTier.level}
            </p>
          </div>
        </div>

        {/* Unlocked Perks */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2.5">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Đặc quyền vừa mở khóa:
          </h4>
          <ul className="text-xs text-slate-200 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Khung Avatar <strong>{newTier.name}</strong> phát sáng toàn hệ thống</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Huy hiệu danh vị gắn liền trên mọi bài viết & bình luận</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tăng điểm uy tín & quyền đề xuất gợi ý tour du lịch AI</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => {
              onClose();
              if (onViewBadges) onViewBadges();
            }}
            className="flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
          >
            Xem kho huy hiệu
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-extrabold"
          >
            <span>Đã hiểu & Khoe ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
export default TierPromotionModal;

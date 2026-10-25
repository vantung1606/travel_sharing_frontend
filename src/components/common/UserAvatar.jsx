import React, { useState } from 'react';
import { getUserTier } from '../../utils/tierSystem';

/**
 * UserAvatar - Component hiển thị Avatar tích hợp Khung Cấp Bậc (Avatar Ring & Prestige Frames)
 * Áp dụng đồng bộ cho toàn bộ hệ thống: Navbar, Profile, UserProfileModal, Community, Chat...
 */
export const UserAvatar = ({
  user,
  size = 'md',
  showBadge = true,
  showVerified = false,
  className = '',
  avatarClassName = '',
  onClick,
  title
}) => {
  const [imageError, setImageError] = useState(false);

  // Kích thước chuẩn cho container và avatar
  const sizeMap = {
    xs: {
      box: 'w-7 h-7 min-w-7',
      img: 'w-6 h-6',
      badge: 'w-3.5 h-3.5 text-[8px] -bottom-0.5 -right-0.5',
      verified: 'w-2.5 h-2.5 text-[7px] -bottom-0.5 -right-0.5'
    },
    sm: {
      box: 'w-9 h-9 min-w-9',
      img: 'w-8 h-8',
      badge: 'w-4 h-4 text-[9px] -bottom-0.5 -right-0.5',
      verified: 'w-3 h-3 text-[8px] -bottom-0.5 -right-0.5'
    },
    md: {
      box: 'w-11 h-11 min-w-11',
      img: 'w-10 h-10',
      badge: 'w-4.5 h-4.5 text-[10px] bottom-0 right-0',
      verified: 'w-3.5 h-3.5 text-[9px] bottom-0 right-0'
    },
    lg: {
      box: 'w-14 h-14 min-w-14',
      img: 'w-13 h-13',
      badge: 'w-5.5 h-5.5 text-xs bottom-0 right-0',
      verified: 'w-4.5 h-4.5 text-[10px] bottom-0 right-0'
    },
    xl: {
      box: 'w-20 h-20 min-w-20',
      img: 'w-[72px] h-[72px]',
      badge: 'w-6 h-6 text-sm bottom-0.5 right-0.5',
      verified: 'w-5 h-5 text-xs bottom-0.5 right-0.5'
    },
    '2xl': {
      box: 'w-24 h-24 sm:w-28 sm:h-28 min-w-24',
      img: 'w-[88px] h-[88px] sm:w-[104px] sm:h-[104px]',
      badge: 'w-7 h-7 sm:w-8 sm:h-8 text-base bottom-1 right-1',
      verified: 'w-6 h-6 text-xs bottom-1 right-1'
    },
    hero: {
      box: 'w-28 h-28 sm:w-32 sm:h-32 min-w-28',
      img: 'w-[102px] h-[102px] sm:w-[118px] sm:h-[118px]',
      badge: 'w-8 h-8 sm:w-9 sm:h-9 text-lg bottom-1.5 right-1.5',
      verified: 'w-6.5 h-6.5 text-xs bottom-1.5 right-1.5'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const currentTier = getUserTier(user);

  // Xử lý avatar fallback
  const rawAvatarUrl = user?.avatarUrl || user?.avatar || user?.profileImageUrl || user?.picture;
  const displayName = user?.fullName || user?.name || user?.username || 'Wayfarer';
  const firstLetter = displayName.trim().charAt(0).toUpperCase() || 'W';
  const tooltipText = title || `${displayName} • ${currentTier.name} (${currentTier.icon})`;

  return (
    <div
      onClick={onClick}
      title={tooltipText}
      className={`relative inline-flex items-center justify-center shrink-0 ${currentSize.box} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Vòng hào quang khung Avatar theo cấp độ (Avatar Frame Effect) */}
      <div
        className={`w-full h-full rounded-full flex items-center justify-center transition-transform duration-200 ${
          currentTier.avatarEffect || ''
        } ${currentTier.avatarRing || 'ring-2 ring-ink-200/80'}`}
      >
        {rawAvatarUrl && !imageError ? (
          <img
            src={rawAvatarUrl}
            alt={displayName}
            onError={() => setImageError(true)}
            className={`rounded-full object-cover bg-ink-100 ${currentSize.img} ${avatarClassName}`}
          />
        ) : (
          <div
            className={`rounded-full bg-gradient-to-tr from-clay-600 to-clay-800 text-white font-black font-display flex items-center justify-center select-none shadow-inner ${currentSize.img} ${avatarClassName}`}
          >
            {firstLetter}
          </div>
        )}
      </div>

      {/* Huy hiệu Cấp độ ở góc (Corner Badge 💎/👑/🥈/🥉) */}
      {showBadge && currentTier?.cornerIcon && (
        <span
          className={`absolute rounded-full flex items-center justify-center font-bold shadow-md border-2 border-[#FFFDF8] select-none transition-transform hover:scale-110 ${currentSize.badge} ${currentTier.cornerBg}`}
          title={`${currentTier.name} (${currentTier.tagText})`}
        >
          {currentTier.cornerIcon}
        </span>
      )}

      {/* Tích xanh xác minh (nếu không hiển thị badge góc hoặc là account verified) */}
      {showVerified && !showBadge && user?.isVerified && (
        <span
          className={`absolute rounded-full bg-clay-600 text-white flex items-center justify-center font-bold border-2 border-[#FFFDF8] shadow-xs ${currentSize.verified}`}
          title="Tài khoản đã xác minh"
        >
          ✓
        </span>
      )}
    </div>
  );
};
export default UserAvatar;

// =====================================================================
// WAYFARE PRESTIGE TIER & HONOR SYSTEM (Single Source of Truth)
// Quản lý cơ chế 4 Cấp bậc Danh hiệu, Khung Avatar và Tích lũy Điểm XP
// =====================================================================

export const TIERS = [
  {
    level: 1,
    id: 'bronze',
    name: 'Tân Thủ Khám Phá',
    nameEn: 'Bronze Explorer',
    minXP: 0,
    nextXP: 150,
    icon: '🥉',
    badgeBg: 'bg-amber-900/10 text-amber-800 border-amber-300',
    tagText: 'Cấp 1 • Bronze',
    avatarRing: 'ring-2 sm:ring-[3px] ring-amber-700/60 shadow-xs shadow-amber-900/10',
    avatarEffect: '',
    cornerIcon: '🥉',
    cornerBg: 'bg-amber-800 text-white',
    desc: 'Bước đầu khám phá các vùng đất mới trên nền tảng Wayfare'
  },
  {
    level: 2,
    id: 'silver',
    name: 'Lữ Hành Bạc',
    nameEn: 'Silver Wanderer',
    minXP: 150,
    nextXP: 400,
    icon: '🥈',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    tagText: 'Cấp 2 • Silver',
    avatarRing: 'ring-2 sm:ring-[3px] ring-slate-300 shadow-md shadow-slate-400/20',
    avatarEffect: 'p-[2px] sm:p-[2.5px] bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400',
    cornerIcon: '🥈',
    cornerBg: 'bg-slate-600 text-white',
    desc: 'Đã có lịch trình và bài viết chia sẻ truyền cảm hứng'
  },
  {
    level: 3,
    id: 'gold',
    name: 'Nhà Thám Hiểm Vàng',
    nameEn: 'Gold Voyager',
    minXP: 400,
    nextXP: 800,
    icon: '👑',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
    tagText: 'Cấp 3 • Gold',
    avatarRing: 'ring-2 sm:ring-[3px] ring-amber-400 shadow-lg shadow-amber-500/30',
    avatarEffect: 'p-[2.5px] sm:p-[3px] bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-md shadow-amber-500/30',
    cornerIcon: '👑',
    cornerBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900',
    desc: 'Thành viên cốt cán với mạng lưới cộng đồng đông đảo và dấu chân rộng lớn'
  },
  {
    level: 4,
    id: 'diamond',
    name: 'Huyền Thoại Kim Cương',
    nameEn: 'Diamond Legend',
    minXP: 800,
    nextXP: 800,
    icon: '💎',
    badgeBg: 'bg-gradient-to-r from-purple-100 via-pink-100 to-amber-100 text-purple-900 border-purple-300',
    tagText: 'Cấp 4 • Diamond VIP',
    avatarRing: 'ring-2 sm:ring-[3px] ring-purple-500 shadow-xl shadow-purple-500/40',
    avatarEffect: 'p-[3px] sm:p-[4px] bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 shadow-lg shadow-purple-500/30 animate-pulse',
    cornerIcon: '💎',
    cornerBg: 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white',
    desc: 'Đỉnh cao danh dự! Top 1% bậc thầy lữ hành có sức ảnh hưởng bậc nhất'
  }
];

/**
 * Tính điểm uy tín (XP) chuẩn dựa trên dữ liệu thực tế:
 * - Mỗi Lịch trình tạo: 60 XP
 * - Mỗi Bài viết chia sẻ: 40 XP
 * - Mỗi Người theo dõi (Follower): 15 XP
 * - Mỗi Địa điểm / Tỉnh thành khám phá: 25 XP
 */
export const calculateUserXP = (user) => {
  if (!user) return 0;

  // Nếu user đã có trường totalXp hoặc xp được truyền sẵn
  if (typeof user.totalXp === 'number') return user.totalXp;
  if (typeof user.xp === 'number') return user.xp;

  const itinsCount = Number(
    user.itinerariesCount ?? 
    user.itinsCount ?? 
    user.itineraryCount ?? 
    user._count?.itineraries ?? 
    0
  );

  const postsCount = Number(
    user.postsCount ?? 
    user.postCount ?? 
    user._count?.posts ?? 
    0
  );

  const followersCount = Number(
    user.followersCount ?? 
    user.followerCount ?? 
    user._count?.followers ?? 
    0
  );

  const destinationsCount = Number(
    typeof user.destinationsCount === 'number' 
      ? user.destinationsCount 
      : (itinsCount > 0 ? Math.min(itinsCount * 2, 25) : 0)
  );

  return (itinsCount * 60) + (postsCount * 40) + (followersCount * 15) + (destinationsCount * 25);
};

/**
 * Lấy đối tượng Tier hiện tại dựa trên đối tượng User hoặc điểm XP
 * Đảm bảo cơ chế nghiêm ngặt, chuẩn mực và đồng bộ tuyệt đối trên toàn hệ thống
 */
export const getUserTier = (userOrXP) => {
  if (!userOrXP) return TIERS[0];

  // 0. Nếu truyền trực tiếp số điểm XP
  if (typeof userOrXP === 'number') {
    if (userOrXP >= 800) return TIERS[3]; // Diamond
    if (userOrXP >= 400) return TIERS[2]; // Gold
    if (userOrXP >= 150) return TIERS[1]; // Silver
    return TIERS[0]; // Bronze
  }

  const user = userOrXP;

  // 1. Kiểm tra trường tier / authorTier từ CSDL hoặc API Backend
  const rawTier = String(user.tier || user.authorTier || '').trim().toLowerCase();
  if (rawTier === 'diamond' || rawTier === 'kim cương' || rawTier === 'vip') return TIERS[3];
  if (rawTier === 'gold' || rawTier === 'vàng') return TIERS[2];
  if (rawTier === 'silver' || rawTier === 'bạc') return TIERS[1];
  if (rawTier === 'bronze' || rawTier === 'đồng') return TIERS[0];

  // 2. Kiểm tra theo rank hoặc role text
  const rawRank = String(user.rank || user.role || user.authorRole || '').trim().toLowerCase();
  if (rawRank.includes('kim cương') || rawRank.includes('diamond')) return TIERS[3];
  if (rawRank.includes('vàng') || rawRank.includes('gold')) return TIERS[2];
  if (rawRank.includes('bạc') || rawRank.includes('silver')) return TIERS[1];
  if (rawRank.includes('đồng') || rawRank.includes('bronze')) return TIERS[0];

  // 3. Quy tắc tài khoản hệ thống (Seed Accounts) đảm bảo không bao giờ bị lệch khung:
  const email = String(user.email || user.authorEmail || '').trim().toLowerCase();
  if (email.startsWith('tung1@') || email.startsWith('admin@')) return TIERS[3]; // tung1 là Admin Kim Cương
  if (email.startsWith('tung2@')) return TIERS[2]; // tung2 là Cấp Vàng
  if (email.startsWith('tung3@')) return TIERS[1]; // tung3 là Cấp Bạc
  if (email.startsWith('tung')) return TIERS[0];   // tung4 -> tung20 là Cấp Đồng

  // 4. Nếu là Admin hệ thống thì luôn được hưởng vinh dự Kim Cương VIP
  if (Array.isArray(user.roles) && user.roles.some(r => r === 'ROLE_ADMIN' || r?.name === 'ROLE_ADMIN')) {
    return TIERS[3];
  }

  // 5. Nếu có dữ liệu hoạt động thật (stats: itins, posts, followers), tính theo XP
  const xp = calculateUserXP(user);
  if (xp >= 800) return TIERS[3]; // Diamond
  if (xp >= 400) return TIERS[2]; // Gold
  if (xp >= 150) return TIERS[1]; // Silver
  return TIERS[0]; // Bronze
};

/**
 * Lấy bậc Tier tiếp theo cần đạt tới
 */
export const getNextTier = (currentTier) => {
  if (!currentTier || currentTier.level >= 4) return null;
  return TIERS[currentTier.level];
};

/**
 * Tính phần trăm tiến trình đến cấp tiếp theo (0% -> 100%)
 */
export const calculateTierProgress = (xp, currentTier, nextTier) => {
  if (!nextTier) return 100;
  const currentMin = currentTier.minXP;
  const nextMin = nextTier.minXP;
  const progress = Math.min(100, Math.max(0, Math.round(((xp - currentMin) / (nextMin - currentMin)) * 100)));
  return progress;
};

/**
 * Kiểm tra xem người dùng có thăng cấp mới hay không
 * Lưu vết cấp độ cũ vào localStorage để bắn thông báo chúc mừng
 */
export const checkTierPromotion = (user) => {
  if (!user || !user.id) return null;
  const currentTier = getUserTier(user);
  const storageKey = `wayfare_user_tier_${user.id}`;
  const savedLevelStr = localStorage.getItem(storageKey);

  if (savedLevelStr) {
    const savedLevel = parseInt(savedLevelStr, 10);
    if (currentTier.level > savedLevel) {
      const oldTier = TIERS.find(t => t.level === savedLevel) || TIERS[0];
      localStorage.setItem(storageKey, currentTier.level.toString());
      return {
        promoted: true,
        oldTier,
        newTier: currentTier
      };
    }
  } else {
    // Lần đầu lưu cấp hiện tại
    localStorage.setItem(storageKey, currentTier.level.toString());
  }

  return null;
};

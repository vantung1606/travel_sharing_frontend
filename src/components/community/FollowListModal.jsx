import React, { useState, useEffect } from 'react';
import { X, Search, UserCheck, UserPlus, Users, Compass, Loader2 } from 'lucide-react';
import { userApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { useApp } from '../../context/AppContext';

export const FollowListModal = ({
  userId,
  userName = 'Người dùng',
  initialTab = 'following', // 'following' | 'followers'
  onClose,
  onSelectUser,
  onFollowChange
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingIds, setTogglingIds] = useState(new Set());

  const toast = useToast();
  const { currentUser } = useApp();

  // Load following and followers lists
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const targetUserId = userId || currentUser?.id;
      const targetEmail = currentUser?.email;
      if (!targetUserId && !targetEmail) return;
      try {
        setLoading(true);
        const [following, followers] = await Promise.all([
          userApi.getFollowing(targetUserId, targetEmail),
          userApi.getFollowers(targetUserId, targetEmail)
        ]);
        if (isMounted) {
          setFollowingList(Array.isArray(following) ? following : []);
          setFollowersList(Array.isArray(followers) ? followers : []);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách theo dõi:', err);
        toast.showError('Không thể tải danh sách kết nối: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handle toggle follow on any user in the list
  const handleToggleFollow = async (targetUser) => {
    if (!targetUser?.id) return;
    try {
      setTogglingIds(prev => new Set(prev).add(targetUser.id));
      const res = await userApi.toggleFollow(targetUser.id);
      const isNowFollowing = res?.isFollowing;

      // Update in following list
      setFollowingList(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, isFollowing: isNowFollowing } : u))
      );

      // Update in followers list
      setFollowersList(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, isFollowing: isNowFollowing } : u))
      );

      // Broadcast follow change to sync everywhere in real time
      window.dispatchEvent(new CustomEvent('wayfare_follow_changed', {
        detail: { targetUserId: targetUser.id, isFollowing: isNowFollowing }
      }));

      if (isNowFollowing) {
        toast.showSuccess(`Đã theo dõi ${targetUser.fullName}! ✨`);
      } else {
        toast.showInfo(`Đã hủy theo dõi ${targetUser.fullName}`);
      }

      if (typeof onFollowChange === 'function') {
        onFollowChange(targetUser.id, isNowFollowing);
      }
    } catch (err) {
      toast.showError('Thao tác theo dõi thất bại: ' + err.message);
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(targetUser.id);
        return next;
      });
    }
  };

  const currentList = activeTab === 'following' ? followingList : followersList;

  const filteredList = currentList.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.handle && u.handle.toLowerCase().includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-ink-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full shadow-2xl border border-ink-200/80 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-ink-200/80 flex items-center justify-between shrink-0 bg-[#F8F4EC] rounded-t-[6px]">
          <div>
            <h3 className="text-base sm:text-lg font-black font-display text-ink-800 leading-snug">
              Mạng lưới kết nối
            </h3>
            <p className="text-xs text-ink-500 font-serif">
              Hồ sơ của <span className="font-bold text-clay-700">{userName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[4px] bg-[#FFFDF8] hover:bg-ink-100 text-ink-600 border border-ink-200/80 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-ink-200/80 shrink-0 bg-[#F8F4EC]/60">
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'following'
                ? 'border-clay-600 text-clay-700 bg-[#FFFDF8]'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Đang theo dõi</span>
            <span className="px-1.5 py-0.5 rounded-[3px] bg-ink-200 text-[10px] text-ink-700 font-mono">
              {followingList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'followers'
                ? 'border-clay-600 text-clay-700 bg-[#FFFDF8]'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Người theo dõi</span>
            <span className="px-1.5 py-0.5 rounded-[3px] bg-ink-200 text-[10px] text-ink-700 font-mono">
              {followersList.length}
            </span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-3 border-b border-ink-200/80 shrink-0 bg-[#FFFDF8]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc @handle..."
              className="w-full pl-8 pr-8 py-1.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-xs text-ink-800 placeholder-ink-400 focus:outline-hidden focus:ring-1 focus:ring-clay-500/20 focus:border-clay-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FFFDF8]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-ink-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-clay-600" />
              <span className="font-serif">Đang tải danh sách kết nối...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-14 space-y-2">
              <div className="w-11 h-11 rounded-[6px] bg-clay-50 text-clay-700 border border-clay-200 flex items-center justify-center mx-auto shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-ink-800 font-display">
                {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có kết nối nào trong danh sách'}
              </p>
              <p className="text-[11px] text-ink-500 max-w-xs mx-auto font-serif">
                {activeTab === 'following'
                  ? 'Hãy khám phá cộng đồng và theo dõi các tác giả yêu thích!'
                  : 'Hãy chia sẻ những chuyến đi thú vị để nhận thêm nhiều người theo dõi nhé!'}
              </p>
            </div>
          ) : (
            filteredList.map(u => {
              const isMe = currentUser && (currentUser.email === u.email || currentUser.name === u.fullName);
              const isToggling = togglingIds.has(u.id);

              return (
                <div
                  key={u.id}
                  className="p-3 rounded-[5px] border border-ink-200/80 hover:border-clay-300 hover:bg-[#F8F4EC]/60 transition-all flex items-center justify-between gap-3 bg-[#F8F4EC]/40 shadow-2xs"
                >
                  {/* User Avatar + Info */}
                  <div
                    onClick={() => {
                      if (typeof onSelectUser === 'function') {
                        onSelectUser(u.id || u.userId);
                      }
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                  >
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={u.fullName}
                      className="w-10 h-10 rounded-[5px] object-cover ring-1 ring-ink-200 group-hover:ring-clay-500 transition-all shrink-0 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold font-display text-xs sm:text-sm text-ink-800 group-hover:text-clay-700 transition-colors truncate">
                          {u.fullName}
                        </h4>
                        {u.role && (
                          <span className="px-1.5 py-0.2 rounded-[3px] bg-clay-50 text-clay-700 text-[10px] font-semibold border border-clay-200/60 shrink-0">
                            {u.role}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-500 font-mono truncate">
                        {u.handle}
                      </p>
                      {u.bio && (
                        <p className="text-[11px] text-ink-600 truncate mt-0.5 font-serif">
                          {u.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Follow Button */}
                  {!isMe && (
                    <button
                      onClick={() => handleToggleFollow(u)}
                      disabled={isToggling}
                      className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs ${
                        u.isFollowing
                          ? 'bg-[#FFFDF8] text-ink-700 hover:bg-rose-50 hover:text-rose-700 border border-ink-200/80'
                          : 'bg-clay-600 hover:bg-clay-700 text-white shadow-xs'
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : u.isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-clay-600" />
                          <span>Đang theo dõi</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Theo dõi</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default FollowListModal;


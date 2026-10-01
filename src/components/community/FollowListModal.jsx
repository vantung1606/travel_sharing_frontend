import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  UserCheck,
  UserPlus,
  Users,
  Compass,
  Loader2,
  Sparkles
} from 'lucide-react';
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
      if (!userId) return;
      try {
        setLoading(true);
        const [following, followers] = await Promise.all([
          userApi.getFollowing(userId),
          userApi.getFollowers(userId)
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              Mạng lưới kết nối
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Hồ sơ của <span className="font-bold text-emerald-600">{userName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 shrink-0 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'following'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Đang theo dõi</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600">
              {followingList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'followers'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Người theo dõi</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600">
              {followersList.length}
            </span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-100 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc @handle..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Đang tải danh sách kết nối...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-14 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có kết nối nào trong danh sách'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
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
                  className="p-3 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-3 bg-white shadow-2xs"
                >
                  {/* User Avatar + Info */}
                  <div
                    onClick={() => {
                      if (typeof onSelectUser === 'function') {
                        onSelectUser(u.id);
                      }
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                  >
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={u.fullName}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-emerald-500 transition-all shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                          {u.fullName}
                        </h4>
                        {u.role && (
                          <span className="px-2 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100 shrink-0">
                            {u.role}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium truncate">
                        {u.handle}
                      </p>
                      {u.bio && (
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs ${
                        u.isFollowing
                          ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
                          : 'ocean-gradient text-white hover:opacity-95 shadow-emerald-500/20'
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : u.isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
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


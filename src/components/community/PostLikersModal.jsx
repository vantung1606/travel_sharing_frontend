import React, { useState, useEffect } from 'react';
import { X, Heart, Search, UserCheck, UserPlus, Users, Loader2 } from 'lucide-react';
import { postApi, userApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { useApp } from '../../context/AppContext';

export const PostLikersModal = ({
  postId,
  postTitle = '',
  onClose,
  onSelectUser,
  onFollowChange
}) => {
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingIds, setTogglingIds] = useState(new Set());

  const toast = useToast();
  const { currentUser } = useApp();

  useEffect(() => {
    let isMounted = true;
    const fetchLikers = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        const data = await postApi.getPostLikers(postId);
        if (isMounted) {
          setLikers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách người thích:', err);
        if (isMounted) {
          toast.showError('Không thể tải danh sách người thích: ' + err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLikers();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleToggleFollow = async (targetUser) => {
    if (!currentUser) {
      toast.showWarning('Vui lòng đăng nhập để theo dõi người dùng!');
      return;
    }
    if (!targetUser?.id) return;

    try {
      setTogglingIds(prev => new Set(prev).add(targetUser.id));
      const res = await userApi.toggleFollow(targetUser.id);
      const isNowFollowing = res?.isFollowing;

      setLikers(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, isFollowing: isNowFollowing } : u))
      );

      window.dispatchEvent(
        new CustomEvent('wayfare_follow_changed', {
          detail: { targetUserId: targetUser.id, isFollowing: isNowFollowing }
        })
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

  const filteredLikers = likers.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.handle && u.handle.toLowerCase().includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-stone-200 max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-[#1E1A15] text-base sm:text-lg flex items-center gap-2">
                Người đã thích
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                  {likers.length}
                </span>
              </h3>
              {postTitle && (
                <p className="text-xs text-stone-500 truncate max-w-[240px] sm:max-w-[280px]">
                  {postTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        {likers.length > 5 && (
          <div className="p-3 border-b border-stone-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm người thích..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-100/70 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* List Body */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 divide-y divide-stone-100 min-h-[220px]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-2" />
              <p className="text-xs sm:text-sm">Đang tải danh sách người thích...</p>
            </div>
          ) : filteredLikers.length === 0 ? (
            <div className="py-12 text-center text-stone-400 flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-stone-300 stroke-[1.5] mb-2" />
              <p className="text-sm font-medium text-stone-600">
                {searchQuery ? 'Không tìm thấy người phù hợp' : 'Chưa có lượt thích nào'}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {searchQuery
                  ? 'Hãy thử tìm kiếm với từ khóa khác'
                  : 'Hãy là người đầu tiên thả tim cho bài viết này!'}
              </p>
            </div>
          ) : (
            filteredLikers.map(u => {
              const isCurrentUser = u.isMe || (currentUser && currentUser.id === u.id);
              const isToggling = togglingIds.has(u.id);

              return (
                <div
                  key={u.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50/60 px-2 rounded-xl transition-colors"
                >
                  {/* User Profile Info */}
                  <div
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                    onClick={() => {
                      if (typeof onSelectUser === 'function') {
                        onSelectUser(u);
                      }
                    }}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          u.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            u.fullName || 'User'
                          )}&background=random`
                        }
                        alt={u.fullName}
                        className="w-11 h-11 rounded-full object-cover border border-stone-200"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center">
                        <Heart className="w-2.5 h-2.5 fill-white text-white" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-semibold text-stone-800 text-sm truncate hover:underline hover:text-rose-600 transition-colors">
                          {u.fullName}
                        </h4>
                        {u.role && u.role.includes('Quản trị') && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 truncate">
                        {u.handle || (u.email ? `@${u.email.split('@')[0]}` : '@user')}
                      </p>
                      {u.bio && (
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {u.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 pl-2">
                    {isCurrentUser ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">
                        Bạn
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleFollow(u)}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                          u.isFollowing
                            ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
                            : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : u.isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PostLikersModal;

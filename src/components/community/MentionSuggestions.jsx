import React, { useState, useMemo } from 'react';
import { Users, Search, AtSign, X, Check } from 'lucide-react';

/**
 * Dropdown list displaying followed users for @tagging
 */
export const MentionSuggestionsDropdown = ({
  followingUsers = [],
  query = '',
  onSelect,
  onClose,
  positionClass = 'bottom-full mb-2',
  title = 'Gắn thẻ người bạn đang theo dõi'
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const activeQuery = (query || internalSearch).toLowerCase().trim();

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(followingUsers)) return [];
    if (!activeQuery) return followingUsers;
    return followingUsers.filter(u => {
      const name = (u.fullName || u.name || '').toLowerCase();
      const handle = (u.handle || '').toLowerCase();
      return name.includes(activeQuery) || handle.includes(activeQuery);
    });
  }, [followingUsers, activeQuery]);

  return (
    <div
      onClick={e => e.stopPropagation()}
      className={`absolute left-0 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${positionClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-sky-50/80 to-blue-50/60 border-b border-slate-100">
        <span className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
          <AtSign className="w-3.5 h-3.5 text-sky-600" />
          <span>{title}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Optional Search if many users */}
      {followingUsers.length > 5 && !query && (
        <div className="p-2 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm bạn theo dõi..."
              value={internalSearch}
              onChange={e => setInternalSearch(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 no-scrollbar p-1">
        {followingUsers.length === 0 ? (
          <div className="p-4 text-center space-y-1">
            <Users className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Bạn chưa theo dõi ai</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Chỉ những người bạn đang theo dõi mới có thể được gắn thẻ trong bài viết & bình luận.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-500">
            Không tìm thấy người bạn theo dõi khớp với <strong>"{activeQuery}"</strong>
          </div>
        ) : (
          filteredUsers.map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelect(user)}
              className="w-full p-2 flex items-center gap-2.5 rounded-xl hover:bg-sky-50/70 transition-colors text-left cursor-pointer group"
            >
              <img
                src={
                  user.avatarUrl ||
                  user.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={user.fullName || user.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 group-hover:border-sky-300"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-800 truncate group-hover:text-sky-700">
                    {user.fullName || user.name}
                  </span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-medium flex items-center gap-0.5 shrink-0">
                    <Check className="w-2.5 h-2.5" /> Bạn theo dõi
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {user.handle || `@user_${user.id}`}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-400 text-center border-t border-slate-100">
        💡 Chỉ người bạn đang theo dõi mới xuất hiện trong danh sách gắn thẻ
      </div>
    </div>
  );
};

/**
 * Helper to render text containing @tags into clickable user mention badges
 */
export const renderTextWithMentions = (text, knownUsers = [], onUserClick = null) => {
  if (!text || typeof text !== 'string') return text;
  if (!text.includes('@')) return text;

  // Build list of valid patterns from knownUsers first, sorted longest name first
  const userPatterns = (Array.isArray(knownUsers) ? knownUsers : [])
    .filter(u => (u.fullName || u.name))
    .sort((a, b) => ((b.fullName || b.name || '').length) - ((a.fullName || a.name || '').length));

  const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  const patternParts = [];
  userPatterns.forEach(u => {
    const name = (u.fullName || u.name || '').trim();
    if (name) {
      patternParts.push(`@${escapeRegex(name)}`);
    }
    if (u.handle) {
      const cleanHandle = u.handle.replace(/^@/, '').trim();
      if (cleanHandle) {
        patternParts.push(`@${escapeRegex(cleanHandle)}`);
      }
    }
  });

  // Generic fallback for any @word (letters, numbers, underscores, accented vietnamese chars)
  patternParts.push('@[A-Za-z0-9_À-ỹ]+');

  const combinedRegex = new RegExp(`(${patternParts.join('|')})`, 'gi');
  const parts = text.split(combinedRegex);

  return parts.map((part, idx) => {
    if (part && part.startsWith('@') && part.length > 1) {
      const tagContent = part.slice(1);
      const matchedUser = userPatterns.find(u => {
        const uName = (u.fullName || u.name || '').toLowerCase();
        const uHandle = (u.handle || '').toLowerCase().replace(/^@/, '');
        const target = tagContent.toLowerCase();
        return uName === target || uHandle === target;
      });

      return (
        <span
          key={idx}
          onClick={(e) => {
            if (matchedUser && onUserClick) {
              e.stopPropagation();
              onUserClick(matchedUser.id || matchedUser);
            }
          }}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold transition-all ${
            matchedUser && onUserClick
              ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800 cursor-pointer border border-sky-200/60 shadow-2xs'
              : 'bg-sky-50/70 text-sky-600 font-semibold'
          }`}
          title={matchedUser ? `Xem hồ sơ của ${matchedUser.fullName || matchedUser.name}` : undefined}
        >
          <AtSign className="w-3 h-3 text-sky-500 shrink-0 inline" />
          <span>{tagContent}</span>
        </span>
      );
    }
    return part;
  });
};

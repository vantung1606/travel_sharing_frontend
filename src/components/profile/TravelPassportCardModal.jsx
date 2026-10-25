import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Download, ShieldCheck, Sparkles, MapPin, Calendar, Compass, Share2 } from 'lucide-react';

export const TravelPassportCardModal = ({ user, profileData, onClose }) => {
  const [copied, setCopied] = useState(false);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile?user=${encodeURIComponent(user?.handle || user?.id || '')}`
    : `https://wayfare.vn/profile?user=${encodeURIComponent(user?.handle || user?.id || '')}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent(profileUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const memberRank = profileData?.rank || profileData?.role || 'Wanderer Gold';
  const followersCount = profileData?.followersCount || user?.followersCount || 0;
  const itinsCount = profileData?.itineraries?.length || 0;
  const postsCount = profileData?.posts?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] rounded-[6px] max-w-md w-full overflow-hidden shadow-2xl border border-ink-200/80 flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-ink-200/80 bg-[#F8F4EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[5px] bg-clay-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '18s' }} />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-ink-800 tracking-tight">Thẻ Du Khách Wayfare</h3>
              <p className="text-[10px] text-ink-500 font-serif">Digital Travel Passport</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[5px] hover:bg-ink-200 text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Passport Card Body */}
        <div className="p-6 space-y-6">
          
          {/* Card Visual */}
          <div className="relative rounded-[6px] overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-clay-950 text-white p-5 shadow-lg border border-ink-700/60">
            {/* Background Decorative Pattern */}
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-clay-500/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

            {/* Passport Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xs tracking-widest text-clay-300 uppercase">WAYFARE PASSPORT</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {memberRank}
              </span>
            </div>

            {/* User Main Section */}
            <div className="flex items-center gap-4 py-4">
              <div className="relative shrink-0">
                <img
                  src={user?.avatar || profileData?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={user?.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-clay-400/60 shadow-md bg-white"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-clay-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-ink-900">
                  ✓
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display font-black text-base text-white truncate leading-tight">
                  {profileData?.fullName || user?.name || 'Du khách Wayfare'}
                </h4>
                <p className="text-xs text-clay-200/90 font-mono truncate">{user?.handle || '@wanderer'}</p>
                <div className="flex items-center gap-1 text-[11px] text-ink-200 mt-1">
                  <MapPin className="w-3 h-3 text-clay-400 shrink-0" />
                  <span className="truncate">{profileData?.location || 'Việt Nam'}</span>
                </div>
              </div>
            </div>

            {/* Passport Mini Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
              <div className="bg-white/5 rounded-[5px] p-2 border border-white/10">
                <span className="block text-[10px] text-ink-300 font-serif">Theo dõi</span>
                <span className="font-black text-xs text-clay-300 mt-0.5 block">{followersCount} người</span>
              </div>
              <div className="bg-white/5 rounded-[5px] p-2 border border-white/10">
                <span className="block text-[10px] text-ink-300 font-serif">Lịch trình</span>
                <span className="font-black text-xs text-amber-300 mt-0.5 block">{itinsCount} tour</span>
              </div>
              <div className="bg-white/5 rounded-[5px] p-2 border border-white/10">
                <span className="block text-[10px] text-ink-300 font-serif">Bài chia sẻ</span>
                <span className="font-black text-xs text-emerald-300 mt-0.5 block">{postsCount} bài</span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 p-4 bg-[#F8F4EC] rounded-[6px] border border-ink-200/80">
            <div className="p-3 bg-[#FFFDF8] rounded-[5px] shadow-2xs border border-ink-200 relative group">
              <img
                src={qrImageUrl}
                alt="QR Hồ Sơ"
                className="w-40 h-40 object-contain rounded-[4px]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-ink-800 flex items-center justify-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-clay-600" />
                Quét mã để kết nối & xem lịch trình du lịch
              </p>
              <p className="text-[11px] text-ink-500 font-serif">
                Sử dụng Camera điện thoại hoặc Zalo để quét nhanh
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className={`flex-1 py-2.5 px-4 rounded-[5px] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-clay-600 hover:bg-clay-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã sao chép liên kết!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép liên kết</span>
                </>
              )}
            </button>

            <a
              href={qrImageUrl}
              download={`Wayfare_Passport_${user?.handle || 'user'}.png`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-[5px] text-xs font-bold bg-[#FFFDF8] text-clay-700 hover:bg-clay-50 flex items-center justify-center gap-1.5 transition-colors border border-ink-200/80 cursor-pointer shadow-2xs"
              title="Tải mã QR về máy"
            >
              <Download className="w-4 h-4" />
              <span>Tải QR</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

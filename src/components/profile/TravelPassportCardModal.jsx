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
  const placesCount = profileData?.destinationsCount || user?.destinationsCount || 24;
  const itinsCount = profileData?.itineraries?.length || 0;
  const postsCount = profileData?.posts?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '18s' }} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-900 tracking-tight">Thẻ Du Khách Wayfare</h3>
              <p className="text-[10px] text-slate-400 font-medium">Digital Travel Passport</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Passport Card Body */}
        <div className="p-6 space-y-6">
          
          {/* Card Visual */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-5 shadow-xl border border-slate-700/50">
            {/* Background Decorative Pattern */}
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-sky-500/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

            {/* Passport Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xs tracking-widest text-sky-400 uppercase">WAYFARE PASSPORT</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-1">
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
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-400/50 shadow-md bg-white"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-slate-900">
                  ✓
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display font-extrabold text-base text-white truncate leading-tight">
                  {profileData?.fullName || user?.name || 'Du khách Wayfare'}
                </h4>
                <p className="text-xs text-sky-300/80 font-mono truncate">{user?.handle || '@wanderer'}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-1">
                  <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">{profileData?.location || 'Việt Nam'}</span>
                </div>
              </div>
            </div>

            {/* Passport Mini Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-medium">Tỉnh thành</span>
                <span className="font-extrabold text-xs text-sky-300 mt-0.5 block">{placesCount} / 63</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-medium">Lịch trình</span>
                <span className="font-extrabold text-xs text-amber-300 mt-0.5 block">{itinsCount} tour</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-medium">Bài chia sẻ</span>
                <span className="font-extrabold text-xs text-emerald-300 mt-0.5 block">{postsCount} bài</span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 relative group">
              <img
                src={qrImageUrl}
                alt="QR Hồ Sơ"
                className="w-40 h-40 object-contain rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-sky-600" />
                Quét mã để kết nối & xem lịch trình du lịch
              </p>
              <p className="text-[11px] text-slate-400">
                Sử dụng Camera điện thoại hoặc Zalo để quét nhanh
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
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
              className="py-3 px-4 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 flex items-center justify-center gap-1.5 transition-colors border border-sky-200/70 cursor-pointer"
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

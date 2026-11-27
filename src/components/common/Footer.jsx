import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Heart, Phone, Mail, MapPin, Facebook, Instagram, Youtube, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  const { branding } = useTheme();
  const contact = branding?.contact || {};
  const hasSocial = Boolean(
    contact.facebook || contact.instagram || contact.youtube || contact.tiktok || contact.threads
  );

  return (
    <footer className="bg-[#1A1714] text-stone-300 border-t-2 border-clay-600/80">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-12 pb-8 sm:pt-14 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10">

          {/* 1. Thương hiệu & Giới thiệu (5 cột) */}
          <div className="sm:col-span-2 lg:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={branding?.logoWhiteUrl || '/wayfare-logo-white.png'}
                alt={branding?.siteTitle || 'Wayfare'}
                onError={(e) => {
                  e.currentTarget.src = '/wayfare-logo-white.png';
                }}
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </Link>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-md">
              {branding?.tagline ||
                'Nền tảng lập lịch trình thông minh cùng AI, khám phá tọa độ bản địa và kết nối cộng đồng yêu du lịch Việt Nam.'}
            </p>

            {contact.address && (
              <p className="text-stone-400 text-xs flex items-start gap-2 leading-relaxed max-w-md">
                <MapPin className="w-4 h-4 text-clay-400 shrink-0 mt-0.5" />
                <span>{contact.address}</span>
              </p>
            )}

            {hasSocial && (
              <div className="flex items-center gap-2 pt-1">
                {contact.facebook && (
                  <a
                    href={contact.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/8 hover:bg-clay-600 border border-white/10 text-stone-200 hover:text-white flex items-center justify-center transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {contact.instagram && (
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/8 hover:bg-clay-600 border border-white/10 text-stone-200 hover:text-white flex items-center justify-center transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {contact.youtube && (
                  <a
                    href={contact.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/8 hover:bg-clay-600 border border-white/10 text-stone-200 hover:text-white flex items-center justify-center transition-colors"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {contact.tiktok && (
                  <a
                    href={contact.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/8 hover:bg-clay-600 border border-white/10 text-stone-200 hover:text-white flex items-center justify-center font-mono font-bold text-xs transition-colors"
                    title="TikTok"
                  >
                    TT
                  </a>
                )}
                {contact.threads && (
                  <a
                    href={contact.threads}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/8 hover:bg-clay-600 border border-white/10 text-stone-200 hover:text-white flex items-center justify-center font-mono font-bold text-xs transition-colors"
                    title="Threads"
                  >
                    @
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 2. Khám phá (2 cột) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Khám phá
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-stone-400 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-stone-400 hover:text-white transition-colors">
                  Điểm đến nổi bật
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-stone-400 hover:text-white transition-colors">
                  Cộng đồng du lịch
                </Link>
              </li>
              <li>
                <Link to="/itineraries" className="text-stone-400 hover:text-white transition-colors">
                  Lịch trình của tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Trải nghiệm (2 cột) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Trải nghiệm
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/itineraries" className="text-stone-400 hover:text-white transition-colors">
                  Lập lịch trình AI
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-stone-400 hover:text-white transition-colors">
                  Bản đồ tọa độ
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-stone-400 hover:text-white transition-colors">
                  Review check-in
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-stone-400 hover:text-white transition-colors">
                  Trò chuyện chuyến đi
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Liên hệ & Hỗ trợ (3 cột) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Liên hệ & Hỗ trợ
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <a
                href={`mailto:${contact.email || 'contact@wayfare.vn'}`}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-clay-600/20 text-clay-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Email</div>
                  <div className="text-xs sm:text-sm font-semibold text-white truncate">
                    {contact.email || 'contact@wayfare.vn'}
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-white shrink-0 transition-colors" />
              </a>

              <a
                href={`tel:${contact.hotline || '1900 6868'}`}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-clay-600/20 text-clay-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Hotline hỗ trợ</div>
                  <div className="text-xs sm:text-sm font-semibold text-white truncate">
                    {contact.hotline || '1900 6868'}
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-white shrink-0 transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <p className="font-medium text-stone-300 text-center sm:text-left">
            {branding?.footerText || '© 2026 Wayfare Travel. All rights reserved.'}
          </p>
          <p className="flex items-center gap-1.5 text-stone-400">
            <span>Thiết kế với</span>
            <Heart className="w-3.5 h-3.5 text-clay-400 fill-clay-400 inline" />
            <span>cho cộng đồng du lịch Việt Nam</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

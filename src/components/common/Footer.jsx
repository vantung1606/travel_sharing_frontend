import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Compass, Heart, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Globe } from 'lucide-react';

export const Footer = () => {
  const { branding } = useTheme();
  const contact = branding?.contact || {};

  return (
    <footer className="bg-[#3A2A21] text-[#D8C9B8] py-10 sm:py-14 border-t border-[#B0522F]/35">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          
          {/* Brand & Intro */}
          <div>
            <div className="mb-3 sm:mb-4">
              <img
                src={branding?.logoWhiteUrl || "/wayfare-logo-white.png"}
                alt={branding?.siteTitle || "Wayfare"}
                onError={(e) => { e.currentTarget.src = '/wayfare-logo-white.png'; }}
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </div>
            <p className="text-[#D8C9B8] text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 font-normal">
              {branding?.tagline || 'Nền tảng du lịch cá tính & chia sẻ trải nghiệm lữ hành thông minh hàng đầu Việt Nam.'}
            </p>
            {contact.address && (
              <p className="text-[#D8C9B8]/80 text-[11px] sm:text-xs flex items-start gap-1.5 leading-snug">
                <MapPin className="w-3.5 h-3.5 text-[#E8B08E] shrink-0 mt-0.5" />
                <span>{contact.address}</span>
              </p>
            )}
          </div>

          {/* Quick Links 1 */}
          <div>
            <h4 className="font-bold text-[#F8F4EC] text-xs sm:text-base mb-2.5 sm:mb-3.5 tracking-tight uppercase sm:normal-case">Khám Phá</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="/explore" className="text-[#D8C9B8] hover:text-[#F0C9B5] hover:underline transition-colors">Top điểm đến hot nhất</a></li>
              <li><a href="/community" className="text-[#D8C9B8] hover:text-[#F0C9B5] hover:underline transition-colors">Cộng đồng du lịch</a></li>
              <li><a href="/itineraries" className="text-[#D8C9B8] hover:text-[#F0C9B5] hover:underline transition-colors">Lịch trình mẫu nổi bật</a></li>
              <li><a href="/explore" className="text-[#D8C9B8] hover:text-[#F0C9B5] hover:underline transition-colors">Review điểm check-in</a></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h4 className="font-bold text-[#F8F4EC] text-xs sm:text-base mb-2.5 sm:mb-3.5 tracking-tight uppercase sm:normal-case">Tính Năng Nổi Bật</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="/itineraries" className="text-[#D8C9B8] hover:text-[#F0C9B5] hover:underline transition-colors">Lên lịch trình tự động với AI</a></li>
              <li><a href="/explore" className="text-[#D8C9B8] hover:text-[#F0C9B5] hover:underline transition-colors">Tối ưu hoá ngân sách phượt</a></li>
              <li><a href="/explore" className="text-[#D8C9B8] hover:text-[#F0C9B5] hover:underline transition-colors">Khám phá điểm đến bí mật</a></li>
              <li><a href="/community" className="text-[#D8C9B8] hover:text-[#F0C9B5] hover:underline transition-colors">Chia sẻ trải nghiệm thực tế</a></li>
            </ul>
          </div>

          {/* Contact & Social Channels */}
          <div>
            <h4 className="font-bold text-[#F8F4EC] text-xs sm:text-base mb-2.5 sm:mb-3.5 tracking-tight uppercase sm:normal-case">Liên Hệ & Kết Nối</h4>
            <div className="space-y-2 text-xs sm:text-sm mb-4">
              <p className="flex items-center gap-2 text-[#D8C9B8]">
                <Mail className="w-3.5 h-3.5 text-[#E8B08E] shrink-0" />
                <span>Email: </span>
                <a 
                  href={`mailto:${contact.email || 'contact@wayfare.vn'}`} 
                  className="text-[#F8F4EC] font-medium hover:underline hover:text-[#F0C9B5] transition-colors"
                >
                  {contact.email || 'contact@wayfare.vn'}
                </a>
              </p>
              <p className="flex items-center gap-2 text-[#D8C9B8]">
                <Phone className="w-3.5 h-3.5 text-[#E8B08E] shrink-0" />
                <span>Hotline: </span>
                <a 
                  href={`tel:${contact.hotline || '1900 6868'}`} 
                  className="text-[#F8F4EC] font-medium hover:underline hover:text-[#F0C9B5] transition-colors"
                >
                  {contact.hotline || '1900 6868'}
                </a>
              </p>
            </div>

            {/* Social Media Channels */}
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#E8B08E] block mb-2">Mạng xã hội</span>
              <div className="flex items-center gap-2 flex-wrap">
                {contact.facebook && (
                  <a
                    href={contact.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-[6px] bg-white/10 hover:bg-[#B0522F] text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
                    title="Facebook Fanpage"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {contact.instagram && (
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-[6px] bg-white/10 hover:bg-[#B0522F] text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
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
                    className="w-8 h-8 rounded-[6px] bg-white/10 hover:bg-[#B0522F] text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
                    title="YouTube Channel"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {contact.tiktok && (
                  <a
                    href={contact.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-[6px] bg-white/10 hover:bg-[#B0522F] text-white flex items-center justify-center font-mono font-bold text-xs transition-all duration-200 shadow-2xs hover:scale-105"
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
                    className="w-8 h-8 rounded-[6px] bg-white/10 hover:bg-[#B0522F] text-white flex items-center justify-center font-mono font-bold text-xs transition-all duration-200 shadow-2xs hover:scale-105"
                    title="Threads"
                  >
                    @
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-6 sm:pt-8 border-t border-[#B0522F]/25 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between text-[#D8C9B8] font-medium gap-2 sm:gap-0">
          <p className="text-[#E3D6C6] font-semibold text-center sm:text-left">{branding?.footerText || '© 2026 Wayfare Travel.'}</p>
          <p className="flex items-center justify-center gap-1.5 text-[#D8C9B8] text-center">
            Thiết kế với <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8B08E] fill-[#E8B08E] shrink-0 inline" /> cho cộng đồng yêu du lịch Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, ArrowRight, X, Megaphone, Bell } from 'lucide-react';

export const TopAnnouncementRibbon = ({ isPreview = false, overrideData = null }) => {
  const { branding, theme } = useTheme();
  const announcement = overrideData || branding?.announcement;

  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isPreview) {
      setIsDismissed(false);
      return;
    }
    try {
      const dismissedVer = sessionStorage.getItem('wf_announcement_dismissed');
      const currentToken = `${announcement?.text}_${announcement?.badge}`;
      if (dismissedVer === currentToken) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } catch {}
  }, [announcement?.text, announcement?.badge, isPreview]);

  if (!announcement || !announcement.enabled || (isDismissed && !isPreview)) {
    return null;
  }

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (!isPreview) {
      try {
        const currentToken = `${announcement?.text}_${announcement?.badge}`;
        sessionStorage.setItem('wf_announcement_dismissed', currentToken);
      } catch {}
    }
  };

  const bgColor = announcement.bgColor || 'var(--wf-primary, #B0522F)';
  const textColor = announcement.textColor || '#FFFFFF';

  return (
    <div 
      style={{ backgroundColor: bgColor, color: textColor }}
      className="relative z-50 w-full transition-all duration-300 shadow-xs select-none border-b border-black/10 text-xs py-2 px-3 sm:px-6"
      role="region"
      aria-label="Thông báo hệ thống"
    >
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-2.5">
        
        {/* Left / Center content */}
        <div className="flex-1 flex items-center justify-center sm:justify-start gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Megaphone className="w-3.5 h-3.5 animate-bounce shrink-0" />
            {announcement.badge && (
              <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-[4px] bg-white/20 text-white border border-white/30 tracking-wider">
                {announcement.badge}
              </span>
            )}
          </div>

          <p className="font-serif text-xs font-medium truncate sm:whitespace-normal">
            {announcement.text || 'Chào mừng bạn đến với Wayfare - Mạng xã hội du lịch phượt hàng đầu!'}
          </p>

          {announcement.linkUrl && (
            <a 
              href={announcement.linkUrl}
              className="inline-flex items-center gap-1 font-sans text-[11px] font-bold underline underline-offset-2 hover:opacity-85 shrink-0 transition-opacity ml-1"
            >
              <span>{announcement.linkText || 'Xem ngay'}</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Right close button */}
        {announcement.isClosable && (
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-black/15 transition-colors cursor-pointer shrink-0 opacity-80 hover:opacity-100"
            title="Đóng thông báo này"
            aria-label="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
export default TopAnnouncementRibbon;

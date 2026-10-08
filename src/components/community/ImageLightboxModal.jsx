import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  MessageCircle,
  Heart,
  ZoomIn,
  Download
} from 'lucide-react';

export const ImageLightboxModal = ({
  isOpen,
  images = [],
  initialIndex = 0,
  onClose,
  post = null,
  onOpenPostDetail = null
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Synchronize initial index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex || 0);
    }
  }, [isOpen, initialIndex]);

  // Navigate next / prev
  const handlePrev = useCallback(() => {
    if (!images || images.length <= 1) return;
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images]);

  const handleNext = useCallback(() => {
    if (!images || images.length <= 1) return;
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images]);

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Prevent background body scrolling when lightbox is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];
  const authorName = post?.authorName || post?.author?.fullName || post?.author?.name || 'Thành viên Wayfare';
  const authorAvatar = post?.authorAvatar || post?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const locationTag = post?.locationTag || post?.destination || '';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-xl transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* ─── 1. TOP HEADER BAR ─── */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-b from-black/80 to-transparent z-10 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Left: Author Info & Post Title */}
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-white font-extrabold text-xs sm:text-sm truncate drop-shadow-sm">
              {post?.title || `Bộ sưu tập ảnh (${images.length} ảnh)`}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-300 truncate">
              <span className="font-semibold text-slate-200">{authorName}</span>
              {locationTag && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{locationTag}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Counter, View Detail, Close */}
        <div className="flex items-center gap-2.5 shrink-0">
          {images.length > 1 && (
            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-black tracking-wide">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {post && onOpenPostDetail && (
            <button
              onClick={() => {
                onClose();
                onOpenPostDetail(post);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-600/90 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              title="Mở toàn bộ bài viết và bình luận"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Xem bài viết</span>
            </button>
          )}

          <a
            href={currentImage}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all cursor-pointer"
            title="Mở ảnh gốc trong tab mới"
            onClick={e => e.stopPropagation()}
          >
            <ZoomIn className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-rose-600/80 text-white/90 hover:text-white transition-all cursor-pointer ring-1 ring-white/10"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── 2. MAIN IMAGE VIEWPORT ─── */}
      <div
        className="flex-1 relative flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/50 hover:bg-sky-600/90 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-2xl backdrop-blur-md cursor-pointer group"
            title="Ảnh trước (Phím mũi tên trái)"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Current Full Image */}
        <div className="relative max-h-full max-w-full flex items-center justify-center">
          <img
            key={currentImage}
            src={currentImage}
            alt={`Photo ${currentIndex + 1}`}
            className="max-h-[75vh] sm:max-h-[78vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 animate-in fade-in zoom-in-95 duration-200"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/50 hover:bg-sky-600/90 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-2xl backdrop-blur-md cursor-pointer group"
            title="Ảnh tiếp theo (Phím mũi tên phải)"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* ─── 3. BOTTOM THUMBNAIL STRIP ─── */}
      {images.length > 1 && (
        <div
          className="w-full py-3 px-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-2 overflow-x-auto no-scrollbar shrink-0 select-none z-10"
          onClick={e => e.stopPropagation()}
        >
          {images.map((thumb, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'ring-3 ring-sky-400 scale-105 shadow-lg shadow-sky-500/40 opacity-100'
                    : 'opacity-50 hover:opacity-90 hover:scale-100 ring-1 ring-white/20'
                }`}
              >
                <img
                  src={thumb}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

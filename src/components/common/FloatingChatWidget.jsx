import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Maximize2, MessageCircle, Minus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MessagesPage = lazy(() => import('../../pages/user/Messages/MessagesPage'));

export const FloatingChatWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, setIsAuthModalOpen, setAuthMode, unreadMessagesCount } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [draftText, setDraftText] = useState('');
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const isHiddenRoute = location.pathname.startsWith('/messages') || location.pathname.startsWith('/admin');

  useEffect(() => {
    setIsOpen(false);
    setActiveThreadId(null);
    setDraftText('');
  }, [currentUser?.id, currentUser?.email, isLoggedIn]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.key]);

  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  const handleMinimize = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  const handleToggle = () => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    if (isOpen) handleMinimize();
    else setIsOpen(true);
  };

  const handleExpand = () => {
    setIsOpen(false);
    navigate(activeThreadId ? '/messages?roomId=' + encodeURIComponent(activeThreadId) : '/messages');
  };

  if (isHiddenRoute) return null;

  // Keep viewport-sized dialogs outside layout ancestors that may clip them.
  return createPortal(
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[60] font-sans">
      {isOpen && isLoggedIn && (
        <section
          ref={panelRef}
          id="wayfare-floating-chat"
          role="dialog"
          aria-label="Tin nhắn Wayfare"
          tabIndex={-1}
          className="absolute bottom-[calc(100%+0.75rem)] right-0 flex h-[min(38rem,calc(100dvh-10rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-xl border border-ink-200 bg-[#FFFDF8] shadow-2xl outline-none sm:h-[min(40rem,calc(100dvh-7rem))]"
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-ink-200 bg-[#FFFDF8] px-3 py-1">
            <div className="flex min-w-0 items-center gap-2 text-clay-700">
              <MessageCircle className="h-4 w-4 shrink-0" />
              <h2 className="truncate text-xs font-bold">Tin nhắn Wayfare</h2>
            </div>
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={handleExpand}
                title="Mở toàn màn hình"
                aria-label="Mở toàn màn hình"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[5px] text-ink-500 transition-colors hover:bg-clay-50 hover:text-clay-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay-600"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleMinimize}
                title="Thu nhỏ"
                aria-label="Thu nhỏ"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[5px] text-ink-500 transition-colors hover:bg-clay-50 hover:text-clay-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay-600"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <Suspense fallback={<div className="flex flex-1 items-center justify-center" role="status" aria-label="Đang tải tin nhắn"><Loader2 className="h-5 w-5 animate-spin text-clay-600" /></div>}>
            <MessagesPage
              key={currentUser?.id || currentUser?.email}
              embedded
              initialThreadId={activeThreadId}
              initialDraft={draftText}
              onActiveThreadChange={setActiveThreadId}
              onDraftChange={setDraftText}
            />
          </Suspense>
        </section>
      )}

      <button
        ref={toggleRef}
        type="button"
        onClick={handleToggle}
        title={isOpen ? 'Đóng cửa sổ trò chuyện' : 'Mở trò chuyện Wayfare'}
        aria-label={isOpen ? 'Đóng cửa sổ trò chuyện' : 'Mở trò chuyện Wayfare'}
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'wayfare-floating-chat' : undefined}
        className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-clay-600 text-white shadow-lg ring-2 ring-white/90 transition-colors hover:bg-clay-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600 sm:h-[52px] sm:w-[52px]"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
        {isLoggedIn && unreadMessagesCount > 0 && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
          </span>
        )}
      </button>
    </div>,
    document.body
  );
};

export default FloatingChatWidget;

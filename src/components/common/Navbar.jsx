import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Sparkles,
  MapPin,
  Users,
  Calendar,
  MessageSquare,
  User,
  Shield,
  Bell,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement?.scrollTop || document.body?.scrollTop || 0;
      setIsScrolled(scrollPos > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // When on homepage and NOT scrolled, we are directly over the dark photo hero:
  const isDarkHero = isHomePage && !isScrolled;

  const {
    portalMode,
    setPortalMode,
    userTab,
    setUserTab,
    setIsAIGeneratorOpen,
    setIsAuthModalOpen,
    setAuthMode,
    currentUser,
    isLoggedIn,
    logout,
    unreadNotificationsCount
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Modern navigation aligned with Stitch M01 / M05
  const navItems = [
    { id: 'home', label: 'Trang chủ', shortLabel: 'Trang chủ', icon: Compass },
    { id: 'explore', label: 'Khám phá', shortLabel: 'Khám phá', icon: MapPin },
    { id: 'community', label: 'Cộng đồng', shortLabel: 'Cộng đồng', icon: Users, badge: 'HOT' },
    { id: 'itineraries', label: 'Lịch trình của tôi', shortLabel: 'Lịch trình', icon: Calendar },
    { id: 'ai-planner', label: 'AI Travel Planner', shortLabel: 'AI Planner', icon: Sparkles, isAi: true },
    { id: 'messages', label: 'Trò chuyện', shortLabel: 'Trò chuyện', icon: MessageSquare, badge: '2' }
  ];

  const handleNavClick = (tabId) => {
    setPortalMode('user');
    setUserTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full select-none transition-all duration-300 border-0 border-b-0 ${
          !isScrolled
            ? 'bg-transparent shadow-none'
            : 'bg-white/85 backdrop-blur-xl shadow-xs text-slate-900'
        } ${isDarkHero ? 'text-white' : 'text-slate-900'}`}
      >
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
            
            {/* 1. Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                onClick={() => { setPortalMode('user'); setUserTab('home'); }}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 border-0 ${
                  isDarkHero
                    ? 'bg-gradient-to-tr from-sky-500 to-blue-600 shadow-sky-500/30'
                    : 'bg-gradient-to-tr from-sky-600 to-blue-600 shadow-sky-500/20'
                }`}>
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div className="block leading-tight">
                  <span className={`font-display font-extrabold text-lg sm:text-xl tracking-tight transition-colors ${
                    isDarkHero ? 'text-white group-hover:text-sky-300' : 'text-slate-900 group-hover:text-sky-600'
                  }`}>
                    Way<span className={isDarkHero ? 'text-sky-400' : 'text-sky-600'}>fare</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Sleek Rounded Navigation Bar (Border-free pill) */}
            {portalMode === 'user' && (
              <nav className={`hidden lg:flex items-center gap-0.5 xl:gap-1 p-1 rounded-full transition-all shrink-0 border-0 shadow-none ${
                isDarkHero
                  ? 'bg-white/10 backdrop-blur-md'
                  : 'bg-slate-200/50 hover:bg-slate-200/70'
              }`}>
                {navItems.map(tab => {
                  const active = userTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleNavClick(tab.id)}
                      title={tab.label}
                      className={`relative flex items-center gap-1 xl:gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap border-0 z-10 ${
                        active
                          ? isDarkHero
                            ? 'text-white font-bold drop-shadow-sm'
                            : 'text-sky-700 font-bold'
                          : isDarkHero
                            ? 'text-white/75 hover:text-white hover:bg-white/10'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      {/* Active Gliding Pill with Fluid Spring + Running Beam ("animation chạy chạy") */}
                      {active && (
                        <motion.div
                          layoutId="activeNavPill"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                          className={`absolute inset-0 rounded-full -z-10 overflow-hidden ${
                            isDarkHero
                              ? 'bg-white/15 backdrop-blur-md shadow-sm ring-1 ring-white/20'
                              : 'bg-white shadow-sm ring-1 ring-sky-500/20'
                          }`}
                        >
                          {/* Animated Running Light Beam running across the active tab */}
                          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] overflow-hidden">
                            <div className="w-3/4 h-full mx-auto bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-running-beam" />
                          </div>
                        </motion.div>
                      )}

                      {tab.isAi ? (
                        <Sparkles className={`w-3.5 h-3.5 shrink-0 ${active ? (isDarkHero ? 'text-amber-200' : 'text-amber-500') : isDarkHero ? 'text-amber-300' : 'text-amber-500'}`} />
                      ) : (
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? (isDarkHero ? 'text-sky-300' : 'text-sky-600') : isDarkHero ? 'text-white/70' : 'text-slate-400'}`} />
                      )}

                      {/* Active Pulsing Indicator Dot */}
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping inline-block -mr-0.5" />
                      )}
                      
                      {/* Responsive adaptive label */}
                      <span className="hidden 2xl:inline">{tab.label}</span>
                      <span className="inline 2xl:hidden">{tab.shortLabel}</span>

                      {/* Smart Tag for AI Planner */}
                      {tab.isAi && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold hidden xl:inline-flex items-center gap-0.5 border-0 ${
                          active
                            ? 'bg-amber-400/20 text-amber-300'
                            : isDarkHero
                              ? 'bg-white/20 text-sky-200'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          Smart
                        </span>
                      )}

                      {/* Notification badge */}
                      {tab.badge && !active && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold border-0 ${
                          tab.badge === 'HOT'
                            ? isDarkHero ? 'bg-amber-400/20 text-amber-200 hidden xl:inline-block' : 'bg-amber-100 text-amber-800 hidden xl:inline-block'
                            : 'bg-rose-500 text-white'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* 3. Right Action Bar */}
            <div className="flex items-center gap-2.5 shrink-0">
              {portalMode === 'user' && (
                /* Notification Bell */
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationOpen(!isNotificationOpen);
                      setIsProfileDropdownOpen(false);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-0 shadow-none transition-colors relative cursor-pointer ${
                      isDarkHero
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-slate-200/50 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900'
                    }`}
                    title="Thông báo"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-amber-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                </div>
              )}

              {/* User Profile / Auth Toggle */}
              {!isLoggedIn ? (
                <button
                  onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs hover:shadow-sky-600/30 transition-all cursor-pointer shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-white" />
                  <span>Đăng nhập</span>
                </button>
              ) : (
                <div ref={profileDropdownRef} className="relative group">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="relative flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-sky-500/30 transition-all cursor-pointer shrink-0 focus:outline-hidden"
                    aria-label={`Tài khoản: ${currentUser.name}`}
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/20 hover:scale-105 active:scale-95 transition-transform"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-white" title="Trực tuyến"></span>
                  </button>

                  {/* Floating Tooltip on Hover (ẩn khi dropdown mở) */}
                  {!isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full pt-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-40 hidden sm:block">
                      <div className="bg-slate-900/95 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-slate-700/60 flex flex-col items-end whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-100">{currentUser.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">Bấm để mở menu tài khoản</span>
                        {/* Tooltip pointer triangle */}
                        <div className="w-2 h-2 bg-slate-900/95 rotate-45 absolute -top-1 right-3.5 border-t border-l border-slate-700/60"></div>
                      </div>
                    </div>
                  )}

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/20 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{currentUser.handle || currentUser.email}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold rounded-full bg-sky-100 text-sky-800">
                            {portalMode === 'admin' ? 'Quản trị viên' : 'Thành viên Wayfare'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => { setPortalMode('user'); setUserTab('notifications'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-sky-600" />
                          <span>Thông báo</span>
                        </div>
                        {unreadNotificationsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[9px]">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => { setPortalMode('user'); setUserTab('profile'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-sky-600" />
                        <span>Trang cá nhân</span>
                      </button>

                      <button
                        onClick={() => { setPortalMode('user'); setUserTab('itineraries'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-sky-600" />
                        <span>Lịch trình của tôi</span>
                      </button>

                      <button
                        onClick={() => { setPortalMode('user'); setUserTab('ai-planner'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>AI Travel Planner</span>
                      </button>

                      {/* Admin Portal Toggle - Protected: Only visible for ROLE_ADMIN */}
                      {isLoggedIn && ((currentUser?.roles && currentUser.roles.includes('ROLE_ADMIN')) || (currentUser?.email && currentUser.email.toLowerCase().includes('admin'))) && (
                        <button
                          onClick={() => { setPortalMode(portalMode === 'admin' ? 'user' : 'admin'); setIsProfileDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-sky-600" />
                          <span>{portalMode === 'admin' ? 'Về giao diện Người dùng' : 'Giao diện Quản Trị'}</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={() => { logout(); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Hamburger Button (< lg) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-xl lg:hidden transition-colors cursor-pointer shrink-0 border-0 ${
                  isDarkHero
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-slate-200/50 hover:bg-slate-200/80 text-slate-700'
                }`}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE DRAWER (< lg)                                      */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative z-10 w-[310px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
                    <Compass className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-lg text-slate-900">
                      Way<span className="text-sky-600">fare</span>
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                      Điều hướng hệ thống
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile CTA */}
              <div className="space-y-2">
                {!isLoggedIn ? (
                  <button
                    onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                    className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <User className="w-4 h-4 text-white" />
                    <span>Đăng nhập / Đăng ký</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsAIGeneratorOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Tạo Lịch Trình AI</span>
                  </button>
                )}
              </div>

              {/* Mobile Navigation List */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block px-2 mb-2">
                  Danh mục trang
                </span>
                {navItems.map(tab => {
                  const Icon = tab.icon;
                  const active = userTab === tab.id && portalMode === 'user';
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleNavClick(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-sky-50 text-sky-800 shadow-xs border border-sky-100 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{tab.label}</span>
                      </div>

                      {tab.isAi ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Smart
                        </span>
                      ) : tab.badge ? (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          tab.badge === 'HOT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-500 text-white'
                        }`}>
                          {tab.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Drawer Footer Profile */}
            {isLoggedIn && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div
                  onClick={() => { setPortalMode('user'); setUserTab('profile'); setIsMobileMenuOpen(false); }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/20"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{currentUser.name}</h4>
                      <p className="text-[10px] text-slate-400">{currentUser.handle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

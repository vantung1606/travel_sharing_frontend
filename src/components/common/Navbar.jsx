import React, { useState } from 'react';
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
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = () => {
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

  // Modern navigation aligned with Stitch M01 / M05
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Compass },
    { id: 'explore', label: 'Khám phá', icon: MapPin },
    { id: 'community', label: 'Cộng đồng', icon: Users, badge: 'HOT' },
    { id: 'itineraries', label: 'Lịch trình của tôi', icon: Calendar },
    { id: 'ai-planner', label: 'AI Travel Planner', icon: Sparkles, isAi: true },
    { id: 'messages', label: 'Trò chuyện', icon: MessageSquare, badge: '2' }
  ];

  const handleNavClick = (tabId) => {
    setPortalMode('user');
    setUserTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-xs select-none">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
            
            {/* 1. Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                onClick={() => { setPortalMode('user'); setUserTab('home'); }}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div className="block leading-tight">
                  <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                    Way<span className="text-sky-600">fare</span>
                  </span>
                  <span className="hidden sm:block text-[9px] uppercase tracking-widest font-extrabold text-slate-400">
                    Smart Travel AI
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Sleek Rounded Navigation Bar (Stitch M05 Style) */}
            {portalMode === 'user' && (
              <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/70 rounded-full border border-slate-200/50 shadow-2xs">
                {navItems.map(tab => {
                  const active = userTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleNavClick(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-sky-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                      }`}
                    >
                      {tab.isAi ? (
                        <Sparkles className={`w-3.5 h-3.5 ${active ? 'text-amber-200' : 'text-amber-500'}`} />
                      ) : (
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                      )}
                      <span>{tab.label}</span>

                      {/* Smart Tag for AI Planner */}
                      {tab.isAi && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 ${
                          active
                            ? 'bg-sky-700/80 text-amber-200'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          Smart
                        </span>
                      )}

                      {/* Notification badge */}
                      {tab.badge && !active && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          tab.badge === 'HOT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-500 text-white'
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
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Search Pill Input (Desktop) */}
              <div className="hidden xl:flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white rounded-full px-3.5 py-1.5 border border-slate-200/60 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm điểm đến, ẩm thực..."
                  className="bg-transparent border-0 outline-none text-xs text-slate-800 placeholder:text-slate-400 w-32 2xl:w-44"
                />
              </div>

              {portalMode === 'user' && (
                <>
                  {/* Notification Bell */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationOpen(!isNotificationOpen);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer shadow-2xs"
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

                  {/* Refined "Tạo lịch trình" Button */}
                  <button
                    type="button"
                    onClick={() => setIsAIGeneratorOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Tạo lịch trình</span>
                  </button>
                </>
              )}

              {/* User Profile / Auth Toggle */}
              {!isLoggedIn ? (
                <button
                  onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-white" />
                  <span>Đăng nhập</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-full hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer group shrink-0"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-500/20"
                    />
                    <div className="hidden xl:block text-left leading-tight">
                      <span className="block text-xs font-bold text-slate-800">
                        {currentUser.name}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {portalMode === 'admin' ? 'Quyền Admin' : currentUser.handle}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block group-hover:text-slate-700 transition-colors" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400">{currentUser.handle}</p>
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

                      <button
                        onClick={() => { setPortalMode(portalMode === 'admin' ? 'user' : 'admin'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>{portalMode === 'admin' ? 'Về giao diện Người dùng' : 'Giao diện Admin'}</span>
                      </button>

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
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 lg:hidden transition-colors cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE / TABLET DRAWER                                    */}
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
                  <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold shadow-md">
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
                    onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
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
                          ? 'bg-sky-50 text-sky-700 shadow-xs border border-sky-100 font-extrabold'
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

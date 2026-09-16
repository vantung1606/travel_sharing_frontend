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
  LogOut,
  UserCheck
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
    stats,
    unreadNotificationsCount
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Trang Chủ', icon: Compass },
    { id: 'explore', label: 'Khám Phá', icon: MapPin },
    { id: 'community', label: 'Cộng Đồng', icon: Users, badge: 'HOT' },
    { id: 'itineraries', label: 'Lịch Trình AI', icon: Calendar },
    { id: 'messages', label: 'Trò Chuyện', icon: MessageSquare, badge: '2' }
  ];

  const handleNavClick = (tabId) => {
    setPortalMode('user');
    setUserTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm select-none">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-14 md:h-16 gap-2 sm:gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3 lg:gap-5 shrink-0 min-w-0">
              <div
                onClick={() => { setPortalMode('user'); setUserTab('home'); }}
                className="flex items-center gap-2 cursor-pointer group shrink-0"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5 md:w-6 md:h-6 animate-spin-slow" />
                </div>
                <div className="block">
                  <span className="font-display font-extrabold text-base sm:text-lg md:text-xl tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                    Way<span className="text-sky-600">fare</span>
                  </span>
                  <span className="hidden sm:block text-[9px] uppercase tracking-widest font-extrabold text-slate-400">
                    Authentic Travel Stories
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links: Visible on md+ screens */}
            {portalMode === 'user' && (
              <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0 flex-1 justify-center px-2">
                {navItems.map(tab => {
                  const Icon = tab.icon;
                  const active = userTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleNavClick(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs lg:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-sky-50 text-sky-700 font-extrabold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {portalMode === 'user' && (
                <>
                  {/* Create AI Itinerary CTA */}
                  <button
                    onClick={() => setIsAIGeneratorOpen(true)}
                    className="hidden xl:flex sparkle-btn text-white px-4 py-2 rounded-full text-xs font-bold items-center gap-2 shadow-lg shadow-orange-500/25 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                    <span className="whitespace-nowrap">Tạo Lịch Trình AI</span>
                  </button>

                  {/* Compact Sparkles Icon Button */}
                  <button
                    onClick={() => setIsAIGeneratorOpen(true)}
                    className="hidden sm:flex xl:hidden p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full cursor-pointer shrink-0"
                    title="Tạo Lịch Trình AI"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  </button>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationOpen(!isNotificationOpen);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full relative cursor-pointer transition-colors"
                      title="Thông báo (M08)"
                    >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
                          {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                        </span>
                      )}
                    </button>
                    <NotificationDropdown
                      isOpen={isNotificationOpen}
                      onClose={() => setIsNotificationOpen(false)}
                    />
                  </div>
                </>
              )}

              {/* ========================================================= */}
              {/* AUTH & USER PROFILE TOGGLE                                */}
              {/* ========================================================= */}
              {!isLoggedIn ? (
                /* CHƯA ĐĂNG NHẬP: Hiển thị duy nhất nút Đăng nhập */
                <button
                  onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-white" />
                  <span>Đăng nhập</span>
                </button>
              ) : (
                /* ĐÃ ĐĂNG NHẬP: Hiển thị Profile Pill kèm Dropdown Menu */
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer group shrink-0"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-sky-500/30 group-hover:ring-sky-500 transition-all"
                    />
                    <div className="hidden xl:block text-left">
                      <span className="block text-xs font-bold text-slate-800 leading-tight">
                        {currentUser.name}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {portalMode === 'admin' ? 'Quyền Admin' : currentUser.handle}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
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
                        className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-sky-600" />
                          <span>Thông báo (M08)</span>
                        </div>
                        {unreadNotificationsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[9px]">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => { setPortalMode('user'); setUserTab('profile'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-sky-600" />
                        <span>Trang cá nhân</span>
                      </button>

                      <button
                        onClick={() => { setPortalMode('user'); setUserTab('itineraries'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>Lịch trình của tôi</span>
                      </button>

                      <button
                        onClick={() => { setPortalMode(portalMode === 'admin' ? 'user' : 'admin'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>{portalMode === 'admin' ? 'Về giao diện Người dùng' : 'Giao diện Admin'}</span>
                      </button>

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={() => { logout(); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* HAMBURGER BUTTON (Visible on < lg screens) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 lg:hidden transition-colors cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE / TABLET SLIDE-OVER NAVIGATION DRAWER              */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Right Drawer */}
          <div className="relative z-10 w-[310px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              
              {/* Drawer Top Header */}
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

              {/* Primary Action Button */}
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
                    className="w-full sparkle-btn text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Tạo Lịch Trình AI Ngay</span>
                  </button>
                )}
              </div>

              {/* Main Navigation Links List */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block px-2 mb-2">
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

                      {tab.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          tab.badge === 'HOT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-500 text-white'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Footer Profile Box / Logout */}
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

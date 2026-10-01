import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Lock, ArrowLeft, LogIn } from 'lucide-react';

// Title dictionary mapping routes to descriptive page titles
export const PAGE_TITLES = {
  '/': 'Wayfare - Khám phá Câu chuyện Du lịch & AI Planner',
  '/home': 'Wayfare - Trang chủ & Bảng tin du lịch',
  '/explore': 'Wayfare - Khám phá Điểm đến & Bản đồ Check-in',
  '/community': 'Wayfare - Cộng đồng & Chia sẻ Nhật ký Phượt',
  '/itineraries': 'Wayfare - Lịch trình của tôi',
  '/ai-planner': 'Wayfare - Lập lịch trình thông minh cùng WanderAI',
  '/messages': 'Wayfare - Trò chuyện & Nhóm chuyến đi',
  '/profile': 'Wayfare - Hồ sơ cá nhân người dùng',
  '/notifications': 'Wayfare - Trung tâm Thông báo',
  '/admin': 'Wayfare Admin - Bảng điều khiển Quản trị',
  '/admin/dashboard': 'Wayfare Admin - Bảng điều khiển Tổng quan',
  '/admin/places': 'Wayfare Admin - Quản lý Điểm đến & Kiểm duyệt Check-in',
  '/admin/users': 'Wayfare Admin - Quản lý Người dùng & Phân quyền RBAC',
  '/admin/reports': 'Wayfare Admin - Kiểm duyệt Vi phạm & Báo cáo Spam',
  '/admin/analytics': 'Wayfare Admin - Thống kê & Phân tích Tăng trưởng',
  '/admin/audit-logs': 'Wayfare Admin - Nhật ký Hệ thống & Hoạt động (Audit Logs)',
  '/admin/revenue': 'Wayfare Admin - Quản lý Doanh thu, Hoa hồng & Đặt cọc',
  '/admin/ai-config': 'Wayfare Admin - Cấu hình Hệ thống AI & Gemini Gateway'
};

// Component that dynamically syncs document.title on every URL change
export const PageTitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const currentTitle = PAGE_TITLES[location.pathname] || 'Wayfare - Authentic Travel Stories';
    document.title = currentTitle;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
};

// Protected Route Guard for Admin Portal (/admin/*)
export const AdminRouteGuard = ({ children }) => {
  const { isLoggedIn, currentUser, setIsAuthModalOpen, setAuthMode, login } = useApp();
  const navigate = useNavigate();

  const isAdmin = isLoggedIn && (
    (currentUser?.roles && currentUser.roles.includes('ROLE_ADMIN')) ||
    (currentUser?.email && currentUser.email.toLowerCase().includes('admin'))
  );

  const handleQuickAdminLogin = () => {
    login({
      name: 'Quản Trị Viên (Admin)',
      handle: '@admin_wayfare',
      email: 'admin@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      roles: ['ROLE_ADMIN', 'ROLE_USER']
    });
  };

  // 1. Not Logged In -> Require Admin Login
  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Khu vực Quản Trị Viên (Admin Portal)</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Bạn đang truy cập trang Quản lý Người dùng & Phân quyền bảo mật. Vui lòng xác thực tài khoản có thẩm quyền Quản Trị Viên.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={handleQuickAdminLogin}
              className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> ⚡ Đăng nhập Nhanh Quản Trị Viên (Admin)
            </button>
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Nhập Email / Mật khẩu Quản trị
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 rounded-full text-slate-400 hover:text-slate-600 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay về Trang chủ Người dùng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged In but Not Admin -> 403 Forbidden
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              403 Forbidden • Quyền truy cập bị từ chối
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Tài khoản không đủ thẩm quyền</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Tài khoản hiện tại <strong className="text-slate-800">{currentUser?.email}</strong> thuộc nhóm thành viên thông thường. Bạn không có quyền truy cập cơ sở dữ liệu và cấu hình hệ thống Wayfare Admin.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={handleQuickAdminLogin}
              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              ⚡ Chuyển sang Tài khoản Quản Trị Viên
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Về lại Trang chủ An toàn
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin
  return children;
};

// Protected Route Guard for Private User Pages (/profile, /messages, /notifications)
export const UserAuthGuard = ({ children, title = 'Nội dung cá nhân' }) => {
  const { isLoggedIn, setIsAuthModalOpen, setAuthMode } = useApp();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">Yêu cầu Đăng nhập</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Vui lòng đăng nhập tài khoản Wayfare của bạn để truy cập {title}.
            </p>
          </div>
          <div className="pt-1 flex flex-col gap-2">
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" /> Đăng nhập ngay
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
            >
              Về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};


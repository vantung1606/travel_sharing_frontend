import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { authApi } from '../../services/api';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Sparkles,
  MapPin
} from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, login } = useApp();
  const toast = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const res = await authApi.login(email, password);
        const userData = res.data?.user || {
          name: res.data?.fullName || email.split('@')[0],
          fullName: res.data?.fullName,
          email: res.data?.email || email,
          handle: res.data?.handle || ('@' + email.split('@')[0]),
          avatar: res.data?.avatar,
          roles: res.data?.roles,
          token: res.data?.token
        };
        login(userData);
        toast.success(res.message || 'Đăng nhập thành công! 🎉');
      } else {
        const res = await authApi.register(fullName, email, password);
        const userData = res.data?.user || {
          name: res.data?.fullName || fullName || email.split('@')[0],
          fullName: res.data?.fullName || fullName,
          email: res.data?.email || email,
          handle: res.data?.handle || ('@' + (fullName ? fullName.toLowerCase().replace(/\s+/g, '_') : email.split('@')[0])),
          avatar: res.data?.avatar,
          roles: res.data?.roles,
          token: res.data?.token
        };
        login(userData);
        toast.success(res.message || 'Đăng ký tài khoản thành công! 🎉');
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Đã xảy ra lỗi, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
      
      {/* Container Dialog Card */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Close Modal Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md transition-all shadow-md cursor-pointer group"
          title="Đóng cửa sổ"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* ========================================================= */}
        {/* LEFT COLUMN: AUTHENTICATION FORM (PILL INPUTS)            */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[54%] p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto z-10 bg-white">
          
          <div>
            {/* Top Brand Logo & Header */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900">
                  Wayfare
                </span>
                <span className="text-[10px] font-bold text-sky-600 block uppercase tracking-wider -mt-1">
                  Travel Platform
                </span>
              </div>
            </div>

            {/* Title & Mode Switcher */}
            <div className="mb-6 space-y-2">
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                {authMode === 'login'
                  ? 'Chào mừng bạn quay trở lại với cộng đồng du lịch Wayfare!'
                  : 'Gia nhập hàng ngàn phượt thủ và khám phá lịch trình mơ ước.'}
              </p>

              {/* Mode Switcher Pill Tabs */}
              <div className="flex bg-slate-100/90 p-1.5 rounded-full border border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Đăng ký
                </button>
              </div>
            </div>

            {/* Form Inputs (Pill-shaped design) */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-3">
                    Họ và tên của bạn
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Tùng"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/15 focus:bg-white focus:border-sky-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-3">
                  Địa chỉ Email / Mã tài khoản
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/15 focus:bg-white focus:border-sky-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-3 mr-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật khẩu
                  </label>
                  {authMode === 'login' && (
                    <a href="#" className="text-[11px] font-bold text-sky-700 hover:underline">
                      Quên mật khẩu?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50/80 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/15 focus:bg-white focus:border-sky-500 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between text-xs text-slate-600 ml-3">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span className="font-medium">Ghi nhớ mật khẩu</span>
                  </label>
                </div>
              )}

              {/* Submit CTA Pill Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 transition-all transform active:scale-98 cursor-pointer mt-3"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Ngay'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Social Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative px-3 bg-white text-center">
                <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            {/* Social SSO Logins */}
            <div className="grid grid-cols-3 gap-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => toast.info('Tính năng đăng nhập Google đang được tích hợp!')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Google</span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={() => toast.info('Tính năng đăng nhập Facebook đang được tích hợp!')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="hidden sm:inline">Facebook</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => toast.info('Tính năng đăng nhập Apple đang được tích hợp!')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.66-.8 1.11-1.92.99-3.04-.96.04-2.13.64-2.82 1.44-.61.71-1.14 1.86-.99 2.96 1.07.08 2.16-.56 2.82-1.36z" />
                </svg>
                <span className="hidden sm:inline">Apple</span>
              </button>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <a href="#" className="text-sky-700 underline font-semibold">Điều khoản dịch vụ</a> và{' '}
              <a href="#" className="text-sky-700 underline font-semibold">Chính sách bảo mật</a> của Wayfare.
            </p>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: BRAND BANNER WITH DIAGONAL SLANT CUT        */}
        {/* Uses the exact login_banner.jpg and img-50.png from CNPM  */}
        {/* ========================================================= */}
        <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col justify-between p-8 sm:p-10 text-white z-20 [clip-path:polygon(10%_0,100%_0,100%_100%,0%_100%)]">
          
          {/* Main Background Banner Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('/images/login/login_banner.jpg')`
            }}
          />

          {/* Dark Cinematic Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/65 to-sky-950/40" />

          {/* Diagonal Slant Pattern Overlay from img-50.png */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[140px] pointer-events-none z-10 opacity-70 bg-repeat-y bg-left-top"
            style={{
              backgroundImage: `url('/images/login/img-50.png')`
            }}
          />

          {/* Top Badge */}
          <div className="relative z-20 pl-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold text-sky-200 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Wayfare Travel Experience</span>
            </div>
          </div>

          {/* Middle Typography & Inspirational Travel Quote */}
          <div className="relative z-20 my-auto py-6 pl-6 space-y-4">
            <h2 className="font-display font-extrabold text-3xl xl:text-4xl text-white leading-tight tracking-tight drop-shadow-md">
              Khám Phá Thế Giới <br />
              <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-amber-200 bg-clip-text text-transparent">
                Theo Phong Cách Riêng
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light drop-shadow-sm max-w-sm">
              Hành trình vạn dặm bắt đầu từ một bước chân. Hãy để trí tuệ nhân tạo AI cùng cộng đồng lữ khách phượt thủ kiến tạo chuyến đi trong mơ cho bạn.
            </p>

            {/* Feature Highlights Pills */}
            <div className="pt-2 space-y-2.5 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sky-500/30 flex items-center justify-center text-sky-300 border border-sky-400/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Tự động tối ưu lịch trình từng ngày qua AI</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sky-500/30 flex items-center justify-center text-sky-300 border border-sky-400/40">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>Tọa độ GPS điểm đến & check-in thực tế</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sky-500/30 flex items-center justify-center text-sky-300 border border-sky-400/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>100.000+ Lữ khách đồng hành & tin tưởng</span>
              </div>
            </div>
          </div>

          {/* Bottom Social Media Bar */}
          <div className="relative z-20 pl-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
            <span className="text-[11px] text-slate-300/80 font-medium">Kết nối với chúng tôi:</span>
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-sky-600 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110"
                title="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-sky-400 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110"
                title="Twitter / X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-pink-600 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110"
                title="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

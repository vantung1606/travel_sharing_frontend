import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { authApi } from '../../services/api';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User
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

  // Auto-rotating 3-slide travel carousel (3.5 seconds per slide)
  const [currentSlide, setCurrentSlide] = useState(0);
  const bannerSlides = [
    {
      id: 1,
      url: '/images/login/travel_banner_1.jpg',
      title: 'Sa Pa • Mù Cang Chải',
      desc: 'Ruộng bậc thang xanh ngát ngút ngàn mây trời'
    },
    {
      id: 2,
      url: '/images/login/travel_banner_2.jpg',
      title: 'Tràng An • Ninh Bình',
      desc: 'Non nước hữu tình dòng sông ngọc bích'
    },
    {
      id: 3,
      url: '/images/login/travel_banner_3.jpg',
      title: 'Hà Giang • Hẻm Tu Sản',
      desc: 'Dòng sông Nho Quế xanh ngọc bích giữa đại ngàn hùng vĩ'
    }
  ];

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isAuthModalOpen, bannerSlides.length]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const res = await authApi.login(email, password);
        const userData = res.data?.user || {
          id: res.data?.id,
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
          id: res.data?.id,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-8 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
      
      {/* Container Dialog Card strictly matching CNPM template layout */}
      <div className="relative w-full max-w-5xl bg-[#eef1f6] rounded-[24px] shadow-2xl overflow-hidden border border-slate-300/40 flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Close Modal Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer group hover:scale-105"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* ========================================================= */}
        {/* LEFT COLUMN: FORM SECTION (39% width, flush right edge)   */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[39%] p-6 sm:p-8 lg:py-10 lg:pl-10 lg:pr-1 flex flex-col justify-center items-center overflow-y-auto z-10 bg-[#eef1f6]">
          
          <div className="w-full max-w-[375px] text-center">
            
            {/* Logo */}
            <div className="flex items-center justify-center mb-3">
              <img
                src="/wayfare-logo.png"
                alt="Wayfare"
                className="h-11 w-auto object-contain drop-shadow-xs"
              />
            </div>

            {/* Heading */}
            <h3 className="text-2xl font-semibold text-[#3c4043] mb-3">
              {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
            </h3>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-200/80 p-1 rounded-full mb-5 max-w-[260px] mx-auto">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-[#3c4043] shadow-xs'
                    : 'text-slate-500 hover:text-[#3c4043]'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-[#3c4043] shadow-xs'
                    : 'text-slate-500 hover:text-[#3c4043]'
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              
              {/* Full Name (when Register) */}
              {authMode === 'register' && (
                <div className="relative">
                  <User className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên của bạn"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-[50px] pl-12 pr-5 rounded-full bg-white border border-white text-sm text-[#3c4043] shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Email / Code */}
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Địa chỉ Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[52px] pl-12 pr-5 rounded-full bg-white border border-white text-sm text-[#3c4043] shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mật Khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] pl-12 pr-12 rounded-full bg-white border border-white text-sm text-[#3c4043] shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3c4043] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs text-[#3c4043] pt-1 px-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                  />
                  <span>Nhớ Mật Khẩu</span>
                </label>
                {authMode === 'login' && (
                  <a href="#" className="hover:text-sky-600 transition-colors">
                    Quên Mật Khẩu?
                  </a>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-base shadow-md shadow-blue-600/25 transition-all transform active:scale-98 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  authMode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'
                )}
              </button>

            </form>

            {/* Social Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300/80"></div>
              </div>
              <span className="relative px-3 bg-[#eef1f6] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Hoặc đăng nhập với
              </span>
            </div>

            {/* Social SSO Logins */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => toast.info('Tính năng đăng nhập Google đang được kết nối!')}
                className="flex items-center justify-center gap-2 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs border border-white transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Google</span>
              </button>

              <button
                type="button"
                onClick={() => toast.info('Tính năng đăng nhập Facebook đang được kết nối!')}
                className="flex items-center justify-center gap-2 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs border border-white transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="hidden sm:inline">Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => toast.info('Tính năng đăng nhập Apple đang được kết nối!')}
                className="flex items-center justify-center gap-2 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs border border-white transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.66-.8 1.11-1.92.99-3.04-.96.04-2.13.64-2.82 1.44-.61.71-1.14 1.86-.99 2.96 1.07.08 2.16-.56 2.82-1.36z" />
                </svg>
                <span className="hidden sm:inline">Apple</span>
              </button>
            </div>

            {/* Footer Terms */}
            <p className="text-[11px] text-slate-400 mt-6">
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <a href="#" className="text-sky-600 underline">Điều khoản dịch vụ</a> và{' '}
              <a href="#" className="text-sky-600 underline">Chính sách bảo mật</a>.
            </p>

          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: BANNER (Matching CNPM .bg-img & img-50.png) */}
        {/* Uses exact login_banner.jpg with img-50.png in the middle */}
        {/* ========================================================= */}
        <div className="hidden lg:block lg:w-[61%] relative min-h-[580px] overflow-hidden">
          
          {/* 3 Auto-Rotating High-Definition Travel Slides with Smooth Crossfade */}
          {bannerSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
                idx === currentSlide
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105 pointer-events-none'
              }`}
              style={{
                backgroundImage: `url('${slide.url}')`
              }}
            />
          ))}

          {/* Slide Indicator Dots at Bottom Right */}
          <div className="absolute bottom-5 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
            {bannerSlides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? 'w-6 bg-white shadow-sm'
                    : 'w-1.5 bg-white/40 hover:bg-white/80'
                }`}
                title={slide.title}
              />
            ))}
          </div>

          {/* img-50.png shifted to hug right against the buttons */}
          <div
            className="absolute -left-[62px] top-0 bottom-0 w-[276px] h-full z-10 pointer-events-none"
            style={{
              backgroundImage: `url('/images/login/img-50.png')`,
              backgroundPosition: 'top left',
              backgroundRepeat: 'repeat-y'
            }}
          />

          {/* Information container as in original CNPM template */}
          <div className="information" />

        </div>

      </div>

    </div>
  );
};

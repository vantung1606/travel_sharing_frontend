import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import mascotImg from '../../assets/design/bannerlogo.png';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode } = useApp();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Đăng nhập thành công với tài khoản: ${email}`);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
      
      {/* Container Dialog Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col lg:flex-row max-h-[90vh]">
        
        {/* Close Modal Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================= */}
        {/* LEFT COLUMN: VISUAL BRAND HERO BANNER (Desktop Only)      */}
        {/* ========================================================= */}
        <div className="hidden lg:flex lg:w-5/12 bg-slate-950 relative flex-col justify-between p-8 text-white overflow-hidden">
          
          {/* Background Image Scrim */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80')`
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-sky-950/60"></div>
          
          {/* Glowing Ambient Light */}
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-sky-500/25 blur-3xl pointer-events-none"></div>

          {/* Top Brand Branding */}
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Wayfare Auth Portal</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">
              Bắt đầu hành trình lữ hành cá tính
            </h2>
          </div>

          {/* Center Mascot & Quote */}
          <div className="relative z-10 my-auto py-4 flex flex-col items-center text-center">
            {/* ENLARGED 3D MASCOT CHARACTER */}
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 mb-2 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] animate-float-3d transition-all">
              <img
                src={mascotImg}
                alt="Wayfare Mascot"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 space-y-1.5 w-full">
              <p className="italic font-medium text-[11px] leading-relaxed">
                "Du lịch không chỉ là đến một địa điểm mới, mà là thay đổi góc nhìn về cuộc sống."
              </p>
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>100.000+ Lữ khách tin dùng</span>
              </div>
            </div>
          </div>

          {/* Bottom Bullet Points */}
          <div className="relative z-10 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Lập tour AI tự động theo gu cá nhân</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Kết nối cộng đồng phượt thủ toàn quốc</span>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* ELEGANT VERTICAL MIDDLE DIVIDER LINE (DESKTOP)            */}
        {/* ========================================================= */}
        <div className="hidden lg:block w-[1px] bg-gradient-to-b from-slate-200/20 via-slate-300 to-slate-200/20 relative z-20 shrink-0"></div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: AUTH01 FORM (STITCH AUTH01 SPECIFICATION)  */}
        {/* ========================================================= */}
        <div className="w-full lg:w-7/12 p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
          
          <div>
            {/* Header Title & Mode Switcher Tabs */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-2xl text-slate-900">
                  {authMode === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                {authMode === 'login'
                  ? 'Chào mừng bạn quay trở lại với Wayfare Platform!'
                  : 'Nhập thông tin bên dưới để trải nghiệm ngay hôm nay.'}
              </p>

              {/* Mode Switcher Pill */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 mt-4">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
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
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    authMode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Đăng ký
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và tên của bạn
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật khẩu
                  </label>
                  {authMode === 'login' && (
                    <a href="#" className="text-[11px] font-bold text-sky-600 hover:underline">
                      Quên mật khẩu?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                  </label>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all transform active:scale-95 cursor-pointer mt-2"
              >
                <span>{authMode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản ngay'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* ========================================================= */}
            {/* PERFECT STITCH AUTH01 MIDDLE DIVIDER LINE                */}
            {/* ========================================================= */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative px-3 bg-white text-center">
                <span className="px-3.5 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest shadow-2xs">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SOCIAL SSO LOGINS GRID (GOOGLE, FACEBOOK, APPLE)          */}
            {/* ========================================================= */}
            <div className="grid grid-cols-3 gap-3">
              
              {/* Google Button */}
              <button
                type="button"
                onClick={() => alert('Đăng nhập bằng Google')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
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
                onClick={() => alert('Đăng nhập bằng Facebook')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="hidden sm:inline">Facebook</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => alert('Đăng nhập bằng Apple')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.66-.8 1.11-1.92.99-3.04-.96.04-2.13.64-2.82 1.44-.61.71-1.14 1.86-.99 2.96 1.07.08 2.16-.56 2.82-1.36z" />
                </svg>
                <span className="hidden sm:inline">Apple</span>
              </button>

            </div>

          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <a href="#" className="text-sky-600 underline">Điều khoản dịch vụ</a> và{' '}
              <a href="#" className="text-sky-600 underline">Chính sách bảo mật</a> của Wayfare.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

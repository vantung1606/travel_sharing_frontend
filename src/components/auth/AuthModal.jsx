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
  User,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
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

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Vui lòng nhập địa chỉ email của bạn!');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setIsLoading(false);
      setForgotStep(2);
      setCountdown(60);
      toast.success(res.message || 'Mã xác thực OTP đã được gửi về hòm thư của bạn! Vui lòng kiểm tra hộp thư đến hoặc mục Spam.');
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số mã OTP!');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(forgotEmail.trim(), otpCode.trim());
      setIsLoading(false);
      setResetToken(res.data?.resetToken || '');
      setForgotStep(3);
      toast.success('Xác thực mã OTP thành công! Vui lòng đặt mật khẩu mới.');
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword(forgotEmail.trim(), resetToken, newPassword);
      setIsLoading(false);
      toast.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      setIsForgotPassword(false);
      setForgotStep(1);
      setEmail(forgotEmail);
      setPassword('');
      setAuthMode('login');
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const res = await authApi.login(email, password);
        const raw = res.data;
        if (!raw || !raw.id) {
          throw new Error('Không nhận được dữ liệu tài khoản hợp lệ từ máy chủ.');
        }
        const userData = {
          id: raw.id,
          name: raw.fullName || raw.name || email.split('@')[0],
          fullName: raw.fullName || raw.name,
          email: raw.email || email,
          handle: raw.handle || ('@' + email.split('@')[0]),
          avatar: raw.avatar || raw.avatarUrl,
          roles: Array.isArray(raw.roles) ? raw.roles : (raw.roles ? Array.from(raw.roles) : ['ROLE_USER']),
          permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
          tier: raw.tier || 'bronze',
          token: raw.token
        };
        login(userData);
        toast.success(res.message || 'Đăng nhập thành công! 🎉');
      } else {
        const res = await authApi.register(fullName, email, password);
        const raw = res.data;
        if (!raw || !raw.id) {
          throw new Error('Đăng ký tài khoản không thành công, vui lòng thử lại.');
        }
        const userData = {
          id: raw.id,
          name: raw.fullName || raw.name || fullName || email.split('@')[0],
          fullName: raw.fullName || raw.name || fullName,
          email: raw.email || email,
          handle: raw.handle || ('@' + (fullName ? fullName.toLowerCase().replace(/\s+/g, '_') : email.split('@')[0])),
          avatar: raw.avatar || raw.avatarUrl,
          roles: Array.isArray(raw.roles) ? raw.roles : (raw.roles ? Array.from(raw.roles) : ['ROLE_USER']),
          token: raw.token
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

  const processGoogleAuth = async (token) => {
    try {
      const res = await authApi.loginWithGoogle(token);
      const raw = res.data;
      if (!raw || !raw.id) {
        throw new Error('Dữ liệu tài khoản trả về từ máy chủ không hợp lệ.');
      }
      const userData = {
        id: raw.id,
        name: raw.fullName || raw.name || raw.email.split('@')[0],
        fullName: raw.fullName || raw.name,
        email: raw.email,
        handle: raw.handle || ('@' + raw.email.split('@')[0]),
        avatar: raw.avatar || raw.avatarUrl,
        roles: Array.isArray(raw.roles) ? raw.roles : (raw.roles ? Array.from(raw.roles) : ['ROLE_USER']),
        permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
        tier: raw.tier || 'bronze',
        token: raw.token
      };
      login(userData);
      toast.success(res.message || 'Đăng nhập bằng tài khoản Google thành công! 🎉');
      setIsAuthModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Xác thực tài khoản Google thất bại, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleClientId = (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '340055145050-thlfrv3nl1j1jcahh75n8inr8v5j4574.apps.googleusercontent.com'
    )?.trim();

    if (!googleClientId || googleClientId.includes('your_google_client_id')) {
      toast.error('Chưa cấu hình VITE_GOOGLE_CLIENT_ID trong file .env! Vui lòng thêm Google Client ID từ Google Cloud Console.');
      return;
    }

    if (!window.google) {
      toast.error('Đang tải Google Sign-In SDK, vui lòng kiểm tra kết nối mạng và thử lại!');
      return;
    }

    setIsLoading(true);

    try {
      // Ưu tiên sử dụng Token Client popup chuẩn OAuth 2.0
      if (window.google.accounts?.oauth2?.initTokenClient) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId.trim(),
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setIsLoading(false);
              toast.error('Đăng nhập Google bị hủy hoặc thất bại: ' + (tokenResponse.error_description || tokenResponse.error));
              return;
            }
            if (tokenResponse.access_token) {
              await processGoogleAuth(tokenResponse.access_token);
            } else {
              setIsLoading(false);
              toast.error('Không nhận được mã xác thực từ Google!');
            }
          }
        });
        tokenClient.requestAccessToken();
      } else if (window.google.accounts?.id) {
        // Fallback: Google ID Token One-tap / Prompt
        window.google.accounts.id.initialize({
          client_id: googleClientId.trim(),
          callback: async (response) => {
            if (response.credential) {
              await processGoogleAuth(response.credential);
            } else {
              setIsLoading(false);
              toast.error('Không nhận được chứng chỉ xác thực từ Google!');
            }
          }
        });
        window.google.accounts.id.prompt();
      } else {
        setIsLoading(false);
        toast.error('Trình duyệt chưa sẵn sàng cho Google Sign-In.');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Google Sign-In Error:', err);
      toast.error('Lỗi khi mở giao diện đăng nhập Google: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-8 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
      
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
              {isForgotPassword
                ? (forgotStep === 1 ? 'Khôi Phục Mật Khẩu' : forgotStep === 2 ? 'Xác Thực Mã OTP' : 'Mật Khẩu Mới')
                : (authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản')}
            </h3>

            {isForgotPassword ? (
              /* ========================================================= */
              /* FORGOT PASSWORD 3-STEP FLOW                               */
              /* ========================================================= */
              <div className="space-y-4 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotStep(1);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-medium mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại đăng nhập</span>
                </button>

                {forgotStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-3.5">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Nhập địa chỉ email tài khoản của bạn. Hệ thống Wayfare sẽ gửi mã OTP gồm 6 chữ số qua hòm thư Resend.
                    </p>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="Địa chỉ Email của bạn"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full h-[52px] pl-12 pr-5 rounded-full bg-white border border-white text-sm text-[#3c4043] shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-[50px] rounded-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>Gửi Mã OTP Xác Thực</span>
                      )}
                    </button>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Mã xác nhận 6 số đã được gửi tới <strong className="text-slate-700">{forgotEmail}</strong>. Vui lòng nhập mã OTP để tiếp tục:
                    </p>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="• • • • • •"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-[52px] pl-12 pr-5 rounded-full bg-white border border-white text-lg font-mono font-bold tracking-[6px] text-center text-[#3c4043] shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs px-2 text-slate-500">
                      <span>Chưa nhận được mã?</span>
                      {countdown > 0 ? (
                        <span className="text-slate-400 font-medium">Gửi lại ({countdown}s)</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isLoading}
                          className="text-sky-600 hover:text-sky-700 font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Gửi lại mã</span>
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-[50px] rounded-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>Xác Nhận Mã OTP</span>
                      )}
                    </button>
                  </form>
                )}

                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Mã xác nhận hợp lệ. Vui lòng thiết lập mật khẩu mới (tối thiểu 6 ký tự) cho tài khoản:
                    </p>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-[52px] pl-12 pr-12 rounded-full bg-white border border-white text-sm text-[#3c4043] shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3c4043] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Xác nhận lại mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-[52px] pl-12 pr-5 rounded-full bg-white border border-white text-sm text-[#3c4043] shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-[50px] rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>Lưu Mật Khẩu & Đăng Nhập</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
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
                      type={authMode === 'login' ? 'text' : 'email'}
                      required
                      placeholder={authMode === 'login' ? 'Email hoặc Tên tài khoản' : 'Địa chỉ Email'}
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
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setForgotStep(1);
                          setForgotEmail(email);
                        }}
                        className="text-xs text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
                      >
                        Quên Mật Khẩu?
                      </button>
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
              </>
            )}

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
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs border border-white transition-all cursor-pointer hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Đăng nhập bảo mật với Google"
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
                disabled={isLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs border border-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="hidden sm:inline">Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => toast.info('Tính năng đăng nhập Apple đang được kết nối!')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs border border-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

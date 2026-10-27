import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { userApi } from '../../services/api';
import { useToast } from '../common/Toast';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.showError('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.showError('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.showError('Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }
    if (currentPassword === newPassword) {
      toast.showError('Mật khẩu mới không được trùng với mật khẩu cũ!');
      return;
    }

    try {
      setIsSubmitting(true);
      await userApi.changePassword(currentPassword, newPassword, confirmPassword);
      toast.showSuccess('Đổi mật khẩu thành công! Tài khoản của bạn đã được cập nhật an toàn. 🎉');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      toast.showError(err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] rounded-[6px] max-w-md w-full p-6 shadow-2xl border border-ink-200/80 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-ink-200/80">
          <h3 className="font-display font-black text-base text-ink-800 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-clay-600" />
            <span>Đổi Mật Khẩu Tài Khoản</span>
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-[5px] bg-[#F8F4EC] hover:bg-ink-200 text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mật khẩu hiện tại */}
          <div>
            <label className="block mb-1 text-xs font-bold text-ink-800">
              Mật khẩu hiện tại <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu đang dùng..."
                className="w-full p-2.5 pr-10 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-medium text-ink-900 outline-none focus:ring-1 focus:ring-clay-500 focus:border-clay-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block mb-1 text-xs font-bold text-ink-800">
              Mật khẩu mới (tối thiểu 6 ký tự) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full p-2.5 pr-10 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-medium text-ink-900 outline-none focus:ring-1 focus:ring-clay-500 focus:border-clay-500 transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block mb-1 text-xs font-bold text-ink-800">
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full p-2.5 pr-10 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-xs font-medium text-ink-900 outline-none focus:ring-1 focus:ring-clay-500 focus:border-clay-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-[5px] border border-amber-200/60 text-[11px] text-amber-800 font-serif space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <Lock className="w-3.5 h-3.5" />
              <span>Ghi chú bảo mật:</span>
            </p>
            <p>Sau khi đổi mật khẩu thành công, bạn sẽ sử dụng mật khẩu mới này cho tất cả các lần đăng nhập tiếp theo.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-200/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-[5px] text-xs font-bold text-ink-600 hover:bg-[#F8F4EC] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-clay-600 hover:bg-clay-700 text-white px-5 py-2.5 rounded-[5px] text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lưu mật khẩu mới</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ChangePasswordModal;

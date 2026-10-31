import React, { useState, useEffect, useCallback } from 'react';
import { 
  Megaphone, 
  Send, 
  History, 
  Bell, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  Compass, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw,
  Users,
  Shield,
  Clock
} from 'lucide-react';
import { notificationApi } from '../../../services/api';
import { useToast } from '../../../components/common/Toast';
import { useApp } from '../../../context/AppContext';

const NOTIFICATION_TYPES = [
  {
    id: 'SYSTEM_NEWS',
    label: 'Tin tức & Sự kiện du lịch',
    badgeText: 'Tin tức',
    color: 'sky',
    icon: Compass,
    accentBg: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    id: 'SYSTEM_ALERT',
    label: 'Cảnh báo quan trọng / Thời tiết',
    badgeText: 'Khẩn cấp',
    color: 'rose',
    icon: AlertTriangle,
    accentBg: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  {
    id: 'FEATURE_UPDATE',
    label: 'Cập nhật tính năng & Phiên bản',
    badgeText: 'Cập nhật',
    color: 'emerald',
    icon: Sparkles,
    accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'COMMUNITY_EVENT',
    label: 'Sự kiện cộng đồng phượt thủ',
    badgeText: 'Cộng đồng',
    color: 'purple',
    icon: Users,
    accentBg: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

export const AdminBroadcastPage = () => {
  const toast = useToast();
  const { currentUser } = useApp();

  const [form, setForm] = useState({
    title: 'Thông báo từ Ban Quản Trị Wayfare',
    message: '',
    type: 'SYSTEM_NEWS',
    targetUrl: '/explore'
  });

  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Tải lịch sử phát sóng
  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await notificationApi.getBroadcastHistory();
      setHistory(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử phát thông báo:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const selectedTypeConfig = NOTIFICATION_TYPES.find(t => t.id === form.type) || NOTIFICATION_TYPES[0];
  const TypeIcon = selectedTypeConfig.icon;

  const handleSendBroadcast = async () => {
    if (!form.message.trim()) {
      toast.error('Vui lòng nhập nội dung thông báo trước khi phát!');
      return;
    }

    try {
      setSending(true);
      const payload = {
        type: form.type,
        message: form.title ? `[${form.title}] ${form.message}` : form.message,
        targetUrl: form.targetUrl || '/',
        senderEmail: currentUser?.email
      };

      const res = await notificationApi.broadcastNotification(payload);
      toast.success(res?.data?.message || 'Đã phát sóng thông báo toàn hệ thống thành công!');
      
      // Reset message
      setForm(prev => ({ ...prev, message: '' }));
      setConfirmModalOpen(false);

      // Reload history
      await loadHistory();
    } catch (err) {
      console.error('Lỗi phát sóng:', err);
      toast.error(err.message || 'Không thể phát sóng thông báo');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* ─── 1. HEADER BANNER ────────────────────────────────────────────── */}
      <div className="p-6 bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-clay-700 text-white flex items-center justify-center shadow-xs">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-ink-900 tracking-tight flex items-center gap-2">
              Trung Tâm Phát Thông Báo Toàn Hệ Thống
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                Real-Time STOMP
              </span>
            </h1>
            <p className="text-xs text-ink-500 font-sans mt-0.5">
              Soạn và gửi thông báo trực tiếp đến tất cả thành viên trong cộng đồng du lịch Wayfare theo thời gian thực.
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          disabled={loadingHistory}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-serif font-medium text-ink-600 bg-[#F8F4EC] hover:bg-ink-100 border border-ink-200 rounded-[5px] transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          Làm mới lịch sử
        </button>
      </div>

      {/* ─── 2. MAIN WORKSPACE (Form + Live Preview) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Composer Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 p-6 shadow-2xs space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <span className="font-serif font-bold text-sm text-ink-900">
                Soạn Nội Dung Phát Sóng
              </span>
              <span className="text-[11px] font-mono text-ink-400">
                Gửi tới: Tất cả người dùng đang hoạt động
              </span>
            </div>

            {/* Type selector */}
            <div className="space-y-2">
              <label className="text-xs font-serif font-bold text-ink-800 block">
                Phân loại thông báo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {NOTIFICATION_TYPES.map(t => {
                  const Icon = t.icon;
                  const isSelected = form.type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, type: t.id }))}
                      className={`p-3 rounded-[5px] border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-clay-50/80 border-clay-600 ring-1 ring-clay-600' 
                          : 'bg-[#FFFDF8] border-ink-200 hover:bg-[#F8F4EC]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 border ${t.accentBg}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-serif font-bold text-ink-900 block truncate">
                          {t.label}
                        </span>
                        <span className="text-[10px] font-mono text-ink-400">
                          Nhãn: {t.badgeText}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold text-ink-800 block">
                Tiêu đề thông báo
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ví dụ: Chào đón Tuần lễ Du lịch Biển Đảo 2026..."
                className="w-full px-3.5 py-2 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs font-sans text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-bold text-ink-800 block">
                  Nội dung chi tiết thông điệp <span className="text-rose-600">*</span>
                </label>
                <span className="text-[10px] font-mono text-ink-400">
                  {form.message.length} / 500 ký tự
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Nhập nội dung thông điệp bạn muốn gửi đến toàn thể cộng đồng du khách..."
                className="w-full p-3 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs font-sans text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600 resize-none leading-relaxed"
              />
            </div>

            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold text-ink-800 block">
                Đường dẫn liên kết khi du khách bấm vào (Target URL)
              </label>
              <div className="relative">
                <ExternalLink className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.targetUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                  placeholder="/explore hoặc /places/12 hoặc /community"
                  className="w-full pl-9 pr-3.5 py-2 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between border-t border-ink-100">
              <span className="text-[11px] text-ink-400 font-sans">
                Thông báo sẽ lập tức hiển thị trên máy tính và điện thoại của du khách.
              </span>

              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={!form.message.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-clay-700 hover:bg-clay-800 text-white font-serif font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                Phát Sóng Ngay
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Live Notification Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 p-5 shadow-2xs space-y-4">
            <span className="font-serif font-bold text-xs text-ink-900 block pb-2 border-b border-ink-100">
              Mô Phỏng Trực Quan Thông Báo (Live Preview)
            </span>

            {/* 1. In-App Notification Center Card Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block">
                1. Hiển thị trong Trung tâm Thông báo (/notifications):
              </span>
              <div className="p-3.5 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 shadow-2xs flex items-start gap-3">
                <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 border ${selectedTypeConfig.accentBg}`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-xs text-ink-900 truncate">
                      {form.title || 'Thông báo từ Ban Quản Trị'}
                    </span>
                    <span className="text-[10px] font-mono text-ink-400 shrink-0">
                      Vừa xong
                    </span>
                  </div>
                  <p className="text-xs text-ink-600 font-sans mt-1 line-clamp-3 leading-relaxed">
                    {form.message || 'Nội dung thông điệp sẽ hiển thị tại đây khi bạn nhập vào biểu mẫu...'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-1.5 py-0.2 rounded-[2px] text-[9px] font-mono font-bold border ${selectedTypeConfig.accentBg}`}>
                      {selectedTypeConfig.badgeText}
                    </span>
                    <span className="text-[10px] font-mono text-clay-700 truncate">
                      Liên kết: {form.targetUrl || '/'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Floating Pop-up Toast Preview */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block">
                2. Pop-up Toast góc phải màn hình của du khách:
              </span>
              <div className="p-3 rounded-[6px] bg-ink-900 text-white shadow-xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-[4px] bg-clay-600 text-white flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold font-serif text-amber-300 truncate">
                    🔔 {form.title || 'Thông báo mới'}
                  </p>
                  <p className="text-[11px] text-ink-200 font-sans truncate mt-0.5">
                    {form.message || 'Nội dung thông báo nổi...'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Stats Banner */}
          <div className="p-4 rounded-[6px] bg-amber-50/70 border border-amber-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed font-sans">
              <span className="font-bold font-serif">Nguyên tắc phát sóng thông báo:</span>
              <p className="mt-0.5 text-amber-800">
                Các thông báo khẩn cấp hoặc tin tức lớn nên được soạn thảo trang trọng, ngắn gọn và dẫn link chính xác đến điểm đến hoặc bài viết cộng đồng liên quan.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ─── 3. BROADCAST HISTORY TABLE ──────────────────────────────────── */}
      <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs overflow-hidden space-y-3">
        <div className="p-4 border-b border-ink-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-clay-700" />
            <h2 className="font-serif font-bold text-sm text-ink-900">
              Nhật Ký Các Đợt Phát Sóng Gần Nhất ({history.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-ink-400">
            Lưu vết tự động bởi Audit Engine
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#F8F4EC]/70 text-ink-500 font-mono text-[10px] uppercase tracking-wider border-b border-ink-200/80">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">STT</th>
                <th className="py-2.5 px-4">Thông điệp phát sóng</th>
                <th className="py-2.5 px-4">Người thực hiện</th>
                <th className="py-2.5 px-4">Thời gian</th>
                <th className="py-2.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loadingHistory ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-400 text-xs">
                    Đang tải nhật ký phát sóng...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-400 text-xs">
                    Chưa có đợt phát sóng thông báo nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                history.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-[#F8F4EC]/60 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-ink-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-serif font-bold text-ink-900">
                        {log.actionDesc || log.message || log.details}
                      </div>
                      <div className="text-[11px] font-mono text-ink-400 mt-0.5">
                        Mã hành động: {log.action || 'BROADCAST_NOTIFICATION'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-600">
                      {log.userEmail || log.userName || 'Quản trị viên'}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-500 text-[11px]">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : 'Gần đây'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Đã gửi
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4. CONFIRMATION DIALOG MODAL ─────────────────────────────────── */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-clay-700">
              <div className="w-10 h-10 rounded-full bg-clay-100 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-clay-700" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-ink-900">
                  Xác nhận Phát Sóng Thông Báo
                </h3>
                <p className="text-xs text-ink-500 font-sans mt-0.5">
                  Thao tác này sẽ gửi thông báo đến <strong>toàn thể người dùng</strong>.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-xs font-sans space-y-1.5">
              <p className="font-serif font-bold text-ink-800">
                {form.title}
              </p>
              <p className="text-ink-600 line-clamp-3 leading-relaxed">
                {form.message}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={sending}
                className="px-4 py-2 rounded-[5px] text-xs font-serif font-bold text-ink-600 hover:bg-[#F8F4EC] transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={sending}
                className="px-5 py-2 rounded-[5px] text-xs font-serif font-bold bg-clay-700 hover:bg-clay-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className={`w-3.5 h-3.5 ${sending ? 'animate-spin' : ''}`} />
                {sending ? 'Đang phát sóng...' : 'Xác Nhận Phát Sóng'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

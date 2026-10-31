import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wrench, 
  Power, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Save, 
  RotateCcw, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Calendar,
  X
} from 'lucide-react';
import { adminMaintenanceApi } from '../../../services/api';
import { useToast } from '../../../components/common/Toast';
import { MaintenanceScreen } from '../../../components/common/MaintenanceScreen';

export const AdminMaintenancePage = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [form, setForm] = useState({
    enabled: false,
    title: 'Hệ thống đang bảo trì nâng cấp',
    message: 'Wayfare đang thực hiện nâng cấp hệ thống định kỳ nhằm mang lại trải nghiệm khám phá du lịch mượt mà hơn. Rất mong bạn thông cảm và quay lại sau ít phút!',
    estimatedEndTime: '',
    allowAdminBypass: true,
    updatedByEmail: '',
    updatedAt: ''
  });

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminMaintenanceApi.getMaintenance();
      if (res) {
        setForm({
          enabled: Boolean(res.enabled),
          title: res.title || 'Hệ thống đang bảo trì nâng cấp',
          message: res.message || '',
          estimatedEndTime: res.estimatedEndTime || '',
          allowAdminBypass: res.allowAdminBypass ?? true,
          updatedByEmail: res.updatedByEmail || '',
          updatedAt: res.updatedAt || ''
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải trạng thái bảo trì:', err);
      toast.error('Không thể tải trạng thái bảo trì: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleSave = async (overrideEnabled = null) => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        enabled: overrideEnabled !== null ? overrideEnabled : form.enabled
      };

      const updated = await adminMaintenanceApi.updateMaintenance(payload);
      setForm(prev => ({ ...prev, ...updated }));
      toast.success(payload.enabled 
        ? 'ĐÃ BẬT CHẾ ĐỘ BẢO TRÌ HỆ THỐNG!' 
        : 'ĐÃ TẮT BẢO TRÌ! Hệ thống đang hoạt động công khai.');
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình bảo trì:', err);
      toast.error(err.message || 'Không thể cập nhật chế độ bảo trì');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEmergency = () => {
    const nextState = !form.enabled;
    setForm(prev => ({ ...prev, enabled: nextState }));
    handleSave(nextState);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* ─── 1. HEADER ─────────────────────────────────────────────────── */}
      <div className="p-6 bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-clay-700 text-white flex items-center justify-center shadow-xs">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-ink-900 tracking-tight flex items-center gap-2">
              Quản Lý Chế Độ Bảo Trì Hệ Thống
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
                form.enabled
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {form.enabled ? 'ĐANG BẬT BẢO TRÌ' : 'HOẠT ĐỘNG BÌNH THƯỜNG'}
              </span>
            </h1>
            <p className="text-xs text-ink-500 font-sans mt-0.5">
              Bật chế độ bảo trì khi nâng cấp CSDL hoặc bảo dưỡng máy chủ. Du khách sẽ thấy màn hình đếm ngược, riêng Quản trị viên vẫn truy cập bình thường.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-serif font-bold text-ink-700 bg-[#F8F4EC] hover:bg-ink-100 border border-ink-200 rounded-[5px] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-clay-700" />
            Xem trước giao diện
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-serif font-bold bg-clay-700 hover:bg-clay-800 text-white rounded-[5px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      {/* ─── 2. EMERGENCY SWITCH CARD ──────────────────────────────────── */}
      <div className={`p-6 rounded-[6px] border transition-all ${
        form.enabled
          ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200/60'
          : 'bg-[#FFFDF8] border-ink-200/80 shadow-2xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-[6px] flex items-center justify-center shrink-0 border ${
              form.enabled
                ? 'bg-amber-500 text-white border-amber-600 shadow-md animate-pulse'
                : 'bg-[#F8F4EC] text-ink-400 border-ink-200'
            }`}>
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-serif text-ink-900">
                  {form.enabled ? 'Hệ thống đang ở Chế độ Bảo trì' : 'Chế độ Bảo trì đang Tắt'}
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full ${
                  form.enabled ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {form.enabled ? 'Người dùng bị chặn' : 'Công khai 100%'}
                </span>
              </div>
              <p className="text-xs text-ink-500 font-sans mt-1 leading-relaxed max-w-xl">
                {form.enabled
                  ? 'Du khách truy cập vào trang web sẽ nhìn thấy màn hình thông báo bảo trì và đồng hồ đếm ngược. Các tài khoản Admin vẫn có thể đăng nhập bình thường.'
                  : 'Trang web đang mở hoàn toàn cho du khách khám phá địa điểm, lịch trình và tham gia cộng đồng.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleEmergency}
            disabled={saving}
            className={`px-5 py-2.5 rounded-[5px] text-xs font-serif font-black shadow-xs transition-all cursor-pointer shrink-0 ${
              form.enabled
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {form.enabled ? 'TẮT BẢO TRÌ (MỞ LẠI HỆ THỐNG)' : 'BẬT BẢO TRÌ HỆ THỐNG'}
          </button>
        </div>
      </div>

      {/* ─── 3. FORM CONFIGURATION ──────────────────────────────────────── */}
      <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 p-6 shadow-2xs space-y-5">
        <h3 className="font-serif font-bold text-sm text-ink-900 pb-2 border-b border-ink-100">
          Cấu Hình Thông Điệp Hiển Thị Tới Du Khách
        </h3>

        <div className="space-y-4 text-xs font-sans">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-serif font-bold text-ink-800 block">
              Tiêu đề thông báo bảo trì
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ví dụ: Hệ thống đang bảo trì nâng cấp định kỳ..."
              className="w-full px-3.5 py-2 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600 font-sans"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="font-serif font-bold text-ink-800 block">
              Nội dung lời nhắn nhủ thân thiện
            </label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Giải thích ngắn gọn lý do bảo trì và gửi lời xin lỗi ấm áp đến du khách..."
              className="w-full p-3 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600 font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Estimated End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="font-serif font-bold text-ink-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-clay-700" />
                Thời gian dự kiến hoàn tất (Để chạy đồng hồ đếm ngược)
              </label>
              <input
                type="datetime-local"
                value={form.estimatedEndTime ? form.estimatedEndTime.substring(0, 16) : ''}
                onChange={(e) => setForm(prev => ({ ...prev, estimatedEndTime: e.target.value }))}
                className="w-full px-3.5 py-2 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 focus:outline-hidden focus:border-clay-600"
              />
              <span className="text-[11px] text-ink-400 font-sans block">
                Nếu để trống, màn hình sẽ chỉ hiển thị thông báo mà không có đồng hồ đếm ngược.
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="font-serif font-bold text-ink-800 block">
                Gợi ý mốc thời gian nhanh:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: '+30 phút', mins: 30 },
                  { label: '+1 giờ', mins: 60 },
                  { label: '+2 giờ', mins: 120 },
                  { label: '+4 giờ', mins: 240 }
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + p.mins * 60 * 1000);
                      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                      setForm(prev => ({ ...prev, estimatedEndTime: iso }));
                    }}
                    className="px-2.5 py-1.5 rounded-[4px] bg-[#F8F4EC] hover:bg-clay-100 text-ink-700 font-mono text-xs font-bold border border-ink-200 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, estimatedEndTime: '' }))}
                  className="px-2.5 py-1.5 rounded-[4px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-serif text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                >
                  Xóa mốc giờ
                </button>
              </div>
            </div>
          </div>

          {/* Admin Bypass Switch */}
          <div className="pt-2">
            <label className="flex items-center justify-between p-3.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-serif font-bold text-xs text-ink-900 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Cho phép Quản trị viên (Super Admin) Bypass
                </span>
                <span className="text-[11px] text-ink-500 font-sans">
                  Khi bật, tài khoản Quản trị viên vẫn truy cập và thao tác kiểm tra bình thường trong lúc hệ thống bảo trì.
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.allowAdminBypass}
                onChange={(e) => setForm(prev => ({ ...prev, allowAdminBypass: e.target.checked }))}
                className="w-5 h-5 rounded-[4px] accent-clay-700 cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Footer Audit Info */}
        {form.updatedAt && (
          <div className="pt-3 border-t border-ink-100 text-[11px] font-mono text-ink-400 flex items-center justify-between">
            <span>Cập nhật lần cuối bởi: <strong>{form.updatedByEmail || 'Admin'}</strong></span>
            <span>Thời gian: {new Date(form.updatedAt).toLocaleString('vi-VN')}</span>
          </div>
        )}
      </div>

      {/* ─── 4. FULLSCREEN PREVIEW MODAL ─────────────────────────────────── */}
      {previewOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 flex flex-col">
          <div className="bg-ink-900 text-white px-6 py-2.5 flex items-center justify-between shrink-0 shadow-md">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Chế độ xem trước màn hình bảo trì (Du khách sẽ nhìn thấy như sau)
            </span>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-[4px] bg-white/10 hover:bg-white/20 text-xs font-serif font-bold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Đóng xem trước
            </button>
          </div>
          <div className="flex-1">
            <MaintenanceScreen maintenanceData={form} />
          </div>
        </div>
      )}

    </div>
  );
};

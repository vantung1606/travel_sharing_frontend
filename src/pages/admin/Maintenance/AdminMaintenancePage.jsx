import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  X,
  Compass,
  Plane,
  Server,
  Database,
  Cpu,
  RefreshCw,
  ExternalLink,
  Megaphone,
  ArrowRight,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminMaintenanceApi } from '../../../services/api';
import { useToast } from '../../../components/common/Toast';
import { MaintenanceScreen } from '../../../components/common/MaintenanceScreen';

export const MAINTENANCE_TEMPLATES = [
  {
    id: 'routine',
    label: 'Bảo trì máy chủ định kỳ',
    badge: '30 phút',
    icon: Server,
    title: 'Hệ thống đang bảo trì & nâng cấp máy chủ định kỳ',
    message: 'Wayfare đang thực hiện đợt bảo dưỡng máy chủ định kỳ nhằm mang lại tốc độ duyệt web mượt mà và ổn định nhất cho bạn. Chúng tôi sẽ sớm mở cửa trở lại!',
    durationMins: 30
  },
  {
    id: 'feature',
    label: 'Nâng cấp tính năng & AI Planner',
    badge: '1 giờ',
    icon: Sparkles,
    title: 'Wayfare đang nâng cấp tính năng mới & Trí tuệ Nhân tạo AI',
    message: 'Đội ngũ kỹ thuật đang cập nhật thuật toán lập lịch trình thông minh AI và bổ sung tính năng mới. Hãy quay lại sau ít phút để trải nghiệm nhé!',
    durationMins: 60
  },
  {
    id: 'emergency',
    label: 'Bảo trì khẩn cấp xử lý sự cố',
    badge: '15 phút',
    icon: AlertTriangle,
    title: 'Hệ thống đang kiểm tra & khắc phục sự cố kỹ thuật',
    message: 'Chúng tôi đang tiến hành khắc phục nhanh sự cố hạ tầng máy chủ để đảm bảo hệ thống vận hành an toàn. Rất xin lỗi vì sự bất tiện này!',
    durationMins: 15
  },
  {
    id: 'database',
    label: 'Tối ưu hóa CSDL & Dữ liệu lớn',
    badge: '2 giờ',
    icon: Database,
    title: 'Bảo trì nâng cấp cơ sở dữ liệu & sao lưu định kỳ',
    message: 'Wayfare đang thực hiện sao lưu an toàn toàn bộ dữ liệu du lịch và mở rộng tài nguyên CSDL MySQL. Quá trình dự kiến hoàn tất trong 2 giờ tới.',
    durationMins: 120
  }
];

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
        ? 'ĐÃ BẬT CHẾ ĐỘ BẢO TRÌ HỆ THỐNG! Du khách sẽ thấy màn hình bảo trì.' 
        : 'ĐÃ TẮT BẢO TRÌ! Hệ thống đã mở cửa công khai trở lại.');
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

  // Chọn template mẫu có sẵn
  const handleApplyTemplate = (tmpl) => {
    const d = new Date(Date.now() + tmpl.durationMins * 60 * 1000);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    setForm(prev => ({
      ...prev,
      title: tmpl.title,
      message: tmpl.message,
      estimatedEndTime: iso
    }));
    toast.success(`Đã áp dụng mẫu: ${tmpl.label} (+${tmpl.badge})`);
  };

  // Thêm thời gian nhanh
  const handleAddTime = (minutes) => {
    const baseTime = form.estimatedEndTime ? new Date(form.estimatedEndTime).getTime() : Date.now();
    const d = new Date(baseTime + minutes * 60 * 1000);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm(prev => ({ ...prev, estimatedEndTime: iso }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* ─── 1. HEADER BANNER ────────────────────────────────────────────── */}
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

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={loadStatus}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-medium text-ink-600 bg-[#F8F4EC] hover:bg-ink-100 border border-ink-200 rounded-[5px] transition-colors cursor-pointer"
            title="Tải lại trạng thái từ CSDL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-serif font-bold text-ink-700 bg-[#F8F4EC] hover:bg-ink-100 border border-ink-200 rounded-[5px] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-clay-700" />
            <span>Toàn màn hình</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-serif font-bold bg-clay-700 hover:bg-clay-800 text-white rounded-[5px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. EMERGENCY TOGGLE CARD ────────────────────────────────────── */}
      <div className={`p-6 rounded-[6px] border transition-all ${
        form.enabled
          ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200/70 shadow-sm'
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
                  {form.enabled ? 'Chế Độ Bảo Trì Đang KÍCH HOẠT' : 'Hệ Thống Đang Mở Cửa Công Khai'}
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  form.enabled ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {form.enabled ? 'Du khách bị chặn' : 'Hoạt động 100%'}
                </span>
              </div>
              <p className="text-xs text-ink-600 font-sans mt-1 leading-relaxed max-w-xl">
                {form.enabled
                  ? 'Du khách truy cập vào bất kỳ trang nào đều sẽ nhìn thấy màn hình thông báo bảo trì và đồng hồ đếm ngược. Các tài khoản Quản trị viên vẫn có thể đăng nhập bình thường.'
                  : 'Trang web đang mở hoàn toàn cho du khách khám phá địa điểm, xem lịch trình và chia sẻ bài viết cộng đồng.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleEmergency}
            disabled={saving}
            className={`px-5 py-2.5 rounded-[5px] text-xs font-serif font-black shadow-xs transition-all cursor-pointer shrink-0 ${
              form.enabled
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-600/50'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {form.enabled ? 'TẮT BẢO TRÌ (MỞ LẠI HỆ THỐNG NGAY)' : 'BẬT CHẾ ĐỘ BẢO TRÌ HỆ THỐNG'}
          </button>
        </div>
      </div>

      {/* ─── 3. MAIN WORKSPACE (Form Configuration + Live Preview) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 p-6 shadow-2xs space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <span className="font-serif font-bold text-sm text-ink-900">
                Cấu Hình Thông Điệp Hiển Thị Tới Du Khách
              </span>
              <span className="text-[11px] font-mono text-ink-400">
                Tự động đồng bộ CSDL
              </span>
            </div>

            {/* Quick Preset Templates */}
            <div className="space-y-2">
              <label className="text-xs font-serif font-bold text-ink-800 block">
                Mẫu kịch bản thông điệp có sẵn (1-Chạm):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MAINTENANCE_TEMPLATES.map(tmpl => {
                  const Icon = tmpl.icon;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="p-3 rounded-[5px] border border-ink-200 bg-[#F8F4EC]/60 hover:bg-[#F8F4EC] hover:border-clay-400 text-left transition-all cursor-pointer group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-[4px] bg-[#FFFDF8] border border-ink-200 flex items-center justify-center shrink-0 text-clay-700 group-hover:scale-105 transition-transform">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-xs text-ink-900 block truncate group-hover:text-clay-800">
                          {tmpl.label}
                        </span>
                        <span className="text-[10px] font-mono text-clay-700 block">
                          Thời gian: +{tmpl.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-serif font-bold text-xs text-ink-800 block">
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
              <div className="flex items-center justify-between">
                <label className="font-serif font-bold text-xs text-ink-800 block">
                  Nội dung lời nhắn nhủ thân thiện
                </label>
                <span className="text-[10px] font-mono text-ink-400">
                  {form.message.length} ký tự
                </span>
              </div>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Giải thích ngắn gọn lý do bảo trì và gửi lời xin lỗi ấm áp đến du khách..."
                className="w-full p-3 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs text-ink-900 focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600 font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Estimated End Time */}
            <div className="space-y-2 pt-1 border-t border-ink-100">
              <div className="flex items-center justify-between">
                <label className="font-serif font-bold text-xs text-ink-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-clay-700" />
                  <span>Thời gian dự kiến hoàn tất (Đồng hồ đếm ngược)</span>
                </label>
                {form.estimatedEndTime && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, estimatedEndTime: '' }))}
                    className="text-[11px] font-serif font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Xóa mốc giờ
                  </button>
                )}
              </div>

              <input
                type="datetime-local"
                value={form.estimatedEndTime ? form.estimatedEndTime.substring(0, 16) : ''}
                onChange={(e) => setForm(prev => ({ ...prev, estimatedEndTime: e.target.value }))}
                className="w-full px-3.5 py-2 bg-[#FFFDF8] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 focus:outline-hidden focus:border-clay-600"
              />

              {/* Quick Time Addition Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block">
                  Cộng thêm thời gian nhanh:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '+15 phút', mins: 15 },
                    { label: '+30 phút', mins: 30 },
                    { label: '+1 giờ', mins: 60 },
                    { label: '+2 giờ', mins: 120 },
                    { label: '+4 giờ', mins: 240 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleAddTime(p.mins)}
                      className="px-2.5 py-1 rounded-[4px] bg-[#F8F4EC] hover:bg-clay-100 text-ink-700 font-mono text-[11px] font-bold border border-ink-200 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Bypass Switch */}
            <div className="pt-2 border-t border-ink-100">
              <label className="flex items-center justify-between p-3.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="font-serif font-bold text-xs text-ink-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Cho phép Quản trị viên (Super Admin) Bypass</span>
                  </span>
                  <span className="text-[11px] text-ink-500 font-sans block">
                    Khi bật, tài khoản Quản trị viên vẫn đăng nhập và thao tác quản lý bình thường trong lúc hệ thống bảo trì.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={form.allowAdminBypass}
                  onChange={(e) => setForm(prev => ({ ...prev, allowAdminBypass: e.target.checked }))}
                  className="w-5 h-5 rounded-[4px] accent-clay-700 cursor-pointer ml-3 shrink-0"
                />
              </label>
            </div>

            {/* Broadcast Reminder Box */}
            <div className="p-3.5 rounded-[5px] bg-sky-50/70 border border-sky-200 flex items-start gap-3">
              <Megaphone className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="text-xs text-sky-900 font-sans flex-1">
                <span className="font-bold font-serif">Mẹo vận hành:</span>
                <p className="mt-0.5 text-sky-800">
                  Nên phát một thông báo trước 15-30 phút qua Trung tâm Thông báo để du khách kịp lưu lại hành trình đang tạo dở.
                </p>
                <Link
                  to="/admin/broadcast"
                  className="inline-flex items-center gap-1 text-[11px] font-serif font-bold text-sky-800 hover:text-sky-900 hover:underline mt-1.5"
                >
                  <span>Đi tới Trung tâm Phát Thông Báo</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Live Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <span className="font-serif font-bold text-xs text-ink-900">
                Mô Phỏng Trực Quan Màn Hình Khách (Live Preview)
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="text-[10px] font-mono text-clay-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>Xem lớn</span>
              </button>
            </div>

            {/* Scaled-down Mini Mockup Card */}
            <div className="p-5 rounded-[8px] bg-[#F8F4EC] border border-ink-200 shadow-inner text-center space-y-4 select-none">
              
              {/* Header Mini */}
              <div className="flex items-center justify-between border-b border-ink-200/60 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <img src="/wayfare-logo.png" alt="Wayfare" className="h-5 w-auto object-contain" />
                  <span className="font-serif font-black text-xs text-clay-800">WAYFARE</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FFFDF8] border border-ink-200 text-ink-500">
                  Admin Login
                </span>
              </div>

              {/* Icon Animated Mini */}
              <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-clay-50 border border-clay-200 flex items-center justify-center text-clay-700 shadow-inner">
                  <Compass className="w-7 h-7 animate-[spin_12s_linear_infinite]" />
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#FFFDF8]">
                  ⚡
                </span>
              </div>

              {/* Title & Message */}
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[9px] font-bold uppercase tracking-wider inline-block">
                  Bảo trì định kỳ
                </span>
                <h4 className="font-serif font-black text-sm text-ink-900 leading-snug line-clamp-2">
                  {form.title || 'Hệ thống đang bảo trì nâng cấp'}
                </h4>
                <p className="text-[11px] text-ink-500 font-sans leading-relaxed line-clamp-3">
                  {form.message || 'Nội dung thông điệp bảo trì sẽ hiển thị tại đây...'}
                </p>
              </div>

              {/* Countdown Preview Mini */}
              {form.estimatedEndTime && (
                <div className="p-2.5 rounded-[6px] bg-[#FFFDF8] border border-ink-200 shadow-2xs space-y-1">
                  <span className="text-[9px] font-mono text-ink-400 uppercase tracking-wider block">
                    Đồng hồ đếm ngược
                  </span>
                  <div className="flex items-center justify-center gap-2 font-mono text-sm font-black text-clay-800">
                    <span>01 Giờ</span>
                    <span>:</span>
                    <span>30 Phút</span>
                    <span>:</span>
                    <span className="animate-pulse">45 Giây</span>
                  </div>
                </div>
              )}

              {/* Upgrades Mini */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] font-mono text-ink-500 text-center">
                <div className="p-1 rounded bg-[#FFFDF8] border border-ink-100">🚀 Máy chủ</div>
                <div className="p-1 rounded bg-[#FFFDF8] border border-ink-100">🤖 AI Planner</div>
                <div className="p-1 rounded bg-[#FFFDF8] border border-ink-100">🛡️ Bảo mật</div>
              </div>

            </div>

            {/* Audit Log Box */}
            {form.updatedAt && (
              <div className="p-3.5 rounded-[5px] bg-[#F8F4EC]/60 border border-ink-100 text-[11px] font-mono text-ink-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Người cập nhật:</span>
                  <strong className="text-ink-700">{form.updatedByEmail || 'Admin'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Thời gian:</span>
                  <span>{new Date(form.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ─── 4. FULLSCREEN PREVIEW MODAL ─────────────────────────────────── */}
      {previewOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/35 backdrop-blur-[2px] flex flex-col animate-in fade-in duration-150">
          <div className="bg-ink-900 text-white px-6 py-2.5 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Chế độ xem trước màn hình bảo trì (Du khách sẽ nhìn thấy như sau)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-white/10 hover:bg-white/20 text-xs font-serif font-bold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Đóng xem trước</span>
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

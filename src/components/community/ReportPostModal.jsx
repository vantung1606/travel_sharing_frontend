import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, Megaphone, EyeOff, FileWarning, HelpCircle, Loader2, Send } from 'lucide-react';
import { postApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { useApp } from '../../context/AppContext';

const REPORT_REASONS = [
  {
    id: 'Spam hoặc quảng cáo thương mại ngoài lề',
    title: 'Spam hoặc quảng cáo thương mại',
    desc: 'Bài viết quảng cáo bán hàng, rao vặt bất động sản, sim số hoặc link spam ngoài ngành du lịch.',
    icon: Megaphone
  },
  {
    id: 'Đòi nợ, bôi nhọ hoặc quấy rối tài chính',
    title: 'Đòi nợ hoặc quấy rối tài chính cá nhân',
    desc: 'Nội dung bóc phốt nợ nần, bôi nhọ danh dự hoặc đe dọa tài chính cá nhân.',
    icon: AlertTriangle
  },
  {
    id: 'Lừa đảo hoặc thông tin du lịch sai lệch',
    title: 'Lừa đảo hoặc tin giả du lịch',
    desc: 'Quảng cáo tour lừa đảo, giả mạo phòng khách sạn hoặc sai lệch địa danh nghiêm trọng.',
    icon: ShieldAlert
  },
  {
    id: 'Nội dung phản cảm, không phù hợp thuần phong mỹ tục',
    title: 'Nội dung phản cảm, bạo lực',
    desc: 'Hình ảnh hoặc ngôn từ thô tục, bạo lực hoặc không phù hợp với không gian cộng đồng.',
    icon: EyeOff
  },
  {
    id: 'Giả mạo hoặc vi phạm bản quyền hình ảnh',
    title: 'Giả mạo tác giả / Vi phạm bản quyền',
    desc: 'Sử dụng hình ảnh hoặc bài viết của người khác mà không xin phép.',
    icon: FileWarning
  },
  {
    id: 'Lý do khác',
    title: 'Lý do khác',
    desc: 'Vi phạm các quy định khác cần Ban Quản Trị xem xét thủ công.',
    icon: HelpCircle
  }
];

export const ReportPostModal = ({ post, onClose, onReportSubmitted }) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { currentUser } = useApp();

  if (!post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.showWarning('Vui lòng chọn lý do báo cáo vi phạm.');
      return;
    }

    try {
      setSubmitting(true);
      await postApi.reportPost(
        post.id,
        {
          category: selectedReason,
          reason: selectedReason,
          details: details.trim()
        },
        currentUser?.email
      );

      toast.showSuccess('Đã gửi báo cáo vi phạm thành công! Ban Quản Trị sẽ xem xét và xử lý bài viết này.');
      if (typeof onReportSubmitted === 'function') {
        onReportSubmitted(post.id);
      }
      onClose();
    } catch (err) {
      toast.showError('Không thể gửi báo cáo: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900">
                Báo cáo bài viết vi phạm
              </h3>
              <p className="text-xs text-slate-400">
                Giúp bảo vệ cộng đồng du lịch Wayfare an toàn & văn minh
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post Brief Info */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3 text-xs">
          {post.images?.[0] && (
            <img
              src={post.images[0]}
              alt={post.title}
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 truncate">{post.title}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tác giả: <strong className="text-slate-700">{post.authorName || post.author?.fullName || 'Thành viên'}</strong> • Mã bài: #{post.id}
            </p>
          </div>
        </div>

        {/* Report Reasons Selection */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Chọn lý do bạn báo cáo bài viết này:
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map(r => {
                const Icon = r.icon;
                const isSelected = selectedReason === r.id;
                return (
                  <label
                    key={r.id}
                    onClick={() => setSelectedReason(r.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/60 shadow-xs ring-1 ring-rose-500/20'
                        : 'border-slate-200/80 hover:bg-slate-50/80 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(r.id)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-rose-600' : 'text-slate-500'}`} />
                        <span>{r.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Additional details */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Chi tiết hoặc bằng chứng thêm (tùy chọn):
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Cung cấp thêm chi tiết để Ban Quản Trị dễ dàng thẩm tra (ví dụ: dòng nội dung sai lệch, số tiền đòi nợ trái phép...)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi báo cáo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

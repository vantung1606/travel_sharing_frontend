import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../../components/common/Toast';
import { adminReviewApi } from '../../../services/api';
import { Star, Eye, EyeOff, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight, MessageSquare, ShieldAlert, ExternalLink, X, ChevronDown } from 'lucide-react';
import { UserAvatar } from '../../../components/common/UserAvatar';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'visible', label: 'Đang hiển thị' },
  { id: 'hidden', label: 'Đã ẩn' }
];

const RatingStars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'text-amber-500 fill-amber-400' : 'text-ink-200'}`} />
    ))}
  </div>
);

export const AdminReviewsPage = () => {
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [pageData, setPageData] = useState({ totalElements: 0, totalPages: 1, number: 0 });
  const [metrics, setMetrics] = useState({ totalReviews: 0, visibleReviews: 0, hiddenReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [detailReview, setDetailReview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadMetrics = useCallback(async () => {
    try {
      const m = await adminReviewApi.getMetrics();
      if (m && m.totalReviews !== undefined) setMetrics(m);
    } catch {
      // ignore
    }
  }, []);

  const loadReviews = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await adminReviewApi.getReviews({
        keyword: searchKeyword.trim() || undefined,
        rating: ratingFilter !== 'all' ? Number(ratingFilter) : undefined,
        visibility: activeTab,
        page,
        size: 15
      });
      setReviews(result.content);
      setPageData({ totalElements: result.totalElements, totalPages: result.totalPages, number: result.number });
    } catch (err) {
      console.error('Load reviews error:', err);
      toast.error('Không tải được danh sách đánh giá: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchKeyword, ratingFilter, page]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const resetToFirstPage = () => setPage(0);

  const handleHideToggle = async (review) => {
    setActionInProgress(review.id);
    try {
      const updated = review.isHidden
        ? await adminReviewApi.unhideReview(review.id)
        : await adminReviewApi.hideReview(review.id);
      setReviews(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      if (detailReview && detailReview.id === updated.id) setDetailReview(updated);
      loadMetrics();
      toast.success(review.isHidden ? 'Đã hiện lại đánh giá' : 'Đã ẩn đánh giá khỏi trang công khai');
    } catch (err) {
      toast.error('Thao tác thất bại: ' + err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setActionInProgress(confirmDelete.id);
    try {
      await adminReviewApi.deleteReview(confirmDelete.id);
      setConfirmDelete(null);
      loadReviews(true);
      loadMetrics();
      toast.success('Đã xóa vĩnh viễn đánh giá');
    } catch (err) {
      toast.error('Xóa đánh giá thất bại: ' + err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const kpis = useMemo(() => ([
    { label: 'Tổng số đánh giá', value: metrics.totalReviews ?? 0, icon: MessageSquare, sub: 'Ghi nhận từ khách du lịch' },
    { label: 'Đang hiển thị công khai', value: metrics.visibleReviews ?? 0, icon: Eye, sub: 'Tính vào điểm trung bình' },
    { label: 'Đã ẩn (Cần kiểm duyệt)', value: metrics.hiddenReviews ?? 0, icon: ShieldAlert, sub: 'Tạm ẩn khỏi trang chi tiết' }
  ]), [metrics]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* ── Page Header ── */}
      <div className="bg-[#FFFDF8] p-5 sm:p-6 rounded-[6px] border border-ink-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-[4px] bg-clay-50 text-clay-700 font-bold text-[10px] uppercase tracking-wider border border-clay-200/60">
              Ban Quản Trị
            </span>
            <span className="text-ink-200">/</span>
            <span className="font-bold text-xs text-clay-700">Kiểm duyệt đánh giá</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-ink-800 tracking-tight">
            Kiểm duyệt Đánh giá Địa điểm
          </h1>
          <p className="text-xs text-ink-400">
            Hệ thống đang có <strong className="text-ink-800 font-bold">{pageData.totalElements}</strong> đánh giá từ du khách. Đánh giá bị ẩn sẽ không còn tính vào điểm trung bình của địa danh.
          </p>
        </div>

        <button
          onClick={() => loadReviews(true)}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F8F4EC] border border-ink-200/80 text-ink-700 text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-ink-400 ${refreshing ? 'animate-spin text-clay-600' : ''}`} />
          <span>{refreshing ? 'Đang tải...' : 'Làm mới'}</span>
        </button>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {kpis.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 flex items-center gap-4 transition-colors hover:border-ink-300">
            <div className="w-10 h-10 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-ink-400 font-bold uppercase tracking-wider block">{label}</span>
              <div className="font-display font-black text-3xl text-ink-800 mt-0.5 leading-none">{value}</div>
              <span className="text-[10px] text-ink-400 font-medium block mt-1">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters Toolbar ── */}
      <div className="p-4 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 flex flex-wrap items-center gap-3">
        {/* Status Tabs */}
        <div className="inline-flex rounded-[5px] bg-[#F8F4EC] p-1 border border-ink-200/80">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); resetToFirstPage(); }}
              className={`px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FFFDF8] text-clay-700 border border-ink-200/80 shadow-none'
                  : 'text-ink-500 hover:text-ink-800 hover:bg-[#FFFDF8]/60 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchKeyword}
            onChange={(e) => { setSearchKeyword(e.target.value); resetToFirstPage(); }}
            onKeyDown={(e) => e.key === 'Enter' && loadReviews()}
            placeholder="Tìm theo nội dung, tác giả hoặc địa điểm…"
            className="w-full pl-9 pr-4 py-2 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-xs text-ink-800 placeholder:text-ink-300 focus:border-clay-600 outline-none transition-all"
          />
        </div>

        {/* Rating Filter Dropdown */}
        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); resetToFirstPage(); }}
          className="px-3 py-2 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-xs font-bold text-ink-700 hover:bg-[#F8F4EC]/80 focus:border-clay-600 outline-none cursor-pointer transition-colors"
        >
          <option value="all">Mọi số sao đánh giá</option>
          <option value="5">5 sao ★★★★★</option>
          <option value="4">4 sao ★★★★☆</option>
          <option value="3">3 sao ★★★☆☆</option>
          <option value="2">2 sao ★★☆☆☆</option>
          <option value="1">1 sao ★☆☆☆☆</option>
        </select>
      </div>

      {/* ── Table Container ── */}
      <div className="rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 overflow-hidden">
        {loading ? (
          <div className="p-14 text-center text-xs text-ink-400 font-medium">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-clay-600" />
            Đang tải dữ liệu đánh giá từ CSDL MySQL…
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-14 text-center">
            <MessageSquare className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-sm font-display font-bold text-ink-800">Không có đánh giá nào phù hợp bộ lọc</p>
            <p className="text-xs text-ink-400 mt-1">Thử đổi thẻ lọc hoặc xóa từ khóa tìm kiếm để xem tất cả.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4EC] border-b border-ink-200/80">
                <tr>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-ink-600 text-center w-12">STT</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-ink-600">Địa điểm</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-ink-600">Tác giả</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-ink-600">Số sao</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-ink-600">Nội dung nhận xét</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-ink-600">Ngày gửi</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-ink-600 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-ink-600 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200/60 bg-[#FFFDF8]">
                {reviews.map((review, idx) => (
                  <tr key={review.id} className={`hover:bg-[#F8F4EC]/60 transition-colors ${review.isHidden ? 'bg-clay-50/40' : ''}`}>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-ink-400 font-bold">{pageData.number * 15 + idx + 1}</td>
                    
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <a
                        href={`/places/${review.placeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-display font-bold text-ink-800 hover:text-clay-700 hover:underline line-clamp-1 inline-flex items-center gap-1"
                      >
                        {review.placeName}
                        <ExternalLink className="w-3 h-3 opacity-60 text-clay-700" />
                      </a>
                      {review.placeCity && <span className="block text-[10px] text-ink-400">{review.placeCity}</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={{ avatar: review.authorAvatar, name: review.authorName }} size={28} />
                        <div className="min-w-0">
                          <p className="font-bold text-ink-800 truncate max-w-[140px]">{review.authorName}</p>
                          {review.authorHandle && (
                            <p className="text-[10px] text-ink-400 truncate max-w-[140px]">{review.authorHandle}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4"><RatingStars rating={review.rating} /></td>

                    <td
                      className="py-3.5 px-4 max-w-[280px] text-xs text-ink-700 line-clamp-2 cursor-pointer hover:text-clay-700"
                      onClick={() => setDetailReview(review)}
                      title="Bấm để xem đầy đủ nhận xét"
                    >
                      {review.comment || <span className="italic text-ink-300">(không có nội dung chữ)</span>}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-ink-500 whitespace-nowrap">{fmtDate(review.createdAt)}</td>

                    <td className="py-3.5 px-4 text-center">
                      {review.isHidden ? (
                        <span className="px-2 py-0.5 rounded-[4px] bg-clay-50 text-clay-800 border border-clay-200 text-[10px] font-bold">ĐÃ ẨN</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">HIỂN THỊ</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleHideToggle(review)}
                          disabled={actionInProgress === review.id}
                          title={review.isHidden ? 'Hiện lại đánh giá' : 'Ẩn đánh giá khỏi trang công khai'}
                          className={`p-1.5 rounded-[4px] border transition-colors cursor-pointer disabled:opacity-40 ${
                            review.isHidden
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-clay-50 text-clay-700 border-clay-200 hover:bg-clay-100'
                          }`}
                        >
                          {review.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(review)}
                          disabled={actionInProgress === review.id}
                          title="Xóa vĩnh viễn"
                          className="p-1.5 rounded-[4px] bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && pageData.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-ink-200/60 bg-[#F8F4EC]/60 text-xs text-ink-500">
            <span>
              Trang {pageData.number + 1} / {pageData.totalPages} · {pageData.totalElements} đánh giá
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={pageData.number === 0}
                className="p-1.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-ink-700 hover:bg-[#F8F4EC] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pageData.totalPages - 1, p + 1))}
                disabled={pageData.number >= pageData.totalPages - 1}
                className="p-1.5 rounded-[5px] bg-[#FFFDF8] border border-ink-200/80 text-ink-700 hover:bg-[#F8F4EC] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Review Detail Modal ── */}
      {detailReview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setDetailReview(null)}>
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-lg w-full p-6 border border-ink-200 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-ink-200/60 pb-3">
              <div className="flex items-center gap-3">
                <UserAvatar user={{ avatar: detailReview.authorAvatar, name: detailReview.authorName }} size={40} />
                <div>
                  <p className="font-display font-black text-base text-ink-800">{detailReview.authorName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RatingStars rating={detailReview.rating} />
                    <span className="text-[11px] text-ink-400">{fmtDate(detailReview.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetailReview(null)} className="p-1.5 rounded-[5px] text-ink-400 hover:bg-[#F8F4EC] hover:text-ink-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <a
                href={`/places/${detailReview.placeId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#F8F4EC] text-clay-700 text-xs font-bold border border-ink-200/80 hover:bg-clay-50"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {detailReview.placeName} <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <p className="mt-3 text-xs text-ink-700 bg-[#F8F4EC] p-3.5 rounded-[5px] border border-ink-200/60 leading-relaxed whitespace-pre-wrap">
                {detailReview.comment || '(Không có nội dung chữ)'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200/60">
              <button
                onClick={() => handleHideToggle(detailReview)}
                disabled={actionInProgress === detailReview.id}
                className={`px-3.5 py-2 rounded-[5px] text-xs font-bold cursor-pointer disabled:opacity-40 inline-flex items-center gap-1.5 border ${
                  detailReview.isHidden
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-clay-50 text-clay-800 border-clay-200 hover:bg-clay-100'
                }`}
              >
                {detailReview.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{detailReview.isHidden ? 'Hiện lại đánh giá' : 'Tạm ẩn đánh giá'}</span>
              </button>
              <button
                onClick={() => setConfirmDelete(detailReview)}
                className="px-3.5 py-2 rounded-[5px] bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF8] rounded-[6px] max-w-md w-full p-6 border border-ink-200 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[5px] bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-ink-800">Xóa vĩnh viễn đánh giá?</h3>
                <p className="text-xs text-ink-400 mt-1 leading-relaxed">
                  Đánh giá của <strong className="text-ink-800 font-bold">{confirmDelete.authorName}</strong> tại <strong className="text-ink-800 font-bold">{confirmDelete.placeName}</strong> sẽ bị xóa khỏi hệ thống và điểm trung bình của địa điểm được tính toán lại. Thao tác không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200/60">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-[5px] bg-[#F8F4EC] text-ink-700 text-xs font-bold border border-ink-200/80 hover:bg-ink-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                disabled={actionInProgress === confirmDelete.id}
                className="px-4 py-2 rounded-[5px] bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 cursor-pointer disabled:opacity-50"
              >
                {actionInProgress === confirmDelete.id ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReviewsPage;

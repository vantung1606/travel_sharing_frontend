import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../../components/common/Toast';
import { adminReviewApi } from '../../../services/api';
import { Star, Eye, EyeOff, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight, MessageSquare, ShieldAlert, ExternalLink, X } from 'lucide-react';
import { UserAvatar } from '../../../components/common/UserAvatar';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'visible', label: 'Đang hiển thị' },
  { id: 'hidden', label: 'Đã ẩn' }
];

const RatingStars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
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
    const m = await adminReviewApi.getMetrics();
    if (m && m.totalReviews !== undefined) setMetrics(m);
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
    { label: 'Tổng số đánh giá', value: metrics.totalReviews ?? 0, icon: MessageSquare, tone: 'text-sky-600 bg-sky-50' },
    { label: 'Đang hiển thị', value: metrics.visibleReviews ?? 0, icon: Eye, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Đã ẩn (chờ xử lý)', value: metrics.hiddenReviews ?? 0, icon: ShieldAlert, tone: 'text-amber-600 bg-amber-50' }
  ]), [metrics]);

  return (
    <div className="space-y-5">
      {/* Page intro */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kiểm duyệt Đánh giá</h1>
          <p className="text-sm text-slate-500 mt-1">
            {pageData.totalElements} đánh giá từ du khách — ẩn/xóa nội dung vi phạm. Đánh giá bị ẩn không còn tính
            vào điểm trung bình của địa điểm.
          </p>
        </div>
        <button
          onClick={() => loadReviews(true)}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tone}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">{label}</span>
              <div className="font-display font-extrabold text-2xl text-slate-900 mt-0.5">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-slate-100 p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); resetToFirstPage(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchKeyword}
            onChange={(e) => { setSearchKeyword(e.target.value); resetToFirstPage(); }}
            onKeyDown={(e) => e.key === 'Enter' && loadReviews()}
            placeholder="Tìm theo nội dung, tác giả hoặc địa điểm…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); resetToFirstPage(); }}
          className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="all">Mọi số sao</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-14 text-center text-sm text-slate-400 font-semibold">Đang tải đánh giá…</div>
        ) : reviews.length === 0 ? (
          <div className="p-14 text-center">
            <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Không có đánh giá nào phù hợp bộ lọc</p>
            <p className="text-xs text-slate-400 mt-1">Thử đổi thẻ lọc hoặc xóa từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 text-center w-12">STT</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Địa điểm</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Tác giả</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Sao</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Nội dung</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Ngày</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reviews.map((review, idx) => (
                  <tr key={review.id} className={`hover:bg-slate-50/70 transition-colors ${review.isHidden ? 'bg-amber-50/40' : ''}`}>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-bold">{pageData.number * 15 + idx + 1}</td>
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <a
                        href={`/places/${review.placeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-sky-700 hover:underline line-clamp-1 inline-flex items-center gap-1"
                      >
                        {review.placeName}
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      {review.placeCity && <span className="block text-[10px] text-slate-400">{review.placeCity}</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={{ avatar: review.authorAvatar, name: review.authorName }} size={30} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{review.authorName}</p>
                          {review.authorHandle && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{review.authorHandle}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><RatingStars rating={review.rating} /></td>
                    <td
                      className="py-3.5 px-4 max-w-[280px] text-xs text-slate-600 line-clamp-2 cursor-pointer hover:text-sky-700"
                      onClick={() => setDetailReview(review)}
                      title="Bấm để xem đầy đủ"
                    >
                      {review.comment || <span className="italic text-slate-400">(không có nội dung)</span>}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">{fmtDate(review.createdAt)}</td>
                    <td className="py-3.5 px-4 text-center">
                      {review.isHidden ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold">ĐÃ ẨN</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">HIỆN</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleHideToggle(review)}
                          disabled={actionInProgress === review.id}
                          title={review.isHidden ? 'Hiện lại đánh giá' : 'Ẩn đánh giá khỏi trang công khai'}
                          className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
                            review.isHidden
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          {review.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(review)}
                          disabled={actionInProgress === review.id}
                          title="Xóa vĩnh viễn"
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pageData.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-semibold">
              Trang {pageData.number + 1} / {pageData.totalPages} · {pageData.totalElements} đánh giá
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={pageData.number === 0}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pageData.totalPages - 1, p + 1))}
                disabled={pageData.number >= pageData.totalPages - 1}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review detail modal */}
      {detailReview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/50" onClick={() => setDetailReview(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar user={{ avatar: detailReview.authorAvatar, name: detailReview.authorName }} size={42} />
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{detailReview.authorName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RatingStars rating={detailReview.rating} />
                    <span className="text-[11px] text-slate-400">{fmtDate(detailReview.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetailReview(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <a
              href={`/places/${detailReview.placeId}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100"
            >
              <Star className="w-3.5 h-3.5" /> {detailReview.placeName} <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <p className="mt-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {detailReview.comment || '(Không có nội dung chữ)'}
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => handleHideToggle(detailReview)}
                disabled={actionInProgress === detailReview.id}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-40 inline-flex items-center gap-1.5 ${
                  detailReview.isHidden
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {detailReview.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {detailReview.isHidden ? 'Hiện lại' : 'Ẩn đánh giá'}
              </button>
              <button
                onClick={() => setConfirmDelete(detailReview)}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Xóa vĩnh viễn đánh giá?</h3>
            <p className="text-sm text-slate-500 mt-2">
              Đánh giá của <b>{confirmDelete.authorName}</b> tại <b>{confirmDelete.placeName}</b> sẽ bị xóa khỏi hệ
              thống và điểm trung bình của địa điểm được tính lại. Thao tác không thể hoàn tác.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                disabled={actionInProgress === confirmDelete.id}
                className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                Xóa đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

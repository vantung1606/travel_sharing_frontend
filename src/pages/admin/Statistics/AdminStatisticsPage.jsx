import React, { useState, useEffect } from 'react';
import { useToast } from '../../../components/common/Toast';
import {
  Users,
  FileText,
  MapPin,
  Map,
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Star,
  RefreshCw,
  BarChart3,
  Activity,
  ArrowUpRight,
  Loader2,
  Sparkles,
  Compass
} from 'lucide-react';
import { adminApi } from '../../../services/api';

// ─── Mini Bar Chart Component (Paper - Ink - Clay) ───────────────────────────
const BarChart = ({ data, color = '#B0522F', label, metricType = 'items' }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => Number(d.count) || 0), 1);
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">{label}</p>
      )}
      <div className="flex items-end gap-2 h-28 pt-4 pb-1 border-b border-ink-200/60">
        {data.map((item, i) => {
          const count = Number(item.count) || 0;
          const percent = Math.min(100, Math.max(10, Math.round((count / max) * 100)));
          const isLatest = i === data.length - 1;

          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-ink-900 text-[#FFFDF8] px-2 py-0.5 rounded-[4px] text-[10px] font-bold whitespace-nowrap pointer-events-none z-10 border border-ink-800">
                {count.toLocaleString('vi-VN')} {metricType}
              </div>

              {/* Bar Value Header */}
              <span className={`text-[10px] font-bold mb-1 transition-colors ${
                isLatest ? 'text-clay-700 font-black' : 'text-ink-400 group-hover:text-ink-800'
              }`}>
                {count}
              </span>

              {/* Bar column */}
              <div className="w-full max-w-[40px] bg-[#F8F4EC] rounded-t-[3px] border-t border-x border-ink-200/60 overflow-hidden flex flex-col justify-end h-full">
                <div
                  className={`w-full rounded-t-[3px] transition-all duration-500 ease-out ${
                    isLatest
                      ? 'bg-gradient-to-t from-clay-700 to-clay-500'
                      : 'bg-gradient-to-t from-ink-300 to-ink-200 group-hover:from-clay-400 group-hover:to-clay-300'
                  }`}
                  style={{ height: `${percent}%` }}
                />
              </div>

              {/* Month label */}
              <span className="text-[10px] text-ink-500 font-semibold mt-2 block text-center truncate w-full">
                {item.label?.replace('Th', 'T')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── KPI Card (Paper - Ink - Clay) ───────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, trend, loading }) => (
  <div className="bg-[#FFFDF8] rounded-[6px] p-5 border border-ink-200/80 flex flex-col justify-between gap-3 relative transition-colors hover:border-ink-300">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-ink-400">{label}</span>
      <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div>
      {loading ? (
        <div className="h-8 w-24 bg-[#F8F4EC] animate-pulse rounded-[4px] mb-1.5" />
      ) : (
        <div className="font-display font-black text-3xl text-ink-800 leading-none mb-1.5">
          {value}
        </div>
      )}
      {sub && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-500">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  </div>
);

// ─── Top List Item (Paper - Ink - Clay) ──────────────────────────────────────
const TopListItem = ({ rank, name, value, suffix = '', bar, maxBar }) => (
  <div className="flex items-center gap-3 py-2 px-2.5 rounded-[5px] hover:bg-[#F8F4EC]/60 transition-colors">
    <span className={`w-5 h-5 rounded-[4px] flex items-center justify-center text-[10px] font-extrabold shrink-0 border ${
      rank === 1 ? 'bg-amber-100 text-amber-800 border-amber-300' :
      rank === 2 ? 'bg-ink-100 text-ink-700 border-ink-300' :
      rank === 3 ? 'bg-clay-100 text-clay-800 border-clay-300' :
      'bg-[#FFFDF8] text-ink-500 border-ink-200/80'
    }`}>
      #{rank}
    </span>
    <div className="flex-1 min-w-0">
      <p className="font-display font-bold text-xs text-ink-800 truncate">{name}</p>
      {maxBar > 0 && (
        <div className="w-full bg-ink-200/50 rounded-full h-1.5 mt-1.5">
          <div
            className="bg-clay-600 h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.round((bar / maxBar) * 100))}%` }}
          />
        </div>
      )}
    </div>
    <span className="font-display font-bold text-xs text-clay-700 shrink-0">
      {value}{suffix && <span className="font-sans font-normal text-ink-400 text-[11px] ml-0.5">{suffix}</span>}
    </span>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AdminStatisticsPage = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStats();
      setStats(data);
      setLastUpdated(new Date());
      toast.success('Dữ liệu thống kê đã được cập nhật!');
    } catch (err) {
      console.error('Stats fetch error:', err);
      toast.error('Không thể tải dữ liệu thống kê. Kiểm tra kết nối backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fmt = (n) => {
    if (n === undefined || n === null) return '—';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString('vi-VN');
  };

  const fmtRating = (r) => r ? Number(r).toFixed(1) : '—';

  const maxDest = stats?.topDestinations?.[0]?.count || 1;
  const maxPlace = stats?.topPlaces?.[0]?.reviewCount || 1;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">

      {/* ── Page Header ── */}
      <div className="bg-[#FFFDF8] rounded-[6px] p-5 sm:p-6 border border-ink-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-[4px] bg-clay-50 text-clay-700 font-bold text-[10px] uppercase tracking-wider border border-clay-200/60">
              Ban Quản Trị
            </span>
            <span className="text-ink-200">/</span>
            <span className="font-bold text-xs text-clay-700">Báo cáo & Thống kê hệ thống</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-ink-800 tracking-tight">
            Tổng quan Thống kê Hệ thống
          </h1>
          <p className="text-xs text-ink-400 mt-1">
            Dữ liệu thống kê thực tế từ CSDL MySQL · Người dùng, Bài viết, Địa điểm, Hành trình
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-ink-400">
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
          <button
            id="btn-refresh-stats"
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] rounded-[5px] text-xs font-bold border border-clay-600 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />
            }
            <span>{loading ? 'Đang tải...' : 'Làm mới số liệu'}</span>
          </button>
        </div>
      </div>

      {/* ── KPI Overview Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          icon={Users}
          label="Tổng người dùng"
          value={fmt(stats?.totalUsers)}
          sub={`+${fmt(stats?.newUsersThisMonth)} thành viên tháng này`}
          trend="up"
          loading={loading}
        />
        <KpiCard
          icon={FileText}
          label="Tổng bài viết"
          value={fmt(stats?.totalPosts)}
          sub={`+${fmt(stats?.newPostsThisMonth)} bài chia sẻ mới`}
          trend="up"
          loading={loading}
        />
        <KpiCard
          icon={MapPin}
          label="Địa điểm du lịch"
          value={fmt(stats?.totalPlaces)}
          sub={`Điểm đánh giá TB: ${fmtRating(stats?.averagePlaceRating)} ★`}
          loading={loading}
        />
        <KpiCard
          icon={Map}
          label="Lịch trình du lịch"
          value={fmt(stats?.totalItineraries)}
          sub={`${fmt(stats?.activeItineraries)} hành trình đang hoạt động`}
          trend="up"
          loading={loading}
        />
      </div>

      {/* ── Engagement Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-[#FFFDF8] rounded-[6px] p-5 border border-ink-200/80 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-rose-100" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-400">Tổng lượt thích (Likes)</p>
            {loading ? (
              <div className="h-7 w-16 bg-[#F8F4EC] animate-pulse rounded-[4px] mt-1" />
            ) : (
              <p className="font-display font-black text-2xl text-ink-800 mt-0.5">{fmt(stats?.totalLikes)}</p>
            )}
          </div>
        </div>

        <div className="bg-[#FFFDF8] rounded-[6px] p-5 border border-ink-200/80 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-400">Tổng bình luận (Comments)</p>
            {loading ? (
              <div className="h-7 w-16 bg-[#F8F4EC] animate-pulse rounded-[4px] mt-1" />
            ) : (
              <p className="font-display font-black text-2xl text-ink-800 mt-0.5">{fmt(stats?.totalComments)}</p>
            )}
          </div>
        </div>

        <div className="bg-[#FFFDF8] rounded-[6px] p-5 border border-ink-200/80 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-300 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-400">Rating trung bình địa điểm</p>
            {loading ? (
              <div className="h-7 w-16 bg-[#F8F4EC] animate-pulse rounded-[4px] mt-1" />
            ) : (
              <p className="font-display font-black text-2xl text-ink-800 mt-0.5">
                {fmtRating(stats?.averagePlaceRating)} <span className="text-base text-amber-500">★</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-[#FFFDF8] rounded-[6px] p-5 sm:p-6 border border-ink-200/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-ink-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-ink-800">Tăng trưởng Thành viên</h3>
                <p className="text-[11px] text-ink-400">Số lượng tài khoản đăng ký theo 6 tháng gần nhất</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{fmt(stats?.newUsersThisMonth)} tháng này</span>
            </span>
          </div>
          {loading ? (
            <div className="h-28 bg-[#F8F4EC] animate-pulse rounded-[5px]" />
          ) : (
            <BarChart data={stats?.userGrowth} color="#B0522F" label="Thành viên đăng ký mới" metricType="thành viên" />
          )}
        </div>

        {/* Post Growth Chart */}
        <div className="bg-[#FFFDF8] rounded-[6px] p-5 sm:p-6 border border-ink-200/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-ink-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-ink-800">Hoạt động Đăng bài Viết</h3>
                <p className="text-[11px] text-ink-400">Số lượng bài chia sẻ kinh nghiệm theo chu kỳ 6 tháng</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-clay-700 bg-clay-50 px-2 py-0.5 rounded-[4px] border border-clay-200">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{fmt(stats?.newPostsThisMonth)} tháng này</span>
            </span>
          </div>
          {loading ? (
            <div className="h-28 bg-[#F8F4EC] animate-pulse rounded-[5px]" />
          ) : (
            <BarChart data={stats?.postGrowth} color="#B0522F" label="Bài viết mới xuất bản" metricType="bài viết" />
          )}
        </div>
      </div>

      {/* ── Top Lists Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <div className="bg-[#FFFDF8] rounded-[6px] p-5 sm:p-6 border border-ink-200/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-ink-200/60">
            <div className="w-8 h-8 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-ink-800">Top Điểm đến Phổ biến</h3>
              <p className="text-[11px] text-ink-400">Dựa trên số lượng hành trình du lịch được khởi tạo</p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-9 bg-[#F8F4EC] animate-pulse rounded-[5px]" />
              ))}
            </div>
          ) : stats?.topDestinations?.length > 0 ? (
            <div className="space-y-1">
              {stats.topDestinations.map((dest, i) => (
                <TopListItem
                  key={i}
                  rank={i + 1}
                  name={dest.destination}
                  value={dest.count}
                  suffix=" chuyến đi"
                  bar={dest.count}
                  maxBar={maxDest}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-ink-400 text-xs">
              <Map className="w-8 h-8 mx-auto mb-2 opacity-30 text-ink-400" />
              <p>Chưa ghi nhận đủ dữ liệu hành trình.</p>
            </div>
          )}
        </div>

        {/* Top Places by Rating */}
        <div className="bg-[#FFFDF8] rounded-[6px] p-5 sm:p-6 border border-ink-200/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-ink-200/60">
            <div className="w-8 h-8 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-ink-800">Top Địa điểm Đánh giá Cao</h3>
              <p className="text-[11px] text-ink-400">Theo điểm số trung bình và số lượt nhận xét từ du khách</p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-9 bg-[#F8F4EC] animate-pulse rounded-[5px]" />
              ))}
            </div>
          ) : stats?.topPlaces?.length > 0 ? (
            <div className="space-y-1">
              {stats.topPlaces.map((place, i) => (
                <TopListItem
                  key={i}
                  rank={i + 1}
                  name={`${place.name}${place.city ? ` · ${place.city}` : ''}`}
                  value={Number(place.rating || 0).toFixed(1)}
                  suffix="★"
                  bar={place.reviewCount}
                  maxBar={maxPlace}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-ink-400 text-xs">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-30 text-ink-400" />
              <p>Chưa ghi nhận dữ liệu đánh giá địa danh.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Itinerary Distribution Row ── */}
      <div className="bg-[#FFFDF8] rounded-[6px] p-5 sm:p-6 border border-ink-200/80 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-ink-200/60">
          <div className="w-8 h-8 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 text-clay-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-black text-base text-ink-800">Phân bổ Hành trình & Tăng trưởng</h3>
            <p className="text-[11px] text-ink-400">Trạng thái toàn bộ hành trình và chu kỳ phát triển hệ thống</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Tổng hành trình', value: stats?.totalItineraries, color: 'text-ink-800' },
            { label: 'Đang hoạt động', value: stats?.activeItineraries, color: 'text-emerald-700' },
            { label: 'Mới tháng này', value: stats?.newItinerariesThisMonth, color: 'text-clay-700' },
            { label: 'Người dùng mới', value: stats?.newUsersThisMonth, color: 'text-ink-800' },
          ].map((item, i) => (
            <div key={i} className="bg-[#F8F4EC] rounded-[6px] p-4 text-center border border-ink-200/60">
              <p className="text-[11px] font-bold text-ink-400 mb-1">{item.label}</p>
              {loading ? (
                <div className="h-7 w-14 bg-ink-200/60 animate-pulse rounded-[4px] mx-auto" />
              ) : (
                <p className={`font-display font-black text-2xl ${item.color}`}>{fmt(item.value)}</p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

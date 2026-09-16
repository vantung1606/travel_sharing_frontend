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
  Loader2
} from 'lucide-react';
import { adminApi } from '../../../services/api';

// ─── Mini Bar Chart Component ─────────────────────────────────────────────────
const BarChart = ({ data, color = '#6366f1', label }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="space-y-1">
      {label && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>}
      <div className="flex items-end gap-1.5 h-20">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              className="w-full rounded-t-md transition-all duration-500 hover:opacity-80 cursor-default"
              style={{
                height: `${Math.max((item.count / max) * 70, 4)}px`,
                backgroundColor: color,
                opacity: 0.7 + 0.3 * (i / data.length)
              }}
              title={`${item.label}: ${item.count}`}
            />
            <span className="text-[8px] text-slate-400 whitespace-nowrap">{item.label?.replace('Th', 'T')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color, bgColor, trend, loading }) => (
  <div className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-24 h-24 ${bgColor} rounded-full -translate-y-8 translate-x-8 opacity-30 blur-xl pointer-events-none`} />
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <div className={`w-10 h-10 rounded-xl ${bgColor} ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      {loading ? (
        <div className="h-9 w-16 bg-slate-100 animate-pulse rounded-lg mb-1.5" />
      ) : (
        <div className={`font-display font-extrabold text-3xl ${color.replace('text-', 'text-').replace('-600', '-700').replace('-500', '-700')} leading-none mb-1.5`}>
          {value}
        </div>
      )}
      {sub && (
        <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  </div>
);

// ─── Top List Item ────────────────────────────────────────────────────────────
const TopListItem = ({ rank, name, value, suffix = '', bar, maxBar }) => (
  <div className="flex items-center gap-3 py-2">
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
      rank === 1 ? 'bg-amber-400 text-white' :
      rank === 2 ? 'bg-slate-300 text-slate-700' :
      rank === 3 ? 'bg-amber-600/80 text-white' :
      'bg-slate-100 text-slate-500'
    }`}>{rank}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-800 truncate">{name}</p>
      {maxBar > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${(bar / maxBar) * 100}%` }}
          />
        </div>
      )}
    </div>
    <span className="text-xs font-extrabold text-slate-700 shrink-0">{value}{suffix && <span className="font-normal text-slate-400 ml-0.5">{suffix}</span>}</span>
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
    return n.toString();
  };

  const fmtRating = (r) => r ? r.toFixed(1) : '—';

  const maxDest = stats?.topDestinations?.[0]?.count || 1;
  const maxPlace = stats?.topPlaces?.[0]?.reviewCount || 1;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[11px] uppercase tracking-wide border border-indigo-100">
              Ban Quản Trị
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-extrabold text-xs text-indigo-600">Thống kê hệ thống</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            Tổng quan Thống kê Hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu thống kê thực tế từ CSDL · Người dùng, Bài viết, Địa điểm, Hành trình
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
          <button
            id="btn-refresh-stats"
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />
            }
            <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* ── KPI Overview Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Tổng người dùng"
          value={fmt(stats?.totalUsers)}
          sub={`+${fmt(stats?.newUsersThisMonth)} tháng này`}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
          trend="up"
          loading={loading}
        />
        <KpiCard
          icon={FileText}
          label="Tổng bài viết"
          value={fmt(stats?.totalPosts)}
          sub={`+${fmt(stats?.newPostsThisMonth)} tháng này`}
          color="text-sky-600"
          bgColor="bg-sky-50"
          trend="up"
          loading={loading}
        />
        <KpiCard
          icon={MapPin}
          label="Địa điểm du lịch"
          value={fmt(stats?.totalPlaces)}
          sub={`Rating TB: ${fmtRating(stats?.averagePlaceRating)} ★`}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          loading={loading}
        />
        <KpiCard
          icon={Map}
          label="Hành trình"
          value={fmt(stats?.totalItineraries)}
          sub={`${fmt(stats?.activeItineraries)} đang hoạt động`}
          color="text-amber-600"
          bgColor="bg-amber-50"
          trend="up"
          loading={loading}
        />
      </div>

      {/* ── Engagement Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Tổng lượt thích</p>
            {loading
              ? <div className="h-7 w-12 bg-slate-100 animate-pulse rounded mt-1" />
              : <p className="font-display font-extrabold text-2xl text-slate-900">{fmt(stats?.totalLikes)}</p>
            }
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Tổng bình luận</p>
            {loading
              ? <div className="h-7 w-12 bg-slate-100 animate-pulse rounded mt-1" />
              : <p className="font-display font-extrabold text-2xl text-slate-900">{fmt(stats?.totalComments)}</p>
            }
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Rating trung bình địa điểm</p>
            {loading
              ? <div className="h-7 w-12 bg-slate-100 animate-pulse rounded mt-1" />
              : <p className="font-display font-extrabold text-2xl text-slate-900">{fmtRating(stats?.averagePlaceRating)} <span className="text-base text-amber-400">★</span></p>
            }
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">Tăng trưởng Người dùng</h3>
                <p className="text-[10px] text-slate-400">6 tháng gần nhất</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{fmt(stats?.newUsersThisMonth)} tháng này</span>
            </span>
          </div>
          {loading ? (
            <div className="h-20 bg-slate-50 animate-pulse rounded-xl" />
          ) : (
            <BarChart data={stats?.userGrowth} color="#6366f1" label="Số người dùng đăng ký mới" />
          )}
        </div>

        {/* Post Growth Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900">Hoạt động Bài viết</h3>
                <p className="text-[10px] text-slate-400">6 tháng gần nhất</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-sky-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{fmt(stats?.newPostsThisMonth)} tháng này</span>
            </span>
          </div>
          {loading ? (
            <div className="h-20 bg-slate-50 animate-pulse rounded-xl" />
          ) : (
            <BarChart data={stats?.postGrowth} color="#0ea5e9" label="Số bài viết mới" />
          )}
        </div>
      </div>

      {/* ── Top Lists Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-900">Top Điểm đến Phổ biến</h3>
              <p className="text-[10px] text-slate-400">Dựa trên số lượng hành trình được tạo</p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-8 bg-slate-50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : stats?.topDestinations?.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {stats.topDestinations.map((dest, i) => (
                <TopListItem
                  key={i}
                  rank={i + 1}
                  name={dest.destination}
                  value={dest.count}
                  suffix=" hành trình"
                  bar={dest.count}
                  maxBar={maxDest}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Map className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Chưa có dữ liệu hành trình</p>
            </div>
          )}
        </div>

        {/* Top Places by Rating */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-900">Top Địa điểm được đánh giá cao</h3>
              <p className="text-[10px] text-slate-400">Theo điểm trung bình từ người dùng</p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-8 bg-slate-50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : stats?.topPlaces?.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {stats.topPlaces.map((place, i) => (
                <TopListItem
                  key={i}
                  rank={i + 1}
                  name={`${place.name}${place.city ? ` · ${place.city}` : ''}`}
                  value={place.rating.toFixed(1)}
                  suffix="★"
                  bar={place.reviewCount}
                  maxBar={maxPlace}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Chưa có dữ liệu địa điểm</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Itinerary Status Row ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm text-slate-900">Phân bổ Hành trình</h3>
            <p className="text-[10px] text-slate-400">Trạng thái toàn bộ hành trình trong hệ thống</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Tổng hành trình', value: stats?.totalItineraries, color: 'text-slate-700', bg: 'bg-slate-50' },
            { label: 'Đang hoạt động', value: stats?.activeItineraries, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Mới tháng này', value: stats?.newItinerariesThisMonth, color: 'text-indigo-700', bg: 'bg-indigo-50' },
            { label: 'Người dùng mới TM', value: stats?.newUsersThisMonth, color: 'text-sky-700', bg: 'bg-sky-50' },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-xl p-4 text-center`}>
              <p className="text-[10px] font-bold text-slate-500 mb-1">{item.label}</p>
              {loading
                ? <div className="h-8 w-12 bg-white/60 animate-pulse rounded mx-auto" />
                : <p className={`font-display font-extrabold text-2xl ${item.color}`}>{fmt(item.value)}</p>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

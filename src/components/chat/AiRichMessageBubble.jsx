import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Heart,
  MapPin,
  Route,
  FileText,
  ExternalLink,
  Check,
  Loader2,
  ArrowRight,
  Calendar,
  Wallet,
  Users,
  MessageCircleQuestion,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { itineraryApi, savedPlaceApi, postApi } from '../../services/api';
import { useApp } from '../../context/AppContext';

function FormattedReplyText({ text }) {
  if (!text) return null;
  let safeText = String(text);
  // Bảo vệ cho cả các tin nhắn cũ lỡ chứa JSON thô bị cắt ngang
  if (safeText.includes('"reply"') && safeText.includes('{')) {
    const match = safeText.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (match && match[1]) {
      try {
        safeText = JSON.parse(`"${match[1]}"`);
      } catch {
        safeText = match[1];
      }
    } else {
      const idx = safeText.indexOf('{');
      if (idx > 15) safeText = safeText.slice(0, idx).trim();
    }
  }
  const cleanedText = safeText.replace(/\s*\((?:placeId|itineraryId|detailId|postId)\s*:\s*\d+\)/gi, '');
  const lines = cleanedText.split('\n');

  return (
    <div className="space-y-1.5 text-[12.5px] leading-relaxed text-ink-800">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        const isDayHeading = /^-?\s*Ngày\s+\d+[:.]/i.test(trimmed);
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p
            key={i}
            className={`break-words ${isDayHeading ? 'font-bold text-clay-800 pt-1' : ''}`}
          >
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                return (
                  <strong key={j} className="font-bold text-ink-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <React.Fragment key={j}>{part.replace(/\*\*/g, '')}</React.Fragment>;
            })}
          </p>
        );
      })}
    </div>
  );
}

const ACTION_STYLE_MAP = {
  CREATE_ITINERARY: {
    icon: Sparkles,
    cls: 'bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] border-clay-600 shadow-xs'
  },
  ADD_ITINERARY_STOP: {
    icon: Plus,
    cls: 'bg-emerald-600 hover:bg-emerald-700 text-[#FFFDF8] border-emerald-600 shadow-xs'
  },
  SAVE_PLACE: {
    icon: Heart,
    cls: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
  },
  UNSAVE_PLACE: {
    icon: Heart,
    cls: 'bg-ink-50 hover:bg-ink-100 text-ink-700 border-ink-200'
  },
  UPDATE_ITINERARY: {
    icon: Pencil,
    cls: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
  },
  UPDATE_ITINERARY_STOP: {
    icon: Pencil,
    cls: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
  },
  DELETE_ITINERARY: {
    icon: Trash2,
    cls: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
  },
  DELETE_ITINERARY_STOP: {
    icon: Trash2,
    cls: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
  },
  OPEN_PLACE: {
    icon: MapPin,
    cls: 'bg-[#FAF7F0] hover:bg-clay-50 text-ink-800 border-ink-200'
  },
  OPEN_ITINERARY: {
    icon: Route,
    cls: 'bg-[#FAF7F0] hover:bg-clay-50 text-ink-800 border-ink-200'
  },
  OPEN_POST: {
    icon: FileText,
    cls: 'bg-[#FAF7F0] hover:bg-clay-50 text-ink-800 border-ink-200'
  },
  NAVIGATE: {
    icon: ExternalLink,
    cls: 'bg-[#FAF7F0] hover:bg-clay-50 text-ink-800 border-ink-200'
  },
  CLONE_ITINERARY: {
    icon: Plus,
    cls: 'bg-clay-50 hover:bg-clay-100 text-clay-800 border-clay-200'
  },
  TOGGLE_ITINERARY_VISIBILITY: {
    icon: ExternalLink,
    cls: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
  },
  CREATE_POST: {
    icon: FileText,
    cls: 'bg-clay-600 hover:bg-clay-700 text-[#FFFDF8] border-clay-600 shadow-xs'
  }
};

function formatCurrency(val) {
  const num = Number(val);
  if (!num || Number.isNaN(num)) return null;
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
}

function getCoverImageByDestination(dest = '') {
  const d = String(dest).toLowerCase();
  if (d.includes('đà lạt') || d.includes('da lat')) return 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('hội an') || d.includes('hoi an') || d.includes('đà nẵng')) return 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('phú quốc') || d.includes('phu quoc') || d.includes('nha trang')) return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('hà giang') || d.includes('sa pa') || d.includes('sapa')) return 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('hạ long') || d.includes('ninh bình')) return 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('nghệ an') || d.includes('nam đàn') || d.includes('hà tĩnh')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
  return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
}

function normalizeGroupType(val = '') {
  const v = String(val).toLowerCase();
  if (v.includes('1 mình') || v.includes('solo') || v.includes('cá nhân')) return 'Cá nhân';
  if (v.includes('cặp đôi') || v.includes('người yêu')) return 'Cặp đôi';
  if (v.includes('gia đình')) return 'Gia đình';
  if (v.includes('bạn')) return 'Bạn bè';
  return val || 'Cá nhân';
}

function formatBackendTime(val) {
  if (!val) return '08:30:00';
  const clean = String(val).trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(clean)) return clean;
  if (/^\d{2}:\d{2}$/.test(clean)) return `${clean}:00`;
  return '08:30:00';
}

function getDefaultDates(durationDays = 2) {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + Math.max(1, Number(durationDays) || 2) - 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
}

/**
 * Card đề xuất lịch trình chuyên nghiệp: hiển thị đầy đủ các chặng theo ngày,
 * cho phép chỉnh sửa nhanh (Tiêu đề, Ngày đi, Ngân sách, Công khai) trước khi lưu vào DB.
 */
function ItineraryProposalCard({
  action,
  idx,
  isLoading,
  doneInfo,
  onSaveItinerary,
  onNavigate
}) {
  const p = action.payload || {};
  const defaults = getDefaultDates(p.durationDays);

  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(p.title || `Khám phá ${p.destination || 'Việt Nam'}`);
  const [startDate, setStartDate] = useState(p.startDate || defaults.startDate);
  const [budgetTotal, setBudgetTotal] = useState(p.budgetTotal ? String(p.budgetTotal) : '3000000');
  const [status, setStatus] = useState((p.status || 'ACTIVE').toUpperCase());
  const [isPublic, setIsPublic] = useState(p.isPublic !== false);
  const [editableDetails, setEditableDetails] = useState(Array.isArray(p.details) ? p.details : []);

  const details = editableDetails;
  const estimatedStopsSum = details.reduce((sum, d) => sum + (Number(d.estimatedCost) || 0), 0);
  const daysCount = Math.max(1, Number(p.durationDays) || (details.length > 0 ? Math.max(...details.map(d => Number(d.dayNumber) || 1)) : 2));

  // Tính ngày kết thúc từ startDate + daysCount
  const computedEndDate = (() => {
    try {
      const s = new Date(startDate);
      if (Number.isNaN(s.getTime())) return defaults.endDate;
      s.setDate(s.getDate() + daysCount - 1);
      return s.toISOString().slice(0, 10);
    } catch {
      return defaults.endDate;
    }
  })();

  // Nhóm chặng dừng theo ngày
  const groupedByDay = details.reduce((acc, item) => {
    const day = Number(item.dayNumber) || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
  const dayKeys = Object.keys(groupedByDay).map(Number).sort((a, b) => a - b);

  const handleRemoveStop = (targetItem) => {
    setEditableDetails(prev => prev.filter(item => item !== targetItem));
  };

  const handleConfirmSave = () => {
    onSaveItinerary(
      {
        ...action,
        payload: {
          ...p,
          title: title.trim() || `Khám phá ${p.destination || 'Việt Nam'}`,
          startDate,
          endDate: computedEndDate,
          durationDays: daysCount,
          budgetTotal: Number(budgetTotal) || 0,
          status,
          isPublic,
          details: editableDetails
        }
      },
      idx
    );
  };

  return (
    <div className="rounded-[8px] border border-clay-200 bg-gradient-to-br from-[#FAF7F0] to-[#FFFDF8] p-3.5 space-y-3 shadow-2xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-clay-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Kế hoạch chuyến đi đề xuất</span>
          </div>
          <h4 className="text-[13.5px] font-bold text-ink-900 mt-0.5 leading-snug">
            {title}
          </h4>
        </div>
        {!doneInfo && (
          <button
            type="button"
            onClick={() => setIsEditing(v => !v)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-semibold bg-white hover:bg-clay-50 text-ink-700 border border-ink-200 cursor-pointer shrink-0"
            title="Chỉnh sửa nhanh trước khi lưu"
          >
            <Pencil className="w-3 h-3" />
            <span>{isEditing ? 'Đóng sửa' : 'Chỉnh sửa'}</span>
          </button>
        )}
      </div>

      {/* Metadata tóm tắt 1 dòng gọn gàng */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-500">
        {p.destination && <span className="font-medium text-ink-700">{p.destination}</span>}
        <span>· {daysCount} ngày ({startDate} → {computedEndDate})</span>
        {p.groupType && <span>· {p.groupType}</span>}
        {formatCurrency(budgetTotal) && <span className="font-semibold text-emerald-700">· ~{formatCurrency(budgetTotal)}</span>}
      </div>

      {/* Form chỉnh nhanh trước khi lưu */}
      {isEditing && !doneInfo && (
        <div className="p-2.5 rounded-[6px] bg-white border border-clay-200/80 space-y-2 text-[11px]">
          <div>
            <label className="block font-bold text-ink-600 mb-0.5">Tên lịch trình</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-ink-200 text-ink-800 outline-none focus:border-clay-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-ink-600 mb-0.5">Ngày khởi hành</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-ink-200 text-ink-800 outline-none focus:border-clay-500"
              />
            </div>
            <div>
              <label className="block font-bold text-ink-600 mb-0.5">Ngân sách dự kiến (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="100000"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-ink-200 text-ink-800 outline-none focus:border-clay-500"
              />
            </div>
            <div>
              <label className="block font-bold text-ink-600 mb-0.5">Trạng thái lưu</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-ink-200 text-ink-800 bg-white outline-none focus:border-clay-500"
              >
                <option value="ACTIVE">Sắp tới (Kích hoạt)</option>
                <option value="DRAFT">Bản nháp</option>
              </select>
            </div>
          </div>
          <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-ink-700 pt-0.5">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="accent-clay-600"
            />
            <span>Công khai lịch trình cho cộng đồng tham khảo</span>
          </label>
        </div>
      )}

      {/* Danh sách chi tiết các chặng theo từng ngày */}
      {dayKeys.length > 0 && (
        <div className="rounded-[6px] bg-white border border-ink-200/70 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsExpanded(v => !v)}
            className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-ink-700 bg-[#FAF7F0]/70 hover:bg-[#FAF7F0] border-b border-ink-200/50 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-clay-600" />
              Chi tiết lịch trình ({details.length} chặng{estimatedStopsSum > 0 ? ` · Dự kiến ${formatCurrency(estimatedStopsSum)}` : ''})
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="p-2.5 space-y-2.5 max-h-64 overflow-y-auto">
              {dayKeys.map((dayNum) => {
                const stops = groupedByDay[dayNum];
                const dayTitle = stops[0]?.dayTitle;
                return (
                  <div key={dayNum} className="space-y-1.5">
                    <div className="text-[11px] font-bold text-clay-700 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-clay-100 text-clay-800">Ngày {dayNum}</span>
                      {dayTitle && <span className="text-ink-600 font-semibold truncate">— {dayTitle}</span>}
                    </div>
                    <div className="pl-2 border-l-2 border-clay-200 space-y-1.5">
                      {stops.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-start justify-between gap-2 text-[11px] bg-[#FAF7F0]/50 rounded px-2 py-1.5">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-ink-900 flex items-center gap-1.5 flex-wrap">
                              {s.startTime && (
                                <span className="text-[10.5px] font-bold text-clay-700 tabular-nums">
                                  {s.startTime}
                                </span>
                              )}
                              <span>{s.locationName}</span>
                            </div>
                            {(s.note || s.aiTip) && (
                              <p className="text-[10.5px] text-ink-500 mt-0.5 leading-snug">
                                {s.note || s.aiTip}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {Number(s.estimatedCost) > 0 && (
                              <span className="text-[10.5px] font-semibold text-emerald-700">
                                {formatCurrency(s.estimatedCost)}
                              </span>
                            )}
                            {isEditing && !doneInfo && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStop(s)}
                                className="p-0.5 rounded text-ink-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Bỏ chặng này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Nút Lưu / Mở trang Lịch trình */}
      {doneInfo ? (
        <button
          type="button"
          onClick={() => onNavigate(doneInfo.itineraryId ? `/itineraries?id=${doneInfo.itineraryId}` : '/itineraries')}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-[11.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{doneInfo.label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          type="button"
          disabled={isLoading}
          onClick={handleConfirmSave}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-[11.5px] font-bold bg-clay-600 hover:bg-clay-700 disabled:opacity-50 text-[#FFFDF8] transition-colors cursor-pointer shadow-xs"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Lưu vào Lịch trình của tôi</span>
        </button>
      )}
    </div>
  );
}

/**
 * Thẻ Thêm điểm dừng thông minh: hiển thị rõ tên địa điểm, chi phí, ghi chú,
 * và cho phép chọn chính xác Lịch trình đích, Ngày thứ mấy, Giờ nào trước khi thêm.
 */
function AddStopActionCard({
  action,
  idx,
  itineraries,
  isLoading,
  doneInfo,
  onAddStop,
  onNavigate
}) {
  const p = action.payload || {};
  const list = Array.isArray(itineraries) ? itineraries : [];

  const initialItinId = (() => {
    if (p.itineraryId && list.some(it => String(it.id) === String(p.itineraryId))) {
      return String(p.itineraryId);
    }
    return list[0]?.id ? String(list[0].id) : (p.itineraryId ? String(p.itineraryId) : '');
  })();

  const [selectedItinId, setSelectedItinId] = useState(initialItinId);
  const [dayNumber, setDayNumber] = useState(Number(p.dayNumber) || 1);
  const [startTime, setStartTime] = useState(
    p.startTime && /^\d{2}:\d{2}/.test(p.startTime) ? p.startTime.slice(0, 5) : '12:00'
  );

  const selectedItin = list.find(it => String(it.id) === String(selectedItinId));
  const maxDays = Math.max(
    3,
    Number(selectedItin?.daysCount) || (Array.isArray(selectedItin?.days) ? selectedItin.days.length : 1),
    dayNumber
  );
  const targetTitle = selectedItin?.title || p.itineraryTitle || (selectedItinId ? `Lịch trình #${selectedItinId}` : 'Chưa có lịch trình');

  return (
    <div className="rounded-[7px] border border-emerald-200/90 bg-[#F4FBF7] p-3 space-y-2 text-[11.5px]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-ink-900 flex items-center gap-1.5 flex-wrap">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{p.locationName || action.label || 'Điểm dừng mới'}</span>
            {p.category && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-emerald-700">
                {p.category}
              </span>
            )}
          </div>
          {(p.locationAddress || p.note) && (
            <p className="text-[11px] text-ink-600 mt-0.5 leading-snug">
              {[p.locationAddress, p.note].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        {Number(p.estimatedCost) > 0 && (
          <span className="text-[11px] font-bold text-emerald-700 shrink-0">
            ~{formatCurrency(p.estimatedCost)}
          </span>
        )}
      </div>

      {/* Chọn Lịch trình đích + Ngày + Giờ rõ ràng */}
      {!doneInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 pt-1">
          <div className="sm:col-span-6">
            <label className="block text-[10px] font-bold text-ink-500 mb-0.5">Thêm vào lịch trình</label>
            {list.length > 0 ? (
              <select
                value={selectedItinId}
                onChange={(e) => setSelectedItinId(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-[11px] font-medium text-ink-800 outline-none focus:border-emerald-500"
              >
                {list.map(it => (
                  <option key={it.id} value={String(it.id)}>
                    {it.title} ({it.destination})
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-2 py-1.5 rounded border border-amber-200 bg-amber-50 text-[11px] text-amber-800">
                {targetTitle}
              </div>
            )}
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-ink-500 mb-0.5">Ngày</label>
            <select
              value={dayNumber}
              onChange={(e) => setDayNumber(Number(e.target.value))}
              className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-[11px] font-medium text-ink-800 outline-none focus:border-emerald-500"
            >
              {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Ngày {d}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-ink-500 mb-0.5">Giờ</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-[11px] font-medium text-ink-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {doneInfo ? (
        <button
          type="button"
          onClick={() => doneInfo.itineraryId && onNavigate(`/itineraries?id=${doneInfo.itineraryId}`)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{doneInfo.label}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ) : (
        <button
          type="button"
          disabled={isLoading || !selectedItinId}
          onClick={() =>
            onAddStop(
              {
                ...action,
                payload: {
                  ...p,
                  itineraryId: Number(selectedItinId),
                  itineraryTitle: targetTitle,
                  dayNumber,
                  startTime
                }
              },
              idx
            )
          }
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>
            {selectedItinId
              ? `Thêm vào Ngày ${dayNumber} (${startTime}) · ${targetTitle}`
              : 'Vui lòng tạo lịch trình trước khi thêm điểm dừng'}
          </span>
        </button>
      )}
    </div>
  );
}

function AddExpenseActionCard({
  action,
  idx,
  itineraries,
  isLoading,
  doneInfo,
  onAddExpense,
  onNavigate
}) {
  const p = action.payload || {};
  const list = Array.isArray(itineraries) ? itineraries : [];
  const initialItinId = p.itineraryId && list.some(it => String(it.id) === String(p.itineraryId))
    ? String(p.itineraryId)
    : (list[0]?.id ? String(list[0].id) : (p.itineraryId ? String(p.itineraryId) : ''));

  const [selectedItinId, setSelectedItinId] = useState(initialItinId);
  const [amount, setAmount] = useState(p.amount ? String(p.amount) : '100000');
  const [category, setCategory] = useState(p.category || 'Ăn uống');
  const [description, setDescription] = useState(p.description || action.label || 'Chi tiêu chuyến đi');

  const selectedItin = list.find(it => String(it.id) === String(selectedItinId));
  const targetTitle = selectedItin?.title || p.itineraryTitle || (selectedItinId ? `Lịch trình #${selectedItinId}` : 'Chưa có lịch trình');

  return (
    <div className="rounded-[7px] border border-amber-200/90 bg-[#FFFDF5] p-3 space-y-2 text-[11.5px]">
      <div className="flex items-center justify-between gap-2">
        <div className="font-bold text-ink-900 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Ghi nhận chi tiêu chuyến đi</span>
        </div>
        {Number(amount) > 0 && (
          <span className="text-[11.5px] font-bold text-amber-700">{formatCurrency(amount)}</span>
        )}
      </div>

      {!doneInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5">
          <div className="sm:col-span-6">
            <label className="block text-[10px] font-bold text-ink-500 mb-0.5">Lịch trình</label>
            {list.length > 0 ? (
              <select
                value={selectedItinId}
                onChange={(e) => setSelectedItinId(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-[11px] font-medium text-ink-800 outline-none focus:border-amber-500"
              >
                {list.map(it => (
                  <option key={it.id} value={String(it.id)}>{it.title}</option>
                ))}
              </select>
            ) : (
              <div className="px-2 py-1.5 rounded border border-amber-200 bg-amber-50 text-[11px] text-amber-800">{targetTitle}</div>
            )}
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-ink-500 mb-0.5">Hạng mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-[11px] font-medium text-ink-800 outline-none focus:border-amber-500"
            >
              {['Ăn uống', 'Di chuyển', 'Lưu trú', 'Tham quan', 'Mua sắm', 'Khác'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-ink-500 mb-0.5">Số tiền (đ)</label>
            <input
              type="number"
              min="0"
              step="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-[11px] font-medium text-ink-800 outline-none focus:border-amber-500"
            />
          </div>
          <div className="sm:col-span-12">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả khoản chi..."
              className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-[11px] text-ink-800 outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {doneInfo ? (
        <button
          type="button"
          onClick={() => doneInfo.itineraryId && onNavigate(`/itineraries?id=${doneInfo.itineraryId}`)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{doneInfo.label}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ) : (
        <button
          type="button"
          disabled={isLoading || !selectedItinId || Number(amount) <= 0}
          onClick={() =>
            onAddExpense(
              {
                ...action,
                payload: {
                  ...p,
                  itineraryId: Number(selectedItinId),
                  itineraryTitle: targetTitle,
                  amount: Number(amount),
                  category,
                  description: description.trim() || category
                }
              },
              idx
            )
          }
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{selectedItinId ? `Ghi ${formatCurrency(amount) || ''} vào ${targetTitle}` : 'Chưa có lịch trình'}</span>
        </button>
      )}
    </div>
  );
}

export const AiRichMessageBubble = ({
  msg,
  effectiveEmail,
  toast,
  navigate,
  onQuickReply
}) => {
  const { fetchItineraries, itineraries } = useApp();
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [doneMap, setDoneMap] = useState({});
  const [confirmIdx, setConfirmIdx] = useState(null);
  const [editingAction, setEditingAction] = useState(null); // { idx, itineraryId, title, budgetTotal, status, isPublic }

  let parsed = null;
  if (msg?.messageType === 'AI_RICH' && typeof msg.content === 'string') {
    try {
      parsed = JSON.parse(msg.content);
    } catch {
      parsed = null;
    }
  }

  const replyText = parsed?.reply ?? msg?.content ?? '';
  const actions = Array.isArray(parsed?.actions) ? parsed.actions : [];
  const quickReplies = Array.isArray(parsed?.quickReplies) ? parsed.quickReplies : [];

  const createItineraryActions = actions
    .map((act, idx) => ({ act, idx }))
    .filter(({ act }) => String(act?.type || '').toUpperCase() === 'CREATE_ITINERARY');
  const addStopActions = actions
    .map((act, idx) => ({ act, idx }))
    .filter(({ act }) => String(act?.type || '').toUpperCase() === 'ADD_ITINERARY_STOP');
  const addExpenseActions = actions
    .map((act, idx) => ({ act, idx }))
    .filter(({ act }) => String(act?.type || '').toUpperCase() === 'ADD_EXPENSE');
  const otherActions = actions
    .map((act, idx) => ({ act, idx }))
    .filter(({ act }) => {
      const t = String(act?.type || '').toUpperCase();
      return t !== 'CREATE_ITINERARY' && t !== 'ADD_ITINERARY_STOP' && t !== 'ADD_EXPENSE';
    });

  // Gom nhóm các nút theo từng Lịch trình và từng Địa điểm để hiển thị gọn, không bị rải nút lộn xộn
  const ITINERARY_ROW_TYPES = new Set(['OPEN_ITINERARY', 'UPDATE_ITINERARY', 'DELETE_ITINERARY', 'TOGGLE_ITINERARY_VISIBILITY', 'CLONE_ITINERARY']);
  const PLACE_ROW_TYPES = new Set(['OPEN_PLACE', 'SAVE_PLACE', 'UNSAVE_PLACE']);

  const itineraryGroupsMap = new Map();
  const placeGroupsMap = new Map();
  const standaloneActions = [];

  otherActions.forEach((item) => {
    const t = String(item.act?.type || '').toUpperCase();
    const p = item.act?.payload || {};
    if (ITINERARY_ROW_TYPES.has(t) && p.itineraryId) {
      const key = String(p.itineraryId);
      if (!itineraryGroupsMap.has(key)) {
        const matched = (itineraries || []).find(it => String(it.id) === key);
        itineraryGroupsMap.set(key, {
          itineraryId: p.itineraryId,
          title: matched?.title || p.title || p.itineraryTitle || `Lịch trình #${key}`,
          destination: matched?.destination || p.destination || '',
          items: []
        });
      }
      itineraryGroupsMap.get(key).items.push(item);
    } else if (PLACE_ROW_TYPES.has(t) && p.placeId) {
      const key = String(p.placeId);
      if (!placeGroupsMap.has(key)) {
        placeGroupsMap.set(key, {
          placeId: p.placeId,
          placeName: p.placeName || item.act?.label?.replace(/^[^\p{L}\p{N}]+/u, '').trim() || `Địa điểm #${key}`,
          items: []
        });
      }
      placeGroupsMap.get(key).items.push(item);
    } else {
      standaloneActions.push(item);
    }
  });

  const itineraryGroups = Array.from(itineraryGroupsMap.values());
  const placeGroups = Array.from(placeGroupsMap.values());

  // Lọc trùng: không hiển thị quickReply nếu giống hệt nhãn nút action phía trên
  const actionLabelsLower = new Set(actions.map(a => (a?.label || '').trim().toLowerCase()));
  const filteredQuickReplies = quickReplies
    .filter(qr => qr && !actionLabelsLower.has(qr.trim().toLowerCase()))
    .slice(0, 4);

  const executeAction = async (action, idx) => {
    if (!action || !action.type || loadingIdx !== null) return;
    const type = String(action.type).toUpperCase();
    const payload = action.payload || {};

    if ((type === 'DELETE_ITINERARY' || type === 'DELETE_ITINERARY_STOP') && confirmIdx !== idx) {
      setConfirmIdx(idx);
      return;
    }
    setConfirmIdx(null);

    // Nếu là UPDATE_ITINERARY từ nút bấm và chưa mở form chỉnh sửa -> mở form inline cho người dùng xác nhận/sửa trước
    if (type === 'UPDATE_ITINERARY' && !action._confirmedEdit) {
      const matched = (itineraries || []).find(it => String(it.id) === String(payload.itineraryId));
      setEditingAction({
        idx,
        action,
        itineraryId: payload.itineraryId,
        title: payload.title || matched?.title || '',
        budgetTotal: payload.budgetTotal !== undefined ? String(payload.budgetTotal) : String(matched?.totalBudget || matched?.budgetTotal || 3000000),
        status: (payload.status || matched?.status || 'ACTIVE').toUpperCase(),
        isPublic: payload.isPublic !== undefined ? payload.isPublic : (matched?.isPublic !== false)
      });
      return;
    }

    if (type === 'OPEN_PLACE') {
      navigate(payload.placeId ? `/places/${payload.placeId}` : '/explore');
      return;
    }
    if (type === 'OPEN_ITINERARY') {
      navigate(payload.itineraryId ? `/itineraries?id=${payload.itineraryId}` : '/itineraries');
      return;
    }
    if (type === 'OPEN_POST') {
      navigate(payload.postId ? `/community?postId=${payload.postId}` : '/community');
      return;
    }
    if (type === 'NAVIGATE') {
      navigate(payload.path || '/explore');
      return;
    }

    setLoadingIdx(idx);
    try {
      if (type === 'CREATE_ITINERARY') {
        const defaults = getDefaultDates(payload.durationDays);
        const destName = payload.destination || 'Việt Nam';
        const details = Array.isArray(payload.details)
          ? payload.details.map((d, dIdx) => {
              const dayNum = Number(d.dayNumber) || 1;
              const rawDayTitle = (d.dayTitle || '').trim();
              const normalizedDayTitle = rawDayTitle.startsWith(`Ngày ${dayNum}`)
                ? rawDayTitle
                : (rawDayTitle ? `Ngày ${dayNum}: ${rawDayTitle}` : `Ngày ${dayNum}: Khám phá ${destName}`);
              return {
                dayNumber: dayNum,
                dayTitle: normalizedDayTitle,
                visitOrder: Number(d.visitOrder) || dIdx + 1,
                placeId: d.placeId ? Number(d.placeId) : null,
                locationName: d.locationName || 'Điểm dừng chân',
                locationAddress: d.locationAddress || destName,
                category: d.category || 'Khám phá',
                startTime: formatBackendTime(d.startTime),
                estimatedCost: d.estimatedCost ? Number(d.estimatedCost) : 0,
                aiTip: d.aiTip || '',
                transitInfo: d.transitInfo || '',
                note: d.note || ''
              };
            })
          : [];

        const created = await itineraryApi.createItinerary(
          {
            title: payload.title || `Chuyến đi ${destName}`,
            destination: destName,
            startDate: payload.startDate || defaults.startDate,
            endDate: payload.endDate || defaults.endDate,
            budgetTotal: payload.budgetTotal ? Number(payload.budgetTotal) : 3000000,
            coverImageUrl: payload.coverImageUrl || getCoverImageByDestination(destName),
            isAiGenerated: true,
            isPublic: payload.isPublic !== false,
            status: (payload.status || 'ACTIVE').toUpperCase(),
            groupType: normalizeGroupType(payload.groupType),
            travelStyle: payload.travelStyle || 'Nghỉ dưỡng & Khám phá',
            details
          },
          effectiveEmail
        );
        await fetchItineraries(effectiveEmail);
        toast.showSuccess(`Đã lưu lịch trình "${created?.title || payload.title}"!`);
        setDoneMap(prev => ({
          ...prev,
          [idx]: { label: `Đã lưu • Mở xem ngay`, itineraryId: created?.id }
        }));
      } else if (type === 'UPDATE_ITINERARY') {
        if (!payload.itineraryId) throw new Error('Thiếu mã lịch trình cần cập nhật.');
        const existing = await itineraryApi.getItineraryById(payload.itineraryId, effectiveEmail);
        const merged = {
          ...existing,
          ...(payload.title ? { title: payload.title } : {}),
          ...(payload.destination ? { destination: payload.destination } : {}),
          ...(payload.startDate ? { startDate: payload.startDate } : {}),
          ...(payload.endDate ? { endDate: payload.endDate } : {}),
          ...(payload.budgetTotal !== undefined ? { budgetTotal: Number(payload.budgetTotal) } : {}),
          ...(payload.groupType ? { groupType: payload.groupType } : {}),
          ...(payload.travelStyle ? { travelStyle: payload.travelStyle } : {}),
          ...(payload.status ? { status: payload.status } : {})
        };
        await itineraryApi.updateItinerary(payload.itineraryId, merged, effectiveEmail);
        await fetchItineraries(effectiveEmail);
        toast.showSuccess('Đã cập nhật lịch trình thành công!');
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã cập nhật • Mở xem', itineraryId: payload.itineraryId } }));
      } else if (type === 'DELETE_ITINERARY') {
        if (!payload.itineraryId) throw new Error('Thiếu mã lịch trình cần xóa.');
        await itineraryApi.deleteItinerary(payload.itineraryId, effectiveEmail);
        await fetchItineraries(effectiveEmail);
        toast.showSuccess(`Đã xóa lịch trình "${payload.title || '#' + payload.itineraryId}".`);
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã xóa lịch trình' } }));
      } else if (type === 'ADD_ITINERARY_STOP') {
        if (!payload.itineraryId) throw new Error('Thiếu mã lịch trình.');
        await itineraryApi.addItineraryDetail(
          payload.itineraryId,
          {
            dayNumber: Number(payload.dayNumber) || 1,
            placeId: payload.placeId ? Number(payload.placeId) : null,
            locationName: payload.locationName || 'Điểm dừng mới',
            locationAddress: payload.locationAddress || '',
            category: payload.category || 'Tham quan',
            startTime: formatBackendTime(payload.startTime),
            estimatedCost: payload.estimatedCost ? Number(payload.estimatedCost) : 0,
            note: payload.note || ''
          },
          effectiveEmail
        );
        await fetchItineraries(effectiveEmail);
        toast.showSuccess(`Đã thêm "${payload.locationName}" vào lịch trình!`);
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã thêm • Mở lịch trình', itineraryId: payload.itineraryId } }));
      } else if (type === 'UPDATE_ITINERARY_STOP') {
        if (!payload.detailId) throw new Error('Thiếu mã điểm dừng cần sửa.');
        await itineraryApi.updateItineraryDetail(
          payload.detailId,
          {
            ...(payload.locationName ? { locationName: payload.locationName } : {}),
            ...(payload.dayNumber ? { dayNumber: Number(payload.dayNumber) } : {}),
            ...(payload.startTime ? { startTime: payload.startTime.slice(0, 5) } : {}),
            ...(payload.estimatedCost !== undefined ? { estimatedCost: Number(payload.estimatedCost) } : {}),
            ...(payload.note !== undefined ? { note: payload.note } : {})
          },
          effectiveEmail
        );
        await fetchItineraries(effectiveEmail);
        toast.showSuccess('Đã cập nhật điểm dừng thành công!');
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã sửa điểm dừng' } }));
      } else if (type === 'DELETE_ITINERARY_STOP') {
        if (!payload.detailId) throw new Error('Thiếu mã điểm dừng cần xóa.');
        await itineraryApi.deleteItineraryDetail(payload.detailId, effectiveEmail);
        await fetchItineraries(effectiveEmail);
        toast.showSuccess(`Đã xóa điểm dừng "${payload.locationName || ''}".`);
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã xóa điểm dừng' } }));
      } else if (type === 'SAVE_PLACE') {
        if (!payload.placeId) throw new Error('Thiếu mã địa điểm.');
        await savedPlaceApi.addSavedPlace(payload.placeId);
        toast.showSuccess(`Đã lưu "${payload.placeName || 'địa điểm'}" vào danh sách yêu thích!`);
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã lưu vào Yêu thích' } }));
      } else if (type === 'UNSAVE_PLACE') {
        if (!payload.placeId) throw new Error('Thiếu mã địa điểm.');
        await savedPlaceApi.removeSavedPlace(payload.placeId);
        toast.showSuccess(`Đã bỏ lưu "${payload.placeName || 'địa điểm'}".`);
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã bỏ lưu' } }));
      } else if (type === 'ADD_EXPENSE') {
        if (!payload.itineraryId) throw new Error('Thiếu mã lịch trình.');
        await itineraryApi.addExpense(
          payload.itineraryId,
          {
            amount: Number(payload.amount) || 0,
            category: payload.category || 'Khác',
            description: payload.description || 'Chi tiêu chuyến đi'
          },
          effectiveEmail
        );
        await fetchItineraries(effectiveEmail);
        toast.showSuccess(`Đã ghi khoản chi ${formatCurrency(payload.amount) || ''} vào "${payload.itineraryTitle || 'lịch trình'}"!`);
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã ghi chi tiêu • Mở lịch trình', itineraryId: payload.itineraryId } }));
      } else if (type === 'CLONE_ITINERARY') {
        if (!payload.itineraryId) throw new Error('Thiếu mã lịch trình.');
        const cloned = await itineraryApi.cloneItinerary(payload.itineraryId, effectiveEmail);
        await fetchItineraries(effectiveEmail);
        toast.showSuccess(`Đã sao chép lịch trình "${cloned?.title || payload.title || ''}" về kho!`);
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã sao chép • Mở xem', itineraryId: cloned?.id } }));
      } else if (type === 'TOGGLE_ITINERARY_VISIBILITY') {
        if (!payload.itineraryId) throw new Error('Thiếu mã lịch trình.');
        const updated = await itineraryApi.toggleVisibility(payload.itineraryId, payload.isPublic);
        await fetchItineraries(effectiveEmail);
        toast.showSuccess(updated?.isPublic ? 'Đã chuyển lịch trình sang Công khai!' : 'Đã chuyển lịch trình sang Riêng tư!');
        setDoneMap(prev => ({ ...prev, [idx]: { label: updated?.isPublic ? 'Đã công khai' : 'Đã đặt riêng tư', itineraryId: payload.itineraryId } }));
      } else if (type === 'CREATE_POST') {
        const createdPost = await postApi.createPost(
          {
            title: payload.title || 'Chia sẻ trải nghiệm du lịch',
            content: payload.content || '',
            locationTag: payload.locationTag || '',
            itineraryId: payload.itineraryId ? Number(payload.itineraryId) : null,
            visibility: 'PUBLIC'
          },
          effectiveEmail
        );
        toast.showSuccess('Đã đăng bài viết lên Cộng đồng!');
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã đăng bài • Mở Cộng đồng', postId: createdPost?.id } }));
      }
    } catch (err) {
      toast.showError(err?.message || 'Không thể thực hiện thao tác. Vui lòng thử lại!');
    } finally {
      setLoadingIdx(null);
    }
  };

  return (
    <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[8px] px-4 py-3 shadow-2xs space-y-3">
      <FormattedReplyText text={replyText} />

      {/* Card Đề xuất Lịch trình chi tiết + Sửa nhanh + Lưu 1-Click */}
      {createItineraryActions.length > 0 && (
        <div className="space-y-2.5 pt-1">
          {createItineraryActions.map(({ act, idx }) => (
            <ItineraryProposalCard
              key={idx}
              action={act}
              idx={idx}
              isLoading={loadingIdx === idx}
              doneInfo={doneMap[idx]}
              onSaveItinerary={executeAction}
              onNavigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Card Thêm điểm dừng rõ ràng: chọn Lịch trình đích, Ngày, Giờ */}
      {addStopActions.length > 0 && (
        <div className="space-y-2 pt-1">
          {addStopActions.map(({ act, idx }) => (
            <AddStopActionCard
              key={idx}
              action={act}
              idx={idx}
              itineraries={itineraries}
              isLoading={loadingIdx === idx}
              doneInfo={doneMap[idx]}
              onAddStop={executeAction}
              onNavigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Card Ghi nhận Chi tiêu chuyến đi */}
      {addExpenseActions.length > 0 && (
        <div className="space-y-2 pt-1">
          {addExpenseActions.map(({ act, idx }) => (
            <AddExpenseActionCard
              key={idx}
              action={act}
              idx={idx}
              itineraries={itineraries}
              isLoading={loadingIdx === idx}
              doneInfo={doneMap[idx]}
              onAddExpense={executeAction}
              onNavigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Nhóm thẻ Lịch trình (Xem / Sửa / Xóa gọn theo từng lịch trình) */}
      {itineraryGroups.length > 0 && (
        <div className="pt-2 border-t border-ink-200/50 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Quản lý lịch trình
          </div>
          <div className="space-y-1.5">
            {itineraryGroups.map((grp) => (
              <div key={grp.itineraryId} className="rounded-[6px] border border-ink-200/80 bg-[#FAF7F0]/70 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold text-ink-900 truncate flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                    <span className="truncate">{grp.title}</span>
                  </div>
                  {grp.destination && <div className="text-[10.5px] text-ink-500 pl-5">{grp.destination}</div>}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {grp.items.map(({ act, idx }) => {
                    const t = String(act.type || '').toUpperCase();
                    const doneInfo = doneMap[idx];
                    if (doneInfo) {
                      return (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> {doneInfo.label}
                        </span>
                      );
                    }
                    if (confirmIdx === idx) {
                      return (
                        <div key={idx} className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 rounded px-2 py-0.5">
                          <span className="text-[10.5px] font-bold text-rose-700">Xóa?</span>
                          <button type="button" onClick={() => executeAction(act, idx)} className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer">Xóa</button>
                          <button type="button" onClick={() => setConfirmIdx(null)} className="px-1.5 py-0.5 rounded bg-white text-ink-600 border border-ink-200 text-[10px] cursor-pointer">Hủy</button>
                        </div>
                      );
                    }
                    const styleCfg = ACTION_STYLE_MAP[t] || ACTION_STYLE_MAP.NAVIGATE;
                    const IconComp = styleCfg.icon;
                    const shortLabel = t === 'OPEN_ITINERARY' ? 'Xem' : t === 'UPDATE_ITINERARY' ? 'Sửa' : t === 'DELETE_ITINERARY' ? 'Xóa' : (act.label || 'Thao tác');
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={loadingIdx !== null}
                        onClick={() => executeAction(act, idx)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${styleCfg.cls}`}
                      >
                        {loadingIdx === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : <IconComp className="w-3 h-3" />}
                        <span>{shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form sửa nhanh inline khi bấm Sửa lịch trình */}
      {editingAction && (
        <div className="rounded-[7px] border border-amber-200 bg-[#FFFDF5] p-3 space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-800 flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa lịch trình #{editingAction.itineraryId}
            </span>
            <button type="button" onClick={() => setEditingAction(null)} className="text-ink-400 hover:text-ink-700 cursor-pointer">Đóng</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-3">
              <label className="block font-bold text-ink-600 mb-0.5">Tên lịch trình</label>
              <input
                type="text"
                value={editingAction.title}
                onChange={(e) => setEditingAction(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-ink-800 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-ink-600 mb-0.5">Ngân sách (VNĐ)</label>
              <input
                type="number"
                value={editingAction.budgetTotal}
                onChange={(e) => setEditingAction(prev => ({ ...prev, budgetTotal: e.target.value }))}
                className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-ink-800 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-ink-600 mb-0.5">Trạng thái</label>
              <select
                value={editingAction.status}
                onChange={(e) => setEditingAction(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-2 py-1.5 rounded border border-ink-200 bg-white text-ink-800 outline-none focus:border-amber-500"
              >
                <option value="ACTIVE">Sắp tới</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="COMPLETED">Đã xong</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-ink-700">
                <input
                  type="checkbox"
                  checked={editingAction.isPublic}
                  onChange={(e) => setEditingAction(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="accent-amber-600"
                />
                <span>Công khai</span>
              </label>
            </div>
          </div>
          <button
            type="button"
            disabled={loadingIdx !== null}
            onClick={() => {
              const { idx, action, title, budgetTotal, status, isPublic } = editingAction;
              setEditingAction(null);
              executeAction({
                ...action,
                _confirmedEdit: true,
                payload: {
                  ...action.payload,
                  title,
                  budgetTotal: Number(budgetTotal) || 0,
                  status,
                  isPublic
                }
              }, idx);
            }}
            className="w-full py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
          >
            Lưu thay đổi
          </button>
        </div>
      )}

      {/* Nhóm thẻ Địa điểm (Chi tiết / Lưu yêu thích gọn theo từng địa điểm) */}
      {placeGroups.length > 0 && (
        <div className="pt-2 border-t border-ink-200/50 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Địa điểm liên quan
          </div>
          <div className="space-y-1.5">
            {placeGroups.map((grp) => (
              <div key={grp.placeId} className="rounded-[6px] border border-ink-200/80 bg-[#FAF7F0]/70 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11.5px] font-bold text-ink-900 flex items-center gap-1.5 min-w-0 flex-1">
                  <MapPin className="w-3.5 h-3.5 text-clay-600 shrink-0" />
                  <span className="truncate">{grp.placeName}</span>
                </div>
                <div className="flex items-center gap-1">
                  {grp.items.map(({ act, idx }) => {
                    const t = String(act.type || '').toUpperCase();
                    const doneInfo = doneMap[idx];
                    if (doneInfo) {
                      return (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> {doneInfo.label}
                        </span>
                      );
                    }
                    const styleCfg = ACTION_STYLE_MAP[t] || ACTION_STYLE_MAP.NAVIGATE;
                    const IconComp = styleCfg.icon;
                    const shortLabel = t === 'OPEN_PLACE' ? 'Chi tiết' : t === 'SAVE_PLACE' ? 'Lưu' : t === 'UNSAVE_PLACE' ? 'Bỏ lưu' : (act.label || 'Xem');
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={loadingIdx !== null}
                        onClick={() => executeAction(act, idx)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${styleCfg.cls}`}
                      >
                        {loadingIdx === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : <IconComp className="w-3 h-3" />}
                        <span>{shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Các nút thao tác độc lập khác (nếu có) */}
      {standaloneActions.length > 0 && (
        <div className="pt-2 border-t border-ink-200/50 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Thao tác nhanh trên dữ liệu
          </div>
          <div className="flex flex-wrap gap-1.5">
            {standaloneActions.map(({ act, idx }) => {
              const doneInfo = doneMap[idx];
              if (doneInfo) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (doneInfo.itineraryId) navigate(`/itineraries?id=${doneInfo.itineraryId}`);
                      else if (doneInfo.postId) navigate(`/community?postId=${doneInfo.postId}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{doneInfo.label}</span>
                    {(doneInfo.itineraryId || doneInfo.postId) && <ArrowRight className="w-3 h-3" />}
                  </button>
                );
              }

              if (confirmIdx === idx) {
                return (
                  <div key={idx} className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-[6px] px-2.5 py-1">
                    <span className="text-[11px] font-bold text-rose-700">Xác nhận xóa?</span>
                    <button
                      type="button"
                      onClick={() => executeAction(act, idx)}
                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-bold cursor-pointer"
                    >
                      Xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmIdx(null)}
                      className="px-2 py-0.5 rounded bg-white hover:bg-ink-50 text-ink-600 border border-ink-200 text-[10.5px] font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                );
              }

              const styleCfg = ACTION_STYLE_MAP[String(act.type || '').toUpperCase()] || ACTION_STYLE_MAP.NAVIGATE;
              const IconComp = styleCfg.icon;
              const isLoading = loadingIdx === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={loadingIdx !== null}
                  onClick={() => executeAction(act, idx)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${styleCfg.cls}`}
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <IconComp className="w-3.5 h-3.5 shrink-0" />}
                  <span>{act.label || 'Thực hiện'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gợi ý hỏi tiếp theo (1-click gửi luôn, không trùng nút action) */}
      {filteredQuickReplies.length > 0 && onQuickReply && (
        <div className="pt-2 border-t border-ink-200/40 space-y-1.5">
          <div className="text-[10px] font-semibold text-ink-400 flex items-center gap-1">
            <MessageCircleQuestion className="w-3 h-3" />
            <span>Gợi ý tiếp theo (bấm để gửi):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filteredQuickReplies.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickReply(qr)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F8F4EC] hover:bg-clay-50 text-clay-800 border border-ink-200/80 hover:border-clay-300 transition-colors cursor-pointer"
              >
                {qr}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function dStartTime(val) {
  return val && /^\d{2}:\d{2}/.test(val) ? val.slice(0, 5) : '09:00';
}

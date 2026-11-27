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
  MessageCircleQuestion
} from 'lucide-react';
import { itineraryApi, savedPlaceApi } from '../../services/api';

/**
 * Render văn bản sạch: loại bỏ markdown ** thô hoặc chuyển thành <strong> gọn gàng,
 * giữ nguyên xuống dòng và làm nổi bật các tiêu đề ngày (Ngày 1:, Ngày 2:...).
 */
function FormattedReplyText({ text }) {
  if (!text) return null;
  const cleanedText = String(text).replace(/\s*\((?:placeId|itineraryId|detailId|postId)\s*:\s*\d+\)/gi, '');
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
  }
};

function formatCurrency(val) {
  const num = Number(val);
  if (!num || Number.isNaN(num)) return null;
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
}

export const AiRichMessageBubble = ({
  msg,
  effectiveEmail,
  toast,
  navigate,
  onQuickReply
}) => {
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [doneMap, setDoneMap] = useState({});
  const [confirmIdx, setConfirmIdx] = useState(null);

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
  const otherActions = actions
    .map((act, idx) => ({ act, idx }))
    .filter(({ act }) => String(act?.type || '').toUpperCase() !== 'CREATE_ITINERARY');

  const executeAction = async (action, idx) => {
    if (!action || !action.type || loadingIdx !== null) return;
    const type = String(action.type).toUpperCase();
    const payload = action.payload || {};

    // Yêu cầu xác nhận 2 bước cho các thao tác xóa
    if ((type === 'DELETE_ITINERARY' || type === 'DELETE_ITINERARY_STOP') && confirmIdx !== idx) {
      setConfirmIdx(idx);
      return;
    }
    setConfirmIdx(null);

    // Các nút điều hướng thuần túy
    if (type === 'OPEN_PLACE') {
      if (payload.placeId) navigate(`/places/${payload.placeId}`);
      else navigate('/explore');
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
        const details = Array.isArray(payload.details)
          ? payload.details.map((d, dIdx) => ({
              dayNumber: Number(d.dayNumber) || 1,
              visitOrder: Number(d.visitOrder) || dIdx + 1,
              placeId: d.placeId ? Number(d.placeId) : null,
              locationName: d.locationName || 'Điểm dừng chân',
              category: d.category || 'Tham quan',
              startTime: d.startTime && /^\d{2}:\d{2}/.test(d.startTime) ? d.startTime.slice(0, 5) : '09:00',
              estimatedCost: d.estimatedCost ? Number(d.estimatedCost) : 0,
              note: d.note || ''
            }))
          : [];

        const created = await itineraryApi.createItinerary(
          {
            title: payload.title || `Chuyến đi ${payload.destination || 'mới'}`,
            destination: payload.destination || 'Việt Nam',
            durationDays: Number(payload.durationDays) || 2,
            budgetTotal: payload.budgetTotal ? Number(payload.budgetTotal) : 0,
            groupType: payload.groupType || 'Cá nhân',
            travelStyle: payload.travelStyle || 'Khám phá',
            isAiGenerated: true,
            isPublic: payload.isPublic !== false,
            status: 'ACTIVE',
            details
          },
          effectiveEmail
        );
        toast.showSuccess(`Đã tạo lịch trình "${created?.title || payload.title}" thành công!`);
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã lưu lịch trình • Mở xem ngay', itineraryId: created?.id } }));
      } else if (type === 'UPDATE_ITINERARY') {
        if (!payload.itineraryId) throw new Error('Thiếu mã lịch trình cần cập nhật.');
        const existing = await itineraryApi.getItineraryById(payload.itineraryId, effectiveEmail);
        const merged = {
          ...existing,
          ...(payload.title ? { title: payload.title } : {}),
          ...(payload.destination ? { destination: payload.destination } : {}),
          ...(payload.durationDays ? { durationDays: Number(payload.durationDays) } : {}),
          ...(payload.budgetTotal !== undefined ? { budgetTotal: Number(payload.budgetTotal) } : {}),
          ...(payload.groupType ? { groupType: payload.groupType } : {}),
          ...(payload.travelStyle ? { travelStyle: payload.travelStyle } : {}),
          ...(payload.status ? { status: payload.status } : {})
        };
        await itineraryApi.updateItinerary(payload.itineraryId, merged, effectiveEmail);
        toast.showSuccess('Đã cập nhật lịch trình thành công!');
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã cập nhật • Mở xem', itineraryId: payload.itineraryId } }));
      } else if (type === 'DELETE_ITINERARY') {
        if (!payload.itineraryId) throw new Error('Thiếu mã lịch trình cần xóa.');
        await itineraryApi.deleteItinerary(payload.itineraryId, effectiveEmail);
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
            category: payload.category || 'Tham quan',
            startTime: payload.startTime && /^\d{2}:\d{2}/.test(payload.startTime) ? payload.startTime.slice(0, 5) : '09:00',
            estimatedCost: payload.estimatedCost ? Number(payload.estimatedCost) : 0,
            note: payload.note || ''
          },
          effectiveEmail
        );
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
        toast.showSuccess('Đã cập nhật điểm dừng thành công!');
        setDoneMap(prev => ({ ...prev, [idx]: { label: 'Đã sửa điểm dừng' } }));
      } else if (type === 'DELETE_ITINERARY_STOP') {
        if (!payload.detailId) throw new Error('Thiếu mã điểm dừng cần xóa.');
        await itineraryApi.deleteItineraryDetail(payload.detailId, effectiveEmail);
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

      {/* Thẻ tóm tắt Lịch trình + Nút Tạo 1-Click */}
      {createItineraryActions.length > 0 && (
        <div className="space-y-2 pt-1">
          {createItineraryActions.map(({ act, idx }) => {
            const p = act.payload || {};
            const doneInfo = doneMap[idx];
            const isLoading = loadingIdx === idx;
            const budgetStr = formatCurrency(p.budgetTotal);
            const stopsCount = Array.isArray(p.details) ? p.details.length : 0;

            return (
              <div
                key={idx}
                className="rounded-[7px] border border-clay-200 bg-gradient-to-br from-[#FAF7F0] to-[#FFFDF8] p-3 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-clay-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Đề xuất lịch trình sẵn sàng lưu</span>
                    </div>
                    <h4 className="text-[13px] font-bold text-ink-900 mt-0.5 truncate">
                      {p.title || `Khám phá ${p.destination || 'Việt Nam'}`}
                    </h4>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-600">
                  {p.destination && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-ink-200/70">
                      <MapPin className="w-3 h-3 text-clay-600" />
                      {p.destination}
                    </span>
                  )}
                  {p.durationDays && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-ink-200/70">
                      <Calendar className="w-3 h-3 text-clay-600" />
                      {p.durationDays} ngày
                    </span>
                  )}
                  {p.groupType && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-ink-200/70">
                      <Users className="w-3 h-3 text-clay-600" />
                      {p.groupType}
                    </span>
                  )}
                  {budgetStr && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-ink-200/70">
                      <Wallet className="w-3 h-3 text-emerald-600" />
                      ~{budgetStr}
                    </span>
                  )}
                  {stopsCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-ink-200/70">
                      <Route className="w-3 h-3 text-indigo-600" />
                      {stopsCount} điểm dừng
                    </span>
                  )}
                </div>

                {doneInfo ? (
                  <button
                    type="button"
                    onClick={() => doneInfo.itineraryId && navigate(`/itineraries?id=${doneInfo.itineraryId}`)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-[11.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{doneInfo.label}</span>
                    {doneInfo.itineraryId && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loadingIdx !== null}
                    onClick={() => executeAction(act, idx)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-[11.5px] font-bold bg-clay-600 hover:bg-clay-700 disabled:opacity-50 text-[#FFFDF8] transition-colors cursor-pointer shadow-xs"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{act.label || 'Lưu & Tạo lịch trình này'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Các nút thao tác Thêm / Sửa / Xóa / Lưu / Xem chi tiết */}
      {otherActions.length > 0 && (
        <div className="pt-2 border-t border-ink-200/50 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Thao tác nhanh trên dữ liệu
          </div>
          <div className="flex flex-wrap gap-1.5">
            {otherActions.map(({ act, idx }) => {
              const doneInfo = doneMap[idx];
              if (doneInfo) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (doneInfo.itineraryId) navigate(`/itineraries?id=${doneInfo.itineraryId}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{doneInfo.label}</span>
                    {doneInfo.itineraryId && <ArrowRight className="w-3 h-3" />}
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

      {/* Gợi ý hỏi tiếp theo (1-click gửi luôn) */}
      {quickReplies.length > 0 && onQuickReply && (
        <div className="pt-2 border-t border-ink-200/40 space-y-1.5">
          <div className="text-[10px] font-semibold text-ink-400 flex items-center gap-1">
            <MessageCircleQuestion className="w-3 h-3" />
            <span>Gợi ý tiếp theo (bấm để gửi):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickReplies.slice(0, 4).map((qr, idx) => (
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

/**
 * Tính toán trạng thái lịch trình động theo ngày thực tế:
 * - Đã hủy nếu status === 'cancelled'
 * - Bản nháp nếu status === 'draft' || 'drafts'
 * - Đã xong nếu ngày kết thúc đã qua (hoặc status === 'completed')
 * - Đang diễn ra nếu hôm nay nằm trong khoảng ngày đi và ngày về
 * - Sắp tới nếu ngày đi ở tương lai
 */
export function computeItineraryStatus(itin) {
  if (!itin) {
    return {
      statusKey: 'upcoming',
      label: 'Sắp tới',
      color: '#059669',
      bg: '#ECFDF5',
      borderColor: '#A7F3D0',
    };
  }

  const rawStatus = (itin.status || '').toLowerCase().trim();

  // 1. Trạng thái Đã hủy
  if (rawStatus === 'cancelled' || rawStatus === 'canceled') {
    return {
      statusKey: 'cancelled',
      label: 'Đã hủy',
      color: '#EF4444',
      bg: '#FEF2F2',
      borderColor: '#FECACA',
    };
  }

  // 2. Trạng thái Bản nháp
  if (rawStatus === 'draft' || rawStatus === 'drafts') {
    return {
      statusKey: 'drafts',
      label: 'Bản nháp',
      color: '#D97706',
      bg: '#FEF3C7',
      borderColor: '#FDE68A',
    };
  }

  // 3. Trạng thái Đã xong được đánh dấu thủ công trong CSDL
  if (rawStatus === 'completed' || rawStatus === 'finished') {
    return {
      statusKey: 'completed',
      label: 'Đã xong',
      color: '#64748B',
      bg: '#F1F5F9',
      borderColor: '#E2E8F0',
    };
  }

  // 4. Tính toán tự động theo ngày thực tế (Real-time Temporal Status)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let startMs = null;
  let endMs = null;

  if (itin.startDate) {
    const s = new Date(itin.startDate);
    if (!isNaN(s.getTime())) {
      startMs = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
    }
  }

  if (itin.endDate) {
    const e = new Date(itin.endDate);
    if (!isNaN(e.getTime())) {
      endMs = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999).getTime();
    }
  }

  // Đã qua ngày kết thúc -> Tự động chuyển thành "Đã xong"
  if (endMs !== null && today > endMs) {
    return {
      statusKey: 'completed',
      label: 'Đã xong',
      color: '#64748B',
      bg: '#F1F5F9',
      borderColor: '#E2E8F0',
    };
  }

  // Chuyến đi đang diễn ra (hôm nay nằm giữa ngày đi và ngày về)
  if (startMs !== null) {
    if (today >= startMs && (endMs === null || today <= endMs)) {
      return {
        statusKey: 'ongoing',
        label: 'Đang diễn ra',
        color: '#2563EB',
        bg: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    // Chuyến đi tương lai
    if (today < startMs) {
      return {
        statusKey: 'upcoming',
        label: 'Sắp tới',
        color: '#059669',
        bg: '#ECFDF5',
        borderColor: '#A7F3D0',
      };
    }
  }

  // Fallback mặc định
  return {
    statusKey: 'upcoming',
    label: 'Sắp tới',
    color: '#059669',
    bg: '#ECFDF5',
    borderColor: '#A7F3D0',
  };
}


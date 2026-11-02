/**
 * Utility functions for parsing and displaying timestamps according to user's device/computer clock.
 * Rules:
 * - < 1 minute: "Vừa xong"
 * - < 60 minutes: "X phút trước" (e.g., "1 phút trước", "5 phút trước")
 * - < 23 hours: "X giờ trước" (e.g., "1 giờ trước", "5 giờ trước")
 * - >= 23 hours: Exact date & time according to user's computer: "HH:mm - DD/MM/YYYY"
 */

export const parseDateSafe = (dateValue) => {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  if (typeof dateValue === 'number') {
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  }

  // Jackson serializer array: [year, month, day, hour, minute, second]
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    const d = new Date(year, month - 1, day, hour, minute, second);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof dateValue === 'string') {
    const str = dateValue.trim();
    if (!str) return null;

    // Pattern "HH:mm - DD/MM/YYYY" hoặc "HH:mm:ss DD/MM/YYYY"
    const ddmmyyyyMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*[-/ ]\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (ddmmyyyyMatch) {
      const [, h, min, sec, d, m, y] = ddmmyyyyMatch;
      const parsed = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(sec || 0));
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Nếu chuỗi đã có chỉ định múi giờ rõ ràng (Z hoặc +07:00, -05:00)
    if (str.endsWith('Z') || /[+-]\d{2}(:?\d{2})?$/.test(str)) {
      const parsed = new Date(str);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Nếu là chuỗi ISO chuẩn "YYYY-MM-DDTHH:mm:ss" không có múi giờ (từ server Railway chạy UTC)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
      const now = Date.now();
      const asUtc = new Date(str + 'Z');
      const asLocal = new Date(str);

      if (!isNaN(asUtc.getTime()) && !isNaN(asLocal.getTime())) {
        const diffUtc = now - asUtc.getTime();
        const diffLocal = now - asLocal.getTime();

        // Nếu parse theo UTC cho mốc thời gian trong tương lai (> 2 phút), chứng tỏ chuỗi đã là giờ local
        if (diffUtc < -120000) {
          return asLocal;
        }

        // Nếu parse theo local bị lệch hơn 6 tiếng (do server UTC bị chậm 7 tiếng so với giờ VN),
        // trong khi parse theo UTC rơi vào khoảng hợp lý
        if (diffLocal >= 6 * 3600 * 1000 && diffUtc >= -60000 && diffUtc < diffLocal) {
          return asUtc;
        }

        return asUtc;
      }
    }

    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

/**
 * Phân tích và chuẩn hóa thời gian theo múi giờ Việt Nam (UTC+7)
 */
export const parseVietnamDate = parseDateSafe;

/**
 * Định dạng ngày giờ chuẩn 24 giờ Việt Nam (không cần giây): "HH:mm DD/MM/YYYY"
 */
export const formatVietnam24h = (dateValue, fallback = '—') => {
  const d = parseVietnamDate(dateValue);
  if (!d) return fallback;
  return d.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Định dạng chỉ ngày theo chuẩn Việt Nam: "DD/MM/YYYY"
 */
export const formatVietnamDateOnly = (dateValue, fallback = '—') => {
  const d = parseVietnamDate(dateValue);
  if (!d) return fallback;
  return d.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Định dạng thời gian tương đối chuẩn xác theo múi giờ Việt Nam:
 * "Vừa xong", "X phút trước", "X giờ trước", "Hôm qua", "X ngày trước"
 */
export const formatVietnamRelativeTime = (dateValue, fallback = 'Vừa xong') => {
  const d = parseVietnamDate(dateValue);
  if (!d) return fallback;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 2) return 'Hôm qua';
  return `${Math.floor(diff / 86400)} ngày trước`;
};

/**
 * Hiển thị thời gian thân thiện theo giờ thực của máy tính người dùng:
 * - Dưới 1 phút: "Vừa xong"
 * - Dưới 60 phút: "X phút trước"
 * - Dưới 23 giờ: "X giờ trước"
 * - Từ 23 giờ trở lên: ngày cụ thể "HH:mm - DD/MM/YYYY"
 */
export const formatDisplayTimeAgo = (dateValue, fallbackTimeAgo) => {
  const date = parseDateSafe(dateValue);
  if (!date) {
    return fallbackTimeAgo || 'Vừa xong';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Nếu bài vừa mới đăng hoặc đồng hồ client và server lệch nhau vài giây/phút:
  if (diffMs < 60000) {
    return 'Vừa xong';
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  // Yêu cầu: dưới 23 giờ hiển thị "X giờ trước", qua 23 giờ ghi ngày cụ thể
  if (diffHours < 23) {
    return `${diffHours} giờ trước`;
  }

  // Qua 23 giờ: hiển thị ngày giờ cụ thể
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

/**
 * Format ngày giờ cụ thể theo máy tính: "HH:mm - DD/MM/YYYY"
 */
export const formatDisplayDateTime = (dateValue, fallbackFormatted) => {
  const date = parseDateSafe(dateValue);
  if (!date) {
    return fallbackFormatted || 'Vừa xong';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

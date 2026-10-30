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

    // Pattern "HH:mm - DD/MM/YYYY"
    const ddmmyyyyMatch = str.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (ddmmyyyyMatch) {
      const [, h, min, d, m, y] = ddmmyyyyMatch;
      const parsed = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Standard ISO string or date string
    let isoStr = str;
    // Nếu chuỗi ISO chưa có offset (+07:00 hay Z), hệ thống backend chuẩn theo giờ Việt Nam (+07:00)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(isoStr) && !/[Z+-]\d{2}(:?\d{2})?$/.test(isoStr) && !isoStr.endsWith('Z')) {
      isoStr = `${isoStr}+07:00`;
    }

    const parsed = new Date(isoStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
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

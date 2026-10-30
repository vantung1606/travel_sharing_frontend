/**
 * Utility functions for parsing and displaying timestamps in user's local timezone (e.g. Vietnam UTC+7)
 * Corrects UTC timestamps saved on cloud server so they display correctly in the browser.
 */

export const formatDisplayDateTime = (dateValue, fallbackFormatted) => {
  if (!dateValue && fallbackFormatted) return fallbackFormatted;
  if (!dateValue) return 'Vừa xong';

  try {
    let date;
    if (typeof dateValue === 'string') {
      // If ISO string without timezone indicator, treat as UTC from backend
      const isoStr = dateValue.endsWith('Z') || dateValue.includes('+') ? dateValue : dateValue + 'Z';
      date = new Date(isoStr);
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) {
      return fallbackFormatted || 'Vừa xong';
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  } catch {
    return fallbackFormatted || 'Vừa xong';
  }
};

export const formatDisplayTimeAgo = (dateValue, fallbackTimeAgo) => {
  if (!dateValue && fallbackTimeAgo) return fallbackTimeAgo;
  if (!dateValue) return 'Vừa xong';

  try {
    const isoStr = typeof dateValue === 'string' && !dateValue.endsWith('Z') && !dateValue.includes('+')
      ? dateValue + 'Z'
      : dateValue;
    const date = new Date(isoStr);

    if (isNaN(date.getTime())) {
      return fallbackTimeAgo || 'Vừa xong';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Within 60 seconds
    if (diffMs < 60000 && diffMs >= -30000) {
      return 'Vừa xong';
    }

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60 && diffMins > 0) {
      return `${diffMins} phút trước`;
    }

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24 && diffHours > 0) {
      return `${diffHours} giờ trước`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return 'Hôm qua';
    }
    if (diffDays > 1 && diffDays < 7) {
      return `${diffDays} ngày trước`;
    }

    // Over 7 days: format as exact date & time
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  } catch {
    return fallbackTimeAgo || 'Vừa xong';
  }
};

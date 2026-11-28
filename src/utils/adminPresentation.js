// Keep audit action codes intact for filters/API calls; show neutral labels in admin.
export const formatAdminActionLabel = (action) => {
  const code = String(action || '');
  if (/(^|_)AI(_|$)/i.test(code)) {
    if (/FLAG/i.test(code)) return 'Gắn cờ nội dung';
    if (/ITINERARY/i.test(code)) return 'Xử lý lịch trình';
    return 'Xử lý hệ thống';
  }
  return code || 'Thao tác hệ thống';
};

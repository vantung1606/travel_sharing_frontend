const ADMIN_PRESENTATION = {
  role: 'admin',
  roleLabel: 'Quản trị viên',
  workspaceLabel: 'Quản trị hệ thống',
  workspaceName: 'Không gian quản trị',
  navigationLabel: 'Các mục quản trị',
  dashboardLabel: 'Tổng quan quản trị',
  menuLabel: 'quản trị'
};

const MODERATOR_PRESENTATION = {
  role: 'moderator',
  roleLabel: 'Giám sát viên',
  workspaceLabel: 'Giám sát nội dung',
  workspaceName: 'Không gian giám sát',
  navigationLabel: 'Các mục giám sát',
  dashboardLabel: 'Tổng quan giám sát',
  menuLabel: 'giám sát'
};

const MEMBER_PRESENTATION = {
  role: null,
  roleLabel: 'Thành viên',
  workspaceLabel: 'Khu vực nội bộ',
  workspaceName: 'Không gian nội bộ',
  navigationLabel: 'Điều hướng nội bộ',
  dashboardLabel: 'Tổng quan',
  menuLabel: 'nội bộ'
};

// Match the role codes returned by the API and used by the route guard.
export const getStaffPresentation = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  if (roles.includes('ROLE_ADMIN')) return ADMIN_PRESENTATION;
  if (roles.includes('ROLE_MODERATOR')) return MODERATOR_PRESENTATION;
  return MEMBER_PRESENTATION;
};

const PAGE_NAMES = {
  places: 'Quản lý địa điểm',
  itineraries: 'Quản lý lịch trình',
  reviews: 'Kiểm duyệt đánh giá',
  users: 'Người dùng & Tài khoản',
  moderators: 'Phân quyền giám sát viên',
  reports: 'Bài viết & Báo cáo',
  analytics: 'Thống kê hệ thống',
  appearance: 'Giao diện & Thương hiệu',
  system: 'Giám sát hệ thống & CSDL',
  broadcast: 'Phát thông báo',
  maintenance: 'Bảo trì hệ thống',
  'audit-logs': 'Nhật ký hoạt động'
};

export const getStaffPageTitle = (tab, user) => {
  const presentation = getStaffPresentation(user);
  if (tab === 'dashboard') return presentation.dashboardLabel;
  if (presentation.role === 'moderator') {
    if (tab === 'places') return 'Giám sát địa điểm';
    if (tab === 'itineraries') return 'Giám sát lịch trình';
    if (tab === 'analytics') return 'Thống kê nội dung';
  }
  return PAGE_NAMES[tab] || presentation.workspaceLabel;
};

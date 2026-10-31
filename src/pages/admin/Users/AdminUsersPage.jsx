import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../../components/common/Toast';
import { adminUserApi } from '../../../services/api';
import {
  Users,
  Shield,
  CheckCircle2,
  Ban,
  Search,
  UserPlus,
  ChevronRight,
  Award,
  Download,
  Eye,
  BadgeCheck,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  Lock,
  Unlock,
  X,
  ShieldCheck,
  UserCog,
  FileSpreadsheet,
  KeyRound,
  Filter,
  Mail,
  Phone,
  Calendar,
  Layers
} from 'lucide-react';
import { UserAvatar } from '../../../components/common/UserAvatar';
import { ModeratorPermissionDrawer } from '../../../components/admin/ModeratorPermissionDrawer';

export const AdminUsersPage = () => {
  const toast = useToast();

  // State
  const [usersList, setUsersList] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    adminCount: 0,
    moderatorCount: 0,
    newUsersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Server-side pagination
  const [pageNum, setPageNum] = useState(0);
  const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 1, number: 0 });

  // Real activity summary for selected user
  const [activitySummary, setActivitySummary] = useState(null);

  // Modal: Temporary password after reset (shown once)
  const [resetPasswordResult, setResetPasswordResult] = useState(null);
  const [permissionDrawerUser, setPermissionDrawerUser] = useState(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'staff', 'locked'
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected for batch action
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Selected user for audit drawer
  const [selectedAuditUser, setSelectedAuditUser] = useState(null);

  // Modal: Change Role
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [newSelectedRole, setNewSelectedRole] = useState('ROLE_USER');

  // Modal: Create / Invite User
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    handle: '',
    phoneNumber: '',
    role: 'ROLE_USER'
  });

  // Load Real Data from Backend — server-side pagination
  const loadData = async (isManualRefresh = false, targetPage = pageNum) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [fetchedPage, fetchedMetrics] = await Promise.all([
        adminUserApi.getUsers({ page: targetPage, size: 20 }),
        adminUserApi.getUserMetrics()
      ]);

      const usersArr = Array.isArray(fetchedPage) ? fetchedPage : (fetchedPage.content || []);
      setUsersList(usersArr);
      if (!Array.isArray(fetchedPage)) {
        setPagination({
          totalElements: fetchedPage.totalElements || 0,
          totalPages: fetchedPage.totalPages || 1,
          number: fetchedPage.number || 0
        });
      }
      if (fetchedMetrics) {
        setMetrics(fetchedMetrics);
      }

      // Default selected audit user to first locked user, or first user in list
      if (!selectedAuditUser && usersArr.length > 0) {
        const priorityUser = usersArr.find(u => u.status === 'LOCKED') || usersArr[0];
        setSelectedAuditUser(priorityUser);
      } else if (selectedAuditUser && usersArr.length > 0) {
        const updatedSelected = usersArr.find(u => u.id === selectedAuditUser.id);
        if (updatedSelected) setSelectedAuditUser(updatedSelected);
      }

      if (isManualRefresh) {
        toast.success('Đồng bộ dữ liệu người dùng thời gian thực thành công!');
      }
    } catch (err) {
      console.error('Failed to load user management data:', err);
      toast.error('Không thể kết nối máy chủ quản lý người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pageNum]);

  // Fetch real activity summary when selected user changes
  useEffect(() => {
    if (!selectedAuditUser || !selectedAuditUser.id) return undefined;
    let cancelled = false;
    setActivitySummary(null);
    adminUserApi.getUserActivity(selectedAuditUser.id).then(summary => {
      if (!cancelled && summary) setActivitySummary(summary);
    }).catch(() => {/* silent fallback */});
    return () => { cancelled = true; };
  }, [selectedAuditUser?.id]);

  // Reset password
  const handleResetPassword = async (user) => {
    try {
      const result = await adminUserApi.resetPassword(user.id);
      setResetPasswordResult(result);
    } catch (err) {
      toast.error('Đặt lại mật khẩu thất bại: ' + err.message);
    }
  };

  // Toggle verified badge
  const handleToggleVerified = async (user) => {
    try {
      const updated = await adminUserApi.setUserVerified(user.id, !user.isVerified);
      setUsersList(prev => prev.map(u => (u.id === updated.id ? updated : u)));
      if (selectedAuditUser?.id === updated.id) setSelectedAuditUser(updated);
      toast.success(!user.isVerified
        ? 'Đã cấp huy hiệu Xác thực cho ' + (user.fullName || user.email)
        : 'Đã gỡ huy hiệu Xác thực của ' + (user.fullName || user.email));
    } catch (err) {
      toast.error('Cập nhật huy hiệu xác thực thất bại: ' + err.message);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      // 1. Tab filter
      if (activeTab === 'staff') {
        const isStaff = user.roles && user.roles.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_MODERATOR');
        if (!isStaff) return false;
      } else if (activeTab === 'locked') {
        if (user.status !== 'LOCKED') return false;
      }

      // 2. Role filter
      if (roleFilter !== 'all') {
        if (!user.roles || !user.roles.includes(roleFilter)) return false;
      }

      // 3. Status filter
      if (statusFilter !== 'all') {
        if (user.status !== statusFilter) return false;
      }

      // 4. Keyword search
      if (searchUser.trim()) {
        const q = searchUser.toLowerCase();
        const matchName = user.fullName && user.fullName.toLowerCase().includes(q);
        const matchEmail = user.email && user.email.toLowerCase().includes(q);
        const matchHandle = user.handle && user.handle.toLowerCase().includes(q);
        const matchId = user.id && String(user.id).includes(q);
        const matchPhone = user.phoneNumber && user.phoneNumber.includes(q);
        if (!matchName && !matchEmail && !matchHandle && !matchId && !matchPhone) return false;
      }

      return true;
    });
  }, [usersList, activeTab, roleFilter, statusFilter, searchUser]);

  // Handlers
  const handleToggleStatus = async (user) => {
    try {
      const willLock = user.status === 'ACTIVE';
      await adminUserApi.toggleUserStatus(user.id);
      
      const updatedStatus = willLock ? 'LOCKED' : 'ACTIVE';
      const isLocked = willLock;

      setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, status: updatedStatus, isLocked } : u));
      if (selectedAuditUser && selectedAuditUser.id === user.id) {
        setSelectedAuditUser(prev => ({ ...prev, status: updatedStatus, isLocked }));
      }

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        activeUsers: willLock ? Math.max(0, prev.activeUsers - 1) : prev.activeUsers + 1,
        lockedUsers: willLock ? prev.lockedUsers + 1 : Math.max(0, prev.lockedUsers - 1)
      }));

      if (willLock) {
        toast.warning(`Đã khóa tài khoản [${user.fullName || user.email}]!`);
      } else {
        toast.success(`Đã kích hoạt lại tài khoản [${user.fullName || user.email}]!`);
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      toast.error('Lỗi khi thay đổi trạng thái tài khoản: ' + err.message);
    }
  };

  const openRoleModal = (user) => {
    setUserToChangeRole(user);
    const currentPrimary = (user.roles && user.roles.find(r => r === 'ROLE_ADMIN')) 
      || (user.roles && user.roles.find(r => r === 'ROLE_MODERATOR')) 
      || 'ROLE_USER';
    setNewSelectedRole(currentPrimary);
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!userToChangeRole) return;
    try {
      await adminUserApi.updateUserRole(userToChangeRole.id, newSelectedRole);
      
      setUsersList(prev => prev.map(u => {
        if (u.id === userToChangeRole.id) {
          return { ...u, roles: [newSelectedRole] };
        }
        return u;
      }));

      if (selectedAuditUser && selectedAuditUser.id === userToChangeRole.id) {
        setSelectedAuditUser(prev => ({ ...prev, roles: [newSelectedRole] }));
      }

      toast.success(`Đã cập nhật vai trò RBAC cho [${userToChangeRole.fullName || userToChangeRole.email}]!`);
      setShowRoleModal(false);
      setUserToChangeRole(null);
    } catch (err) {
      console.error('Update role error:', err);
      toast.error('Không thể cập nhật quyền hạn: ' + err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.email || !newUserForm.password || !newUserForm.fullName) {
      toast.error('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu!');
      return;
    }

    setIsSubmittingUser(true);
    try {
      await adminUserApi.createUser(newUserForm);
      toast.success('Đã khởi tạo tài khoản và phân quyền thành công!');
      setShowAddUserModal(false);
      setNewUserForm({
        fullName: '',
        email: '',
        password: '',
        handle: '',
        phoneNumber: '',
        role: 'ROLE_USER'
      });
      loadData();
    } catch (err) {
      console.error('Create user error:', err);
      toast.error('Không thể tạo người dùng: ' + err.message);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (usersList.length === 0) {
      toast.info('Không có dữ liệu để xuất CSV');
      return;
    }
    const headers = ['ID', 'Ho Ten', 'Email', 'Handle', 'Vai Tro', 'Trang Thai', 'Chuyen Di', 'Danh Gia', 'Da Xac Thuc'];
    const rows = usersList.map(u => [
      u.id,
      `"${u.fullName || ''}"`,
      u.email,
      u.handle || '',
      `"${(u.roles || []).join(', ')}"`,
      u.status || 'ACTIVE',
      u.tripsCount || 0,
      u.reviewsCount || 0,
      u.isVerified ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wayfare_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã xuất file CSV hồ sơ người dùng thành công!');
  };

  // Batch toggle selection
  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Batch lock selected
  const handleBatchLock = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      for (const id of selectedUserIds) {
        await adminUserApi.toggleUserStatus(id);
      }
      toast.success(`Đã cập nhật trạng thái cho ${selectedUserIds.length} tài khoản!`);
      setSelectedUserIds([]);
      loadData();
    } catch (err) {
      toast.error('Lỗi khi thao tác hàng loạt');
    }
  };

  // Helper for role badge (Paper-Ink-Clay style)
  const renderRoleBadge = (roles) => {
    if (!roles || roles.length === 0 || roles.includes('ROLE_USER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-700 border border-ink-200/80 font-mono text-[10px] font-semibold">
          Wanderer
        </span>
      );
    }
    if (roles.includes('ROLE_ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-amber-50 text-amber-900 border border-amber-300/80 font-serif font-bold text-[10px]">
          <Shield className="w-3 h-3 text-amber-700" /> Quản trị viên
        </span>
      );
    }
    if (roles.includes('ROLE_MODERATOR')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-clay-50 text-clay-800 border border-clay-300/80 font-serif font-bold text-[10px]">
          <ShieldCheck className="w-3 h-3 text-clay-700" /> Kiểm duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] bg-[#F8F4EC] text-ink-700 border border-ink-200/80 font-mono text-[10px]">
        {roles[0]}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. HEADER & TOOLBAR (Paper-Ink-Clay) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-500 mb-1">
            <Shield className="w-3.5 h-3.5 text-clay-600" />
            <span>Wayfare Security & RBAC</span>
            <span>•</span>
            <span className="text-clay-600 font-bold">Quản trị người dùng</span>
          </div>
          <h1 className="font-display font-black text-2xl lg:text-3xl text-ink-800 tracking-tight flex items-center gap-3">
            Người Dùng & Phân Quyền
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              Live DB
            </span>
          </h1>
          <p className="text-xs text-ink-500 mt-1 max-w-2xl">
            Quản lý định danh thành viên, cấu hình vai trò RBAC và theo dõi lịch sử an toàn cộng đồng từ cơ sở dữ liệu hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F3EFE6] text-ink-700 font-serif font-bold text-xs border border-ink-200/80 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-ink-500" />
            Xuất CSV ({usersList.length})
          </button>
          
          <button 
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F3EFE6] text-ink-700 font-serif font-bold text-xs border border-ink-200/80 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu từ CSDL"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-clay-600 ${refreshing ? 'animate-spin' : ''}`} />
            Đồng bộ
          </button>

          <button 
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-clay-600 hover:bg-clay-700 text-white font-serif font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Thêm nhân sự / Phân quyền
          </button>
        </div>
      </div>

      {/* 2. 4 METRICS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Tổng người dùng */}
        <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">Tổng người dùng đăng ký</span>
              <div className="font-display font-black text-2xl lg:text-3xl text-ink-800 mt-1">
                {metrics.totalUsers} <span className="text-xs font-serif font-normal text-ink-400">tài khoản</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 text-clay-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1.5 pt-1 border-t border-ink-100">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-clay-600 font-bold flex items-center gap-1">
                +{metrics.newUsersToday} mới hôm nay
              </span>
              <span className="text-ink-600 font-semibold">{metrics.activeUsers} đang hoạt động</span>
            </div>
            <div className="w-full bg-[#F0EBE1] h-1.5 rounded-[3px] overflow-hidden">
              <div 
                className="bg-clay-600 h-full rounded-[3px] transition-all duration-500" 
                style={{ width: `${metrics.totalUsers > 0 ? (metrics.activeUsers / metrics.totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Quản trị & Điều hành */}
        <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">Ban quản trị & Nhân sự</span>
              <div className="font-display font-black text-2xl lg:text-3xl text-ink-800 mt-1">
                {metrics.adminCount} <span className="text-xs font-serif font-normal text-ink-400">tài khoản RBAC</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[5px] bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-ink-100 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-[4px] bg-amber-100/70 text-amber-900 border border-amber-200">ADMIN: {metrics.adminCount}</span>
            <span className="px-2 py-0.5 rounded-[4px] bg-clay-100/70 text-clay-900 border border-clay-200">MOD: {metrics.moderatorCount || 0}</span>
          </div>
        </div>

        {/* KPI 3: Tài khoản bị khóa / Ban */}
        <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-rose-600 font-bold block">Tài khoản vi phạm / Khóa</span>
              <div className="font-display font-black text-2xl lg:text-3xl text-rose-700 mt-1">
                {metrics.lockedUsers} <span className="text-xs font-serif font-normal text-rose-400">bị hạn chế</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[5px] bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1 border-t border-ink-100 text-[11px] text-ink-500 flex items-center justify-between">
            <span>Tỷ lệ khóa hệ thống:</span>
            <span className="font-mono font-bold text-ink-700">
              {metrics.totalUsers > 0 ? ((metrics.lockedUsers / metrics.totalUsers) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* KPI 4: Tăng trưởng hôm nay */}
        <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 block">Đăng ký mới hôm nay</span>
              <div className="font-display font-black text-2xl lg:text-3xl text-clay-700 mt-1">
                +{metrics.newUsersToday} <span className="text-xs font-serif font-normal text-ink-400">thành viên</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 text-clay-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1 border-t border-ink-100 text-[11px] text-ink-600 flex items-center justify-between font-mono">
            <span>Kiểm duyệt viên:</span>
            <span className="text-clay-700 font-bold">{metrics.moderatorCount || 0} MODERATOR</span>
          </div>
        </div>

      </div>

      {/* 3. TABS CHUYỂN ĐỔI PHÂN HỆ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-200/80 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#EBE5D8] rounded-[5px]">
          {[
            { id: 'all', label: 'Tất cả tài khoản', count: pagination.totalElements || usersList.length },
            { id: 'staff', label: 'Phân quyền & Ban quản trị', count: metrics.adminCount },
            { id: 'locked', label: 'Tài khoản tạm khóa / Ban', count: metrics.lockedUsers, isUrgent: true }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-[4px] font-serif text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-[#FFFDF8] text-ink-800 font-bold shadow-xs border border-ink-200/80'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#E2DACB] font-medium'
              }`}
            >
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.2 rounded-[3px] font-mono text-[10px] ${
                t.isUrgent && t.count > 0 
                  ? 'bg-rose-100 text-rose-800 font-bold' 
                  : 'bg-ink-100 text-ink-700'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-ink-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>REST API: /api/v1/admin/users</span>
        </div>
      </div>

      {/* 4. FILTER & SEARCH TOOLBAR */}
      <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="flex-1 flex items-center bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-ink-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo Tên, Email, @handle, Số điện thoại hoặc ID #USR..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="bg-transparent border-0 outline-none w-full text-xs text-ink-800 placeholder:text-ink-400 font-sans"
          />
          {searchUser && (
            <button onClick={() => setSearchUser('')} className="text-ink-400 hover:text-ink-700 text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] px-2.5 py-1.5">
            <Filter className="w-3 h-3 text-ink-500 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs font-serif font-bold text-ink-700 cursor-pointer pr-2"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
              <option value="ROLE_MODERATOR">Kiểm duyệt viên (Mod)</option>
              <option value="ROLE_USER">Thành viên (Wanderer)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] px-2.5 py-1.5">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs font-serif font-bold text-ink-700 cursor-pointer pr-2"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động (Active)</option>
              <option value="LOCKED">Đã khóa (Locked/Banned)</option>
            </select>
          </div>

          <button 
            onClick={() => loadData(true)}
            className="p-2 rounded-[5px] bg-[#F8F4EC] hover:bg-[#EBE5D8] text-ink-600 transition-colors border border-ink-200/80 cursor-pointer" 
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5. BỐ CỤC 2 CỘT: BẢNG NGƯỜI DÙNG (68%) & AUDIT DRAWER (32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: USER TABLE (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] shadow-xs overflow-hidden">
            
            {/* Table Header Batch Actions */}
            <div className="px-4 py-2.5 bg-[#F8F4EC] border-b border-ink-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                  onChange={toggleSelectAll}
                  className="rounded-[3px] accent-clay-600 focus:ring-clay-500 cursor-pointer" 
                />
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 font-bold">
                  Đã chọn {selectedUserIds.length} / {filteredUsers.length} tài khoản
                </span>
              </div>
              {selectedUserIds.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button 
                    onClick={handleBatchLock}
                    className="px-2.5 py-1 rounded-[4px] bg-rose-50 border border-rose-200 text-rose-700 font-serif font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Khóa / Mở khóa ({selectedUserIds.length})
                  </button>
                </div>
              )}
            </div>

            {/* User Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F4EC]/60 text-ink-500 font-mono text-[10px] uppercase tracking-wider border-b border-ink-200/80">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center"></th>
                    <th className="py-2.5 px-3">Người dùng & Định danh</th>
                    <th className="py-2.5 px-3">Vai trò RBAC</th>
                    <th className="py-2.5 px-3 text-center">Chuyến đi & Bài viết</th>
                    <th className="py-2.5 px-3 text-center">Đánh giá</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-ink-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-clay-600" />
                        Đang đồng bộ dữ liệu người dùng từ cơ sở dữ liệu...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-ink-400 font-serif">
                        Không tìm thấy tài khoản nào khớp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      const isAudited = selectedAuditUser && selectedAuditUser.id === user.id;

                      return (
                        <tr 
                          key={user.id} 
                          onClick={() => setSelectedAuditUser(user)}
                          className={`hover:bg-[#F8F4EC]/70 transition-colors cursor-pointer ${
                            isAudited ? 'bg-[#F8F4EC] border-l-2 border-l-clay-600' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSelectUser(user.id)}
                              className="rounded-[3px] accent-clay-600 focus:ring-clay-500 cursor-pointer" 
                            />
                          </td>

                          {/* User Info */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar user={user} size="sm" showBadge={true} />
                              <div className="min-w-0">
                                <div className="font-serif font-bold text-ink-800 flex items-center gap-1.5 truncate">
                                  <span>{user.fullName || 'Chưa đặt tên'}</span>
                                  {user.isVerified && (
                                    <BadgeCheck className="w-3.5 h-3.5 text-clay-600 shrink-0" title="Tài khoản đã xác thực" />
                                  )}
                                </div>
                                <div className="text-ink-400 font-mono text-[10px] truncate">
                                  {user.handle || ('@' + (user.email ? user.email.split('@')[0] : 'user'))} • #USR-{user.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-3">
                            {renderRoleBadge(user.roles)}
                          </td>

                          {/* Activity: Trips & Posts */}
                          <td className="py-3 px-3 text-center">
                            <div className="font-serif font-bold text-ink-800">{user.tripsCount || 0} chuyến</div>
                            <span className="text-ink-400 font-mono text-[10px]">{user.postsCount || 0} bài</span>
                          </td>

                          {/* Reviews Count */}
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F8F4EC] border border-ink-200/60 text-ink-700 font-mono text-[10px] font-bold">
                              <Award className="w-3 h-3 text-amber-600" /> {user.reviewsCount || 0}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            {user.status === 'LOCKED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[10px] font-bold">
                                <Ban className="w-2.5 h-2.5 text-rose-600" /> Đã khóa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Hoạt động
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1">
                              {/* View detail in audit */}
                              <button 
                                onClick={() => setSelectedAuditUser(user)}
                                className="w-7 h-7 rounded-[4px] hover:bg-[#EBE5D8] text-ink-500 hover:text-clay-600 flex items-center justify-center transition-colors cursor-pointer" 
                                title="Xem hồ sơ & Hoạt động thực tế"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Change role */}
                              <button 
                                onClick={() => openRoleModal(user)}
                                className="w-7 h-7 rounded-[4px] hover:bg-amber-100 text-ink-500 hover:text-amber-800 flex items-center justify-center transition-colors cursor-pointer" 
                                title="Phân quyền vai trò RBAC"
                              >
                                <UserCog className="w-3.5 h-3.5" />
                              </button>

                              {/* Granular Permissions Matrix */}
                              <button 
                                onClick={() => setPermissionDrawerUser(user)}
                                className="w-7 h-7 rounded-[4px] hover:bg-clay-100 text-ink-500 hover:text-clay-700 flex items-center justify-center transition-colors cursor-pointer" 
                                title="Phân quyền chi tiết (RBAC Matrix)"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Status Lock / Unlock */}
                              <button 
                                onClick={() => handleToggleStatus(user)}
                                className={`w-7 h-7 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                                  user.status === 'LOCKED'
                                    ? 'hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800'
                                    : 'hover:bg-rose-100 text-ink-400 hover:text-rose-700'
                                }`} 
                                title={user.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                              >
                                {user.status === 'LOCKED' ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}

                </tbody>
              </table>
            </div>

            {/* Pagination Controls — server-side */}
            <div className="px-4 py-2.5 bg-[#F8F4EC] border-t border-ink-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500 font-mono">
              <div>
                Bản ghi <strong className="text-ink-800">{pagination.totalElements === 0 ? 0 : pagination.number * 20 + 1} - {pagination.number * 20 + usersList.length}</strong> / <strong className="text-ink-800">{pagination.totalElements}</strong> tài khoản
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPageNum(p => Math.max(0, p - 1))}
                  disabled={pagination.number === 0}
                  className="w-7 h-7 rounded-[4px] bg-[#FFFDF8] border border-ink-200/80 flex items-center justify-center text-ink-700 hover:bg-[#F3EFE6] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 py-1 rounded-[4px] bg-clay-600 text-white font-mono font-bold text-xs">
                  {pagination.number + 1}
                </span>
                <button
                  onClick={() => setPageNum(p => p + 1)}
                  disabled={pagination.number >= pagination.totalPages - 1}
                  className="w-7 h-7 rounded-[4px] bg-[#FFFDF8] border border-ink-200/80 flex items-center justify-center text-ink-700 hover:bg-[#F3EFE6] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: USER AUDIT & ACTION DRAWER (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          <div className="p-5 rounded-[6px] bg-[#FFFDF8] border border-ink-200/80 shadow-xs flex flex-col space-y-4">
            
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-ink-200/80">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selectedAuditUser?.status === 'LOCKED' ? 'bg-rose-600 animate-ping' : 'bg-emerald-500'}`}></span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-700">
                  Hồ Sơ & Thao Tác Quản Trị
                </span>
              </div>
              {selectedAuditUser?.status === 'LOCKED' ? (
                <span className="px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-mono font-bold">
                  Bị hạn chế
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  Hợp lệ
                </span>
              )}
            </div>

            {selectedAuditUser ? (
              <>
                {/* Profile summary of selected user */}
                <div className="p-3.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 flex items-start gap-3">
                  {selectedAuditUser.avatarUrl ? (
                    <img 
                      src={selectedAuditUser.avatarUrl} 
                      alt={selectedAuditUser.fullName}
                      className="w-12 h-12 rounded-[5px] object-cover border border-ink-200/80 shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-[5px] bg-clay-600 text-white flex items-center justify-center font-display font-black text-base shrink-0">
                      {selectedAuditUser.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-sm text-ink-800 truncate">
                        {selectedAuditUser.fullName || selectedAuditUser.email}
                      </h3>
                      <span className="font-mono text-[10px] text-ink-400">#USR-{selectedAuditUser.id}</span>
                    </div>
                    <p className="text-xs text-ink-500 truncate mt-0.5">
                      {selectedAuditUser.handle ? `@${selectedAuditUser.handle} • ` : ''}{selectedAuditUser.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs">
                      {selectedAuditUser.status === 'LOCKED' ? (
                        <span className="text-rose-700 font-mono text-[11px] font-bold flex items-center gap-1">
                          <Ban className="w-3 h-3" /> Tài khoản bị khóa
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-mono text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
                        </span>
                      )}
                      <span className="text-ink-400">•</span>
                      <span className="text-ink-600 font-serif text-[11px] font-bold flex items-center gap-0.5">
                        {selectedAuditUser.isVerified ? (
                          <><BadgeCheck className="w-3 h-3 text-clay-600" /> Đã xác minh</>
                        ) : (
                          'Chưa xác minh'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thống kê hoạt động THẬT từ DB */}
                <div className="p-3.5 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xs text-ink-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-clay-600" /> Hoạt động CSDL
                    </span>
                    <span className="font-mono text-[10px] text-clay-700 font-bold">
                      {activitySummary ? 'Thời gian thực' : 'Đang truy vấn…'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[
                      { label: 'Bài viết', value: activitySummary?.posts },
                      { label: 'Lịch trình', value: activitySummary?.trips },
                      { label: 'Đánh giá', value: activitySummary?.reviews },
                      { label: 'Đã lưu', value: activitySummary?.savedPlaces },
                      { label: 'Người theo dõi', value: activitySummary?.followers },
                      { label: 'Đang theo dõi', value: activitySummary?.following }
                    ].map(item => (
                      <div key={item.label} className="p-2 rounded-[4px] bg-[#FFFDF8] border border-ink-200/60 text-center">
                        <div className="font-display font-black text-sm text-ink-800">{item.value ?? '—'}</div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-ink-500 font-bold">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Profile Details */}
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500 block">
                    Chi tiết định danh
                  </span>
                  <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-ink-100">
                      <span className="text-ink-500">Vai trò RBAC:</span>
                      <span className="font-mono font-bold text-ink-800">{(selectedAuditUser.roles || []).join(', ') || 'ROLE_USER'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink-100">
                      <span className="text-ink-500">Số điện thoại:</span>
                      <span className="font-mono font-semibold text-ink-800">{selectedAuditUser.phoneNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink-100">
                      <span className="text-ink-500">Tổng chuyến đi:</span>
                      <span className="font-serif font-bold text-ink-800">{selectedAuditUser.tripsCount || 0} chuyến</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-ink-500">Tiểu sử (Bio):</span>
                      <span className="font-serif italic text-ink-800 truncate max-w-[170px]">{selectedAuditUser.bio || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>

                {/* Hành động quản trị thực */}
                <div className="space-y-2 pt-1 border-t border-ink-200/80">
                  <button
                    onClick={() => handleToggleStatus(selectedAuditUser)}
                    className={`w-full py-2.5 rounded-[5px] font-serif font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
                      selectedAuditUser.status === 'LOCKED'
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-rose-700 hover:bg-rose-800 text-white'
                    }`}
                  >
                    {selectedAuditUser.status === 'LOCKED' ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Mở khóa tài khoản (Active)
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" /> Khóa tài khoản (Banned)
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openRoleModal(selectedAuditUser)}
                      className="py-2 rounded-[5px] bg-[#F8F4EC] hover:bg-[#EBE5D8] text-ink-700 font-serif font-bold text-xs border border-ink-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCog className="w-3.5 h-3.5 text-amber-700" /> Phân quyền
                    </button>
                    <button
                      onClick={() => handleResetPassword(selectedAuditUser)}
                      className="py-2 rounded-[5px] bg-[#FFFDF8] hover:bg-[#F3EFE6] text-ink-700 font-serif font-bold text-xs border border-ink-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-clay-600" /> Reset mật khẩu
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleVerified(selectedAuditUser)}
                    className={`w-full py-2 rounded-[5px] font-serif font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
                      selectedAuditUser.isVerified
                        ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                        : 'bg-[#FFFDF8] border-ink-200/80 text-ink-700 hover:bg-[#F3EFE6]'
                    }`}
                  >
                    <BadgeCheck className={`w-3.5 h-3.5 ${selectedAuditUser.isVerified ? 'text-amber-700' : 'text-ink-400'}`} />
                    {selectedAuditUser.isVerified ? 'Đã xác thực — nhấn để gỡ badge' : 'Chưa xác thực — nhấn để cấp badge'}
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-ink-400 font-serif text-xs">
                Chọn một người dùng từ bảng bên trái để xem audit chi tiết.
              </div>
            )}

          </div>
        </div>

      </div>

      {/* 6. MODAL: PHÂN QUYỀN VAI TRÒ (CHANGE ROLE RBAC) */}
      {showRoleModal && userToChangeRole && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ink-200/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[4px] bg-amber-100 text-amber-800 flex items-center justify-center">
                  <UserCog className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-ink-800 text-sm">Phân quyền vai trò RBAC</h3>
              </div>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="w-7 h-7 rounded-[4px] hover:bg-[#F8F4EC] text-ink-400 hover:text-ink-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F8F4EC] border border-ink-200/60 rounded-[5px] flex items-center gap-3">
              <UserAvatar user={userToChangeRole} size="md" showBadge={true} />
              <div>
                <div className="font-serif font-bold text-xs text-ink-800">{userToChangeRole.fullName || userToChangeRole.email}</div>
                <div className="font-mono text-[10px] text-ink-400">{userToChangeRole.email}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-serif font-bold text-xs text-ink-800 block">Chọn vai trò hệ thống chuẩn (RBAC):</label>
              
              <div className="space-y-2">
                {[
                  { role: 'ROLE_ADMIN', title: 'Quản trị viên (Admin)', desc: 'Toàn quyền cấu hình hệ thống, quản trị người dùng, duyệt địa điểm và kiểm duyệt báo cáo vi phạm.' },
                  { role: 'ROLE_MODERATOR', title: 'Kiểm duyệt viên (Moderator)', desc: 'Kiểm duyệt bài viết, đánh giá và địa điểm chờ duyệt. KHÔNG có quyền can thiệp quản trị người dùng.' },
                  { role: 'ROLE_USER', title: 'Người dùng tiêu chuẩn (Wanderer)', desc: 'Tạo lịch trình du lịch cá nhân, chia sẻ bài viết, đánh giá địa điểm và tham gia cộng đồng.' }
                ].map((item) => (
                  <label
                    key={item.role}
                    onClick={() => setNewSelectedRole(item.role)}
                    className={`flex items-start gap-3 p-3 rounded-[5px] border cursor-pointer transition-all ${
                      newSelectedRole === item.role
                        ? 'border-clay-600 bg-clay-50/50 ring-1 ring-clay-600'
                        : 'border-ink-200/80 hover:bg-[#F8F4EC]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="selectedRole" 
                      value={item.role}
                      checked={newSelectedRole === item.role}
                      onChange={() => setNewSelectedRole(item.role)}
                      className="mt-0.5 accent-clay-600" 
                    />
                    <div>
                      <div className="font-serif font-bold text-xs text-ink-800 flex items-center gap-1.5">
                        <span>{item.title}</span>
                        <span className="px-1.5 py-0.2 rounded-[3px] bg-[#EBE5D8] text-ink-700 font-mono text-[9px]">{item.role}</span>
                      </div>
                      <div className="text-[11px] text-ink-500 mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-200/80">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-3.5 py-2 rounded-[5px] text-xs font-serif font-semibold text-ink-600 hover:bg-[#F8F4EC] cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-4 py-2 rounded-[5px] text-xs font-serif font-bold bg-clay-600 hover:bg-clay-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Lưu phân quyền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: THÊM NHÂN SỰ MỚI (CREATE USER / INVITE STAFF) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ink-200/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[4px] bg-clay-100 text-clay-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-ink-800 text-sm">Thêm nhân sự / Phân quyền mới</h3>
              </div>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="w-7 h-7 rounded-[4px] hover:bg-[#F8F4EC] text-ink-400 hover:text-ink-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-serif font-bold text-ink-700 block mb-1">Họ và tên *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Lê Bảo Hoàng"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none text-ink-800 focus:border-clay-600 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-serif font-bold text-ink-700 block mb-1">Địa chỉ Email *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@wayfare.vn"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none text-ink-800 focus:border-clay-600 font-sans"
                  />
                </div>
                <div>
                  <label className="font-serif font-bold text-ink-700 block mb-1">Mật khẩu ban đầu *</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none text-ink-800 focus:border-clay-600 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-serif font-bold text-ink-700 block mb-1">Handle (@username)</label>
                  <input 
                    type="text" 
                    placeholder="hoangle_wander"
                    value={newUserForm.handle}
                    onChange={(e) => setNewUserForm({ ...newUserForm, handle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none text-ink-800 focus:border-clay-600 font-sans"
                  />
                </div>
                <div>
                  <label className="font-serif font-bold text-ink-700 block mb-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    placeholder="0912 345 678"
                    value={newUserForm.phoneNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none text-ink-800 focus:border-clay-600 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="font-serif font-bold text-ink-700 block mb-1">Vai trò cấp phát</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] outline-none font-serif font-semibold text-ink-800"
                >
                  <option value="ROLE_USER">Thành viên thông thường (Wanderer)</option>
                  <option value="ROLE_MODERATOR">Kiểm duyệt viên (Moderator)</option>
                  <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-200/80">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-2 rounded-[5px] text-xs font-serif font-semibold text-ink-600 hover:bg-[#F8F4EC] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-2 rounded-[5px] text-xs font-serif font-bold bg-clay-600 hover:bg-clay-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingUser && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Tạo tài khoản & Phân quyền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: MẬT KHẨU TẠM SAU KHI RESET */}
      {resetPasswordResult && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="w-9 h-9 rounded-[5px] bg-[#F8F4EC] border border-ink-200/60 text-clay-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-ink-800 text-sm">Đã đặt lại mật khẩu thành công</h3>
              <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                Mật khẩu tạm dưới đây chỉ hiển thị <b>một lần duy nhất</b>. Hãy sao chép và gửi trực tiếp cho
                người dùng <b>{resetPasswordResult.email}</b>. Cơ sở dữ liệu chỉ lưu chuỗi mã hóa BCrypt.
              </p>
            </div>
            <div className="p-3 rounded-[5px] bg-ink-800 border border-ink-900 text-center">
              <span className="font-mono font-black text-amber-400 text-base tracking-widest select-all">
                {resetPasswordResult.tempPassword}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-200/80">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resetPasswordResult.tempPassword);
                  toast.success('Đã sao chép mật khẩu tạm vào khay nhớ tạm!');
                }}
                className="px-3.5 py-2 rounded-[5px] bg-[#F8F4EC] text-ink-700 text-xs font-serif font-bold hover:bg-[#EBE5D8] border border-ink-200/80 cursor-pointer"
              >
                Sao chép
              </button>
              <button
                onClick={() => setResetPasswordResult(null)}
                className="px-4 py-2 rounded-[5px] text-xs font-serif font-bold bg-clay-600 hover:bg-clay-700 text-white shadow-xs cursor-pointer"
              >
                Tôi đã lưu mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 9. DRAWER: PHÂN QUYỀN NGƯỜI GIÁM SÁT (RBAC MATRIX) */}
      <ModeratorPermissionDrawer
        isOpen={Boolean(permissionDrawerUser)}
        onClose={() => setPermissionDrawerUser(null)}
        targetUser={permissionDrawerUser}
        onUpdated={() => {
          loadData(true);
        }}
      />

    </div>
  );
};

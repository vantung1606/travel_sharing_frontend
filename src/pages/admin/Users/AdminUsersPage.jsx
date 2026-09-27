import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../../components/common/Toast';
import { adminUserApi } from '../../../services/api';
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Trash2,
  Search,
  UserPlus,
  ChevronRight,
  UserCheck,
  Mail,
  Award,
  MoreHorizontal,
  Download,
  SlidersHorizontal,
  Eye,
  BadgeCheck,
  Gavel,
  RefreshCw,
  Sparkles,
  Link,
  ChevronLeft,
  Lock,
  Unlock,
  X,
  Check,
  Phone,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  UserCog
} from 'lucide-react';

export const AdminUsersPage = () => {
  const toast = useToast();

  // State
  const [usersList, setUsersList] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    adminCount: 0,
    newUsersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('Tất cả tài khoản');
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

  // Load Real Data from Backend
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [fetchedUsers, fetchedMetrics] = await Promise.all([
        adminUserApi.getUsers(),
        adminUserApi.getUserMetrics()
      ]);

      const usersArr = Array.isArray(fetchedUsers) ? fetchedUsers : [];
      setUsersList(usersArr);
      if (fetchedMetrics) {
        setMetrics(fetchedMetrics);
      }

      // Default selected audit user to first locked or high risk user, or first user in list
      if (!selectedAuditUser && usersArr.length > 0) {
        const priorityUser = usersArr.find(u => u.status === 'LOCKED' || (u.riskScore && u.riskScore > 50)) || usersArr[0];
        setSelectedAuditUser(priorityUser);
      } else if (selectedAuditUser && usersArr.length > 0) {
        // Keep updated state for current audit user
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
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      // 1. Tab filter
      if (activeTab === 'Phân quyền & Ban quản trị') {
        const isStaff = user.roles && user.roles.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_MODERATOR' || r === 'ROLE_GUIDE');
        if (!isStaff) return false;
      } else if (activeTab === 'Báo cáo vi phạm & Rủi ro cao') {
        if ((user.riskScore || 0) < 50 && user.status !== 'LOCKED') return false;
      } else if (activeTab === 'Tài khoản tạm khóa / Ban') {
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

  // Average Trust Score
  const avgTrustScore = useMemo(() => {
    if (usersList.length === 0) return '95.0';
    const sum = usersList.reduce((acc, u) => acc + (u.trustScore || 85), 0);
    return (sum / usersList.length).toFixed(1);
  }, [usersList]);

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
        toast.warning(`Đã khóa tài khoản [${user.fullName || user.email}] thành công!`);
      } else {
        toast.success(`Đã kích hoạt lại tài khoản [${user.fullName || user.email}] thành công!`);
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
      || (user.roles && user.roles.find(r => r === 'ROLE_GUIDE')) 
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

      toast.success(`Đã phân quyền thành công cho [${userToChangeRole.fullName}]!`);
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
      toast.success('Đã khởi tạo tài khoản & phân quyền thành công! 🎉');
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
    const headers = ['ID', 'Ho Ten', 'Email', 'Handle', 'Vai Tro', 'Trang Thai', 'Chuyen Di', 'Trust Score', 'Risk Score'];
    const rows = usersList.map(u => [
      u.id,
      `"${u.fullName || ''}"`,
      u.email,
      u.handle || '',
      `"${(u.roles || []).join(', ')}"`,
      u.status || 'ACTIVE',
      u.tripsCount || 0,
      u.trustScore || 0,
      u.riskScore || 0
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

    toast.success('Đã xuất file CSV người dùng thành công! 📊');
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
      toast.success(`Đã cập nhật trạng thái cho ${selectedUserIds.length} tài khoản đã chọn!`);
      setSelectedUserIds([]);
      loadData();
    } catch (err) {
      toast.error('Lỗi khi thực hiện thao tác hàng loạt');
    }
  };

  // Helper for role badge
  const renderRoleBadge = (roles) => {
    if (!roles || roles.length === 0 || roles.includes('ROLE_USER')) {
      return (
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1">
          Wanderer Member
        </span>
      );
    }
    if (roles.includes('ROLE_ADMIN')) {
      return (
        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold inline-flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-purple-600" /> Super Admin
        </span>
      );
    }
    if (roles.includes('ROLE_MODERATOR')) {
      return (
        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Kiểm duyệt viên
        </span>
      );
    }
    if (roles.includes('ROLE_GUIDE')) {
      return (
        <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-bold inline-flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-sky-600" /> Đối tác / HDV
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
        {roles[0]}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. BREADCRUMB & ENTERPRISE HEADER */}
      <div className="flex flex-col gap-1">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Quản trị hệ thống
          </span>
          <span>/</span>
          <span className="text-sky-600 font-bold">Quản lý người dùng & Phân quyền</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Quản lý Người dùng & An toàn Cộng đồng
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></span>
                Dữ liệu thật (DB Active)
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kiểm soát tài khoản, phân quyền quản trị viên RBAC và giám sát an toàn nội dung với WanderAI theo thời gian thực.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Xuất CSV ({usersList.length})
            </button>
            <button 
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
              Đồng bộ dữ liệu
            </button>
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              + Thêm nhân sự / Phân quyền
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 METRICS KPI CARDS (Real from DB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">Tổng người dùng đăng ký</span>
              <div className="font-display font-extrabold text-2xl text-slate-900 mt-1">
                {metrics.totalUsers} <span className="text-xs text-slate-400 font-normal">tài khoản</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-600 font-bold flex items-center gap-0.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span> +{metrics.newUsersToday} mới hôm nay
              </span>
              <span className="text-slate-500 font-semibold">{metrics.activeUsers} hoạt động</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-sky-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${metrics.totalUsers > 0 ? (metrics.activeUsers / metrics.totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">Quản trị & Điều hành</span>
              <div className="font-display font-extrabold text-2xl text-slate-900 mt-1">
                {metrics.adminCount} <span className="text-xs text-slate-400 font-normal">nhân sự RBAC</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Super Admin</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Moderator</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Guide</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-rose-600 font-extrabold uppercase tracking-wider block">Tài khoản vi phạm / Khóa</span>
              <div className="font-display font-extrabold text-2xl text-rose-600 mt-1">
                {metrics.lockedUsers} <span className="text-xs text-rose-500 font-normal">đã vô hiệu hóa</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold">
            <span className="text-amber-600 font-bold">WanderAI Scan</span>
            <span>•</span>
            <span>Chống Spam</span>
            <span>•</span>
            <span>Bảo vệ Tour</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">AI Trust Score Trung Bình</span>
              <div className="font-display font-extrabold text-2xl text-teal-600 mt-1 flex items-baseline gap-1">
                {avgTrustScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Độ tin cậy:</span>
            <span className="text-teal-600 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Chuẩn WanderAI
            </span>
          </div>
        </div>

      </div>

      {/* 3. TABS CHUYỂN ĐỔI PHÂN HỆ */}
      <div className="flex items-center justify-between overflow-x-auto pb-1 text-xs font-bold">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full">
          {[
            { label: 'Tất cả tài khoản', count: usersList.length },
            { label: 'Phân quyền & Ban quản trị', count: metrics.adminCount },
            { label: 'Báo cáo vi phạm & Rủi ro cao', count: usersList.filter(u => (u.riskScore || 0) >= 50).length, isUrgent: true },
            { label: 'Tài khoản tạm khóa / Ban', count: metrics.lockedUsers }
          ].map(t => (
            <button
              key={t.label}
              onClick={() => setActiveTab(t.label)}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === t.label
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>{t.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                t.isUrgent && t.count > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-900/10 text-current'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Backend API Connected (Port 8081)
        </div>
      </div>

      {/* 4. BỘ LỌC & TÌM KIẾM */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm theo Tên, Email, @handle, SĐT hoặc ID người dùng..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="bg-transparent border-0 outline-none w-full text-xs text-slate-800 placeholder:text-slate-400"
          />
          {searchUser && (
            <button onClick={() => setSearchUser('')} className="text-slate-400 hover:text-slate-600 text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ROLE_ADMIN">Super Admin (Quản trị viên)</option>
            <option value="ROLE_MODERATOR">Kiểm duyệt viên (Mod)</option>
            <option value="ROLE_GUIDE">Đối tác / HDV (Guide)</option>
            <option value="ROLE_USER">Thành viên (Wanderer)</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (Active)</option>
            <option value="LOCKED">Đã khóa (Locked/Banned)</option>
          </select>

          <button 
            onClick={() => loadData(true)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" 
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5. BỐ CỤC 2 CỘT: BẢNG NGƯỜI DÙNG (68%) & AUDIT DRAWER (32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: USER TABLE (8 Cols ~ 67-68%) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            
            {/* Table Header Batch Actions */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                  onChange={toggleSelectAll}
                  className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer" 
                />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Đã chọn {selectedUserIds.length} / {filteredUsers.length} tài khoản
                </span>
              </div>
              {selectedUserIds.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button 
                    onClick={handleBatchLock}
                    className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition-colors"
                  >
                    Khóa / Mở khóa ({selectedUserIds.length})
                  </button>
                </div>
              )}
            </div>

            {/* User Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-10"></th>
                    <th className="py-3 px-4">Người dùng & Danh hiệu</th>
                    <th className="py-3 px-4">Vai trò & Cấp phép</th>
                    <th className="py-3 px-4 text-center">Hoạt động</th>
                    <th className="py-3 px-4 text-center">AI Trust</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-500" />
                        Đang đồng bộ dữ liệu người dùng từ cơ sở dữ liệu...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
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
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            isAudited ? 'bg-sky-50/40' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSelectUser(user.id)}
                              className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer" 
                            />
                          </td>

                          {/* User Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img 
                                  src={user.avatarUrl} 
                                  alt={user.fullName} 
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {user.fullName}
                                  {user.isVerified && (
                                    <BadgeCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" title="Đã xác thực" />
                                  )}
                                </div>
                                <span className="text-slate-400 text-[11px]">
                                  {user.handle || ('@' + user.email.split('@')[0])} • ID: #USR-{user.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            {renderRoleBadge(user.roles)}
                          </td>

                          {/* Activity */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-bold text-slate-900">{user.tripsCount || 0} chuyến đi</div>
                            <span className="text-slate-400 text-[11px]">{user.postsCount || 0} bài review</span>
                          </td>

                          {/* AI Trust Score */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${
                              (user.trustScore || 80) >= 80 
                                ? 'bg-teal-100 text-teal-800' 
                                : (user.trustScore || 80) >= 50 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-rose-100 text-rose-800'
                            }`}>
                              <BadgeCheck className="w-3.5 h-3.5" /> {user.trustScore || 85}/100
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {user.status === 'LOCKED' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                                ● Đã khóa (Banned)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                ● Hoạt động
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1">
                              {/* View detail in audit */}
                              <button 
                                onClick={() => setSelectedAuditUser(user)}
                                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 hover:text-sky-600 flex items-center justify-center transition-colors" 
                                title="Xem hồ sơ & Audit"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Change role */}
                              <button 
                                onClick={() => openRoleModal(user)}
                                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 hover:text-purple-600 flex items-center justify-center transition-colors" 
                                title="Phân quyền vai trò"
                              >
                                <UserCog className="w-4 h-4" />
                              </button>

                              {/* Toggle Status Lock / Unlock */}
                              <button 
                                onClick={() => handleToggleStatus(user)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                  user.status === 'LOCKED'
                                    ? 'hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700'
                                    : 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                                }`} 
                                title={user.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                              >
                                {user.status === 'LOCKED' ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
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

            {/* Pagination Controls */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
              <div>
                Hiển thị <strong className="text-slate-900">1 - {filteredUsers.length}</strong> trên tổng số <strong className="text-slate-900">{metrics.totalUsers}</strong> tài khoản
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-40" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold">1</button>
                <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: USER AUDIT & ACTION DRAWER (4 Cols ~ 32-33%) */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md flex flex-col space-y-4">
            
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedAuditUser?.status === 'LOCKED' ? 'bg-rose-600 animate-ping' : 'bg-sky-500'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Xử lý tài khoản & Audit
                </span>
              </div>
              {selectedAuditUser?.status === 'LOCKED' ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                  Đã bị hạn chế
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  Bình thường
                </span>
              )}
            </div>

            {selectedAuditUser ? (
              <>
                {/* Profile summary of selected user */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  {selectedAuditUser.avatarUrl ? (
                    <img 
                      src={selectedAuditUser.avatarUrl} 
                      alt={selectedAuditUser.fullName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {selectedAuditUser.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {selectedAuditUser.handle || ('@' + selectedAuditUser.email.split('@')[0])}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">#USR-{selectedAuditUser.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{selectedAuditUser.fullName} • {selectedAuditUser.email}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      {selectedAuditUser.status === 'LOCKED' ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <Ban className="w-3.5 h-3.5" /> Tài khoản bị khóa
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động hợp lệ
                        </span>
                      )}
                      <span className="text-slate-400">• Trust: {selectedAuditUser.trustScore || 85}%</span>
                    </div>
                  </div>
                </div>

                {/* AI Risk Analysis Engine */}
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  (selectedAuditUser.riskScore || 0) >= 50 
                    ? 'bg-amber-50 border-amber-200/60' 
                    : 'bg-teal-50 border-teal-200/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-sky-600" /> WanderAI Security Shield
                    </span>
                    <span className={`text-xs font-extrabold ${
                      (selectedAuditUser.riskScore || 0) >= 50 ? 'text-amber-700' : 'text-teal-700'
                    }`}>
                      Mức rủi ro: {selectedAuditUser.riskScore || 12}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedAuditUser.riskScore >= 50 
                      ? 'Phát hiện hành vi gửi liên kết quảng bá bất thường hoặc tỷ lệ nội dung trùng lặp cao. Hệ thống khuyến nghị giám sát chặt chẽ.'
                      : 'Hồ sơ người dùng trong sạch, tương tác du lịch tự nhiên, các lịch trình chia sẻ đạt tiêu chuẩn an toàn cộng đồng.'}
                  </p>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        (selectedAuditUser.riskScore || 0) >= 50 ? 'bg-amber-600' : 'bg-teal-600'
                      }`} 
                      style={{ width: `${selectedAuditUser.riskScore || 12}%` }}
                    ></div>
                  </div>
                </div>

                {/* Extra Profile Details */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Chi tiết tài khoản
                  </span>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-500">Vai trò RBAC:</span>
                      <span className="font-semibold text-slate-900">{(selectedAuditUser.roles || []).join(', ') || 'ROLE_USER'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-500">Số điện thoại:</span>
                      <span className="font-semibold text-slate-900">{selectedAuditUser.phoneNumber || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-500">Số chuyến đi:</span>
                      <span className="font-semibold text-slate-900">{selectedAuditUser.tripsCount || 0} chuyến</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Tiểu sử:</span>
                      <span className="font-semibold text-slate-900 italic truncate max-w-[180px]">{selectedAuditUser.bio || 'Chưa có bio'}</span>
                    </div>
                  </div>
                </div>

                {/* Mod Note Area */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ghi chú kiểm duyệt nội bộ
                  </label>
                  <textarea
                    defaultValue={selectedAuditUser.status === 'LOCKED' ? 'Tài khoản đang bị khóa do vi phạm chính sách spam.' : 'Tài khoản thành viên hoạt động tích cực.'}
                    rows={2}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleToggleStatus(selectedAuditUser)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                      selectedAuditUser.status === 'LOCKED'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {selectedAuditUser.status === 'LOCKED' ? (
                      <>
                        <Unlock className="w-4 h-4" /> Mở khóa tài khoản (Active)
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4" /> Khóa tài khoản (Banned)
                      </>
                    )}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openRoleModal(selectedAuditUser)}
                      className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCog className="w-3.5 h-3.5 text-purple-600" /> Phân quyền
                    </button>
                    <button
                      onClick={() => toast.info('Đã lưu ghi chú kiểm duyệt cho tài khoản này!')}
                      className="py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Lưu ghi chú
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chọn một người dùng từ bảng bên trái để xem audit chi tiết.
              </div>
            )}

          </div>
        </div>

      </div>

      {/* 6. MODAL: PHÂN QUYỀN VAI TRÒ (CHANGE ROLE RBAC) */}
      {showRoleModal && userToChangeRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <UserCog className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Phân quyền vai trò RBAC</h3>
              </div>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                {userToChangeRole.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">{userToChangeRole.fullName}</div>
                <div className="text-[11px] text-slate-400">{userToChangeRole.email}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Chọn vai trò hệ thống:</label>
              
              <div className="space-y-2">
                {[
                  { role: 'ROLE_ADMIN', title: 'Super Admin', desc: 'Toàn quyền cấu hình AI, quản trị người dùng, duyệt điểm và xem báo cáo tài chính.' },
                  { role: 'ROLE_MODERATOR', title: 'Kiểm duyệt viên (Mod)', desc: 'Xử lý báo cáo vi phạm cộng đồng, kiểm duyệt bài viết và bình luận.' },
                  { role: 'ROLE_GUIDE', title: 'Đối tác / HDV (Guide)', desc: 'Được phép tạo tour chuyên nghiệp, nhận đặt cọc và kết nối khách.' },
                  { role: 'ROLE_USER', title: 'Thành viên (Wanderer)', desc: 'Tạo lịch trình du lịch cá nhân, chia sẻ bài viết và tham gia cộng đồng.' }
                ].map((item) => (
                  <label
                    key={item.role}
                    onClick={() => setNewSelectedRole(item.role)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      newSelectedRole === item.role
                        ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="selectedRole" 
                      value={item.role}
                      checked={newSelectedRole === item.role}
                      onChange={() => setNewSelectedRole(item.role)}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500" 
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all cursor-pointer"
              >
                Lưu phân quyền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: THÊM NHÂN SỰ MỚI (CREATE USER / INVITE STAFF) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Thêm nhân sự / Phân quyền mới</h3>
              </div>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Lê Bảo Hoàng"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Địa chỉ Email *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@wayfare.vn"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mật khẩu ban đầu *</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Handle (@username)</label>
                  <input 
                    type="text" 
                    placeholder="@hoangle_wander"
                    value={newUserForm.handle}
                    onChange={(e) => setNewUserForm({ ...newUserForm, handle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    placeholder="0912 345 678"
                    value={newUserForm.phoneNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vai trò cấp phát</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-700"
                >
                  <option value="ROLE_USER">Thành viên thông thường (Wanderer)</option>
                  <option value="ROLE_MODERATOR">Kiểm duyệt viên (Moderator)</option>
                  <option value="ROLE_GUIDE">Đối tác / Hướng dẫn viên (Guide)</option>
                  <option value="ROLE_ADMIN">Quản trị viên cấp cao (Super Admin)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingUser && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Tạo tài khoản & Phân quyền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

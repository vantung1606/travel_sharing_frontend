import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, 
  Shield, 
  Users, 
  MapPin, 
  Star, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Palette, 
  History, 
  Check, 
  X, 
  Save, 
  RotateCcw, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';
import { adminPermissionApi } from '../../../services/api';
import { useToast } from '../../../components/common/Toast';
import { UserAvatar } from '../../../components/common/UserAvatar';

// Định nghĩa các module nghiệp vụ và danh sách quyền tương ứng
const MODULE_CONFIGS = [
  {
    key: 'REPORTS',
    label: 'Xử lý Báo cáo & Tố cáo',
    description: 'Cho phép Người giám sát truy cập phân hệ Báo cáo, xem các bài viết/đánh giá bị tố cáo và đưa ra quyết định xử lý hoặc bác bỏ.',
    icon: MessageSquare,
    badgeColor: 'rose',
    accentBorder: 'border-rose-200',
    accentBg: 'bg-rose-50/70',
    accentText: 'text-rose-700',
    permissionCodes: ['REPORTS_VIEW', 'REPORTS_RESOLVE', 'REPORTS_DISMISS']
  },
  {
    key: 'PLACES',
    label: 'Quản lý Địa điểm & Check-in',
    description: 'Cho phép duyệt hoặc từ chối các địa điểm mới do người dùng gửi lên bản đồ du lịch.',
    icon: MapPin,
    badgeColor: 'clay',
    accentBorder: 'border-clay-200',
    accentBg: 'bg-clay-50/70',
    accentText: 'text-clay-700',
    permissionCodes: ['PLACES_VIEW', 'PLACES_APPROVE', 'PLACES_REJECT']
  },
  {
    key: 'REVIEWS',
    label: 'Kiểm duyệt Đánh giá Du khách',
    description: 'Cho phép kiểm duyệt và xử lý các đánh giá vi phạm thuần phong mỹ tục, ẩn hoặc khôi phục đánh giá.',
    icon: Star,
    badgeColor: 'amber',
    accentBorder: 'border-amber-200',
    accentBg: 'bg-amber-50/70',
    accentText: 'text-amber-800',
    permissionCodes: ['REVIEWS_VIEW', 'REVIEWS_HIDE', 'REVIEWS_RESTORE']
  },
  {
    key: 'POSTS',
    label: 'Bài viết & Nhật ký Cộng đồng',
    description: 'Cho phép kiểm duyệt bài viết du lịch của cộng đồng người dùng, ẩn các nội dung sai lệch hoặc vi phạm.',
    icon: FileText,
    badgeColor: 'indigo',
    accentBorder: 'border-indigo-200',
    accentBg: 'bg-indigo-50/70',
    accentText: 'text-indigo-700',
    permissionCodes: ['POSTS_VIEW', 'POSTS_HIDE', 'POSTS_RESTORE']
  },
  {
    key: 'STATISTICS',
    label: 'Thống kê & Phân tích Tăng trưởng',
    description: 'Cho phép xem bảng điều khiển thống kê tăng trưởng thành viên, lượt tương tác và số liệu hệ thống.',
    icon: BarChart3,
    badgeColor: 'emerald',
    accentBorder: 'border-emerald-200',
    accentBg: 'bg-emerald-50/70',
    accentText: 'text-emerald-700',
    permissionCodes: ['STATISTICS_VIEW']
  },
  {
    key: 'THEME',
    label: 'Giao diện & Thương hiệu',
    description: 'Cho phép xem và tùy biến bảng màu hệ thống, logo, tiêu đề SEO và nhận diện thương hiệu.',
    icon: Palette,
    badgeColor: 'purple',
    accentBorder: 'border-purple-200',
    accentBg: 'bg-purple-50/70',
    accentText: 'text-purple-700',
    permissionCodes: ['THEME_VIEW', 'THEME_MANAGE']
  },
  {
    key: 'USERS',
    label: 'Tra cứu Người dùng & Tài khoản',
    description: 'Cho phép xem danh sách thành viên trong hệ thống (chỉ Quản trị viên tối cao mới được đổi quyền hoặc xóa).',
    icon: Users,
    badgeColor: 'sky',
    accentBorder: 'border-sky-200',
    accentBg: 'bg-sky-50/70',
    accentText: 'text-sky-700',
    permissionCodes: ['USERS_VIEW']
  },
  {
    key: 'AUDIT',
    label: 'Nhật ký Kiểm duyệt (Audit Logs)',
    description: 'Cho phép tra cứu lịch sử các thao tác phê duyệt, xử lý vi phạm trong hệ thống.',
    icon: History,
    badgeColor: 'slate',
    accentBorder: 'border-slate-200',
    accentBg: 'bg-slate-50/70',
    accentText: 'text-slate-700',
    permissionCodes: ['AUDIT_VIEW']
  }
];

export const AdminModeratorsPage = () => {
  const toast = useToast();

  const [moderators, setModerators] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMod, setSelectedMod] = useState(null);
  const [effectiveData, setEffectiveData] = useState(null);
  const [loadingEffective, setLoadingEffective] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDetails, setExpandedDetails] = useState({});

  // Module state: moduleKey -> boolean (true = được phép, false = bị chặn)
  const [moduleStates, setModuleStates] = useState({});

  // Tải danh sách người giám sát và danh mục quyền hệ thống
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [modList, allPerms] = await Promise.all([
        adminPermissionApi.getModerators(),
        adminPermissionApi.getAllPermissions()
      ]);
      setModerators(modList || []);
      setCatalog(allPerms || []);

      // Chọn người giám sát đầu tiên mặc định
      if (modList && modList.length > 0) {
        const firstMod = modList.find(m => m.roles?.includes('ROLE_MODERATOR')) || modList[0];
        setSelectedMod(firstMod);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách người giám sát:', err);
      toast.error('Không thể tải dữ liệu: ' + (err.message || 'Lỗi server'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Tải quyền chi tiết khi chọn một Người giám sát
  const loadUserPermissions = useCallback(async (user) => {
    if (!user?.id) return;
    try {
      setLoadingEffective(true);
      const eff = await adminPermissionApi.getEffectivePermissions(user.id);
      setEffectiveData(eff);

      const effectivePerms = new Set(eff?.effectivePermissions || []);

      // Tính trạng thái bật/tắt của từng module dựa trên effective permissions
      const initialModuleStates = {};
      MODULE_CONFIGS.forEach(mod => {
        // Module được xem là BẬT nếu có ít nhất quyền VIEW hoặc phần lớn quyền của module đó
        const primaryCode = mod.permissionCodes[0];
        initialModuleStates[mod.key] = effectivePerms.has(primaryCode);
      });

      setModuleStates(initialModuleStates);
    } catch (err) {
      console.error('Lỗi khi tính toán quyền hiệu lực:', err);
      toast.error('Không thể tải quyền của người giám sát: ' + err.message);
    } finally {
      setLoadingEffective(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedMod?.id) {
      loadUserPermissions(selectedMod);
    }
  }, [selectedMod?.id, loadUserPermissions]);

  // Bật/tắt quyền cho một module
  const handleToggleModule = (moduleKey) => {
    if (isSuperAdmin) {
      toast.info('Quản trị viên tối cao (Admin) luôn có toàn quyền trong toàn bộ hệ thống.');
      return;
    }
    setModuleStates(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  // Toggle xem chi tiết từng quyền con
  const toggleExpand = (moduleKey) => {
    setExpandedDetails(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  // Lưu phân quyền
  const handleSavePermissions = async () => {
    if (!selectedMod?.id) return;
    if (isSuperAdmin) {
      toast.info('Tài khoản này là Quản trị viên tối cao, không cần tùy chỉnh phân quyền.');
      return;
    }

    try {
      setSaving(true);

      const allowList = [];
      const denyList = [];

      MODULE_CONFIGS.forEach(mod => {
        const isEnabled = !!moduleStates[mod.key];
        mod.permissionCodes.forEach(code => {
          if (isEnabled) {
            allowList.push(code);
          } else {
            denyList.push(code);
          }
        });
      });

      await adminPermissionApi.updateUserPermissions(selectedMod.id, {
        allow: allowList,
        deny: denyList
      });

      toast.success(`Đã cập nhật phân quyền cho Người giám sát ${selectedMod.fullName || selectedMod.email} thành công!`);
      // Reload lại quyền
      await loadUserPermissions(selectedMod);
    } catch (err) {
      console.error('Lỗi khi lưu phân quyền:', err);
      toast.error(err.message || 'Không thể lưu phân quyền');
    } finally {
      setSaving(false);
    }
  };

  // Lọc danh sách người giám sát
  const filteredModerators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return moderators;
    return moderators.filter(m => 
      (m.fullName && m.fullName.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q))
    );
  }, [moderators, searchQuery]);

  const isSuperAdmin = selectedMod?.roles?.includes('ROLE_ADMIN');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[6px] bg-clay-700 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-ink-900 tracking-tight">
                Phân Quyền Người Giám Sát (Moderator RBAC)
              </h1>
              <p className="text-xs text-ink-500 font-sans mt-0.5">
                Admin kiểm soát trực tiếp các phân hệ cho từng Người giám sát. Tích vào ô tính năng để cấp quyền quản lý, bỏ tích để thu hồi quyền.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => selectedMod && loadUserPermissions(selectedMod)}
            disabled={loadingEffective}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-medium text-ink-600 bg-[#F8F4EC] hover:bg-ink-100/80 border border-ink-200 rounded-[5px] transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingEffective ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          
          <button
            onClick={handleSavePermissions}
            disabled={saving || loadingEffective || isSuperAdmin}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-serif font-bold text-white rounded-[5px] shadow-xs transition-colors cursor-pointer ${
              isSuperAdmin
                ? 'bg-ink-300 cursor-not-allowed'
                : 'bg-clay-700 hover:bg-clay-800 active:scale-[0.99]'
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Phân Quyền'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left List + Right Permission Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Moderator Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs overflow-hidden flex flex-col">
            
            {/* Search Box */}
            <div className="p-3.5 border-b border-ink-200/80 bg-[#F8F4EC]/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm người giám sát theo tên, email..."
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#FFFDF8] border border-ink-200 rounded-[4px] focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-600 font-sans"
                />
              </div>
            </div>

            {/* List Header */}
            <div className="px-4 py-2.5 bg-[#FFFDF8] border-b border-ink-100 flex items-center justify-between text-[11px] font-mono text-ink-400 uppercase tracking-wider">
              <span>Đội ngũ Giám sát ({filteredModerators.length})</span>
              <span>Vai trò</span>
            </div>

            {/* Moderator List */}
            <div className="divide-y divide-ink-100 max-h-[560px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-ink-400">
                  Đang tải danh sách người giám sát...
                </div>
              ) : filteredModerators.length === 0 ? (
                <div className="p-8 text-center text-xs text-ink-400">
                  Không tìm thấy người giám sát nào.
                </div>
              ) : (
                filteredModerators.map((mod) => {
                  const isSelected = selectedMod?.id === mod.id;
                  const isModAdmin = mod.roles?.includes('ROLE_ADMIN');

                  return (
                    <div
                      key={mod.id}
                      onClick={() => setSelectedMod(mod)}
                      className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-clay-50/80 border-l-4 border-l-clay-700' 
                          : 'hover:bg-[#F8F4EC]/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar 
                          avatarUrl={mod.avatarUrl} 
                          fullName={mod.fullName} 
                          size="md"
                          className="shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-serif font-bold text-ink-900 truncate">
                            {mod.fullName || mod.email}
                          </p>
                          <p className="text-[11px] font-mono text-ink-400 truncate">
                            {mod.email}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-[3px] shrink-0 border ${
                        isModAdmin
                          ? 'bg-clay-50 text-clay-800 border-clay-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {isModAdmin ? 'Admin' : 'Moderator'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Hint Footer */}
            <div className="p-3 bg-[#F8F4EC]/60 border-t border-ink-200/80 text-[11px] text-ink-500 font-sans flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-clay-600 shrink-0 mt-0.5" />
              <span>
                Chọn một Người giám sát ở danh sách trên để xem và tích/bỏ tích các quyền quản lý tương ứng ở cột bên phải.
              </span>
            </div>

          </div>
        </div>

        {/* Right Column: Permission Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Selected Moderator Info Banner */}
          {selectedMod ? (
            <div className="p-4 bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar 
                  avatarUrl={selectedMod.avatarUrl} 
                  fullName={selectedMod.fullName} 
                  size="lg"
                  className="border border-ink-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold font-serif text-ink-900">
                      {selectedMod.fullName || selectedMod.email}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-clay-100 text-clay-800 font-bold border border-clay-300">
                      ID #{selectedMod.id}
                    </span>
                  </div>
                  <p className="text-xs text-ink-400 font-mono mt-0.5">
                    {selectedMod.email}
                  </p>
                </div>
              </div>

              {isSuperAdmin ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-clay-50 text-clay-800 border border-clay-200 text-xs font-serif font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  Toàn quyền Quản trị tối cao (Admin)
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif text-ink-500">Trạng thái phân hệ:</span>
                  <span className="text-xs font-mono font-bold text-clay-700 bg-clay-50 px-2 py-0.5 rounded-[4px] border border-clay-200">
                    {Object.values(moduleStates).filter(Boolean).length} / {MODULE_CONFIGS.length} Cho phép
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {/* Super Admin Notice */}
          {isSuperAdmin && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-[6px] flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed font-sans">
                <p className="font-bold font-serif text-amber-900">Tài khoản này là Quản trị viên tối cao (Super Admin)</p>
                <p className="mt-0.5">
                  Tài khoản Quản trị viên mặc định sở hữu 100% tất cả các quyền trong hệ thống. Để phân quyền hạn chế theo từng module, hãy chọn tài khoản có vai trò <strong>Moderator</strong> (Người giám sát).
                </p>
              </div>
            </div>
          )}

          {/* Module Cards Grid */}
          <div className="space-y-3">
            {MODULE_CONFIGS.map((mod) => {
              const Icon = mod.icon;
              const isChecked = isSuperAdmin ? true : !!moduleStates[mod.key];
              const isExpanded = !!expandedDetails[mod.key];

              return (
                <div 
                  key={mod.key}
                  className={`bg-[#FFFDF8] rounded-[6px] border transition-all duration-200 overflow-hidden shadow-2xs ${
                    isChecked 
                      ? 'border-clay-300 ring-1 ring-clay-200/50' 
                      : 'border-ink-200/80 opacity-75'
                  }`}
                >
                  {/* Module Card Main Row */}
                  <div className="p-4 flex items-start justify-between gap-4">
                    
                    {/* Left: Icon & Module Details */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-9 h-9 rounded-[5px] flex items-center justify-center shrink-0 border ${
                        isChecked 
                          ? `${mod.accentBg} ${mod.accentText} ${mod.accentBorder}` 
                          : 'bg-ink-100 text-ink-400 border-ink-200'
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold font-serif text-ink-900">
                            {mod.label}
                          </h3>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] uppercase ${
                            isChecked
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-ink-100 text-ink-500 border border-ink-200'
                          }`}>
                            {isChecked ? 'Được phép' : 'Bị chặn'}
                          </span>
                        </div>

                        <p className="text-xs text-ink-500 font-sans mt-1 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Checkbox Switch (Tích chọn để cấp quyền, bỏ tích để thu hồi) */}
                    <div className="flex items-center gap-3 shrink-0 pt-0.5">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isSuperAdmin}
                          onChange={() => handleToggleModule(mod.key)}
                          className="w-5 h-5 rounded-[4px] border-ink-300 text-clay-700 focus:ring-clay-600 focus:ring-offset-0 cursor-pointer accent-clay-700"
                        />
                        <span className="text-xs font-serif font-bold text-ink-800 hidden sm:inline">
                          {isChecked ? 'Đang cấp quyền' : 'Chặn quyền'}
                        </span>
                      </label>
                    </div>

                  </div>

                  {/* Accordion Toggle for Detailed Sub-Permissions */}
                  <div className="px-4 py-2 bg-[#F8F4EC]/40 border-t border-ink-100 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => toggleExpand(mod.key)}
                      className="inline-flex items-center gap-1 font-serif text-ink-500 hover:text-clay-700 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Thu gọn mã quyền</span>
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>Xem {mod.permissionCodes.length} quyền hệ thống chi tiết</span>
                        </>
                      )}
                    </button>

                    <span className="font-mono text-[10px] text-ink-400">
                      Module: {mod.key}
                    </span>
                  </div>

                  {/* Sub-Permissions Detail List */}
                  {isExpanded && (
                    <div className="p-3 bg-[#FFFDF8] border-t border-ink-100 space-y-1.5 animate-in fade-in duration-150">
                      {mod.permissionCodes.map((code) => {
                        const permSpec = catalog.find(p => p.code === code);
                        return (
                          <div 
                            key={code}
                            className="flex items-center justify-between p-2 rounded-[4px] bg-[#F8F4EC]/50 text-xs font-sans"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-emerald-500' : 'bg-ink-300'}`} />
                              <span className="font-mono font-bold text-ink-700 text-[11px]">{code}</span>
                              <span className="text-ink-500 text-[11px]">
                                — {permSpec?.name || 'Quyền thao tác hệ thống'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-ink-400">
                              {isChecked ? 'Hoạt động' : 'Vô hiệu hóa'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Bottom Save Bar */}
          <div className="p-4 bg-[#FFFDF8] rounded-[6px] border border-ink-200/80 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-ink-500 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Sau khi tích hoặc bỏ tích các ô trên, nhấn nút <strong>Lưu Thay Đổi</strong> để cập nhật quyền ngay vào cơ sở dữ liệu.
              </span>
            </div>

            <button
              onClick={handleSavePermissions}
              disabled={saving || loadingEffective || isSuperAdmin}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-serif font-bold text-white rounded-[5px] shadow-xs transition-colors shrink-0 cursor-pointer ${
                isSuperAdmin
                  ? 'bg-ink-300 cursor-not-allowed'
                  : 'bg-clay-700 hover:bg-clay-800 active:scale-[0.99]'
              }`}
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Đang lưu phân quyền...' : 'Lưu Thay Đổi Phân Quyền'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

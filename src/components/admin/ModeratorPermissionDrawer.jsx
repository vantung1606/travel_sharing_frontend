import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  X, Shield, ShieldCheck, Check, Ban, RotateCcw, 
  Search, Lock, Info, CheckCircle2, AlertTriangle, Sparkles 
} from 'lucide-react';
import { adminPermissionApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { UserAvatar } from '../common/UserAvatar';

const MODULE_DISPLAY_NAMES = {
  DASHBOARD: 'Dashboard & Hoạt động',
  STATISTICS: 'Thống kê & Báo cáo',
  PLACES: 'Quản lý Địa điểm & Check-in',
  REVIEWS: 'Kiểm duyệt Đánh giá',
  REPORTS: 'Xử lý Tố cáo Vi phạm',
  POSTS: 'Bài viết & Cộng đồng',
  USERS: 'Người dùng & Tài khoản',
  MODERATORS: 'Người giám sát & Phân quyền',
  THEME: 'Giao diện & Thương hiệu',
  SETTINGS: 'Cấu hình Hệ thống',
  AUDIT: 'Nhật ký Hệ thống (Audit)'
};

export const ModeratorPermissionDrawer = ({ isOpen, onClose, targetUser, onUpdated }) => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [effectiveData, setEffectiveData] = useState(null);
  
  // Custom overrides state: code -> 'ALLOW' | 'DENY'
  const [overrides, setOverrides] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch catalog and current user permissions
  const loadPermissions = useCallback(async () => {
    if (!targetUser?.id) return;
    try {
      setLoading(true);
      const [allPerms, eff] = await Promise.all([
        adminPermissionApi.getAllPermissions(),
        adminPermissionApi.getEffectivePermissions(targetUser.id)
      ]);

      setCatalog(allPerms || []);
      setEffectiveData(eff);

      // Pre-populate overrides
      const initialOverrides = {};
      eff?.allowedPermissions?.forEach(code => { initialOverrides[code] = 'ALLOW'; });
      eff?.deniedPermissions?.forEach(code => { initialOverrides[code] = 'DENY'; });
      setOverrides(initialOverrides);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu quyền:', err);
      toast.error('Không thể tải dữ liệu phân quyền: ' + (err.message || 'Lỗi server'));
    } finally {
      setLoading(false);
    }
  }, [targetUser?.id, toast]);

  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen, loadPermissions]);

  // Handle setting 3-way state
  const handleSetState = (code, state) => {
    setOverrides(prev => {
      const next = { ...prev };
      if (state === 'INHERIT') {
        delete next[code];
      } else {
        next[code] = state; // 'ALLOW' or 'DENY'
      }
      return next;
    });
  };

  // Group catalog by module
  const groupedCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const groups = {};

    catalog.forEach(p => {
      if (query) {
        const match = p.name.toLowerCase().includes(query) ||
                      p.code.toLowerCase().includes(query) ||
                      (p.description && p.description.toLowerCase().includes(query));
        if (!match) return;
      }

      if (!groups[p.module]) {
        groups[p.module] = [];
      }
      groups[p.module].push(p);
    });

    return groups;
  }, [catalog, searchQuery]);

  // Calculate live effective preview
  const liveStats = useMemo(() => {
    if (!effectiveData) return { total: 0, allows: 0, denies: 0 };
    const inherited = new Set(effectiveData.inheritedPermissions || []);
    const allows = new Set();
    const denies = new Set();

    Object.entries(overrides).forEach(([code, effect]) => {
      if (effect === 'ALLOW') allows.add(code);
      if (effect === 'DENY') denies.add(code);
    });

    const effective = new Set(inherited);
    allows.forEach(c => effective.add(c));
    denies.forEach(c => effective.delete(c));

    return {
      total: effective.size,
      allows: allows.size,
      denies: denies.size,
      inherited: inherited.size
    };
  }, [effectiveData, overrides]);

  // Bulk actions on a module
  const handleBulkModule = (moduleKey, effect) => {
    const permsInModule = catalog.filter(p => p.module === moduleKey);
    setOverrides(prev => {
      const next = { ...prev };
      permsInModule.forEach(p => {
        if (effect === 'INHERIT') {
          delete next[p.code];
        } else {
          next[p.code] = effect;
        }
      });
      return next;
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!targetUser?.id) return;
    try {
      setSaving(true);
      const allowList = [];
      const denyList = [];

      Object.entries(overrides).forEach(([code, effect]) => {
        if (effect === 'ALLOW') allowList.push(code);
        if (effect === 'DENY') denyList.push(code);
      });

      await adminPermissionApi.updateUserPermissions(targetUser.id, {
        allow: allowList,
        deny: denyList
      });

      toast.success(`Đã cập nhật phân quyền chi tiết cho ${targetUser.fullName || targetUser.email}!`);
      onUpdated?.();
      onClose?.();
    } catch (err) {
      console.error('Lỗi khi lưu phân quyền:', err);
      toast.error(err.message || 'Không thể lưu phân quyền');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isSuperAdmin = targetUser?.roles?.includes('ROLE_ADMIN');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#FFFDF8] h-full shadow-2xl border-l border-ink-200/80 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-ink-200/80 bg-[#F8F4EC]/60 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <UserAvatar 
              avatarUrl={targetUser?.avatarUrl} 
              fullName={targetUser?.fullName} 
              size="lg" 
              className="border border-ink-200" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink-800 font-serif">
                  {targetUser?.fullName || targetUser?.email}
                </h3>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-[4px] border ${
                  isSuperAdmin 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-clay-100 text-clay-900 border-clay-300'
                }`}>
                  {isSuperAdmin ? 'Admin Tối Cao' : 'Người giám sát'}
                </span>
              </div>
              <p className="text-xs text-ink-500 font-sans mt-0.5">
                {targetUser?.email} · {targetUser?.handle || '@moderator'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-[5px] text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Bar */}
        <div className="px-5 py-3 bg-[#F8F4EC] border-b border-ink-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-ink-500 font-medium">Quyền hiệu lực thực tế:</span>
            <span className="font-mono font-bold text-sm text-clay-700 bg-[#FFFDF8] px-2.5 py-0.5 rounded-[4px] border border-clay-300 shadow-2xs">
              {isSuperAdmin ? 'TOÀN QUYỀN (ADMIN)' : `${liveStats.total} / ${catalog.length} quyền`}
            </span>
          </div>

          {!isSuperAdmin && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> +{liveStats.allows} cấp riêng
              </span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <Ban className="w-3 h-3" /> -{liveStats.denies} từ chối
              </span>
            </div>
          )}
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-ink-200/80 flex items-center justify-between gap-3 bg-[#FFFDF8]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm quyền theo tên hoặc mã (vd: PLACES_APPROVE)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] transition-colors"
            />
          </div>

          <button
            onClick={() => setOverrides({})}
            className="px-3 py-1.5 text-xs font-serif font-medium text-ink-600 hover:text-ink-900 bg-[#F8F4EC] hover:bg-[#EAE4D6] rounded-[5px] border border-ink-200 transition-colors flex items-center gap-1.5"
            title="Khôi phục tất cả về quyền mặc định của vai trò"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Mặc định
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 sidebar-scrollbar">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-clay-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-ink-500 font-serif">Đang nạp ma trận quyền của người giám sát...</p>
            </div>
          ) : isSuperAdmin ? (
            <div className="p-6 rounded-[6px] bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold font-serif">
                <ShieldCheck className="w-5 h-5 text-amber-700" /> Tài khoản Quản trị viên tối cao (SuperAdmin)
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-sans">
                Tài khoản này nắm giữ vai trò <code>ROLE_ADMIN</code> nên mặc định được hệ thống trao toàn bộ 100% quyền hạn quản trị (Bypass All Permissions). Để giới hạn chức năng theo ma trận quyền, vui lòng chuyển vai trò tài khoản này thành <strong>Người giám sát (ROLE_MODERATOR)</strong> trước.
              </p>
            </div>
          ) : (
            Object.entries(groupedCatalog).map(([moduleKey, permissions]) => {
              const moduleName = MODULE_DISPLAY_NAMES[moduleKey] || moduleKey;
              
              return (
                <div key={moduleKey} className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] overflow-hidden shadow-2xs">
                  {/* Module Header */}
                  <div className="px-4 py-2.5 bg-[#F8F4EC]/80 border-b border-ink-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-clay-700 uppercase tracking-wider">
                        {moduleKey}
                      </span>
                      <h4 className="text-xs font-bold text-ink-800 font-serif">
                        {moduleName}
                      </h4>
                    </div>

                    {/* Quick batch toggles */}
                    <div className="flex items-center gap-1 text-[10px] font-sans">
                      <button
                        onClick={() => handleBulkModule(moduleKey, 'ALLOW')}
                        className="px-2 py-0.5 rounded text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-medium transition-colors"
                      >
                        Bật hết
                      </button>
                      <button
                        onClick={() => handleBulkModule(moduleKey, 'DENY')}
                        className="px-2 py-0.5 rounded text-rose-700 hover:bg-rose-100 border border-rose-300 font-medium transition-colors"
                      >
                        Chặn hết
                      </button>
                      <button
                        onClick={() => handleBulkModule(moduleKey, 'INHERIT')}
                        className="px-2 py-0.5 rounded text-ink-600 hover:bg-ink-200 border border-ink-300 font-medium transition-colors"
                      >
                        Mặc định
                      </button>
                    </div>
                  </div>

                  {/* Permissions rows */}
                  <div className="divide-y divide-ink-100">
                    {permissions.map(p => {
                      const currentOverride = overrides[p.code];
                      const isInherited = effectiveData?.inheritedPermissions?.includes(p.code);
                      const currentState = currentOverride || (isInherited ? 'INHERITED_ALLOW' : 'INHERITED_DENY');

                      return (
                        <div key={p.code} className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#F8F4EC]/30 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-xs font-bold text-ink-800">
                                {p.name}
                              </span>
                              <span className="font-mono text-[10px] text-ink-400 bg-ink-50 px-1.5 py-0.2 rounded border border-ink-200">
                                {p.code}
                              </span>
                            </div>
                            {p.description && (
                              <p className="text-[11px] text-ink-400 font-sans mt-0.5 line-clamp-1">
                                {p.description}
                              </p>
                            )}
                          </div>

                          {/* 3-State Toggle Switch */}
                          <div className="flex items-center rounded-[5px] p-0.5 bg-ink-100/70 border border-ink-200/80 shrink-0">
                            {/* Inherit (Default from Role) */}
                            <button
                              type="button"
                              onClick={() => handleSetState(p.code, 'INHERIT')}
                              className={`px-2 py-1 text-[11px] font-serif rounded-[3px] transition-all cursor-pointer ${
                                !currentOverride
                                  ? 'bg-[#FFFDF8] text-ink-800 font-bold shadow-xs'
                                  : 'text-ink-400 hover:text-ink-700'
                              }`}
                              title={`Theo vai trò mặc định (${isInherited ? 'Được phép' : 'Không có'})`}
                            >
                              Mặc định
                            </button>

                            {/* ALLOW */}
                            <button
                              type="button"
                              onClick={() => handleSetState(p.code, 'ALLOW')}
                              className={`px-2 py-1 text-[11px] font-serif rounded-[3px] transition-all cursor-pointer flex items-center gap-1 ${
                                currentOverride === 'ALLOW'
                                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                  : 'text-emerald-700 hover:bg-emerald-100/50'
                              }`}
                              title="Cấp riêng cho moderator này"
                            >
                              <Check className="w-3 h-3" /> Cho phép
                            </button>

                            {/* DENY */}
                            <button
                              type="button"
                              onClick={() => handleSetState(p.code, 'DENY')}
                              className={`px-2 py-1 text-[11px] font-serif rounded-[3px] transition-all cursor-pointer flex items-center gap-1 ${
                                currentOverride === 'DENY'
                                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                                  : 'text-rose-700 hover:bg-rose-100/50'
                              }`}
                              title="Chặn riêng quyền này của moderator"
                            >
                              <Ban className="w-3 h-3" /> Từ chối
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-ink-200/80 bg-[#F8F4EC]/80 flex items-center justify-between gap-3">
          <div className="text-xs text-ink-500 font-sans">
            Thao tác lưu sẽ được ghi lại trong <strong>Nhật ký kiểm duyệt (Audit Log)</strong>.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-[5px] text-xs font-serif font-medium text-ink-600 hover:text-ink-900 bg-[#FFFDF8] hover:bg-ink-100 border border-ink-200 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isSuperAdmin}
              className="px-5 py-2 rounded-[5px] text-xs font-serif font-bold text-white bg-clay-600 hover:bg-clay-700 disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lưu phân quyền
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

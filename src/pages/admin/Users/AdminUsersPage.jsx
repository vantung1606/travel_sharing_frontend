import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
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
  ChevronLeft
} from 'lucide-react';

export const AdminUsersPage = () => {
  const { users, reports, toggleUserStatus, resolveReport } = useApp();
  const [activeTab, setActiveTab] = useState('Tất cả tài khoản');
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Selected audit user for right drawer (matching Stitch A03)
  const [selectedAuditUser, setSelectedAuditUser] = useState({
    name: 'Nguyễn Hoàng Long',
    handle: '@tourgiare_dalat',
    id: '#USR-9941',
    email: 'long.tourdalat88@gmail.com',
    ip: '118.69.182.xx',
    reportsCount: 3,
    riskScore: 86,
    aiReason: 'Phát hiện 14 bình luận có mẫu nội dung lặp 98% trong vòng 10 phút. Chứa link điều hướng đến website chưa được cấp phép du lịch.',
    evidenceSnippet: '"Combo tour Đà Lạt 3N2Đ chỉ 499k bao gồm xe limousine, đặt ngay tại bit.ly/tour-dalat-sieu-re cọc trước 50% nhận slot gấp..."',
    modNote: 'Tài khoản có dấu hiệu farm tương tác tự động. Trùng subnet IP với đợt spam tuần trước.'
  });

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
                Real-time Sync
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kiểm soát tài khoản, phân quyền quản trị viên và xử lý báo cáo vi phạm nội dung / spam theo thời gian thực.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all cursor-pointer">
              <Download className="w-4 h-4 text-slate-500" />
              Xuất CSV
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all cursor-pointer">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              Lọc nâng cao
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer">
              <UserPlus className="w-4 h-4" />
              + Thêm nhân sự / Phân quyền
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 METRICS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">Tổng người dùng đăng ký</span>
              <div className="font-display font-extrabold text-2xl text-slate-900 mt-1">128.450</div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-600 font-bold flex items-center gap-0.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span> +1.840 mới hôm nay
              </span>
              <span className="text-slate-500 font-semibold">82% kích hoạt</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-sky-600 h-full rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">Quản trị & Điều hành</span>
              <div className="font-display font-extrabold text-2xl text-slate-900 mt-1">
                34 <span className="text-xs text-slate-400 font-normal">nhân sự</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">5 Super Admin</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">12 Moderator</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">17 Đối tác</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-rose-600 font-extrabold uppercase tracking-wider block">Báo cáo vi phạm đang chờ</span>
              <div className="font-display font-extrabold text-2xl text-rose-600 mt-1">
                15 <span className="text-xs text-rose-500 font-normal">cần xử lý gấp</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold">
            <span className="text-amber-600 font-bold">8 Spam</span>
            <span>•</span>
            <span>5 Mạo danh</span>
            <span>•</span>
            <span>2 Xúc phạm</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">AI Trust Score Trung Bình</span>
              <div className="font-display font-extrabold text-2xl text-teal-600 mt-1 flex items-baseline gap-1">
                94.8 <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Chặn độc hại:</span>
            <span className="text-teal-600 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 91.2% tự động
            </span>
          </div>
        </div>

      </div>

      {/* 3. TABS CHUYỂN ĐỔI PHÂN HỆ */}
      <div className="flex items-center justify-between overflow-x-auto pb-1 text-xs font-bold">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full">
          {[
            { label: 'Tất cả tài khoản', count: '128.450' },
            { label: 'Phân quyền & Ban quản trị', count: '34' },
            { label: 'Báo cáo vi phạm & Spam', count: '15', isUrgent: true },
            { label: 'Tài khoản tạm khóa / Ban', count: '62' }
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
                t.isUrgent ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-900/10 text-current'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span> Cập nhật mỗi 30 giây
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
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Moderator">Kiểm duyệt viên (Mod)</option>
            <option value="Partner">Đối tác Tour (Partner)</option>
            <option value="User">Thành viên (Wanderer)</option>
          </select>

          <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 outline-none cursor-pointer">
            <option>Tất cả trạng thái</option>
            <option>Hoạt động (Active)</option>
            <option>Hạn chế tương tác</option>
            <option>Đã khóa (Banned)</option>
          </select>

          <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" title="Làm mới">
            <RefreshCw className="w-4 h-4" />
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
                <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Đã chọn 1 / 128.450
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors">
                  Gửi thông báo
                </button>
                <button className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors">
                  Cập nhật vai trò
                </button>
              </div>
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
                    <th className="py-3 px-4 text-center">AI Trust Score</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* Row 1: Hoàng Nam */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                            HN
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            Hoàng Nam
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold flex items-center gap-0.5">
                              <Award className="w-3 h-3 text-amber-600" /> Gold
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">@namwanderer • ID: #USR-1082</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        Wanderer Member
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-900">14 chuyến đi</div>
                      <span className="text-slate-400 text-[11px]">18 bài review</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold">
                        <BadgeCheck className="w-3.5 h-3.5 text-teal-600" /> 99/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ● Hoạt động
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 text-slate-400">
                        <button className="p-1.5 hover:text-sky-600"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:text-sky-600"><Shield className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: Minh Anh */}
                  <tr className="hover:bg-slate-50/60 transition-colors bg-sky-50/20">
                    <td className="py-3.5 px-4 text-center">
                      <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                            MA
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            Minh Anh
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold flex items-center gap-0.5">
                              <Shield className="w-3 h-3 text-purple-600" /> Mod
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">@minhanhtravel • ID: #ADM-042</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold">
                        Community Moderator
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-900">32 lịch trình</div>
                      <span className="text-slate-400 text-[11px]">45 bài review</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold">
                        <BadgeCheck className="w-3.5 h-3.5 text-teal-600" /> 100/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ● Hoạt động
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 text-slate-400">
                        <button className="p-1.5 hover:text-sky-600"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:text-sky-600"><Shield className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3: Tuấn Kiệt */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                            TK
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            Tuấn Kiệt
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold">
                              Local Guide
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">@tuankiet_phuot • ID: #USR-4521</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        Nhóm trưởng Trekking
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-900">8 chuyến phượt</div>
                      <span className="text-slate-400 text-[11px]">12 album ảnh</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold">
                        <BadgeCheck className="w-3.5 h-3.5 text-teal-600" /> 95/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ● Hoạt động
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 text-slate-400">
                        <button className="p-1.5 hover:text-sky-600"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:text-sky-600"><Shield className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 4: Nguyễn Hoàng Long (Báo cáo vi phạm AUDIT TARGET) */}
                  <tr className="bg-rose-50/70 hover:bg-rose-100/70 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                            TL
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-rose-600 ring-2 ring-white"></span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            Nguyễn Hoàng Long
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> 3 Tố cáo
                            </span>
                          </div>
                          <span className="text-rose-600 font-bold text-[11px]">@tourgiare_dalat • ID: #USR-9941</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
                        Tài khoản nghi vấn
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-rose-600">0 chuyến đi</div>
                      <span className="text-slate-400 text-[11px]">14 comment spam</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> 24/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 font-bold text-[10px] animate-pulse">
                        Chờ xử lý gấp
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform" title="Đang xử lý ở ngăn bên">
                          <Gavel className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors" title="Khóa ngay">
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 5: Đặng Khoa */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                          ĐK
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Đặng Khoa</div>
                          <span className="text-slate-400 text-[11px]">@dangkhoa_trek • ID: #USR-7729</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        Wanderer Member
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-900">5 chuyến đi</div>
                      <span className="text-slate-400 text-[11px]">6 bài review</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold">
                        <BadgeCheck className="w-3.5 h-3.5 text-teal-600" /> 92/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ● Hoạt động
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 text-slate-400">
                        <button className="p-1.5 hover:text-sky-600"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:text-sky-600"><Shield className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
              <div>Hiển thị <strong className="text-slate-900">1 - 5</strong> trên tổng số <strong className="text-slate-900">128.450</strong> tài khoản</div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-40" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold">1</button>
                <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100">2</button>
                <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100">3</button>
                <span className="px-1 text-slate-400">...</span>
                <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100">2.569</button>
                <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100">
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
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Xử lý báo cáo & Audit
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                Ưu tiên cao
              </span>
            </div>

            {/* Profile summary of reported user */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                TL
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{selectedAuditUser.handle}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedAuditUser.id}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{selectedAuditUser.name} • {selectedAuditUser.email}</p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 3 Tố cáo mới
                  </span>
                  <span className="text-slate-400">• IP: {selectedAuditUser.ip}</span>
                </div>
              </div>
            </div>

            {/* AI Risk Analysis Engine */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-600" /> WanderAI Moderation Engine
                </span>
                <span className="text-xs font-extrabold text-amber-700">Mức rủi ro: {selectedAuditUser.riskScore}%</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedAuditUser.aiReason}
              </p>
              <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: `${selectedAuditUser.riskScore}%` }}></div>
              </div>
            </div>

            {/* Attached Evidence Snippet */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Nội dung vi phạm đính kèm
              </span>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Nhóm: "Phượt Hà Giang & Homestay Đà Lạt"</span>
                  <span>15 phút trước</span>
                </div>
                <div className="italic text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/60">
                  {selectedAuditUser.evidenceSnippet}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                    <Link className="w-3.5 h-3.5" /> Link affiliate độc hại
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-sky-600 font-bold cursor-pointer hover:underline">Xem 2 ảnh bằng chứng</span>
                </div>
              </div>
            </div>

            {/* Mod Note Area */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Ghi chú điều tra nội bộ (Mod note)
              </label>
              <textarea
                defaultValue={selectedAuditUser.modNote}
                rows={2}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  toggleUserStatus('4');
                  resolveReport('rep-1');
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" /> Khóa tài khoản vĩnh viễn (Ban)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => resolveReport('rep-1')}
                  className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Tạm ẩn 7 ngày
                </button>
                <button
                  onClick={() => resolveReport('rep-1')}
                  className="py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
                >
                  Bỏ qua báo cáo
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

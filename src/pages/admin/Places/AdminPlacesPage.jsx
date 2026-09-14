import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  MapPin,
  Check,
  X,
  Search,
  Filter,
  PlusCircle,
  Download,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Camera,
  Map,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const AdminPlacesPage = () => {
  const { pendingPlaces, approvePlace, rejectPlace, destinations } = useApp();
  const [activeTab, setActiveTab] = useState('Chờ duyệt từ cộng đồng');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState({
    id: 'lolo',
    name: 'Homestay Bản Lô Lô Chải',
    category: 'Khách sạn / Homestay',
    location: 'Đồng Văn, Hà Giang',
    coordinates: '23.3592° N, 105.3184° E',
    tags: ['Văn hóa bản địa', 'Cột cờ Lũng Cú', 'Trang phục Lô Lô'],
    submittedBy: '@namwanderer',
    submittedTime: '15 phút trước',
    status: 'Chờ duyệt',
    imagesCount: 6,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
    description: 'Homestay mang đậm bản sắc dân tộc Lô Lô dưới chân cột cờ Lũng Cú. Tường trình đất vàng nhạt, mái âm dương cổ kính, view thung lũng tuyệt đẹp.'
  });

  const [selectedRows, setSelectedRows] = useState(['lolo', 'doigio']);

  const toggleRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. BREADCRUMB & TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>Quản trị hệ thống</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-sky-600">Quản lý địa điểm & Check-in</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý Địa điểm & Phê duyệt Điểm Check-in
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-sky-600 font-bold text-xs border border-slate-200">
              Live Data Sync
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all cursor-pointer">
            <Download className="w-4 h-4 text-teal-600" />
            <span>Xuất CSV / Excel</span>
          </button>

          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all cursor-pointer">
            <SlidersHorizontal className="w-4 h-4 text-sky-600" />
            <span>Lọc nâng cao</span>
          </button>

          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer">
            <PlusCircle className="w-4 h-4" />
            <span>Thêm địa điểm mới</span>
          </button>
        </div>
      </div>

      {/* 2. 4 METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold">Tổng địa điểm trên hệ thống</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-slate-900">8.940</span>
                <span className="text-xs font-bold text-teal-600">+120</span>
              </div>
              <p className="text-[11px] text-slate-400">Phủ sóng 63 tỉnh thành phố</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Map className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-sky-600 h-full rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-slate-400 font-semibold">Chờ duyệt cộng đồng</p>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-amber-600">28</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Gấp</span>
              </div>
              <p className="text-[11px] text-slate-400">Yêu cầu xử lý trong 24h tới</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '32%' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold">Tọa độ AI gắn nhãn chuẩn</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-slate-900">96.4%</span>
                <span className="text-xs font-bold text-sky-600">Auto-Sync</span>
              </div>
              <p className="text-[11px] text-slate-400">Tối ưu cho WanderAI Planner</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-sky-600 h-full rounded-full" style={{ width: '96.4%' }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold">Báo cáo sai lệch / Đóng cửa</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-rose-600">12</span>
                <span className="text-xs font-bold text-rose-600">Cần rà soát</span>
              </div>
              <p className="text-[11px] text-slate-400">Sai định vị GPS / Đổi giờ mở cửa</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '14%' }}></div>
          </div>
        </div>

      </div>

      {/* 3. STATUS TABS & MULTI-FILTER TOOLBAR CARD */}
      <div className="space-y-3">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { label: 'Tất cả địa điểm', count: '8.940' },
            { label: 'Chờ duyệt từ cộng đồng', count: '28' },
            { label: 'Đã xác minh (Verified)', count: '8.790' },
            { label: 'Tạm ẩn / Đang bảo trì', count: '122' }
          ].map(tab => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.label
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900/10 text-[11px] font-extrabold">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Multi-Filter Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên địa danh, thành phố, địa chỉ, người tạo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-800 rounded-full text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500/20 border border-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <select className="w-full px-3 py-2 bg-slate-50 text-slate-800 rounded-full text-xs font-semibold outline-none border border-slate-200 cursor-pointer">
                <option value="">Tất cả tỉnh thành (63)</option>
                <option value="hagiang">Hà Giang</option>
                <option value="danang">Đà Nẵng</option>
                <option value="dalat">Đà Lạt</option>
                <option value="phuquoc">Phú Quốc</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select className="w-full px-3 py-2 bg-slate-50 text-slate-800 rounded-full text-xs font-semibold outline-none border border-slate-200 cursor-pointer">
                <option value="">Tất cả thể loại</option>
                <option value="canh-dep">Danh lam thắng cảnh</option>
                <option value="homestay">Homestay / Lưu trú</option>
                <option value="cafe">Quán Cafe / Check-in</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select className="w-full px-3 py-2 bg-slate-50 text-slate-800 rounded-full text-xs font-semibold outline-none border border-slate-200 cursor-pointer">
                <option value="">Mức chi phí</option>
                <option value="free">Miễn phí vé</option>
                <option value="under100">&lt; 100.000đ</option>
                <option value="luxury">Cao cấp (&gt; 500k)</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <select className="w-full px-3 py-2 bg-slate-50 text-slate-800 rounded-full text-xs font-semibold outline-none border border-slate-200 cursor-pointer">
                <option value="newest">Mới gửi nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
              <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" title="Làm mới">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Quick AI Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold pt-1">
            <span className="text-slate-400 flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gợi ý lọc AI:
            </span>
            {['☁️ Điểm săn mây mùa thu', '🌅 View hoàng hôn thung lũng', '☕ Cafe Vintage', '⛰️ Đèo Hà Giang', '📸 Top 10 Instagrammable'].map(chip => (
              <button
                key={chip}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 4. BULK ACTIONS BAR */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#283044] text-white shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
              {selectedRows.length}
            </span>
            <span className="text-xs font-bold">địa điểm đang được chọn</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
              <Check className="w-4 h-4" /> Phê duyệt hàng loạt
            </button>
            <button className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
              <Sparkles className="w-4 h-4 text-amber-400" /> Gán AI Tag
            </button>
            <button className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
              <X className="w-4 h-4" /> Từ chối / Ẩn
            </button>
          </div>
        </div>
      )}

      {/* 5. PRIMARY DATA TABLE & RIGHT PREVIEW DRAWER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table Column (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer" />
                  </th>
                  <th className="py-3.5 px-4">Địa điểm & Phân loại</th>
                  <th className="py-3.5 px-4">Khu vực & Tọa độ</th>
                  <th className="py-3.5 px-4">Đặc trưng AI</th>
                  <th className="py-3.5 px-4">Tương tác</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Người đề xuất</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* Row 1: Homestay Bản Lô Lô Chải */}
                <tr
                  onClick={() => setSelectedPlace({
                    id: 'lolo',
                    name: 'Homestay Bản Lô Lô Chải',
                    category: 'Khách sạn / Homestay',
                    location: 'Đồng Văn, Hà Giang',
                    coordinates: '23.3592° N, 105.3184° E',
                    tags: ['Văn hóa bản địa', 'Cột cờ Lũng Cú', 'Trang phục Lô Lô'],
                    submittedBy: '@namwanderer',
                    submittedTime: '15 phút trước',
                    status: 'Chờ duyệt',
                    imagesCount: 6,
                    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
                    description: 'Homestay mang đậm bản sắc dân tộc Lô Lô dưới chân cột cờ Lũng Cú. Tường trình đất vàng nhạt, mái âm dương cổ kính.'
                  })}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes('lolo')}
                      onChange={() => toggleRow('lolo')}
                      className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative shadow-sm">
                        <img
                          src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=150&q=80"
                          alt="Lô Lô Chải"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-white text-[9px] font-bold">6 ảnh</span>
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">Homestay Bản Lô Lô Chải</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">Khách sạn / Homestay</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">User đề xuất</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">Đồng Văn, Hà Giang</span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-600" /> 23.3592° N, 105.3184° E
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">Văn hóa bản địa</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">Cột cờ Lũng Cú</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Mới</span>
                    </div>
                    <span className="text-[10px] text-slate-400">0 check-in</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Chờ duyệt
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">@namwanderer</span>
                    <span className="text-[10px] text-slate-400">15 phút trước</span>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => approvePlace('lolo')}
                        className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="Duyệt"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectPlace('lolo')}
                        className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Từ chối"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 2: Quán Cafe Đồi Gió Đà Lạt */}
                <tr
                  onClick={() => setSelectedPlace({
                    id: 'doigio',
                    name: 'Quán Cafe Đồi Gió Đà Lạt',
                    category: 'Quán Cafe / Ẩm thực',
                    location: 'Phường 11, TP. Đà Lạt',
                    coordinates: '11.9404° N, 108.4583° E',
                    tags: ['Thung lũng đèn', 'Sống ảo hoàng hôn', 'Acoustic đêm'],
                    submittedBy: '@kiettuan',
                    submittedTime: '1 giờ trước',
                    status: 'Chờ duyệt',
                    imagesCount: 4,
                    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
                    description: 'Quán cafe mộc mạc trên đồi thông Đà Lạt ngắm toàn cảnh thung lũng đèn về đêm.'
                  })}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes('doigio')}
                      onChange={() => toggleRow('doigio')}
                      className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative shadow-sm">
                        <img
                          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=150&q=80"
                          alt="Đồi Gió"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-white text-[9px] font-bold">4 ảnh</span>
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">Quán Cafe Đồi Gió Đà Lạt</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">Quán Cafe / Ẩm thực</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">User đề xuất</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">Phường 11, Đà Lạt</span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-600" /> 11.9404° N, 108.4583° E
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">Thung lũng đèn</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">Hoàng hôn</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>4.7</span>
                    </div>
                    <span className="text-[10px] text-slate-400">86 check-in</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Chờ duyệt
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">@kiettuan</span>
                    <span className="text-[10px] text-slate-400">1 giờ trước</span>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => approvePlace('doigio')}
                        className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="Duyệt"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectPlace('doigio')}
                        className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Từ chối"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Verified Destinations */}
                {destinations.map(d => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedPlace({
                      id: d.id,
                      name: d.name,
                      category: d.category,
                      location: d.name,
                      coordinates: `${d.coordinates.lat}° N, ${d.coordinates.lng}° E`,
                      tags: d.tags,
                      submittedBy: 'System Admin',
                      submittedTime: 'Gốc CSDL',
                      status: 'Đã xuất bản',
                      imagesCount: 18,
                      image: d.image,
                      description: d.description
                    })}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={d.image} alt={d.name} className="w-14 h-14 rounded-xl object-cover" />
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{d.name}</h4>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">{d.category}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> AI Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{d.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-600" /> {d.coordinates.lat}° N, {d.coordinates.lng}° E
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {d.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{d.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{d.reviewsCount} check-in</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Đã xuất bản
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">System Admin</span>
                      <span className="text-[10px] text-slate-400">Gốc CSDL</span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1 text-slate-400">
                        <button className="p-1.5 hover:text-sky-600"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:text-sky-600"><Edit className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>

        {/* Right Preview Drawer (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-600" /> Chi Tiết Địa Điểm Đề Xuất
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              selectedPlace.status === 'Chờ duyệt' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {selectedPlace.status}
            </span>
          </div>

          {/* Place Preview Card */}
          <div className="space-y-3">
            <div className="h-44 rounded-2xl overflow-hidden relative shadow-sm bg-slate-100">
              <img src={selectedPlace.image} alt={selectedPlace.name} className="w-full h-full object-cover" />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-bold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> {selectedPlace.imagesCount} ảnh
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">{selectedPlace.name}</h3>
              <p className="text-xs text-slate-500 font-semibold">{selectedPlace.location}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Tọa độ: {selectedPlace.coordinates}</p>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {selectedPlace.description}
            </p>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nhãn AI Tự Động Phân Loại</span>
              <div className="flex flex-wrap gap-1">
                {selectedPlace.tags.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Người đề xuất:</span>
              <span className="font-bold text-slate-900">{selectedPlace.submittedBy} ({selectedPlace.submittedTime})</span>
            </div>

            {selectedPlace.status === 'Chờ duyệt' && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => approvePlace(selectedPlace.id)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Phê duyệt địa điểm
                </button>
                <button
                  onClick={() => rejectPlace(selectedPlace.id)}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Từ chối
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

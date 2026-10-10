import React, { useState, useMemo } from 'react';
import { useToast } from '../common/Toast';
import { X, Download, Printer, Calendar, FileText, Copy, Check, FileCode } from 'lucide-react';

export const ItineraryExportModal = ({ itinerary, onClose }) => {
  const toast = useToast();

  // Export Format Tabs: 'pdf' | 'calendar' | 'text' | 'json'
  const [activeTab, setActiveTab] = useState('pdf');

  // Customization Options
  const [includeBudget, setIncludeBudget] = useState(true);
  const [includeTips, setIncludeTips] = useState(true);
  const [includeChecklist, setIncludeChecklist] = useState(true);
  const [includeEmergency, setIncludeEmergency] = useState(true);
  const [copiedText, setCopiedText] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!itinerary) return null;

  const days = itinerary.days && itinerary.days.length > 0 ? itinerary.days : [
    {
      dayNumber: 1,
      title: 'Ngày 1: Khám phá các điểm dừng chân nổi bật',
      activities: [
        {
          time: '08:30 – 10:30',
          category: 'Văn hóa & Danh lam',
          title: `Khám phá biểu tượng ${itinerary.destination || 'Điểm đến'}`,
          location: `${itinerary.destination || 'Trung tâm'} Landmark`,
          address: `Khu vực trung tâm ${itinerary.destination || 'Việt Nam'}`,
          note: 'Khởi đầu ngày mới với cảnh quan tiêu biểu và không gian văn hóa bản địa.',
          aiTip: 'Nên khởi hành sớm để tận hưởng không khí trong lành và chụp ảnh đẹp.',
          cost: '100.000đ/người'
        },
        {
          time: '12:00 – 13:30',
          category: 'Ẩm thực địa phương',
          title: `Thưởng thức ẩm thực truyền thống`,
          location: `Phố ẩm thực ${itinerary.destination || 'địa phương'}`,
          address: `Tuyến phố đặc sản, ${itinerary.destination || 'Việt Nam'}`,
          note: 'Trải nghiệm ẩm thực phong phú mang đậm phong vị địa phương.',
          aiTip: 'Thưởng thức các món đặc sản theo đề xuất của người bản địa.',
          cost: '120.000đ/người'
        }
      ]
    }
  ];

  const destination = itinerary.destination || 'Điểm đến du lịch';
  const title = itinerary.title || `Hành trình khám phá ${destination}`;
  const duration = itinerary.duration || `${days.length}N${days.length > 1 ? days.length - 1 : 1}Đ`;
  const totalBudget = itinerary.totalBudget || itinerary.budgetTotal || (days.length * 1500000);
  const budgetPerPerson = itinerary.budgetPerPerson || Math.round(totalBudget / 4);

  // 1. Generate Plain Text Summary for Chat Sharing
  const textSummary = useMemo(() => {
    let out = `====================================================\n`;
    out += `🗺️ CẨM NANG HÀNH TRÌNH DU LỊCH WAYFARE\n`;
    out += `📌 Chuyến đi: ${title}\n`;
    out += `📍 Điểm đến: ${destination} | ⏱️ Thời lượng: ${duration}\n`;
    if (includeBudget) {
      out += `💰 Dự toán: ~${Number(budgetPerPerson).toLocaleString('vi-VN')} đ/người (Tổng nhóm: ~${Number(totalBudget).toLocaleString('vi-VN')} đ)\n`;
    }
    out += `====================================================\n\n`;

    days.forEach((day, dIdx) => {
      out += `📅 【${day.title || `NGÀY ${dIdx + 1}`}】\n`;
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((act, aIdx) => {
          out += `  • ${act.time || 'Thời gian tự do'}: ${act.title}\n`;
          out += `    📍 Địa điểm: ${act.location || ''} (${act.address || ''})\n`;
          if (act.note) out += `    📝 Ghi chú: ${act.note}\n`;
          if (includeTips && act.aiTip) out += `    💡 Mẹo AI: ${act.aiTip}\n`;
          if (includeBudget && act.cost) out += `    💵 Chi phí: ${act.cost}\n`;
          out += `\n`;
        });
      }
      out += `----------------------------------------------------\n`;
    });

    if (includeChecklist) {
      out += `\n🎒 HÀNH TRANG CẦN CHUẨN BỊ:\n`;
      out += `  [x] Giấy tờ tùy thân (CCCD/Hộ chiếu gốc, GPLX)\n`;
      out += `  [x] Sạc dự phòng, cáp sạc và thiết bị chụp ảnh\n`;
      out += `  [x] Thuốc men cơ bản (Say xe, hạ sốt, băng cá nhân)\n`;
      out += `  [x] Trang phục phù hợp thời tiết ${destination}\n`;
      out += `----------------------------------------------------\n`;
    }

    if (includeEmergency) {
      out += `\n🚨 SỐ ĐIỆN THOẠI KHẨN CẤP & CỨU HỘ:\n`;
      out += `  • Cảnh sát / Trật tự: 113\n`;
      out += `  • Cứu hỏa / Cứu nạn: 114\n`;
      out += `  • Cấp cứu y tế: 115\n`;
      out += `  • Hỗ trợ du khách Wayfare: 1900 6868\n`;
      out += `====================================================\n`;
    }

    out += `\nĐược tạo bởi Wayfare Travel Sharing & AI Planner. Chúc bạn có một hành trình đáng nhớ! 🌍✨`;
    return out;
  }, [title, destination, duration, days, includeBudget, includeTips, includeChecklist, includeEmergency, totalBudget, budgetPerPerson]);

  // 2. Generate iCalendar (.ics) content
  const icsContent = useMemo(() => {
    // Generate dates based on current or offset
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    let events = '';

    days.forEach((day, dIdx) => {
      const eventDate = new Date(now.getTime() + (dIdx + 1) * 86400000);
      const dateStr = `${eventDate.getFullYear()}${pad(eventDate.getMonth() + 1)}${pad(eventDate.getDate())}`;

      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((act, aIdx) => {
          let startHour = 8 + aIdx * 2;
          let endHour = startHour + 2;
          if (startHour > 21) startHour = 20;
          if (endHour > 23) endHour = 22;

          const dtStart = `${dateStr}T${pad(startHour)}0000`;
          const dtEnd = `${dateStr}T${pad(endHour)}0000`;
          const uid = `wayfare-${Date.now()}-${dIdx}-${aIdx}@wayfare.vn`;
          const desc = `${act.note || ''}\\nĐịa chỉ: ${act.address || ''}\\nMẹo AI: ${act.aiTip || 'Không có'}`;

          events += `BEGIN:VEVENT\r\n`;
          events += `UID:${uid}\r\n`;
          events += `DTSTAMP:${dateStr}T000000Z\r\n`;
          events += `DTSTART:${dtStart}\r\n`;
          events += `DTEND:${dtEnd}\r\n`;
          events += `SUMMARY:[Wayfare] ${act.title || 'Điểm tham quan'}\r\n`;
          events += `DESCRIPTION:${desc}\r\n`;
          events += `LOCATION:${act.address || act.location || destination}\r\n`;
          events += `STATUS:CONFIRMED\r\n`;
          events += `END:VEVENT\r\n`;
        });
      }
    });

    return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Wayfare//Travel Sharing AI Planner//VI\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:${title}\r\nX-WR-TIMEZONE:Asia/Ho_Chi_Minh\r\n${events}END:VCALENDAR\r\n`;
  }, [title, destination, days]);

  // Action: Copy Text to Clipboard
  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textSummary);
        setCopiedText(true);
        toast.showSuccess('Đã sao chép cẩm nang hành trình vào bộ nhớ tạm! 📋');
        setTimeout(() => setCopiedText(false), 2500);
      }
    } catch (err) {
      toast.showError('Không thể sao chép văn bản: ' + err.message);
    }
  };

  // Action: Download .txt file
  const handleDownloadTxt = () => {
    const blob = new Blob([textSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Wayfare_LichTrinh_${destination.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.showSuccess('Đã tải xuống file văn bản tóm tắt (.txt)! 📄');
  };

  // Action: Download .ics Calendar file
  const handleDownloadICS = () => {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Wayfare_LichTrinh_${destination.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.showSuccess('Đã tải file Lịch (.ics)! Hãy mở file để thêm vào Apple Calendar / Google Calendar 📅');
  };

  // Action: Download .json Data file
  const handleDownloadJSON = () => {
    const exportData = {
      app: 'Wayfare Travel Sharing & AI Planner',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      itinerary: {
        title,
        destination,
        duration,
        totalBudget,
        budgetPerPerson,
        days
      }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Wayfare_Itinerary_${destination.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.showSuccess('Đã tải xuống file dữ liệu JSON cấu trúc đầy đủ! 💾');
  };

  // Action: Print / Save to PDF via styled printable window
  const handlePrintPDF = () => {
    setIsExporting(true);
    toast.info('Đang chuẩn bị bản in / PDF chuẩn A4 sắc nét...');

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      toast.showError('Trình duyệt đã chặn cửa sổ pop-up. Vui lòng cho phép pop-up để in/lưu PDF.');
      setIsExporting(false);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Cẩm nang Hành trình - ${title} - Wayfare</title>
        <style>
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          body {
            color: #1e293b;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 11pt;
            line-height: 1.5;
          }
          .header-banner {
            border-bottom: 3px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .brand-logo {
            font-size: 18pt;
            font-weight: 900;
            color: #0284c7;
            letter-spacing: -0.5px;
          }
          .brand-sub {
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .qr-box {
            text-align: right;
            font-size: 8pt;
            color: #64748b;
          }
          .title-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 20px;
          }
          .main-title {
            font-size: 16pt;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 6px 0;
          }
          .meta-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 9.5pt;
            color: #475569;
          }
          .meta-item strong {
            color: #0f172a;
          }
          .day-card {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            margin-bottom: 18px;
            page-break-inside: avoid;
            overflow: hidden;
          }
          .day-header {
            background: #e0f2fe;
            color: #0369a1;
            font-weight: 800;
            font-size: 11pt;
            padding: 8px 14px;
            border-bottom: 1px solid #bae6fd;
          }
          .activity-row {
            padding: 10px 14px;
            border-bottom: 1px dashed #e2e8f0;
          }
          .activity-row:last-child {
            border-bottom: none;
          }
          .act-title {
            font-size: 10.5pt;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 2px;
          }
          .act-meta {
            font-size: 9pt;
            color: #64748b;
            margin-bottom: 4px;
          }
          .act-note {
            font-size: 9pt;
            color: #334155;
            margin-bottom: 4px;
          }
          .act-tip {
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
            padding: 4px 8px;
            font-size: 8.5pt;
            color: #92400e;
            border-radius: 4px;
            margin-top: 4px;
          }
          .info-grid {
            display: flex;
            gap: 16px;
            margin-top: 20px;
            page-break-inside: avoid;
          }
          .info-col {
            flex: 1;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 14px;
            font-size: 9pt;
          }
          .info-col h4 {
            margin: 0 0 6px 0;
            color: #0f172a;
            font-size: 10pt;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
          }
          .footer-note {
            margin-top: 24px;
            text-align: center;
            font-size: 8pt;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <div>
            <div class="brand-logo">Wayfare</div>
            <div class="brand-sub">Hành Trình Du Lịch Thông Minh & Lịch Trình AI</div>
          </div>
          <div class="qr-box">
            <div>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</div>
            <div style="color: #0284c7; font-weight: bold;">wayfare.vn/community</div>
          </div>
        </div>

        <div class="title-section">
          <h1 class="main-title">${title}</h1>
          <div class="meta-grid">
            <div class="meta-item">📍 Điểm đến: <strong>${destination}</strong></div>
            <div class="meta-item">⏱️ Thời lượng: <strong>${duration}</strong></div>
            ${includeBudget ? `<div class="meta-item">💰 Ngân sách: <strong>~${Number(budgetPerPerson).toLocaleString('vi-VN')} đ/người</strong> (Tổng: ${Number(totalBudget).toLocaleString('vi-VN')} đ)</div>` : ''}
            <div class="meta-item">✨ Phân loại: <strong>Lộ trình WanderAI Tối Ưu</strong></div>
          </div>
        </div>

        <!-- DAYS ITINERARY -->
        ${days.map((d, dIdx) => `
          <div class="day-card">
            <div class="day-header">${d.title || `Ngày ${dIdx + 1}: Lộ trình khám phá`}</div>
            ${(d.activities || []).map(act => `
              <div class="activity-row">
                <div class="act-title">${act.time || '08:30'} • ${act.title}</div>
                <div class="act-meta">
                  📍 <strong>${act.location || ''}</strong>: ${act.address || 'Khu vực trung tâm'} 
                  ${includeBudget && act.cost ? `| 💵 ${act.cost}` : ''}
                </div>
                ${act.note ? `<div class="act-note">${act.note}</div>` : ''}
                ${includeTips && act.aiTip ? `<div class="act-tip">💡 <strong>Mẹo WanderAI:</strong> ${act.aiTip}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}

        <!-- OPTIONAL SECTIONS -->
        <div class="info-grid">
          ${includeChecklist ? `
            <div class="info-col">
              <h4>🎒 Hành trang chuẩn bị</h4>
              <div>☑ CCCD/Hộ chiếu gốc & GPLX</div>
              <div>☑ Sạc dự phòng & máy ảnh/điện thoại</div>
              <div>☑ Thuốc y tế cơ bản, hạ sốt, băng gạc</div>
              <div>☑ Quần áo thoáng mát & chống nắng</div>
              <div>☑ Bản đồ offline hoặc cẩm nang này</div>
            </div>
          ` : ''}

          ${includeEmergency ? `
            <div class="info-col">
              <h4>🚨 Hỗ trợ khẩn cấp tại ${destination}</h4>
              <div>• Cảnh sát / An ninh trật tự: <strong>113</strong></div>
              <div>• Cứu hộ / Cứu nạn: <strong>114</strong></div>
              <div>• Cấp cứu y tế: <strong>115</strong></div>
              <div>• Tổng đài hỗ trợ du lịch: <strong>1900 6868</strong></div>
            </div>
          ` : ''}
        </div>

        <div class="footer-note">
          Tài liệu cẩm nang được biên soạn tự động bởi nền tảng Wayfare. Bạn có thể in cẩm nang này hoặc lưu dưới dạng PDF trên điện thoại để sử dụng ngoại tuyến (Offline) trong suốt chuyến đi.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 my-auto">
        
        {/* Accent Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-sky-500 to-amber-500 shrink-0" />

        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  Xuất bản & Tải xuống Lịch trình
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold">
                  Offline Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {title} • {duration}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Format Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Chọn định dạng tải xuống phù hợp:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pdf', label: 'Cẩm nang PDF (In A4)', icon: Printer, badge: 'Phổ biến nhất' },
                { id: 'calendar', label: 'Lịch ĐT (.ics)', icon: Calendar, badge: 'Apple / Google' },
                { id: 'text', label: 'Bản Tóm tắt Zalo', icon: FileText, badge: 'Gửi nhóm' },
                { id: 'json', label: 'Dữ liệu JSON', icon: FileCode, badge: 'Sao lưu' }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-22 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-2 ring-sky-500/20'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {tab.badge}
                      </span>
                    </div>
                    <div>
                      <span className={`block font-bold text-xs ${isSelected ? 'text-sky-950' : 'text-slate-700'}`}>
                        {tab.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options Customization Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">
              Tùy chọn nội dung xuất bản:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeBudget}
                  onChange={(e) => setIncludeBudget(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Đính kèm Bảng dự toán chi phí</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeTips}
                  onChange={(e) => setIncludeTips(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Đính kèm Mẹo thông minh WanderAI</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeChecklist}
                  onChange={(e) => setIncludeChecklist(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Đính kèm Checklist đồ dùng đi phượt</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeEmergency}
                  onChange={(e) => setIncludeEmergency(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Đính kèm Số cứu hộ & Khẩn cấp</span>
              </label>
            </div>
          </div>

          {/* Tab Specific Content Preview & Actions */}
          {activeTab === 'pdf' && (
            <div className="p-4.5 rounded-2xl border border-sky-100 bg-sky-50/40 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Cẩm nang Hành trình PDF / Bản in chuẩn A4
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Xuất cẩm nang có đầy đủ logo Wayfare, chi tiết lộ trình từng ngày, địa chỉ chính xác, mẹo hay và mã QR. Phù hợp để in ra giấy hoặc lưu thành file PDF mang theo khi không có sóng mạng.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  disabled={isExporting}
                  className="ocean-gradient text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-sky-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Mở Cửa Sổ In / Lưu PDF (A4)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="p-4.5 rounded-2xl border border-sky-100 bg-sky-50/40 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Đồng bộ Lịch Điện Thoại (.ics - iCalendar)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    File lịch chuẩn quốc tế (.ics) tự động tạo các sự kiện theo từng mốc giờ và địa điểm. Tương thích trực tiếp với iPhone (Apple Calendar), Android (Google Calendar) và Outlook.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadICS}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file Lịch điện thoại (.ics)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Xem trước bản tóm tắt gửi nhóm:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-sky-200"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-sky-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Đã chép!' : 'Sao chép nhanh'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file .txt</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={textSummary}
                rows={8}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-[11px] font-mono text-slate-700 outline-none select-all"
              />
            </div>
          )}

          {activeTab === 'json' && (
            <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Xuất dữ liệu cấu trúc Wayfare (.json)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Lưu trữ trọn vẹn dữ liệu JSON các ngày, trạm dừng chân, chi phí và cấu hình AI để lưu trữ cá nhân hoặc tích hợp vào hệ thống khác.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file JSON (.json)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Wayfare Offline Travel Export Utility v2.5
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};


import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Palette, 
  Image, 
  Megaphone,
  Share2,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Type, 
  Sliders, 
  CheckCircle2, 
  RotateCcw, 
  Upload, 
  Save, 
  Eye, 
  Smartphone, 
  Monitor, 
  History, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  Info,
  Layers,
  Compass,
  Search,
  FileText,
  AlertTriangle,
  HelpCircle,
  X
} from 'lucide-react';
import { adminThemeApi, uploadApi } from '../../../services/api';
import { useToast } from '../../../components/common/Toast';
import { useTheme } from '../../../context/ThemeContext';

// ─── 1. BỘ CHỦ ĐỀ MÀU SẮC TUYỂN CHỌN (CURATED TRAVEL THEMES) ─────────────────
export const CURATED_COLOR_THEMES = [
  {
    id: 'classic-clay',
    name: 'Đất Nung Cổ Điển',
    subtitle: 'Chuẩn nhận diện Wayfare',
    badge: 'Mặc định',
    description: 'Tone màu gốm nung đất ấm kết hợp nền giấy ngà mộc mạc và mực nâu đen trang trọng.',
    colors: {
      primary: '#b0522f',
      primaryHover: '#93422a',
      background: '#f8f4ec',
      surface: '#ffffff',
      text: '#1e1a15',
      muted: '#6b6258',
      border: '#e5ded2',
      headerBg: '#f8f4ec',
      sidebarBg: '#1e1a15',
      sidebarText: '#f8f4ec',
      buttonBg: '#b0522f',
      buttonText: '#ffffff',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#2563eb'
    }
  },
  {
    id: 'ocean-cyan',
    name: 'Biển Xanh Ngọc Bích',
    subtitle: 'Cảm hứng Vịnh Lan Hạ & Phú Quốc',
    badge: 'Biển đảo',
    description: 'Tone màu xanh lam ngọc bích của biển khơi mang lại cảm giác khoáng đạt, tự do và tươi mát.',
    colors: {
      primary: '#0284c7',
      primaryHover: '#0369a1',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      border: '#e0f2fe',
      headerBg: '#f0f9ff',
      sidebarBg: '#0f172a',
      sidebarText: '#f0f9ff',
      buttonBg: '#0284c7',
      buttonText: '#ffffff',
      success: '#059669',
      warning: '#d97706',
      danger: '#e11d48',
      info: '#0284c7'
    }
  },
  {
    id: 'forest-emerald',
    name: 'Đại Ngàn Tây Bắc',
    subtitle: 'Cảm hứng Mù Cang Chải & Pù Luông',
    badge: 'Núi rừng',
    description: 'Tone màu xanh ngọc bích của rừng già nguyên sinh và thung lũng lúa xanh bạt ngàn.',
    colors: {
      primary: '#15803d',
      primaryHover: '#166534',
      background: '#f4fbf7',
      surface: '#ffffff',
      text: '#14532d',
      muted: '#4b725a',
      border: '#dcfce7',
      headerBg: '#f4fbf7',
      sidebarBg: '#14532d',
      sidebarText: '#f4fbf7',
      buttonBg: '#15803d',
      buttonText: '#ffffff',
      success: '#16a34a',
      warning: '#ca8a04',
      danger: '#dc2626',
      info: '#2563eb'
    }
  },
  {
    id: 'sunset-amber',
    name: 'Hoàng Hôn Cao Nguyên',
    subtitle: 'Cảm hứng Chiều Tà Đà Lạt & Tà Xùa',
    badge: 'Nắng ấm',
    description: 'Tone màu nắng cam hổ phách hoàng hôn rực rỡ, ấm cúng và ngập tràn cảm xúc lãng mạn.',
    colors: {
      primary: '#c2410c',
      primaryHover: '#9a3412',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#451a03',
      muted: '#78350f',
      border: '#fef3c7',
      headerBg: '#fffbeb',
      sidebarBg: '#451a03',
      sidebarText: '#fffbeb',
      buttonBg: '#c2410c',
      buttonText: '#ffffff',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#2563eb'
    }
  }
];

// Ngăn chặn vòng lặp vô hạn nếu ảnh fallback cũng không tải được
export const handleImageErrorSafe = (e, fallbackSrc = '/wayfare-logo.png') => {
  if (!e || !e.target) return;
  if (e.target.dataset.fallbackApplied) {
    e.target.onerror = null;
    e.target.style.display = 'none';
    return;
  }
  e.target.dataset.fallbackApplied = 'true';
  e.target.onerror = null;
  e.target.src = fallbackSrc;
};

// Gợi ý mã màu 1-chạm cho từng thuộc tính
export const QUICK_COLOR_SWATCHES = {
  primary: ['#b0522f', '#0284c7', '#15803d', '#c2410c', '#7c3aed', '#db2777', '#0f766e', '#1e293b'],
  primaryHover: ['#93422a', '#0369a1', '#166534', '#9a3412', '#6d28d9', '#be185d', '#115e59', '#0f172a'],
  buttonBg: ['#b0522f', '#0284c7', '#15803d', '#c2410c', '#7c3aed', '#1e1a15', '#0f766e', '#dc2626'],
  buttonText: ['#ffffff', '#f8f4ec', '#1e1a15', '#0f172a'],
  background: ['#f8f4ec', '#ffffff', '#f0f9ff', '#f4fbf7', '#fffbeb', '#f8fafc', '#faf5ff', '#fff7ed'],
  surface: ['#ffffff', '#fdfbf7', '#f8fafc', '#fffbeb', '#f0fdf4', '#f1f5f9'],
  text: ['#1e1a15', '#0f172a', '#14532d', '#451a03', '#111827', '#334155'],
  border: ['#e5ded2', '#e0f2fe', '#dcfce7', '#fef3c7', '#e2e8f0', '#cbd5e1', '#fed7aa'],
  headerBg: ['#f8f4ec', '#ffffff', '#f0f9ff', '#f4fbf7', '#fffbeb', '#1e1a15', '#0f172a'],
  sidebarBg: ['#1e1a15', '#0f172a', '#14532d', '#451a03', '#09090b', '#312e81', '#1e293b']
};

export function normalizeHexColor(hex, fallback = '#b0522f') {
  if (!hex || typeof hex !== 'string') return fallback.toLowerCase();
  let clean = hex.trim().toLowerCase();
  if (!clean.startsWith('#')) clean = '#' + clean;
  if (/^#[0-9a-f]{6}$/.test(clean)) return clean;
  if (/^#[0-9a-f]{3}$/.test(clean)) {
    return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return fallback.toLowerCase();
};

// ─── TÍNH TOÁN ĐỘ TƯƠNG PHẢN WCAG (CONTRAST CHECKER) ─────────────────────────
function getLuminance(hex) {
  const norm = normalizeHexColor(hex, '#000000');
  const clean = norm.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export const AdminAppearancePage = () => {
  const toast = useToast();
  const { applyCssTokens, refreshTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('branding'); // branding | colors | components | history
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop | mobile

  // Version data
  const [publishedData, setPublishedData] = useState(null);
  const [publishedVersion, setPublishedVersion] = useState(1);
  const [versionsList, setVersionsList] = useState([]);

  // Editable theme state
  const [formData, setFormData] = useState({
    branding: {
      siteTitle: 'Wayfare',
      tagline: 'Hành trình khám phá du lịch Việt Nam theo cách riêng',
      metaDescription: 'Nền tảng chia sẻ lịch trình du lịch thông minh, khám phá 500+ địa điểm văn hóa và kết nối cộng đồng phượt thủ Việt Nam.',
      logoUrl: '/wayfare-logo.png',
      logoWhiteUrl: '/wayfare-logo-white.png',
      faviconUrl: '/favicon.ico',
      heroBgUrl: '',
      loginBgUrl: '',
      footerText: '© 2026 Wayfare Travel Sharing Platform. Mọi quyền được bảo lưu.',
      contact: {
        hotline: '1900 6868',
        email: 'contact@wayfare.vn',
        address: 'Hà Nội & TP. Hồ Chí Minh, Việt Nam',
        facebook: 'https://facebook.com/wayfare.vietnam',
        instagram: 'https://instagram.com/wayfare.vn',
        tiktok: 'https://tiktok.com/@wayfare.vn',
        youtube: 'https://youtube.com/@wayfarevn',
        threads: 'https://threads.net/@wayfare.vn'
      },
      announcement: {
        enabled: false,
        badge: 'SỰ KIỆN',
        text: 'Chào mừng mùa du lịch 2026 - Khám phá 500+ điểm đến đặc sắc & Lên lịch trình thông minh cùng AI!',
        linkText: 'Khám phá ngay',
        linkUrl: '/explore',
        bgColor: '#B0522F',
        textColor: '#FFFFFF',
        isClosable: true
      }
    },
    colors: {
      primary: '#B0522F',
      primaryHover: '#93422A',
      background: '#F8F4EC',
      surface: '#FFFFFF',
      text: '#1E1A15',
      muted: '#6B6258',
      border: '#E5DED2',
      headerBg: '#F8F4EC',
      sidebarBg: '#1E1A15',
      sidebarText: '#F8F4EC',
      buttonBg: '#B0522F',
      buttonText: '#FFFFFF',
      success: '#16A34A',
      warning: '#D97706',
      danger: '#DC2626',
      info: '#2563EB'
    },
    components: {
      radiusCard: '6px',
      radiusControl: '5px',
      shadowLevel: 'xs',
      headerStyle: 'solid'
    }
  });

  const fileInputRef = useRef(null);

  // Load theme data
  const loadThemeData = useCallback(async () => {
    try {
      setLoading(true);
      const [themeRes, verRes] = await Promise.all([
        adminThemeApi.getTheme(),
        adminThemeApi.getVersions()
      ]);

      if (themeRes?.published) {
        setPublishedData(themeRes.published);
        setPublishedVersion(themeRes.publishedVersion || 1);
      }

      // Use draft if exists, else published
      const source = themeRes?.draft || themeRes?.published;
      if (source) {
        const sanitizedBranding = { ...(source.branding || {}) };
        if (!sanitizedBranding.logoUrl || sanitizedBranding.logoUrl.includes('brand-logo.png')) {
          sanitizedBranding.logoUrl = '/wayfare-logo.png';
        }
        if (!sanitizedBranding.logoWhiteUrl || sanitizedBranding.logoWhiteUrl.includes('brand-logo-white.png')) {
          sanitizedBranding.logoWhiteUrl = '/wayfare-logo-white.png';
        }
        sanitizedBranding.contact = {
          hotline: '1900 6868',
          email: 'contact@wayfare.vn',
          address: 'Hà Nội & TP. Hồ Chí Minh, Việt Nam',
          facebook: 'https://facebook.com/wayfare.vietnam',
          instagram: 'https://instagram.com/wayfare.vn',
          tiktok: 'https://tiktok.com/@wayfare.vn',
          youtube: 'https://youtube.com/@wayfarevn',
          threads: 'https://threads.net/@wayfare.vn',
          ...(sanitizedBranding.contact || {})
        };
        sanitizedBranding.announcement = {
          enabled: false,
          badge: 'SỰ KIỆN',
          text: 'Chào mừng mùa du lịch 2026 - Khám phá 500+ điểm đến đặc sắc & Lên lịch trình thông minh cùng AI!',
          linkText: 'Khám phá ngay',
          linkUrl: '/explore',
          bgColor: '#B0522F',
          textColor: '#FFFFFF',
          isClosable: true,
          ...(sanitizedBranding.announcement || {})
        };

        setFormData(prev => ({
          branding: { ...prev.branding, ...sanitizedBranding },
          colors: { ...prev.colors, ...(source.colors || {}) },
          components: { ...prev.components, ...(source.components || {}) }
        }));
      }

      setVersionsList(verRes || []);
    } catch (err) {
      console.error('Lỗi khi tải cấu hình giao diện:', err);
      toast.error('Không thể tải cấu hình giao diện: ' + (err.message || 'Lỗi server'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Chạy nạp dữ liệu từ máy chủ duy nhất một lần khi trang được nạp (Mount)
  useEffect(() => {
    loadThemeData();
  }, [loadThemeData]);

  // Real-time live synchronization: Whenever formData changes, apply CSS tokens immediately to document!
  useEffect(() => {
    applyCssTokens(formData);
  }, [formData]);

  // Handle color change
  const handleColorChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value
      }
    }));
  };

  // Handle branding change
  const handleBrandingChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [key]: value
      }
    }));
  };

  // Handle contact change
  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        contact: {
          ...(prev.branding?.contact || {}),
          [field]: value
        }
      }
    }));
  };

  // Handle announcement change
  const handleAnnouncementChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        announcement: {
          ...(prev.branding?.announcement || {}),
          [field]: value
        }
      }
    }));
  };

  // Handle components change
  const handleComponentChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [key]: value
      }
    }));
  };

  // Áp dụng bảng màu tuyển chọn
  const handleApplyColorTheme = (theme) => {
    if (!theme || !theme.colors) return;
    const cleanColors = {};
    Object.keys(theme.colors).forEach(k => {
      cleanColors[k] = normalizeHexColor(theme.colors[k]);
    });
    const updated = {
      ...formData,
      colors: {
        ...formData.colors,
        ...cleanColors
      }
    };
    setFormData(updated);
    applyCssTokens(updated);
    toast.success(`Đã kích hoạt bộ phối màu "${theme.name}"! Bạn có thể xem ngay trên khung Xem Trước bên phải.`);
  };

  // Upload ảnh logo/banner trực tiếp lên Cloudinary
  const handleTriggerUpload = (field) => {
    setUploadingField(field);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingField) return;

    try {
      toast.info('Đang tải ảnh lên Cloudinary CDN...');
      const uploadedUrl = await uploadApi.uploadSingle(file);
      if (uploadedUrl) {
        handleBrandingChange(uploadingField, uploadedUrl);
        toast.success('Tải ảnh thành công! Đã tự động cập nhật đường dẫn CDN.');
      }
    } catch (err) {
      console.error('Lỗi upload ảnh:', err);
      toast.error('Tải ảnh thất bại: ' + (err.message || 'Không thể upload'));
    } finally {
      setUploadingField(null);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      await adminThemeApi.saveDraft(formData, 'Lưu bản nháp giao diện');
      toast.success('Đã lưu bản nháp giao diện thành công! Bạn có thể xem trước trước khi xuất bản.');
    } catch (err) {
      toast.error(err.message || 'Không thể lưu bản nháp');
    } finally {
      setSavingDraft(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    try {
      setPublishing(true);
      await adminThemeApi.saveDraft(formData, 'Lưu trước khi xuất bản');
      const res = await adminThemeApi.publishTheme();
      
      applyCssTokens(formData);
      try {
        localStorage.setItem('wayfare_theme', JSON.stringify(formData));
      } catch {}
      await refreshTheme();

      toast.success(`Đã xuất bản giao diện v${res?.versionNo || ''} thành công ra toàn hệ thống! 🚀`);
      await loadThemeData();
    } catch (err) {
      toast.error(err.message || 'Không thể xuất bản giao diện');
    } finally {
      setPublishing(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    const confirm = window.confirm(
      'Bạn có chắc chắn muốn khôi phục bảng màu và nhận diện giao diện về mặc định chuẩn của Wayfare không?'
    );
    if (!confirm) return;

    try {
      setResetting(true);
      await adminThemeApi.resetTheme();
      await refreshTheme();
      toast.success('Đã khôi phục giao diện về mặc định chuẩn của Wayfare thành công!');
      await loadThemeData();
    } catch (err) {
      toast.error(err.message || 'Không thể khôi phục mặc định');
    } finally {
      setResetting(false);
    }
  };

  // Rollback version
  const handleRollback = async (versionId, versionNo) => {
    const confirm = window.confirm(`Bạn có chắc chắn muốn Rollback giao diện về phiên bản v${versionNo}?`);
    if (!confirm) return;

    try {
      await adminThemeApi.rollbackVersion(versionId);
      await refreshTheme();
      toast.success(`Đã khôi phục thành công giao diện về phiên bản v${versionNo}!`);
      await loadThemeData();
    } catch (err) {
      toast.error(err.message || 'Không thể rollback phiên bản');
    }
  };

  // Contrast calculation
  const textContrast = useMemo(() => {
    return getContrastRatio(formData.colors.text, formData.colors.background).toFixed(2);
  }, [formData.colors.text, formData.colors.background]);

  const buttonContrast = useMemo(() => {
    return getContrastRatio(formData.colors.buttonText, formData.colors.buttonBg).toFixed(2);
  }, [formData.colors.buttonText, formData.colors.buttonBg]);

  // Helper to render interactive color card with native picker and 1-click swatches
  const renderColorCard = (colorKey, label, subtitle, fallback = '#b0522f') => {
    const currentColor = normalizeHexColor(formData?.colors?.[colorKey], fallback);
    const swatches = QUICK_COLOR_SWATCHES[colorKey] || [];

    return (
      <div key={colorKey} className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="font-serif text-xs font-bold text-ink-800 block truncate">{label}</span>
            <span className="font-mono text-[10px] text-ink-400 block truncate">{subtitle}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input 
              type="color" 
              value={currentColor} 
              onChange={e => handleColorChange(colorKey, e.target.value)}
              className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white shrink-0"
              title={`Bấm để mở bảng chọn màu cho ${label}`}
            />
            <input
              type="text"
              value={formData?.colors?.[colorKey] || ''}
              onChange={e => handleColorChange(colorKey, e.target.value)}
              onBlur={e => {
                const clean = normalizeHexColor(e.target.value, fallback);
                handleColorChange(colorKey, clean);
              }}
              className="w-20 px-2 py-1 text-xs font-mono bg-white border border-ink-200 rounded text-center uppercase"
            />
          </div>
        </div>

        {/* 1-Click Fast Color Swatches */}
        {swatches.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-ink-200/60 flex-wrap">
            <span className="text-[9px] font-mono text-ink-400 shrink-0">Gợi ý 1-chạm:</span>
            {swatches.map(swatch => {
              const isSelected = currentColor.toLowerCase() === swatch.toLowerCase();
              return (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => handleColorChange(colorKey, swatch)}
                  style={{ backgroundColor: swatch }}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer shadow-2xs hover:scale-125 ${
                    isSelected ? 'ring-2 ring-clay-700 border-white scale-110' : 'border-ink-200'
                  }`}
                  title={`Chọn ${swatch}`}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Hidden file input for Cloudinary upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
        className="hidden"
      />

      {/* ─── 1. HEADER BANNER ────────────────────────────────────────────── */}
      <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[5px] bg-clay-100 text-clay-700 border border-clay-300 flex items-center justify-center shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-ink-900 font-serif tracking-tight">
                Quản Lý Giao Diện & Bộ Nhận Diện Thương Hiệu
              </h1>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-300">
                Đang chạy: v{publishedVersion}
              </span>
            </div>
            <p className="text-xs text-ink-500 font-sans mt-1 leading-relaxed">
              Kiểm soát toàn bộ Design Tokens: Bảng màu sắc, Logo, Tiêu đề SEO, Bo góc & Trải nghiệm giao diện xuyên suốt hệ thống Web và Mobile.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          <button
            onClick={handleReset}
            disabled={resetting || loading}
            className="px-3.5 py-2 rounded-[5px] text-xs font-serif font-medium text-ink-600 hover:text-ink-900 bg-[#F8F4EC] hover:bg-ink-100 border border-ink-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Khôi phục về bảng màu mặc định của Wayfare"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={savingDraft || loading}
            className="px-4 py-2 rounded-[5px] text-xs font-serif font-bold text-ink-700 bg-[#FFFDF8] hover:bg-[#F8F4EC] border border-ink-300 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            {savingDraft ? (
              <div className="w-3.5 h-3.5 border-2 border-ink-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-ink-500" />
            )}
            <span>Lưu bản nháp</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing || loading}
            className="px-5 py-2 rounded-[5px] text-xs font-serif font-bold text-white bg-clay-700 hover:bg-clay-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {publishing ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Xuất bản toàn hệ thống</span>
          </button>
        </div>
      </div>

      {/* ─── LIVE PREVIEW ACTIVE NOTICE BAR ─────────────────────────── */}
      <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-[6px] p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-emerald-950 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="font-serif font-bold text-[12.5px] text-emerald-900">
            Chế độ Xem Trước Thời Gian Thực (Live Preview Active):
          </span>
          <span className="text-emerald-800 font-sans">
            Mọi thay đổi về màu sắc, preset, logo hoặc bo góc bên dưới phản ánh TỨC THÌ lên toàn bộ trang để bạn trải nghiệm. Bấm Xuất bản khi hoàn tất.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
            CSS Tokens :root
          </span>
        </div>
      </div>

      {/* ─── 2. MAIN 2-COLUMN WORKSPACE: Controls on Left, Live Preview on Right ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Tabs & Form Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Tabs Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 p-1 bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] shadow-2xs font-serif text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`py-2 px-2 rounded-[4px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'branding' 
                  ? 'bg-clay-700 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              <Image className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Thương hiệu</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('colors')}
              className={`py-2 px-2 rounded-[4px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'colors' 
                  ? 'bg-clay-700 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              <Palette className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Bảng màu</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('social')}
              className={`py-2 px-2 rounded-[4px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'social' 
                  ? 'bg-clay-700 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Mạng xã hội</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('announcement')}
              className={`py-2 px-2 rounded-[4px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer relative ${
                activeTab === 'announcement' 
                  ? 'bg-clay-700 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Thông báo</span>
              {formData.branding?.announcement?.enabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-1" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('components')}
              className={`py-2 px-2 rounded-[4px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'components' 
                  ? 'bg-clay-700 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Bo góc</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-2 px-2 rounded-[4px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-clay-700 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Lịch sử ({versionsList.length})</span>
            </button>
          </div>

          {/* ═══════════════ TAB 1: BRANDING & ASSETS ═══════════════ */}
          {activeTab === 'branding' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-6 shadow-xs space-y-6">
              
              {/* Group 1: General Brand Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                  <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
                    <Type className="w-4 h-4 text-clay-700" />
                    <span>Thông Tin Thương Hiệu & Định Danh Website</span>
                  </h3>
                  <span className="text-[11px] font-mono text-ink-400">SEO & Metadata</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-serif text-xs font-bold text-ink-800 block">
                      Tên Website / Nền tảng <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.branding.siteTitle || ''}
                      onChange={e => handleBrandingChange('siteTitle', e.target.value)}
                      placeholder="VD: Wayfare"
                      className="w-full px-3.5 py-2 text-xs bg-[#F8F4EC] border border-ink-200 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] font-sans"
                    />
                    <span className="text-[10px] text-ink-400 font-sans block">
                      Hiển thị trên tiêu đề tab trình duyệt và đầu trang Navbar
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-serif text-xs font-bold text-ink-800 block">
                      Khẩu hiệu Thương hiệu (Tagline)
                    </label>
                    <input
                      type="text"
                      value={formData.branding.tagline || ''}
                      onChange={e => handleBrandingChange('tagline', e.target.value)}
                      placeholder="VD: Khám phá Việt Nam theo cách riêng"
                      className="w-full px-3.5 py-2 text-xs bg-[#F8F4EC] border border-ink-200 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] font-sans"
                    />
                    <span className="text-[10px] text-ink-400 font-sans block">
                      Xuất hiện dưới logo và trong các chiến dịch quảng bá
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-serif text-xs font-bold text-ink-800 block">
                      Mô tả SEO Meta Description
                    </label>
                    <span className="text-[10px] font-mono text-ink-400">
                      {formData.branding.metaDescription?.length || 0} / 160 ký tự (Khuyến nghị: 120-160)
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.branding.metaDescription || ''}
                    onChange={e => handleBrandingChange('metaDescription', e.target.value)}
                    placeholder="Mô tả tóm tắt cho công cụ tìm kiếm Google và các mạng xã hội khi chia sẻ link..."
                    className="w-full px-3.5 py-2 text-xs bg-[#F8F4EC] border border-ink-200 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] font-sans leading-relaxed resize-none"
                  />
                </div>

                {/* Google Search Snippet Simulation */}
                <div className="p-3.5 rounded-[6px] bg-[#F8F4EC]/60 border border-ink-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block">
                    Mô phỏng hiển thị trên kết quả tìm kiếm Google (SERP Preview):
                  </span>
                  <div className="pt-1">
                    <div className="text-[11px] font-sans text-emerald-800 truncate">
                      https://wayfare.vn › kham-pha-viet-nam
                    </div>
                    <div className="font-serif font-bold text-sm text-[#1a0dab] hover:underline cursor-pointer truncate">
                      {formData.branding.siteTitle || 'Wayfare'} • {formData.branding.tagline || 'Hành trình khám phá du lịch'}
                    </div>
                    <div className="text-xs text-ink-600 font-sans line-clamp-2 mt-0.5 leading-relaxed">
                      {formData.branding.metaDescription || 'Nền tảng chia sẻ lịch trình du lịch thông minh, khám phá 500+ địa điểm văn hóa và kết nối cộng đồng phượt thủ.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Visual Brand Assets (Logo, White Logo, Favicon, Banner) */}
              <div className="space-y-4 pt-2 border-t border-ink-100">
                <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                  <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
                    <Image className="w-4 h-4 text-clay-700" />
                    <span>Hình Ảnh Logo & Biểu Tượng Nhận Diện (Brand Assets)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-ink-400">Cloudinary CDN Ready</span>
                </div>

                {/* 1. Logo Chính (Dark Logo) */}
                <div className="p-4 rounded-[6px] bg-[#F8F4EC]/60 border border-ink-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-serif font-bold text-xs text-ink-900 block">
                        Logo chính (Primary Dark Logo)
                      </span>
                      <span className="text-[11px] text-ink-500 font-sans block">
                        Dùng trên nền sáng (Navbar, trang chủ, báo cáo). Khuyến nghị: PNG trong suốt, tỷ lệ 4:1 (240x60px).
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTriggerUpload('logoUrl')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#FFFDF8] hover:bg-clay-50 border border-clay-300 text-clay-800 font-serif font-bold text-xs shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-clay-700" />
                      <span>Tải ảnh lên (Cloudinary)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Preview Box */}
                    <div className="w-32 h-12 rounded-[4px] bg-white border border-ink-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                      {formData.branding.logoUrl ? (
                        <img 
                          src={formData.branding.logoUrl} 
                          alt="Primary Logo" 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => handleImageErrorSafe(e, '/wayfare-logo.png')}
                        />
                      ) : (
                        <span className="text-[10px] text-ink-400 font-mono">Chưa có logo</span>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      value={formData.branding.logoUrl || ''}
                      onChange={e => handleBrandingChange('logoUrl', e.target.value)}
                      placeholder="/wayfare-logo.png hoặc https://res.cloudinary.com/..."
                      className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-ink-200 rounded-[5px] font-mono text-[11px] text-ink-900 focus:outline-none focus:border-clay-600"
                    />
                  </div>
                </div>

                {/* 2. Logo Nền Tối (White Logo) */}
                <div className="p-4 rounded-[6px] bg-[#F8F4EC]/60 border border-ink-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-serif font-bold text-xs text-ink-900 block">
                        Logo nền tối (White / Monochrome Logo)
                      </span>
                      <span className="text-[11px] text-ink-500 font-sans block">
                        Dùng trên banner tối màu, màn hình bảo trì hoặc footer nền đen.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTriggerUpload('logoWhiteUrl')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#FFFDF8] hover:bg-clay-50 border border-clay-300 text-clay-800 font-serif font-bold text-xs shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-clay-700" />
                      <span>Tải ảnh lên (Cloudinary)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Dark Preview Box */}
                    <div className="w-32 h-12 rounded-[4px] bg-ink-900 border border-ink-700 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                      {formData.branding.logoWhiteUrl ? (
                        <img 
                          src={formData.branding.logoWhiteUrl} 
                          alt="White Logo" 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => handleImageErrorSafe(e, '/wayfare-logo-white.png')}
                        />
                      ) : (
                        <span className="text-[10px] text-ink-400 font-mono">Chưa có logo</span>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      value={formData.branding.logoWhiteUrl || ''}
                      onChange={e => handleBrandingChange('logoWhiteUrl', e.target.value)}
                      placeholder="/wayfare-logo-white.png hoặc https://res.cloudinary.com/..."
                      className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-ink-200 rounded-[5px] font-mono text-[11px] text-ink-900 focus:outline-none focus:border-clay-600"
                    />
                  </div>
                </div>

                {/* 3. Favicon & Hero Banner in 2 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Favicon */}
                  <div className="p-3.5 rounded-[6px] bg-[#F8F4EC]/60 border border-ink-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs text-ink-900 block">
                        Biểu tượng Favicon
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTriggerUpload('faviconUrl')}
                        className="text-[10px] font-mono text-clay-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" /> Tải ảnh
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-white border border-ink-200 flex items-center justify-center shrink-0">
                        <img 
                          src={formData.branding.faviconUrl || '/favicon.ico'} 
                          alt="Favicon" 
                          className="w-5 h-5 object-contain"
                          onError={(e) => handleImageErrorSafe(e, '/wayfare-logo.png')}
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.branding.faviconUrl || ''}
                        onChange={e => handleBrandingChange('faviconUrl', e.target.value)}
                        placeholder="/favicon.ico"
                        className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-ink-200 rounded font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Hero Banner Background */}
                  <div className="p-3.5 rounded-[6px] bg-[#F8F4EC]/60 border border-ink-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs text-ink-900 block">
                        Ảnh nền Hero Banner trang chủ
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTriggerUpload('heroBgUrl')}
                        className="text-[10px] font-mono text-clay-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" /> Tải ảnh
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.branding.heroBgUrl || ''}
                      onChange={e => handleBrandingChange('heroBgUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-ink-200 rounded font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Footer Copyright Text */}
                <div className="space-y-1.5 pt-2">
                  <label className="font-serif text-xs font-bold text-ink-800 block">
                    Văn bản Bản quyền Chân trang (Footer Copyright)
                  </label>
                  <input
                    type="text"
                    value={formData.branding.footerText || ''}
                    onChange={e => handleBrandingChange('footerText', e.target.value)}
                    placeholder="© 2026 Wayfare Travel Sharing Platform. Mọi quyền được bảo lưu."
                    className="w-full px-3.5 py-2 text-xs bg-[#F8F4EC] border border-ink-200 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] font-sans"
                  />
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════ TAB 2: SYSTEM COLORS & THEMES ═══════════════ */}
          {activeTab === 'colors' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-6 shadow-xs space-y-6">
              
              {/* Group 0: Curated Color Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Bộ Phối Màu Tuyển Chọn Cho Du Lịch (Theme Presets 1-Chạm)</span>
                    </h3>
                    <p className="text-[11px] text-ink-500 font-sans mt-0.5">
                      Bấm vào bất kỳ bảng màu nào dưới đây để áp dụng tức thì lên toàn bộ trang web và xem trực quan bên phải.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {CURATED_COLOR_THEMES.map(theme => {
                    const currentPrimary = normalizeHexColor(formData?.colors?.primary);
                    const currentBg = normalizeHexColor(formData?.colors?.background);
                    const themePrimary = normalizeHexColor(theme?.colors?.primary);
                    const themeBg = normalizeHexColor(theme?.colors?.background);
                    const isCurrent = currentPrimary === themePrimary && currentBg === themeBg;

                    return (
                      <div
                        key={theme.id}
                        onClick={() => handleApplyColorTheme(theme)}
                        className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer space-y-2.5 relative group ${
                          isCurrent
                            ? 'bg-clay-50/90 border-clay-700 ring-2 ring-clay-700/80 shadow-xs'
                            : 'bg-[#F8F4EC]/60 border-ink-200 hover:bg-[#F8F4EC] hover:border-clay-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              style={{ backgroundColor: theme.colors.primary }}
                              className="w-4 h-4 rounded-full border border-white shadow-2xs"
                            />
                            <span className="font-serif font-bold text-xs text-ink-900 group-hover:text-clay-800">
                              {theme.name}
                            </span>
                          </div>
                          {isCurrent ? (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-600 text-white font-bold flex items-center gap-1 shadow-2xs">
                              <Check className="w-3 h-3" /> Đang áp dụng
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-ink-200/70 text-ink-700">
                              {theme.badge}
                            </span>
                          )}
                        </div>

                        {/* Palette Swatches */}
                        <div className="grid grid-cols-5 gap-1 py-0.5">
                          {[
                            { label: 'Chính', color: theme.colors.primary },
                            { label: 'Nền', color: theme.colors.background },
                            { label: 'Thẻ', color: theme.colors.surface },
                            { label: 'Chữ', color: theme.colors.text },
                            { label: 'Viền', color: theme.colors.border }
                          ].map(item => (
                            <div key={item.label} className="text-center">
                              <div
                                style={{ backgroundColor: item.color }}
                                className="h-4 rounded-[2px] border border-ink-300 shadow-2xs"
                                title={`${item.label}: ${item.color}`}
                              />
                              <span className="text-[8px] font-mono text-ink-500 block truncate mt-0.5">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        <p className="text-[11px] text-ink-500 font-sans leading-tight line-clamp-2">
                          {theme.description}
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyColorTheme(theme);
                          }}
                          className={`w-full py-1.5 px-2 rounded-[4px] text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : 'bg-clay-700 hover:bg-clay-800 text-white shadow-2xs'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>✓ Bộ màu đang kích hoạt</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Áp dụng bảng màu này ➔</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group 1: Brand Accent Colors */}
              <div className="space-y-3 pt-2 border-t border-ink-100">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-clay-700 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Màu Nhận Diện Cốt Lõi (Core Accent Colors)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Primary Color */}
                  {renderColorCard('primary', 'Màu chính (Primary)', 'Nút bấm, biểu tượng, điểm nhấn', '#b0522f')}
                  {/* Primary Hover */}
                  {renderColorCard('primaryHover', 'Rê chuột (Primary Hover)', 'Trạng thái khi rê chuột lên nút', '#93422a')}
                  {/* Button Bg */}
                  {renderColorCard('buttonBg', 'Nền nút bấm (Button Bg)', 'Màu nền nút bấm hành động', '#b0522f')}
                  {/* Button Text */}
                  {renderColorCard('buttonText', 'Chữ nút bấm (Button Text)', 'Màu chữ hiển thị trên nút', '#ffffff')}
                </div>
              </div>

              {/* Group 2: Layout & Typography Colors */}
              <div className="space-y-3 pt-2 border-t border-ink-100">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-clay-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Bố Cục & Màu Nền Hệ Thống (Layout & Surface)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Background */}
                  {renderColorCard('background', 'Nền trang web (Background)', 'Màu nền chung toàn hệ thống', '#f8f4ec')}
                  {/* Surface */}
                  {renderColorCard('surface', 'Màu ô thẻ (Surface / Card)', 'Nền card, modal, khung nội dung', '#ffffff')}
                  {/* Text Color */}
                  {renderColorCard('text', 'Màu chữ chính (Text Color)', 'Tiêu đề, văn bản nội dung', '#1e1a15')}
                  {/* Border Color */}
                  {renderColorCard('border', 'Màu đường viền (Border)', 'Đường viền thẻ, phân cách ô', '#e5ded2')}
                </div>
              </div>

              {/* Group 3: Navigation Header & Sidebar */}
              <div className="space-y-3 pt-2 border-t border-ink-100">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-clay-700 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" /> Thanh Điều Hướng (Navbar & Sidebar)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Header Background */}
                  {renderColorCard('headerBg', 'Nền thanh Header (Navbar)', 'Thanh điều hướng trên cùng', '#f8f4ec')}
                  {/* Sidebar Background */}
                  {renderColorCard('sidebarBg', 'Nền menu Sidebar', 'Thanh menu quản trị bên trái', '#1e1a15')}
                </div>
              </div>

              {/* Group 4: Accessibility & Contrast Checker Box */}
              <div className="p-4 rounded-[6px] bg-[#F8F4EC]/70 border border-ink-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-ink-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Kiểm Tra Độ Tương Phản Chuẩn WCAG (Accessibility Compliance)</span>
                  </span>
                  <span className="text-[10px] font-mono text-ink-400">Tiêu chuẩn quốc tế</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded bg-white border border-ink-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif font-bold block text-ink-800">Chữ chính trên Nền trang</span>
                      <span className="font-mono text-[10px] text-ink-400">Tỷ lệ: {textContrast}:1</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      Number(textContrast) >= 4.5 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {Number(textContrast) >= 7.0 ? 'ĐẠT AAA' : Number(textContrast) >= 4.5 ? 'ĐẠT AA' : 'CẢNH BÁO MỜ'}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-white border border-ink-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif font-bold block text-ink-800">Chữ nút trên Nền nút bấm</span>
                      <span className="font-mono text-[10px] text-ink-400">Tỷ lệ: {buttonContrast}:1</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      Number(buttonContrast) >= 4.5 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {Number(buttonContrast) >= 7.0 ? 'ĐẠT AAA' : Number(buttonContrast) >= 4.5 ? 'ĐẠT AA' : 'CẢNH BÁO MỜ'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

                    {/* ═══════════════ TAB: SOCIAL MEDIA & CONTACT CHANNELS ═══════════════ */}
          {activeTab === 'social' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-6 shadow-xs space-y-6">
              
              <div className="border-b border-ink-200/80 pb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-clay-700" />
                  <h3 className="font-serif font-bold text-base text-ink-900">
                    Kênh Mạng Xã Hội & Thông Tin Liên Hệ
                  </h3>
                </div>
                <p className="text-xs text-ink-500 font-sans mt-1">
                  Thiết lập các kênh liên hệ trực tiếp và liên kết mạng xã hội chính thức của Wayfare. Dữ liệu này sẽ tự động hiển thị đồng bộ dưới Chân trang (Footer) và trang Liên hệ của hệ thống.
                </p>
              </div>

              {/* Group 1: Direct Contact Information */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-clay-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>1. Thông tin liên hệ trực tiếp</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hotline */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif font-bold text-ink-800">
                      Đường dây nóng / Hotline du khách
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.branding?.contact?.hotline || ''}
                        onChange={(e) => handleContactChange('hotline', e.target.value)}
                        placeholder="1900 6868 hoặc 0912 345 678"
                        className="w-full pl-9 pr-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif font-bold text-ink-800">
                      Hộp thư hỗ trợ (Email)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.branding?.contact?.email || ''}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        placeholder="contact@wayfare.vn"
                        className="w-full pl-9 pr-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Headquarters Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-serif font-bold text-ink-800">
                    Địa chỉ trụ sở văn phòng đại diện
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-2.5" />
                    <textarea
                      rows={2}
                      value={formData.branding?.contact?.address || ''}
                      onChange={(e) => handleContactChange('address', e.target.value)}
                      placeholder="Tòa nhà Wayfare, Ba Đình, Hà Nội & Quận 1, TP. Hồ Chí Minh, Việt Nam"
                      className="w-full pl-9 pr-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-serif text-ink-900 outline-none focus:border-clay-600 focus:bg-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Social Media Platforms */}
              <div className="space-y-4 pt-4 border-t border-ink-200/80">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-clay-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>2. Kênh Mạng Xã Hội Chính Thức</span>
                </h4>

                <div className="space-y-3">
                  {/* Facebook */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-serif font-bold text-ink-800 flex items-center gap-1.5">
                        <Facebook className="w-3.5 h-3.5 text-blue-600" />
                        <span>Facebook Fanpage / Cộng đồng</span>
                      </label>
                      {formData.branding?.contact?.facebook && (
                        <a 
                          href={formData.branding.contact.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-clay-700 hover:underline flex items-center gap-0.5"
                        >
                          <span>Thử liên kết</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={formData.branding?.contact?.facebook || ''}
                      onChange={(e) => handleContactChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/wayfare.vietnam"
                      className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-serif font-bold text-ink-800 flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-600" />
                        <span>Instagram Du lịch</span>
                      </label>
                      {formData.branding?.contact?.instagram && (
                        <a 
                          href={formData.branding.contact.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-clay-700 hover:underline flex items-center gap-0.5"
                        >
                          <span>Thử liên kết</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={formData.branding?.contact?.instagram || ''}
                      onChange={(e) => handleContactChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/wayfare.vn"
                      className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-serif font-bold text-ink-800 flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[10px] px-1 bg-black text-white rounded">TT</span>
                        <span>TikTok Kênh video trải nghiệm</span>
                      </label>
                      {formData.branding?.contact?.tiktok && (
                        <a 
                          href={formData.branding.contact.tiktok} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-clay-700 hover:underline flex items-center gap-0.5"
                        >
                          <span>Thử liên kết</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={formData.branding?.contact?.tiktok || ''}
                      onChange={(e) => handleContactChange('tiktok', e.target.value)}
                      placeholder="https://tiktok.com/@wayfare.vn"
                      className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-serif font-bold text-ink-800 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-600" />
                        <span>YouTube Vlogs du lịch</span>
                      </label>
                      {formData.branding?.contact?.youtube && (
                        <a 
                          href={formData.branding.contact.youtube} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-clay-700 hover:underline flex items-center gap-0.5"
                        >
                          <span>Thử liên kết</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={formData.branding?.contact?.youtube || ''}
                      onChange={(e) => handleContactChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/@wayfarevn"
                      className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                    />
                  </div>

                  {/* Threads */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-serif font-bold text-ink-800 flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[10px] px-1 bg-ink-800 text-white rounded">@</span>
                        <span>Threads / Nhóm thảo luận</span>
                      </label>
                      {formData.branding?.contact?.threads && (
                        <a 
                          href={formData.branding.contact.threads} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-clay-700 hover:underline flex items-center gap-0.5"
                        >
                          <span>Thử liên kết</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={formData.branding?.contact?.threads || ''}
                      onChange={(e) => handleContactChange('threads', e.target.value)}
                      placeholder="https://threads.net/@wayfare.vn"
                      className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ TAB: TOP ANNOUNCEMENT RIBBON ═══════════════ */}
          {activeTab === 'announcement' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-6 shadow-xs space-y-6">
              
              <div className="border-b border-ink-200/80 pb-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-clay-700" />
                  <h3 className="font-serif font-bold text-base text-ink-900">
                    Thanh Thông Báo Nổi Bật Đầu Trang (Announcement Ribbon)
                  </h3>
                </div>
                <p className="text-xs text-ink-500 font-sans mt-1">
                  Quản lý dải thông báo mảnh chạy trên cùng của website (nằm trên thanh Navbar). Thường dùng cho các chiến dịch phát động mùa du lịch, ưu đãi đặc biệt hoặc thông báo tính năng AI mới.
                </p>
              </div>

              {/* Master Switch */}
              <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200 flex items-center justify-between gap-4">
                <div>
                  <span className="font-serif font-bold text-sm text-ink-900 block">
                    Kích hoạt thanh thông báo trên toàn hệ thống
                  </span>
                  <span className="text-[11px] text-ink-500 font-sans mt-0.5 block">
                    Khi bật, banner sẽ hiển thị trên đỉnh toàn bộ các trang công khai cho du khách.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.branding?.announcement?.enabled || false}
                    onChange={(e) => handleAnnouncementChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ink-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Announcement Content Config */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Badge Text */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif font-bold text-ink-800">
                      Huy hiệu nhãn (Badge)
                    </label>
                    <input
                      type="text"
                      value={formData.branding?.announcement?.badge || ''}
                      onChange={(e) => handleAnnouncementChange('badge', e.target.value)}
                      placeholder="SỰ KIỆN, HOT, MỚI..."
                      className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-serif font-bold text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                    />
                    {/* Quick Badge Presets */}
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {['SỰ KIỆN', 'MỚI', 'HOT', 'ƯU ĐÃI', 'BẢO TRÌ'].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => handleAnnouncementChange('badge', b)}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-ink-200/70 hover:bg-clay-100 hover:text-clay-800 transition-colors cursor-pointer"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button Text */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif font-bold text-ink-800">
                      Chữ nút kêu gọi (CTA Text)
                    </label>
                    <input
                      type="text"
                      value={formData.branding?.announcement?.linkText || ''}
                      onChange={(e) => handleAnnouncementChange('linkText', e.target.value)}
                      placeholder="Khám phá ngay"
                      className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-serif text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                    />
                  </div>

                  {/* Target URL */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif font-bold text-ink-800">
                      Đường dẫn liên kết (Target Link)
                    </label>
                    <input
                      type="text"
                      value={formData.branding?.announcement?.linkUrl || ''}
                      onChange={(e) => handleAnnouncementChange('linkUrl', e.target.value)}
                      placeholder="/explore hoặc /community"
                      className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-mono text-ink-900 outline-none focus:border-clay-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Main Message Text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-serif font-bold text-ink-800">
                    Nội dung thông điệp chính
                  </label>
                  <textarea
                    rows={2}
                    value={formData.branding?.announcement?.text || ''}
                    onChange={(e) => handleAnnouncementChange('text', e.target.value)}
                    placeholder="Chào mừng mùa du lịch 2026 - Khám phá 500+ điểm đến đặc sắc & Lên lịch trình thông minh cùng AI!"
                    className="w-full px-3 py-2 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-serif text-ink-900 outline-none focus:border-clay-600 focus:bg-white resize-none"
                  />
                </div>

                {/* Color Styling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-ink-200/80">
                  {/* Background Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif font-bold text-ink-800">
                      Màu nền thanh thông báo
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.branding?.announcement?.bgColor || formData.colors.primary}
                        onChange={(e) => handleAnnouncementChange('bgColor', e.target.value)}
                        className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.branding?.announcement?.bgColor || formData.colors.primary}
                        onChange={(e) => handleAnnouncementChange('bgColor', e.target.value)}
                        className="w-32 px-3 py-1.5 bg-[#F8F4EC] border border-ink-200 rounded-[5px] text-xs font-mono uppercase text-ink-900"
                      />
                      <div className="flex items-center gap-1">
                        {[formData.colors.primary, '#D97706', '#0284C7', '#15803D', '#1E1A15', '#DC2626'].map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAnnouncementChange('bgColor', c)}
                            style={{ backgroundColor: c }}
                            className="w-5 h-5 rounded-full border border-white shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Allow dismiss */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif font-bold text-ink-800">
                      Cho phép du khách đóng thông báo
                    </label>
                    <div className="flex items-center gap-2 pt-1.5">
                      <input
                        type="checkbox"
                        id="announcementClosable"
                        checked={formData.branding?.announcement?.isClosable !== false}
                        onChange={(e) => handleAnnouncementChange('isClosable', e.target.checked)}
                        className="rounded border-ink-300 text-clay-700 focus:ring-clay-500 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="announcementClosable" className="text-xs text-ink-700 font-sans cursor-pointer select-none">
                        Hiển thị nút (X) để du khách có thể tắt thông báo trong phiên truy cập
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Box inside tab */}
              <div className="pt-4 border-t border-ink-200/80 space-y-2">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-ink-700 block">
                  Khung xem trước thanh thông báo thực tế
                </span>
                
                <div 
                  style={{
                    backgroundColor: formData.branding?.announcement?.bgColor || formData.colors.primary,
                    color: formData.branding?.announcement?.textColor || '#FFFFFF'
                  }}
                  className="rounded-[6px] py-2.5 px-4 shadow-sm flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Megaphone className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                    {formData.branding?.announcement?.badge && (
                      <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/20 text-white border border-white/30 shrink-0">
                        {formData.branding.announcement.badge}
                      </span>
                    )}
                    <span className="font-serif font-medium truncate">
                      {formData.branding?.announcement?.text || 'Nội dung thông báo mẫu...'}
                    </span>
                    {formData.branding?.announcement?.linkText && (
                      <span className="underline font-bold text-[11px] shrink-0 ml-1 cursor-pointer">
                        {formData.branding.announcement.linkText} ➔
                      </span>
                    )}
                  </div>
                  {formData.branding?.announcement?.isClosable !== false && (
                    <span className="p-0.5 rounded-full hover:bg-black/20 shrink-0 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}


          {/* ═══════════════ TAB 3: TOKENS & COMPONENTS ═══════════════ */}
          {activeTab === 'components' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-6 shadow-xs space-y-6">
              
              <div className="border-b border-ink-100 pb-2">
                <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-clay-700" />
                  <span>Bo Góc, Đổ Bóng & Quy Chuẩn Giao Diện (Design Tokens)</span>
                </h3>
                <p className="text-[11px] text-ink-500 font-sans mt-0.5">
                  Thiết lập độ bo góc và độ bóng đồng bộ trên tất cả các trang web và ứng dụng di động.
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Radius Card */}
                <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">
                        Bo góc Thẻ & Khung nội dung (Radius Card)
                      </span>
                      <span className="text-[11px] text-ink-500 font-sans">
                        Áp dụng cho Card địa điểm du lịch, Card bài viết cộng đồng, Hộp thoại Modal
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded border border-ink-200 text-clay-700">
                      {formData.components.radiusCard}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                    {[
                      { val: '2px', label: 'Vuông vức' },
                      { val: '4px', label: 'Gọn gàng' },
                      { val: '6px', label: 'Mặc định' },
                      { val: '8px', label: 'Mềm mại' },
                      { val: '12px', label: 'Hiện đại' },
                      { val: '16px', label: 'Bo tròn' }
                    ].map(r => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => handleComponentChange('radiusCard', r.val)}
                        className={`p-2 text-center rounded border transition-all cursor-pointer ${
                          formData.components.radiusCard === r.val
                            ? 'bg-clay-700 text-white font-bold border-clay-700 shadow-2xs'
                            : 'bg-white text-ink-700 hover:bg-ink-100 border-ink-200'
                        }`}
                      >
                        <span className="font-mono text-xs block">{r.val}</span>
                        <span className="text-[10px] font-sans opacity-80 block">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Radius Control */}
                <div className="p-4 rounded-[6px] bg-[#F8F4EC] border border-ink-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">
                        Bo góc Nút bấm & Ô nhập liệu (Radius Control)
                      </span>
                      <span className="text-[11px] text-ink-500 font-sans">
                        Áp dụng cho Button hành động, Ô tìm kiếm Input field, Thẻ lọc Dropdown
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded border border-ink-200 text-clay-700">
                      {formData.components.radiusControl}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                    {[
                      { val: '2px', label: 'Cổ điển' },
                      { val: '4px', label: 'Nhẹ nhàng' },
                      { val: '5px', label: 'Mặc định' },
                      { val: '8px', label: 'Bầu bĩnh' },
                      { val: '9999px', label: 'Viên thuốc (Pill)' }
                    ].map(r => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => handleComponentChange('radiusControl', r.val)}
                        className={`p-2 text-center rounded border transition-all cursor-pointer ${
                          formData.components.radiusControl === r.val
                            ? 'bg-clay-700 text-white font-bold border-clay-700 shadow-2xs'
                            : 'bg-white text-ink-700 hover:bg-ink-100 border-ink-200'
                        }`}
                      >
                        <span className="font-mono text-xs block">{r.val === '9999px' ? 'Pill' : r.val}</span>
                        <span className="text-[10px] font-sans opacity-80 block">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Typography Guidelines */}
                <div className="p-4 rounded-[6px] bg-[#F8F4EC]/70 border border-ink-200 space-y-2">
                  <span className="font-serif font-bold text-xs text-ink-900 block">
                    Quy chuẩn Phông chữ Hệ thống (Typography Guidelines)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    <div className="p-2.5 rounded bg-white border border-ink-200">
                      <span className="font-serif font-bold text-ink-800 block">Font Tiêu đề: Serif (Merriweather)</span>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        Tạo chiều sâu văn hóa, cảm giác hoài niệm và phong vị nhật ký lữ hành.
                      </p>
                    </div>
                    <div className="p-2.5 rounded bg-white border border-ink-200">
                      <span className="font-sans font-bold text-ink-800 block">Font Nội dung: Sans-serif (Inter / System)</span>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        Độ tương phản cao, tối ưu hiển thị rõ nét trên màn hình Retina & Mobile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════ TAB 4: VERSION HISTORY & ROLLBACK ═══════════════ */}
          {activeTab === 'history' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-6 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-clay-700" />
                    <span>Lịch Sử Các Phiên Bản Giao Diện & Điểm Khôi Phục (Rollback)</span>
                  </h3>
                  <p className="text-[11px] text-ink-500 font-sans mt-0.5">
                    Hệ thống tự động chụp ảnh snapshot mỗi lần xuất bản để bạn có thể quay lại bất kỳ lúc nào.
                  </p>
                </div>
              </div>

              {versionsList.length === 0 ? (
                <div className="py-12 text-center text-ink-400 text-xs font-sans">
                  Chưa có lịch sử phiên bản nào được ghi nhận.
                </div>
              ) : (
                <div className="divide-y divide-ink-100">
                  {versionsList.map(v => {
                    const isCurrent = v.versionNo === publishedVersion;
                    return (
                      <div key={v.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-ink-900">
                              Phiên bản v{v.versionNo}
                            </span>
                            {isCurrent && (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                                Đang chạy thực tế
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-ink-400">
                              {v.publishedAt ? new Date(v.publishedAt).toLocaleString('vi-VN') : 'Bản lưu nháp'}
                            </span>
                          </div>
                          <p className="text-xs text-ink-600 font-serif mt-1">
                            {v.note || 'Cập nhật bộ nhận diện giao diện'}
                          </p>
                          {v.publishedByEmail && (
                            <span className="text-[10px] font-mono text-ink-400 block mt-0.5">
                              Người xuất bản: {v.publishedByEmail}
                            </span>
                          )}
                        </div>

                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleRollback(v.id, v.versionNo)}
                            className="px-3.5 py-1.5 text-xs font-serif font-bold text-clay-700 hover:text-white bg-clay-50 hover:bg-clay-700 border border-clay-300 rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Rollback về v{v.versionNo}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

        {/* ═══════════════ RIGHT COLUMN: LIVE INTERACTIVE PREVIEW (5 cols) ═══════════════ */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          
          {/* Preview Controller Bar */}
          <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-3.5 shadow-2xs flex items-center justify-between">
            <span className="font-serif font-bold text-xs text-ink-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-clay-700" />
              <span>Xem Trước Trực Quan Thời Gian Thực</span>
            </span>

            {/* Desktop / Mobile Switcher */}
            <div className="flex items-center gap-1 bg-[#F8F4EC] p-0.5 rounded-[4px] border border-ink-200">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded-[3px] text-xs transition-all cursor-pointer flex items-center gap-1 ${
                  previewMode === 'desktop' ? 'bg-white text-ink-900 shadow-2xs font-bold' : 'text-ink-400 hover:text-ink-700'
                }`}
                title="Xem trước màn hình Máy tính (Desktop)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono hidden sm:inline">Máy tính</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded-[3px] text-xs transition-all cursor-pointer flex items-center gap-1 ${
                  previewMode === 'mobile' ? 'bg-white text-ink-900 shadow-2xs font-bold' : 'text-ink-400 hover:text-ink-700'
                }`}
                title="Xem trước màn hình Điện thoại (Mobile 360px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono hidden sm:inline">Điện thoại</span>
              </button>
            </div>
          </div>

          {/* Real-time Preview Stage Container */}
          <div className="flex justify-center">
            <div 
              style={{
                backgroundColor: formData.colors.background,
                color: formData.colors.text,
                width: previewMode === 'mobile' ? '360px' : '100%',
                borderRadius: '8px'
              }}
              className="border-2 border-ink-300 shadow-lg p-4 transition-all duration-300 space-y-3.5 overflow-hidden"
            >
              
              {/* Mini Announcement Ribbon Preview if enabled */}
              {formData.branding?.announcement?.enabled && (
                <div 
                  style={{ 
                    backgroundColor: formData.branding.announcement.bgColor || formData.colors.primary,
                    color: formData.branding.announcement.textColor || '#FFFFFF',
                    borderRadius: formData.components.radiusCard
                  }}
                  className="py-1 px-3 text-[10px] flex items-center justify-between gap-1 shadow-2xs font-serif mb-1"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Megaphone className="w-2.5 h-2.5 animate-bounce shrink-0" />
                    {formData.branding.announcement.badge && (
                      <span className="font-mono text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-white/20 text-white shrink-0">
                        {formData.branding.announcement.badge}
                      </span>
                    )}
                    <span className="truncate">{formData.branding.announcement.text}</span>
                  </div>
                  {formData.branding.announcement.linkText && (
                    <span className="underline font-bold shrink-0 text-[9px]">
                      {formData.branding.announcement.linkText} ➔
                    </span>
                  )}
                </div>
              )}

              {/* Mini Preview Navbar Header */}
              <div 
                style={{ 
                  backgroundColor: formData.colors.headerBg,
                  borderColor: formData.colors.border,
                  borderRadius: formData.components.radiusCard
                }}
                className="p-3 border flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {formData.branding.logoUrl ? (
                    <img 
                      src={formData.branding.logoUrl} 
                      alt="Logo" 
                      className="h-6 w-auto object-contain"
                      onError={(e) => handleImageErrorSafe(e, '/wayfare-logo.png')}
                    />
                  ) : (
                    <div 
                      style={{ backgroundColor: formData.colors.primary }}
                      className="w-6 h-6 rounded flex items-center justify-center text-white font-serif font-black text-xs shrink-0"
                    >
                      W
                    </div>
                  )}
                  <div className="min-w-0">
                    <h5 className="font-serif font-bold text-xs leading-none truncate">
                      {formData.branding.siteTitle || 'Wayfare'}
                    </h5>
                    <span className="font-sans text-[9px] text-ink-500 block truncate mt-0.5">
                      {formData.branding.tagline || 'Khám phá Việt Nam'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    backgroundColor: formData.colors.buttonBg,
                    color: formData.colors.buttonText,
                    borderRadius: formData.components.radiusControl
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  Khám phá
                </button>
              </div>

              {/* Sample Destination Card */}
              <div 
                style={{ 
                  backgroundColor: formData.colors.surface,
                  borderColor: formData.colors.border,
                  borderRadius: formData.components.radiusCard
                }}
                className="border overflow-hidden shadow-xs space-y-2.5"
              >
                <div className="h-32 bg-ink-200 relative overflow-hidden">
                  <img 
                    src={formData.branding.heroBgUrl || "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80"} 
                    alt="Sample destination"
                    className="w-full h-full object-cover"
                  />
                  <div 
                    style={{ 
                      backgroundColor: formData.colors.primary, 
                      color: formData.colors.buttonText,
                      borderRadius: formData.components.radiusControl 
                    }}
                    className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-mono font-bold shadow-xs"
                  >
                    Nổi bật
                  </div>
                </div>

                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-ink-500 uppercase">
                      Vịnh Hạ Long • Quảng Ninh
                    </span>
                    <span className="text-[11px] font-bold text-amber-600">
                      ★ 4.9 (12 đánh giá)
                    </span>
                  </div>

                  <h6 className="font-serif font-bold text-xs line-clamp-1 text-ink-900">
                    Du ngoạn ngắm hoàng hôn trên du thuyền Vịnh Lan Hạ
                  </h6>

                  <p className="text-[11px] text-ink-600 font-sans line-clamp-2 leading-relaxed">
                    Trải nghiệm chèo kayak ngắm hang Sáng Tối, hòa mình vào thiên nhiên hùng vĩ của di sản thế giới.
                  </p>

                  <div className="pt-2 border-t border-ink-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-ink-400 block font-mono">Chi phí dự tính:</span>
                      <span 
                        style={{ color: formData.colors.primary }}
                        className="font-mono font-bold text-xs"
                      >
                        1.450.000 ₫
                      </span>
                    </div>

                    <button
                      type="button"
                      style={{
                        backgroundColor: formData.colors.primary,
                        color: formData.colors.buttonText,
                        borderRadius: formData.components.radiusControl
                      }}
                      className="px-3 py-1 text-[10px] font-serif font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Lên lịch ngay
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample Buttons & Badges Sandbox */}
              <div 
                style={{ 
                  backgroundColor: formData.colors.surface,
                  borderColor: formData.colors.border,
                  borderRadius: formData.components.radiusCard
                }}
                className="p-3 border space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData.colors.buttonBg,
                      color: formData.colors.buttonText,
                      borderRadius: formData.components.radiusControl
                    }}
                    className="flex-1 py-1.5 font-bold shadow-2xs text-[11px] cursor-pointer"
                  >
                    Nút Chính (Primary)
                  </button>
                  
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData.colors.background,
                      color: formData.colors.text,
                      borderColor: formData.colors.border,
                      borderRadius: formData.components.radiusControl
                    }}
                    className="flex-1 py-1.5 font-medium border text-[11px] cursor-pointer"
                  >
                    Nút Phụ (Secondary)
                  </button>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between gap-1 pt-1">
                  <span 
                    style={{ backgroundColor: `${formData.colors.success}18`, color: formData.colors.success }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                  >
                    ● Hoạt động
                  </span>
                  <span 
                    style={{ backgroundColor: `${formData.colors.warning}18`, color: formData.colors.warning }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                  >
                    ● Chờ duyệt
                  </span>
                  <span 
                    style={{ backgroundColor: `${formData.colors.danger}18`, color: formData.colors.danger }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                  >
                    ● Đã ẩn
                  </span>
                </div>
              </div>

              {/* Mini Footer Preview */}
              <div className="pt-1 text-center">
                <span className="text-[9px] font-mono text-ink-400 block truncate">
                  {formData.branding.footerText || '© 2026 Wayfare Travel Sharing Platform'}
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminAppearancePage;

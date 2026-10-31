import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Palette, Image, Type, Sliders, CheckCircle2, RotateCcw, 
  Upload, Save, Eye, Smartphone, Monitor, History, AlertCircle, 
  ExternalLink, Sparkles, Check, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { adminThemeApi } from '../../../services/api';
import { useToast } from '../../../components/common/Toast';
import { useTheme } from '../../../context/ThemeContext';

export const AdminAppearancePage = () => {
  const toast = useToast();
  const { applyCssTokens, refreshTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('branding'); // branding | colors | components | history
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [resetting, setResetting] = useState(false);
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
      metaDescription: 'Nền tảng chia sẻ lịch trình du lịch, khám phá địa điểm và kết nối cộng đồng.',
      logoUrl: '/images/brand-logo.png',
      logoWhiteUrl: '/images/brand-logo-white.png',
      faviconUrl: '/favicon.ico',
      heroBgUrl: '',
      loginBgUrl: '',
      footerText: '© 2026 Wayfare Travel. Mọi quyền được bảo lưu.'
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
      radiusControl: '5px'
    }
  });

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
        setFormData({
          branding: { ...formData.branding, ...(source.branding || {}) },
          colors: { ...formData.colors, ...(source.colors || {}) },
          components: { ...formData.components, ...(source.components || {}) }
        });
      }

      setVersionsList(verRes || []);
    } catch (err) {
      console.error('Lỗi khi tải cấu hình giao diện:', err);
      toast.error('Không thể tải cấu hình giao diện: ' + (err.message || 'Lỗi server'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadThemeData();
  }, [loadThemeData]);

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
      // Save current formData first
      await adminThemeApi.saveDraft(formData, 'Lưu trước khi xuất bản');
      const res = await adminThemeApi.publishTheme();
      
      applyCssTokens(formData);
      await refreshTheme();

      toast.success(`Đã xuất bản giao diện v${res?.versionNo || ''} thành công ra toàn hệ thống!`);
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
      const res = await adminThemeApi.resetTheme();
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[5px] bg-clay-100 text-clay-700 border border-clay-300 flex items-center justify-center shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-ink-800 font-serif">
                Quản lý Giao diện & Thương hiệu
              </h1>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-300">
                Đang chạy: v{publishedVersion}
              </span>
            </div>
            <p className="text-xs text-ink-500 font-sans mt-1 leading-relaxed">
              Kiểm soát toàn bộ Design Tokens: Bảng màu sắc, Logo, Tiêu đề SEO, Bo góc & Trải nghiệm giao diện xuyên suốt hệ thống.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleReset}
            disabled={resetting || loading}
            className="px-3.5 py-2 rounded-[5px] text-xs font-serif font-medium text-ink-600 hover:text-ink-900 bg-[#F8F4EC] hover:bg-ink-100 border border-ink-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Khôi phục về bảng màu mặc định của Wayfare"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục mặc định
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
            Lưu bản nháp
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing || loading}
            className="px-5 py-2 rounded-[5px] text-xs font-serif font-bold text-white bg-clay-600 hover:bg-clay-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {publishing ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            Xuất bản toàn hệ thống
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Layout: Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Tabs & Form Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 p-1 bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] shadow-2xs font-serif text-xs">
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex-1 py-2 px-3 rounded-[4px] font-bold transition-all text-center ${
                activeTab === 'branding' 
                  ? 'bg-clay-600 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              Thương hiệu & Logo
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex-1 py-2 px-3 rounded-[4px] font-bold transition-all text-center ${
                activeTab === 'colors' 
                  ? 'bg-clay-600 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              Bảng màu hệ thống
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`flex-1 py-2 px-3 rounded-[4px] font-bold transition-all text-center ${
                activeTab === 'components' 
                  ? 'bg-clay-600 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              Bo góc & Tokens
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-3 rounded-[4px] font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'history' 
                  ? 'bg-clay-600 text-white shadow-xs' 
                  : 'text-ink-600 hover:text-ink-900 hover:bg-[#F8F4EC]'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Lịch sử
            </button>
          </div>

          {/* TAB 1: BRANDING */}
          {activeTab === 'branding' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-5 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-sm text-ink-800 border-b border-ink-100 pb-2 flex items-center gap-2">
                <Image className="w-4 h-4 text-clay-600" /> Nhận diện Thương hiệu & Logo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-serif text-xs font-bold text-ink-700">Tên Website / Ứng dụng</label>
                  <input
                    type="text"
                    value={formData.branding.siteTitle || ''}
                    onChange={e => handleBrandingChange('siteTitle', e.target.value)}
                    placeholder="VD: Wayfare"
                    className="w-full px-3 py-2 text-xs bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-serif text-xs font-bold text-ink-700">Khẩu hiệu (Tagline)</label>
                  <input
                    type="text"
                    value={formData.branding.tagline || ''}
                    onChange={e => handleBrandingChange('tagline', e.target.value)}
                    placeholder="VD: Khám phá Việt Nam theo cách riêng"
                    className="w-full px-3 py-2 text-xs bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-serif text-xs font-bold text-ink-700">Mô tả SEO meta description</label>
                <textarea
                  rows={2}
                  value={formData.branding.metaDescription || ''}
                  onChange={e => handleBrandingChange('metaDescription', e.target.value)}
                  placeholder="Mô tả tóm tắt cho công cụ tìm kiếm Google..."
                  className="w-full px-3 py-2 text-xs bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="font-serif text-xs font-bold text-ink-700">Đường dẫn Logo chính (Dark logo)</label>
                  <input
                    type="text"
                    value={formData.branding.logoUrl || ''}
                    onChange={e => handleBrandingChange('logoUrl', e.target.value)}
                    placeholder="/images/brand-logo.png"
                    className="w-full px-3 py-2 text-xs bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-serif text-xs font-bold text-ink-700">Đường dẫn Logo nền tối (White logo)</label>
                  <input
                    type="text"
                    value={formData.branding.logoWhiteUrl || ''}
                    onChange={e => handleBrandingChange('logoWhiteUrl', e.target.value)}
                    placeholder="/images/brand-logo-white.png"
                    className="w-full px-3 py-2 text-xs bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-serif text-xs font-bold text-ink-700">Đường dẫn Favicon Icon</label>
                  <input
                    type="text"
                    value={formData.branding.faviconUrl || ''}
                    onChange={e => handleBrandingChange('faviconUrl', e.target.value)}
                    placeholder="/favicon.ico"
                    className="w-full px-3 py-2 text-xs bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-serif text-xs font-bold text-ink-700">Ảnh nền Banner Hero (Tùy chọn)</label>
                  <input
                    type="text"
                    value={formData.branding.heroBgUrl || ''}
                    onChange={e => handleBrandingChange('heroBgUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-serif text-xs font-bold text-ink-700">Văn bản Chân trang (Footer text)</label>
                <input
                  type="text"
                  value={formData.branding.footerText || ''}
                  onChange={e => handleBrandingChange('footerText', e.target.value)}
                  placeholder="© 2026 Wayfare Travel. Mọi quyền được bảo lưu."
                  className="w-full px-3 py-2 text-xs bg-[#F8F4EC] border border-ink-200/80 rounded-[5px] focus:outline-none focus:border-clay-600 focus:bg-[#FFFDF8]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: COLORS */}
          {activeTab === 'colors' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-5 shadow-xs space-y-6">
              
              {/* Group 1: Brand Accent Colors */}
              <div>
                <h4 className="font-serif font-bold text-xs text-ink-800 uppercase tracking-wider text-clay-700 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Màu Nhận diện Thương hiệu
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Primary Color */}
                  <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Màu chính (Primary)</span>
                      <span className="font-mono text-[10px] text-ink-400">Nút bấm, điểm nhấn, badge</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.colors.primary} 
                        onChange={e => handleColorChange('primary', e.target.value)}
                        className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.colors.primary}
                        onChange={e => handleColorChange('primary', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-ink-200 rounded text-center"
                      />
                    </div>
                  </div>

                  {/* Primary Hover */}
                  <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Rê chuột (Hover)</span>
                      <span className="font-mono text-[10px] text-ink-400">Trạng thái hover của nút</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.colors.primaryHover} 
                        onChange={e => handleColorChange('primaryHover', e.target.value)}
                        className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.colors.primaryHover}
                        onChange={e => handleColorChange('primaryHover', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-ink-200 rounded text-center"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Group 2: Surface & Typography Colors */}
              <div>
                <h4 className="font-serif font-bold text-xs text-ink-800 uppercase tracking-wider text-clay-700 mb-3 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" /> Bố cục & Màu nền trang
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Background */}
                  <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Màu nền trang (Background)</span>
                      <span className="font-mono text-[10px] text-ink-400">Nền trang toàn hệ thống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.colors.background} 
                        onChange={e => handleColorChange('background', e.target.value)}
                        className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.colors.background}
                        onChange={e => handleColorChange('background', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-ink-200 rounded text-center"
                      />
                    </div>
                  </div>

                  {/* Surface */}
                  <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Màu thẻ / Ô (Surface)</span>
                      <span className="font-mono text-[10px] text-ink-400">Nền card, modal, ô nội dung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.colors.surface} 
                        onChange={e => handleColorChange('surface', e.target.value)}
                        className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.colors.surface}
                        onChange={e => handleColorChange('surface', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-ink-200 rounded text-center"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Màu chữ chính (Text)</span>
                      <span className="font-mono text-[10px] text-ink-400">Tiêu đề, nội dung chính</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.colors.text} 
                        onChange={e => handleColorChange('text', e.target.value)}
                        className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.colors.text}
                        onChange={e => handleColorChange('text', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-ink-200 rounded text-center"
                      />
                    </div>
                  </div>

                  {/* Border Color */}
                  <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Màu viền (Border)</span>
                      <span className="font-mono text-[10px] text-ink-400">Đường viền thẻ, phân cách</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.colors.border} 
                        onChange={e => handleColorChange('border', e.target.value)}
                        className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.colors.border}
                        onChange={e => handleColorChange('border', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-ink-200 rounded text-center"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Group 3: Navigation Bar & Sidebar */}
              <div>
                <h4 className="font-serif font-bold text-xs text-ink-800 uppercase tracking-wider text-clay-700 mb-3 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" /> Điều hướng & Thanh tác vụ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Header Background */}
                  <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Nền thanh Header</span>
                      <span className="font-mono text-[10px] text-ink-400">Thanh điều hướng trên cùng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.colors.headerBg} 
                        onChange={e => handleColorChange('headerBg', e.target.value)}
                        className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.colors.headerBg}
                        onChange={e => handleColorChange('headerBg', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-ink-200 rounded text-center"
                      />
                    </div>
                  </div>

                  {/* Sidebar Background */}
                  <div className="p-3 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Nền thanh Sidebar</span>
                      <span className="font-mono text-[10px] text-ink-400">Menu quản trị bên trái</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.colors.sidebarBg} 
                        onChange={e => handleColorChange('sidebarBg', e.target.value)}
                        className="w-8 h-8 rounded border border-ink-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.colors.sidebarBg}
                        onChange={e => handleColorChange('sidebarBg', e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-ink-200 rounded text-center"
                      />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: COMPONENTS & TOKENS */}
          {activeTab === 'components' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-5 shadow-xs space-y-5">
              <h3 className="font-serif font-bold text-sm text-ink-800 border-b border-ink-100 pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-clay-600" /> Bo góc & Token Thành phần (Components)
              </h3>

              <div className="space-y-4">
                {/* Radius Card */}
                <div className="p-4 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Bo góc Thẻ / Card (Radius Card)</span>
                      <span className="font-mono text-[10px] text-ink-400">Độ cong góc của Card địa điểm, Card bài viết, Modal</span>
                    </div>
                    <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded border border-ink-200">
                      {formData.components.radiusCard}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {['2px', '4px', '6px', '8px', '12px', '16px'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleComponentChange('radiusCard', r)}
                        className={`px-3 py-1 text-xs rounded border transition-all ${
                          formData.components.radiusCard === r
                            ? 'bg-clay-600 text-white font-bold border-clay-600'
                            : 'bg-white text-ink-700 hover:bg-ink-100 border-ink-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Radius Control */}
                <div className="p-4 rounded-[5px] bg-[#F8F4EC] border border-ink-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-ink-800 block">Bo góc Nút bấm & Ô nhập (Radius Control)</span>
                      <span className="font-mono text-[10px] text-ink-400">Độ cong góc của Nút button, Input field, Dropdown</span>
                    </div>
                    <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded border border-ink-200">
                      {formData.components.radiusControl}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {['2px', '4px', '5px', '8px', '9999px'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleComponentChange('radiusControl', r)}
                        className={`px-3 py-1 text-xs rounded border transition-all ${
                          formData.components.radiusControl === r
                            ? 'bg-clay-600 text-white font-bold border-clay-600'
                            : 'bg-white text-ink-700 hover:bg-ink-100 border-ink-200'
                        }`}
                      >
                        {r === '9999px' ? 'Pill (Tròn)' : r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERSION HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-5 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-sm text-ink-800 border-b border-ink-100 pb-2 flex items-center gap-2">
                <History className="w-4 h-4 text-clay-600" /> Lịch sử Phiên bản Giao diện & Rollback
              </h3>

              <div className="divide-y divide-ink-100">
                {versionsList.map(v => {
                  const isCurrent = v.versionNo === publishedVersion;
                  return (
                    <div key={v.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-ink-800">
                            Phiên bản v{v.versionNo}
                          </span>
                          {isCurrent && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                              Đang áp dụng
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-ink-400">
                            {v.publishedAt ? new Date(v.publishedAt).toLocaleString('vi-VN') : 'Bản nháp'}
                          </span>
                        </div>
                        <p className="text-xs text-ink-500 font-serif mt-0.5">
                          {v.note || 'Không có ghi chú'}
                        </p>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => handleRollback(v.id, v.versionNo)}
                          className="px-3 py-1 text-xs font-serif font-medium text-clay-700 hover:text-white bg-clay-50 hover:bg-clay-600 border border-clay-300 rounded-[4px] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Rollback về v{v.versionNo}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Interactive Real-time Preview Box (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-3">
          
          {/* Preview Controller Bar */}
          <div className="bg-[#FFFDF8] border border-ink-200/80 rounded-[6px] p-3 shadow-2xs flex items-center justify-between">
            <span className="font-serif font-bold text-xs text-ink-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-clay-600" /> Xem trước Thời gian thực
            </span>

            {/* Desktop / Mobile toggle */}
            <div className="flex items-center gap-1 bg-[#F8F4EC] p-0.5 rounded-[4px] border border-ink-200">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded-[3px] text-xs transition-all ${
                  previewMode === 'desktop' ? 'bg-white text-ink-900 shadow-2xs font-bold' : 'text-ink-400 hover:text-ink-700'
                }`}
                title="Xem trước màn hình Máy tính"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded-[3px] text-xs transition-all ${
                  previewMode === 'mobile' ? 'bg-white text-ink-900 shadow-2xs font-bold' : 'text-ink-400 hover:text-ink-700'
                }`}
                title="Xem trước màn hình Điện thoại (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Real-time Preview Container */}
          <div className="flex justify-center">
            <div 
              style={{
                backgroundColor: formData.colors.background,
                color: formData.colors.text,
                width: previewMode === 'mobile' ? '360px' : '100%',
                borderRadius: '8px'
              }}
              className="border border-ink-300 shadow-md p-4 transition-all duration-300 space-y-4 overflow-hidden"
            >
              
              {/* Mini Preview Header */}
              <div 
                style={{ 
                  backgroundColor: formData.colors.surface,
                  borderColor: formData.colors.border,
                  borderRadius: formData.components.radiusCard
                }}
                className="p-3 border flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div 
                    style={{ backgroundColor: formData.colors.primary }}
                    className="w-7 h-7 rounded flex items-center justify-center text-white font-serif font-black text-xs"
                  >
                    W
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-xs leading-none">
                      {formData.branding.siteTitle || 'Wayfare'}
                    </h5>
                    <span className="font-sans text-[9px] text-ink-400">
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
                  className="px-2.5 py-1 text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
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
                <div className="h-28 bg-ink-200 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80" 
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

                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-ink-400 uppercase">Vịnh Hạ Long · Quảng Ninh</span>
                    <span className="text-[11px] font-bold text-amber-600">★ 4.9</span>
                  </div>

                  <h6 className="font-serif font-bold text-xs line-clamp-1">
                    Du ngoạn ngắm hoàng hôn trên du thuyền Vịnh Lan Hạ
                  </h6>

                  <p className="text-[11px] text-ink-500 font-sans line-clamp-2 leading-relaxed">
                    Trải nghiệm chèo kayak ngắm hang Sáng Tối, hòa mình vào thiên nhiên hùng vĩ của di sản thế giới.
                  </p>

                  <div className="pt-2 border-t border-ink-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-ink-400 block font-mono">Ngân sách dự tính:</span>
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
                      className="px-2.5 py-1 text-[10px] font-serif font-bold transition-all shadow-2xs"
                    >
                      Lên lịch ngay
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample Buttons & Alert States */}
              <div 
                style={{ 
                  backgroundColor: formData.colors.surface,
                  borderColor: formData.colors.border,
                  borderRadius: formData.components.radiusCard
                }}
                className="p-3 border space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData.colors.buttonBg,
                      color: formData.colors.buttonText,
                      borderRadius: formData.components.radiusControl
                    }}
                    className="flex-1 py-1.5 font-bold shadow-2xs text-[11px]"
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
                    className="flex-1 py-1.5 font-medium border text-[11px]"
                  >
                    Nút Phụ (Secondary)
                  </button>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span 
                    style={{ backgroundColor: `${formData.colors.success}20`, color: formData.colors.success }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                  >
                    Hoạt động
                  </span>
                  <span 
                    style={{ backgroundColor: `${formData.colors.warning}20`, color: formData.colors.warning }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                  >
                    Chờ duyệt
                  </span>
                  <span 
                    style={{ backgroundColor: `${formData.colors.danger}20`, color: formData.colors.danger }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                  >
                    Đã ẩn
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminAppearancePage;

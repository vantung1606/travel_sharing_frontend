import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { publicConfigApi } from '../services/api';

const ThemeContext = createContext(null);

const DEFAULT_THEME_TOKENS = {
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
  branding: {
    siteTitle: 'Wayfare',
    tagline: 'Hành trình khám phá du lịch Việt Nam theo cách riêng',
    metaDescription: 'Nền tảng chia sẻ lịch trình du lịch, khám phá địa điểm và kết nối cộng đồng phượt thủ hàng đầu Việt Nam.',
    logoUrl: '/images/brand-logo.png',
    logoWhiteUrl: '/images/brand-logo-white.png',
    faviconUrl: '/favicon.ico',
    heroBgUrl: '',
    loginBgUrl: '',
    footerText: '© 2026 Wayfare Travel. Mọi quyền được bảo lưu.'
  },
  components: {
    radiusCard: '6px',
    radiusControl: '5px'
  }
};

function applyCssTokens(tokens) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const colors = tokens?.colors || DEFAULT_THEME_TOKENS.colors;
  const components = tokens?.components || DEFAULT_THEME_TOKENS.components;

  if (colors.primary) root.style.setProperty('--wf-primary', colors.primary);
  if (colors.primaryHover) root.style.setProperty('--wf-primary-hover', colors.primaryHover);
  if (colors.background) root.style.setProperty('--wf-background', colors.background);
  if (colors.surface) root.style.setProperty('--wf-surface', colors.surface);
  if (colors.text) root.style.setProperty('--wf-text', colors.text);
  if (colors.muted) root.style.setProperty('--wf-muted', colors.muted);
  if (colors.border) root.style.setProperty('--wf-border', colors.border);
  if (colors.headerBg) root.style.setProperty('--wf-header-bg', colors.headerBg);
  if (colors.sidebarBg) root.style.setProperty('--wf-sidebar-bg', colors.sidebarBg);
  if (colors.sidebarText) root.style.setProperty('--wf-sidebar-text', colors.sidebarText);
  if (colors.buttonBg) root.style.setProperty('--wf-button-bg', colors.buttonBg);
  if (colors.buttonText) root.style.setProperty('--wf-button-text', colors.buttonText);
  if (colors.success) root.style.setProperty('--wf-success', colors.success);
  if (colors.warning) root.style.setProperty('--wf-warning', colors.warning);
  if (colors.danger) root.style.setProperty('--wf-danger', colors.danger);
  if (colors.info) root.style.setProperty('--wf-info', colors.info);

  if (components.radiusCard) root.style.setProperty('--wf-radius-card', components.radiusCard);
  if (components.radiusControl) root.style.setProperty('--wf-radius-control', components.radiusControl);

  // Update favicon if provided
  if (tokens?.branding?.faviconUrl) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = tokens.branding.faviconUrl;
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const cached = localStorage.getItem('wayfare_theme');
      if (cached) {
        const parsed = JSON.parse(cached);
        applyCssTokens(parsed);
        return parsed;
      }
    } catch {}
    applyCssTokens(DEFAULT_THEME_TOKENS);
    return DEFAULT_THEME_TOKENS;
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchSiteConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await publicConfigApi.getSiteConfig();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        const merged = {
          colors: { ...DEFAULT_THEME_TOKENS.colors, ...(data.colors || {}) },
          branding: { ...DEFAULT_THEME_TOKENS.branding, ...(data.branding || {}) },
          components: { ...DEFAULT_THEME_TOKENS.components, ...(data.components || {}) },
          version: data.version
        };
        setTheme(merged);
        applyCssTokens(merged);
        localStorage.setItem('wayfare_theme', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Lỗi khi tải cấu hình theme:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteConfig();
  }, [fetchSiteConfig]);

  const branding = useMemo(() => theme.branding || DEFAULT_THEME_TOKENS.branding, [theme]);
  const colors = useMemo(() => theme.colors || DEFAULT_THEME_TOKENS.colors, [theme]);
  const components = useMemo(() => theme.components || DEFAULT_THEME_TOKENS.components, [theme]);

  const value = useMemo(() => ({
    theme,
    branding,
    colors,
    components,
    isLoading,
    refreshTheme: fetchSiteConfig,
    applyCssTokens
  }), [theme, branding, colors, components, isLoading, fetchSiteConfig]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: DEFAULT_THEME_TOKENS,
      branding: DEFAULT_THEME_TOKENS.branding,
      colors: DEFAULT_THEME_TOKENS.colors,
      components: DEFAULT_THEME_TOKENS.components,
      isLoading: false,
      refreshTheme: () => {},
      applyCssTokens: () => {}
    };
  }
  return ctx;
};

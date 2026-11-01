import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { publicConfigApi } from '../services/api';

const ThemeContext = createContext(null);

export const DEFAULT_THEME_TOKENS = {
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
    logoUrl: '/wayfare-logo.png',
    logoWhiteUrl: '/wayfare-logo-white.png',
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

export function applyCssTokens(tokens) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const colors = tokens?.colors || DEFAULT_THEME_TOKENS.colors;
  const components = tokens?.components || DEFAULT_THEME_TOKENS.components;
  const branding = tokens?.branding || DEFAULT_THEME_TOKENS.branding;

  // Primary color tokens and root aliases
  if (colors.primary) {
    root.style.setProperty('--wf-primary', colors.primary);
    root.style.setProperty('--primary', colors.primary);
  }
  if (colors.primaryHover) {
    root.style.setProperty('--wf-primary-hover', colors.primaryHover);
    root.style.setProperty('--primary-hover', colors.primaryHover);
  }

  // Background and surface tokens
  if (colors.background) {
    root.style.setProperty('--wf-background', colors.background);
    root.style.setProperty('--surface', colors.background);
    if (document.body) {
      document.body.style.backgroundColor = colors.background;
    }
  }
  if (colors.surface) {
    root.style.setProperty('--wf-surface', colors.surface);
  }

  // Text tokens
  if (colors.text) {
    root.style.setProperty('--wf-text', colors.text);
    root.style.setProperty('--on-surface', colors.text);
    if (document.body) {
      document.body.style.color = colors.text;
    }
  }
  if (colors.muted) root.style.setProperty('--wf-muted', colors.muted);
  if (colors.border) root.style.setProperty('--wf-border', colors.border);

  // Headers & Sidebars
  if (colors.headerBg) root.style.setProperty('--wf-header-bg', colors.headerBg);
  if (colors.sidebarBg) root.style.setProperty('--wf-sidebar-bg', colors.sidebarBg);
  if (colors.sidebarText) root.style.setProperty('--wf-sidebar-text', colors.sidebarText);

  // Button tokens
  if (colors.buttonBg) root.style.setProperty('--wf-button-bg', colors.buttonBg);
  if (colors.buttonText) root.style.setProperty('--wf-button-text', colors.buttonText);

  // Status tokens
  if (colors.success) root.style.setProperty('--wf-success', colors.success);
  if (colors.warning) root.style.setProperty('--wf-warning', colors.warning);
  if (colors.danger) root.style.setProperty('--wf-danger', colors.danger);
  if (colors.info) root.style.setProperty('--wf-info', colors.info);

  // Component geometry
  if (components.radiusCard) {
    root.style.setProperty('--wf-radius-card', components.radiusCard);
    root.style.setProperty('--radius-card', components.radiusCard);
  }
  if (components.radiusControl) {
    root.style.setProperty('--wf-radius-control', components.radiusControl);
    root.style.setProperty('--radius-control', components.radiusControl);
  }

  // Update browser document title
  if (branding?.siteTitle) {
    const titleText = branding.tagline ? `${branding.siteTitle} - ${branding.tagline}` : branding.siteTitle;
    document.title = titleText;
  }

  // Update favicon link if valid
  if (branding?.faviconUrl) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = branding.faviconUrl;
  }

  // Update meta description
  if (branding?.metaDescription) {
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = branding.metaDescription;
  }
}

function sanitizeBranding(branding) {
  if (!branding) return DEFAULT_THEME_TOKENS.branding;
  const copy = { ...DEFAULT_THEME_TOKENS.branding, ...branding };
  if (!copy.logoUrl || copy.logoUrl.includes('brand-logo.png')) {
    copy.logoUrl = '/wayfare-logo.png';
  }
  if (!copy.logoWhiteUrl || copy.logoWhiteUrl.includes('brand-logo-white.png')) {
    copy.logoWhiteUrl = '/wayfare-logo-white.png';
  }
  return copy;
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const cached = localStorage.getItem('wayfare_theme');
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.branding = sanitizeBranding(parsed.branding);
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
          branding: sanitizeBranding(data.branding),
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

  // Set live preview theme (updates state and immediately renders across document)
  const setLivePreviewTheme = useCallback((newTokens) => {
    if (!newTokens) return;
    const merged = {
      colors: { ...(theme?.colors || DEFAULT_THEME_TOKENS.colors), ...(newTokens.colors || {}) },
      branding: sanitizeBranding({ ...(theme?.branding || DEFAULT_THEME_TOKENS.branding), ...(newTokens.branding || {}) }),
      components: { ...(theme?.components || DEFAULT_THEME_TOKENS.components), ...(newTokens.components || {}) }
    };
    setTheme(merged);
    applyCssTokens(merged);
  }, [theme]);

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
    applyCssTokens,
    setLivePreviewTheme
  }), [theme, branding, colors, components, isLoading, fetchSiteConfig, setLivePreviewTheme]);

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
      applyCssTokens: () => {},
      setLivePreviewTheme: () => {}
    };
  }
  return ctx;
};
export default ThemeProvider;

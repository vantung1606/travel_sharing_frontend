import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  RotateCcw,
  Wifi,
  Save,
  SlidersHorizontal,
  Sparkles,
  Database,
  RefreshCw,
  MapPin,
  KeyRound,
  Eye,
  EyeOff,
  History,
  TrendingUp,
  Smile,
  Flame,
  Compass,
  Wallet,
  FlaskConical,
  Play,
  CheckCircle2,
  Copy,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Clock3,
  Terminal,
  AlertTriangle,
  FileJson,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  ChevronRight as ChevronRightSm
} from 'lucide-react';
import { useToast } from '../../../components/common/Toast';
import {
  DEFAULT_CONFIG,
  DRAFT_KEY,
  MODELS,
  TONES,
  PROMPT_HISTORY,
  PRESET_PROMPTS,
  SAMPLE_ITINERARIES,
  SAMPLE_LOGS,
  STATUS,
  validateConfig,
  readDraft
} from './aiConfigPreview';

export function AdminAIConfigPage() {
  const toast = useToast();
  
  // Configuration States
  const [initial] = useState(readDraft);
  const [config, setConfig] = useState(initial.config);
  const [savedConfig, setSavedConfig] = useState(initial.config);
  const [savedAt, setSavedAt] = useState(initial.savedAt);
  const [errors, setErrors] = useState({});
  const [showApiKey, setShowApiKey] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'test-connection' | 'api-key' | 'history' | 'reset' | 'log-detail' | 'edit-multiplier'
  const [selectedLog, setSelectedLog] = useState(null);

  // Sandbox Playground States
  const [sandboxPrompt, setSandboxPrompt] = useState('Lên lịch trình 2N1Đ đi Ninh Bình cho 2 người, thích chụp ảnh sống ảo và ẩm thực dê núi');
  const [isRunningSandbox, setIsRunningSandbox] = useState(false);
  const [sandboxTab, setSandboxTab] = useState('visual'); // 'visual' | 'json'
  const [sandboxTelemetry, setSandboxTelemetry] = useState({
    status: '200 OK',
    time: '1.05s',
    tokens: '340 tokens',
    promptTokens: 45,
    completionTokens: 295
  });
  const [currentItinerary, setCurrentItinerary] = useState(SAMPLE_ITINERARIES.ninhBinh);

  // Connection Test Animation States
  const [testStep, setTestStep] = useState(0); // 0: idle, 1: connecting, 2: ping, 3: auth, 4: ready

  // Request Logs Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const isDirty = JSON.stringify(config) !== JSON.stringify(savedConfig);
  const selectedModel = MODELS.find(m => m.id === config.model) || MODELS[0];

  // Warn on page unload if changes are unsaved
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Update field helpers
  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const validationErrors = validateConfig(config);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Vui lòng kiểm tra lại các trường cấu hình chưa hợp lệ!');
      return;
    }

    try {
      const now = new Date().toISOString();
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ config, savedAt: now }));
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ config, savedAt: now }));
      setSavedConfig({ ...config });
      setSavedAt(now);
      toast.success('Đã lưu cấu hình Hệ thống AI thành công! ✨');
    } catch {
      toast.error('Không thể lưu vào bộ nhớ cục bộ.');
    }
  };

  const handleRestoreDefaults = () => {
    setConfig({ ...DEFAULT_CONFIG });
    setErrors({});
    setActiveModal(null);
    toast.info('Đã khôi phục cài đặt mặc định của hệ thống WanderAI.');
  };

  const handleRunSandbox = () => {
    if (!sandboxPrompt.trim()) {
      toast.warning('Vui lòng nhập nội dung yêu cầu thử nghiệm.');
      return;
    }

    setIsRunningSandbox(true);
    toast.info('Đang gửi prompt đến AI Engine...');

    setTimeout(() => {
      setIsRunningSandbox(false);
      // Switch preview based on prompt keywords
      if (sandboxPrompt.toLowerCase().includes('đà nẵng') || sandboxPrompt.toLowerCase().includes('hội an')) {
        setCurrentItinerary(SAMPLE_ITINERARIES.daNang);
        setSandboxTelemetry({
          status: '200 OK',
          time: '1.24s',
          tokens: '412 tokens',
          promptTokens: 52,
          completionTokens: 360
        });
      } else {
        setCurrentItinerary(SAMPLE_ITINERARIES.ninhBinh);
        setSandboxTelemetry({
          status: '200 OK',
          time: '1.05s',
          tokens: '340 tokens',
          promptTokens: 45,
          completionTokens: 295
        });
      }
      toast.success('AI Engine đã tạo thành công cấu trúc lịch trình!');
    }, 1100);
  };

  const handleRunConnectionTest = () => {
    setActiveModal('test-connection');
    setTestStep(1);

    setTimeout(() => setTestStep(2), 600);
    setTimeout(() => setTestStep(3), 1300);
    setTimeout(() => {
      setTestStep(4);
      toast.success('Kết nối Gemini API Gateway hoạt động ổn định (412ms)!');
    }, 2000);
  };

  const handleCopyJson = async (data) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success('Đã sao chép dữ liệu JSON vào bộ nhớ tạm! 📋');
    } catch {
      toast.error('Không thể sao chép JSON.');
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return SAMPLE_LOGS.filter(log => {
      const matchSearch =
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || log.status === statusFilter;
      const matchTime = timeFilter === 'all' || (timeFilter === 'hour' ? log.minutesAgo <= 60 : true);

      return matchSearch && matchStatus && matchTime;
    });
  }, [searchQuery, statusFilter, timeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-w-0 space-y-6 pb-16">
      
      {/* ─── 1. TOP HEADER & BREADCRUMB BAR ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1 hover:text-sky-600 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              Ban Quản Trị Hệ Thống
            </span>
            <ChevronRightSm className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-sky-600 font-bold">Cấu hình Trợ lý AI & Model</span>
          </div>

          {/* Title & Core Live Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cấu hình Hệ thống AI & Giám sát Model (AI Engine)
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-600"></span>
              </span>
              <span>AI Core: Online (v2.4-turbo)</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Quản lý tham số mô hình ngôn ngữ lớn (LLM), cấu hình Prompt Rules hệ sinh thái du lịch, kiểm soát hạn mức Token và quy tắc an toàn nội dung.
          </p>
        </div>

        {/* Action Buttons Top */}
        <div className="flex flex-wrap items-center gap-2.5 self-start xl:self-center">
          <button
            type="button"
            onClick={() => setActiveModal('reset')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            type="button"
            onClick={handleRunConnectionTest}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all shadow-xs"
          >
            <Wifi className="w-4 h-4 text-sky-600" />
            <span>Kiểm tra kết nối (Test API)</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isDirty
                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20 ring-2 ring-sky-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </div>

      {/* ─── 2. TELEMETRY KPI QUOTA CARDS (ROW 1) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tokens used */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Tokens dùng hôm nay</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">1.482.500</p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 mb-1.5">
              <span>Hạn mức 1.8M/ngày</span>
              <span className="font-extrabold text-sky-600">82%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: '82%' }}></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Primary Model */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Mô hình chính</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg sm:text-xl font-extrabold text-slate-900">{selectedModel.shortName}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              Fallback: <span className="font-semibold text-slate-700">GPT-4o-mini & Haiku</span>
            </p>
            <div className="mt-3 text-sky-600 text-[11px] font-bold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Auto-Switching Ready</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Average Latency */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Độ trễ phản hồi TB</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">1.18s</p>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ↓ -24%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Nhờ tối ưu <span className="font-semibold text-slate-700">Semantic Cache</span>
            </p>
            <div className="mt-3 text-slate-500 text-[11px] font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>P95 latency: 2.1s</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Validity & Shield */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Tỷ lệ hợp lệ</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">99.6%</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Chặn <span className="font-bold text-rose-600">42 yêu cầu</span> vi phạm
            </p>
            <div className="mt-3 text-emerald-700 text-[11px] font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
              <span>Jailbreak & Spam Shield Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. TWO-COLUMN DEEP CONFIGURATION GRID (ROW 2) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: MODEL PARAMETERS (6 COLS) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-extrabold text-slate-900">Cấu hình Model & Tham số LLM</h2>
                <p className="text-xs text-slate-400">Thiết lập kết nối mô hình và tham số suy luận du lịch.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px] tracking-wider uppercase">
              Inference Tuning
            </span>
          </div>

          {/* Provider & Model Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Nhà cung cấp & Model LLM chính <span className="text-rose-500">*</span>
            </label>
            <select
              value={config.model}
              onChange={(e) => updateConfig('model', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 font-medium"
            >
              {MODELS.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.isDefault ? '(Mặc định khuyên dùng)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {selectedModel.description}
            </p>
          </div>

          {/* Temperature Slider */}
          <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="temperature-slider" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Temperature (Độ ngẫu nhiên / Sáng tạo)</span>
              </label>
              <span className="px-3 py-1 rounded-lg bg-white border border-sky-200 text-sky-700 font-mono font-extrabold text-xs shadow-xs">
                {Number(config.temperature).toFixed(2)}
              </span>
            </div>

            <input
              id="temperature-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.temperature}
              onChange={(e) => updateConfig('temperature', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>0.0 (Chính xác địa lý tuyệt đối)</span>
              <span className="text-sky-700 font-bold">0.4 (Cân bằng du lịch chuẩn)</span>
              <span>1.0 (Rất sáng tạo)</span>
            </div>
          </div>

          {/* Max Tokens & Top-P */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Max Output Tokens</label>
                <span className="text-[10px] font-mono text-slate-400">128 - 8192</span>
              </div>
              <input
                type="number"
                min="128"
                max="8192"
                step="64"
                value={config.maxTokens}
                onChange={(e) => updateConfig('maxTokens', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
              />
              <p className="text-[10px] text-slate-400">Giới hạn output lịch trình tối đa.</p>
              {errors.maxTokens && <p className="text-[10px] text-rose-600">{errors.maxTokens}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Top-P Sampling</label>
                <span className="text-[10px] font-mono text-slate-400">0.05 - 1.0</span>
              </div>
              <input
                type="number"
                min="0.05"
                max="1.0"
                step="0.05"
                value={config.topP}
                onChange={(e) => updateConfig('topP', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
              />
              <p className="text-[10px] text-slate-400">Ngưỡng Nucleus sampling.</p>
              {errors.topP && <p className="text-[10px] text-rose-600">{errors.topP}</p>}
            </div>
          </div>

          {/* Smart Toggles Section */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Tính năng Tối ưu Hành trình
            </span>

            {/* Toggle 1: Semantic Cache */}
            <div
              onClick={() => updateConfig('cache', !config.cache)}
              className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Kích hoạt Semantic Cache (Redis + Vector)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Tự động trả về lịch trình tương đương nếu độ tương đồng &gt; 92%, giảm 60% chi phí.
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative shrink-0 mt-1 ${config.cache ? 'bg-sky-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${config.cache ? 'left-5' : 'left-1'}`}></div>
              </div>
            </div>

            {/* Toggle 2: Fallback */}
            <div
              onClick={() => updateConfig('fallback', !config.fallback)}
              className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Auto-Fallback khi chạm Rate Limit / Timeout</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Chuyển sang GPT-4o-mini ngay lập tức nếu Google Gemini phản hồi chậm hơn 3.5s.
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative shrink-0 mt-1 ${config.fallback ? 'bg-sky-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${config.fallback ? 'left-5' : 'left-1'}`}></div>
              </div>
            </div>

            {/* Sub-inputs if fallback is enabled */}
            {config.fallback && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Model dự phòng</label>
                  <select
                    value={config.fallbackModel}
                    onChange={(e) => updateConfig('fallbackModel', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none font-medium"
                  >
                    {MODELS.filter(m => m.id !== config.model).map(m => (
                      <option key={m.id} value={m.id}>{m.shortName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Thời gian chờ (giây)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.5"
                    value={config.timeout}
                    onChange={(e) => updateConfig('timeout', Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Toggle 3: Grounding */}
            <div
              onClick={() => updateConfig('grounding', !config.grounding)}
              className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Grounding GPS thực tế từ CSDL WanderAI</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Gắn kinh độ, vĩ độ và mã định danh quán ăn, resort được kiểm duyệt vào phản hồi.
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative shrink-0 mt-1 ${config.grounding ? 'bg-sky-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${config.grounding ? 'left-5' : 'left-1'}`}></div>
              </div>
            </div>
          </div>

          {/* Gemini API Key Vault Card */}
          <div className="p-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/70 to-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800">Gemini API Key Vault</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 font-bold text-[10px]">
                Tier 3 (Pay-as-you-go)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  readOnly
                  value={config.apiKey || 'AIzaSyDk9941_SecretKey_WanderAI_Production'}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono text-slate-700 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('api-key')}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-xs"
              >
                Đổi Key
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.success('Hạn mức tháng còn lại: $640.20 / $1,000.00 Credit limit.');
                }}
                className="px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-all shadow-xs"
              >
                Kiểm tra Quota
              </button>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Hạn mức tháng còn lại: $640.20 / $1,000.00 Credit limit</span>
              <span className="text-emerald-600 font-bold">Khả dụng</span>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: SYSTEM PROMPT & PERSONA (6 COLS) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-extrabold text-slate-900">System Prompt & Quy chuẩn Persona</h2>
                <p className="text-xs text-slate-400">Định hình trí tuệ nhân tạo, phong cách và nguyên tắc tư vấn.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-bold text-[10px] tracking-wider uppercase">
              V-Persona v3.8
            </span>
          </div>

          {/* Master System Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-sky-600" />
                <span>Master System Prompt (Định hình trí tuệ du lịch)</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveModal('history')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>Lịch sử Prompt</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={config.systemPrompt}
              onChange={(e) => updateConfig('systemPrompt', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 leading-relaxed outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 resize-y"
            ></textarea>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Prompt này được tự động chèn vào vị trí cao nhất của mọi context chain gửi đến LLM.</span>
              <span className={`font-mono ${config.systemPrompt.length > 4500 ? 'text-rose-500 font-bold' : ''}`}>
                {config.systemPrompt.length} / 5.000 ký tự
              </span>
            </div>
            {errors.systemPrompt && <p className="text-[10px] text-rose-600">{errors.systemPrompt}</p>}
          </div>

          {/* Persona Tone Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700">Tone & Phong cách đàm thoại du lịch</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map(tone => {
                const isSelected = config.tone === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => updateConfig('tone', tone.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-sky-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {tone.id === 'friendly' && <Smile className="w-3.5 h-3.5" />}
                    {tone.id === 'inspiring' && <Flame className="w-3.5 h-3.5" />}
                    {tone.id === 'local' && <Compass className="w-3.5 h-3.5" />}
                    {tone.id === 'budget' && <Wallet className="w-3.5 h-3.5" />}
                    <span>{tone.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safety & Moderation (2x2 Grid) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Bộ lọc An toàn & Ngăn chặn Jailbreak</span>
              </label>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">Standard Safety API</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'hateSpeech', label: 'Hate Speech' },
                { key: 'harassment', label: 'Harassment' },
                { key: 'sexualContent', label: 'Sexual Content' },
                { key: 'dangerousContent', label: 'Dangerous Acts' }
              ].map(item => (
                <div key={item.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                  <select
                    value={config[item.key]}
                    onChange={(e) => updateConfig(item.key, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 outline-none"
                  >
                    <option value="high">Chặn mức cao</option>
                    <option value="medium">Chặn từ mức vừa</option>
                    <option value="strict">Nghiêm ngặt</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Peak-Season Multiplier */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Hệ số trượt giá mùa cao điểm (Peak-Season)</span>
                <p className="text-[11px] text-slate-500">Tự động tăng chi phí dự toán trong kỳ nghỉ Lễ/Tết.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-lg text-orange-700">
                x{Number(config.seasonMultiplier).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => setActiveModal('edit-multiplier')}
                className="w-8 h-8 rounded-xl bg-white border border-orange-200 text-orange-700 flex items-center justify-center hover:bg-orange-100 transition-colors shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. INTERACTIVE SANDBOX PLAYGROUND (ROW 3) ───────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-900">Sandbox Thử Nghiệm Prompt & Phản Hồi Trực Tiếp</h2>
              <p className="text-xs text-slate-400">Kiểm tra kết quả sinh lịch trình thực tế theo thông số cấu hình bên trên.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Active: {selectedModel.shortName}
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 shrink-0">Mẫu gợi ý:</span>
          {PRESET_PROMPTS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSandboxPrompt(preset)}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors"
            >
              {preset.length > 40 ? preset.slice(0, 40) + '...' : preset}
            </button>
          ))}
        </div>

        {/* Prompt Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={sandboxPrompt}
              onChange={(e) => setSandboxPrompt(e.target.value)}
              placeholder="Nhập yêu cầu tạo lịch trình thử nghiệm..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-10 py-3 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 font-medium"
            />
          </div>

          <button
            type="button"
            onClick={handleRunSandbox}
            disabled={isRunningSandbox}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 disabled:opacity-50"
          >
            {isRunningSandbox ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang suy luận AI...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Chạy thử nghiệm (Run Test)</span>
              </>
            )}
          </button>
        </div>

        {/* Playground Result Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
          {/* Telemetry bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200/80 pb-3">
            <div className="flex flex-wrap items-center gap-3 text-slate-600">
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Status: {sandboxTelemetry.status}
              </span>
              <span>•</span>
              <span>Thời gian: <strong className="font-mono text-slate-900">{sandboxTelemetry.time}</strong></span>
              <span>•</span>
              <span>
                Tokens: <strong className="font-mono text-slate-900">{sandboxTelemetry.tokens}</strong> (Prompt: {sandboxTelemetry.promptTokens} | Completion: {sandboxTelemetry.completionTokens})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-slate-200 p-0.5">
                <button
                  type="button"
                  onClick={() => setSandboxTab('visual')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    sandboxTab === 'visual' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Xem trực quan
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxTab('json')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    sandboxTab === 'json' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  JSON thô
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopyJson(currentItinerary)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-sky-700 text-xs font-bold shadow-xs transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép JSON</span>
              </button>
            </div>
          </div>

          {/* Result Content */}
          {sandboxTab === 'visual' ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-base font-extrabold text-sky-800">
                    {currentItinerary.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thời lượng: {currentItinerary.duration} • Đối tượng: {currentItinerary.targetAudience}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 font-extrabold text-xs self-start sm:self-auto">
                  Ước tính: {new Intl.NumberFormat('vi-VN').format(currentItinerary.estimatedBudgetPerPerson)}đ / người
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {currentItinerary.days.map((dayObj) => (
                  <div key={dayObj.day} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-extrabold text-[11px]">
                        N{dayObj.day}
                      </span>
                      <span>{dayObj.title}</span>
                    </h4>

                    <div className="space-y-2.5 pt-1">
                      {dayObj.activities.map((act, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs">
                          <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px] shrink-0">
                            {act.time}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">{act.title}</p>
                            <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">{act.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl p-4 overflow-x-auto text-sky-200 font-mono text-xs leading-relaxed max-h-96">
              <pre>{JSON.stringify(currentItinerary, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* ─── 5. REQUEST LOGS TABLE (ROW 4) ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-base font-extrabold text-slate-900">
              Nhật ký Gọi AI API Gần Đây (Request Logs)
            </h2>
            <p className="text-xs text-slate-400">Giám sát các yêu cầu theo thời gian thực, lưu lượng token và trạng thái fallback.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-500">Live streaming logs</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm mã yêu cầu, tác vụ, người dùng..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="success">200 OK</option>
              <option value="cached">Cached</option>
              <option value="fallback">GPT-4o Fallback</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none font-medium"
            >
              <option value="all">Cả ngày hôm nay</option>
              <option value="hour">1 giờ gần nhất</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || timeFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTimeFilter('all');
                  setCurrentPage(1);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Xóa bộ lọc"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Tính năng gọi</th>
                <th className="py-3 px-4">User / Client</th>
                <th className="py-3 px-4 text-right">Tokens (In / Out)</th>
                <th className="py-3 px-4 text-right">Latency</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.map(log => {
                const statusMeta = STATUS[log.status] || STATUS.success;
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                      #{log.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        {log.status === 'blocked' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : (
                          <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                        )}
                        <span>{log.task}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${log.avatarColor}`}>
                          {log.avatarText}
                        </div>
                        <span className="font-medium text-slate-700">{log.user}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700 whitespace-nowrap">
                      {log.input} / {log.output}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                      {log.latency}s
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLog(log);
                          setActiveModal('log-detail');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 font-bold text-[11px] transition-colors"
                      >
                        JSON
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy nhật ký yêu cầu phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-1">
          <span>
            Hiển thị {filteredLogs.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} trong tổng số 14.820 requests hôm nay
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === i + 1
                    ? 'bg-sky-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────────────────── */}
      
      {/* 1. Test Connection Modal */}
      {activeModal === 'test-connection' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Wifi className="w-5 h-5" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900">Kiểm tra kết nối AI Gateway</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { step: 1, label: 'Khởi tạo kênh truyền an toàn TLS 1.3...' },
                { step: 2, label: 'Xác thực Google Gemini API Key Vault...' },
                { step: 3, label: 'Kiểm tra độ trễ Ping & Quota định mức...' },
                { step: 4, label: 'Kết nối hoàn tất: Google Gemini 1.5 Pro (412ms)' }
              ].map(item => (
                <div key={item.step} className="flex items-center gap-3 text-xs">
                  {testStep > item.step ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : testStep === item.step ? (
                    <RefreshCw className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
                  )}
                  <span className={testStep >= item.step ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {testStep === 4 && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Hệ thống AI Engine sẵn sàng phục vụ
                </p>
                <p className="text-[11px] text-emerald-700">
                  Phản hồi từ Google AI Cloud: 200 OK • Hạn mức khả dụng: 99.8% • Cache: Ready.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}

      {/* 2. API Key Vault Modal */}
      {activeModal === 'api-key' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-sky-600" />
                <h3 className="font-display font-extrabold text-base text-slate-900">Cập nhật Gemini API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Khóa API Google Gemini mới</label>
              <input
                type="text"
                defaultValue={config.apiKey}
                id="new-api-key-input"
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-sky-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400">
                Khóa được mã hóa và lưu an toàn. Dùng cho việc sinh lịch trình AI.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const inputVal = document.getElementById('new-api-key-input')?.value;
                  if (inputVal) {
                    updateConfig('apiKey', inputVal);
                    toast.success('Đã cập nhật khóa API Key Vault thành công!');
                  }
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-sm"
              >
                Xác nhận đổi khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Prompt History Modal */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-sky-600" />
                <h3 className="font-display font-extrabold text-base text-slate-900">Lịch sử Phiên bản Master Prompt</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {PROMPT_HISTORY.map((hist, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      {hist.version}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{hist.updatedAt}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700">{hist.note}</p>
                  <p className="text-[11px] text-slate-400">Tác giả: {hist.author}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        updateConfig('systemPrompt', hist.prompt);
                        setActiveModal(null);
                        toast.info(`Đã khôi phục prompt phiên bản ${hist.version}!`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-sky-700 hover:bg-sky-50 text-xs font-bold shadow-xs"
                    >
                      Khôi phục bản này
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Reset Defaults Confirmation Modal */}
      {activeModal === 'reset' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-base text-slate-900">Khôi phục cấu hình mặc định?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Thao tác này sẽ đặt lại tất cả tham số LLM, Master System Prompt, bộ lọc an toàn về cấu hình gốc WanderAI Engine tiêu chuẩn.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-sm"
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Request Log Detail Modal */}
      {activeModal === 'log-detail' && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-sky-600" />
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  Chi tiết Request #{selectedLog.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Người dùng</span>
                <span className="font-bold text-slate-800">{selectedLog.user}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Thời gian</span>
                <span className="font-mono text-slate-800">{selectedLog.time}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Mô hình</span>
                <span className="font-bold text-slate-800">{selectedLog.model}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Trạng thái</span>
                <span className="font-bold text-slate-800">{STATUS[selectedLog.status]?.label}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">JSON Payload & Metadata</span>
              <div className="bg-slate-900 rounded-xl p-3.5 text-sky-200 font-mono text-[11px] leading-relaxed max-h-60 overflow-y-auto">
                <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCopyJson(selectedLog)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Edit Multiplier Modal */}
      {activeModal === 'edit-multiplier' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h3 className="font-display font-extrabold text-base text-slate-900">Hệ số trượt giá mùa Lễ/Tết</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Hệ số nhân chi phí (1.0x - 3.0x)</label>
              <input
                type="number"
                min="1.0"
                max="3.0"
                step="0.05"
                defaultValue={config.seasonMultiplier}
                id="multiplier-input"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400">
                Ví dụ: 1.15x sẽ tự động cộng 15% vào giá vé và phòng nghỉ ước tính trong lịch trình.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = document.getElementById('multiplier-input')?.value;
                  if (val) {
                    updateConfig('seasonMultiplier', Number(val));
                    toast.success(`Đã cập nhật hệ số trượt giá: x${Number(val).toFixed(2)}`);
                  }
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 shadow-sm"
              >
                Lưu hệ số
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

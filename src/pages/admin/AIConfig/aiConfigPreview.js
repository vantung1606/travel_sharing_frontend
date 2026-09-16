// A06 AI Engine Configuration Preview & Fixtures matching Stitch Screen A06
export const DRAFT_KEY = 'wayfare_a06_ai_config_v2';

export const MODELS = [
  {
    id: 'gemini-1.5-pro',
    name: 'Google Gemini 1.5 Pro',
    shortName: 'Gemini 1.5 Pro',
    provider: 'Google AI',
    description: 'Khuyên dùng cho Itinerary dài, context window 1M tokens, đa phương thức đọc ảnh & phân tích tài liệu hành trình.',
    isDefault: true
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Google Gemini 1.5 Flash',
    shortName: 'Gemini 1.5 Flash',
    provider: 'Google AI',
    description: 'Tối ưu tốc độ cao (< 0.6s), tiết kiệm token, phù hợp hỏi đáp nhanh và gợi ý ẩm thực điểm đến.'
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o-mini',
    shortName: 'GPT-4o-mini',
    provider: 'OpenAI',
    description: 'Độ ổn định cao, tối ưu logic tính toán chi phí và xử lý đa ngôn ngữ quốc tế.'
  },
  {
    id: 'llama-3-70b',
    name: 'Meta Llama 3 70B (Private Cluster)',
    shortName: 'Llama 3 70B',
    provider: 'Self-Hosted',
    description: 'Hạ tầng máy chủ chuyên biệt, bảo mật dữ liệu tuyệt đối nội bộ doanh nghiệp.'
  }
];

export const DEFAULT_CONFIG = {
  model: 'gemini-1.5-pro',
  temperature: 0.40,
  maxTokens: 4096,
  topP: 0.95,
  cache: true,
  fallback: true,
  fallbackModel: 'gpt-4o-mini',
  timeout: 3.5,
  grounding: true,
  apiKey: 'AIzaSyDk9941_SecretKey_WanderAI_Production',
  systemPrompt: `Bạn là WanderAI - Chuyên gia cố vấn du lịch thông minh bản địa Việt Nam.
Nguyên tắc hoạt động cốt lõi:
1. Luôn gợi ý lộ trình thực tế theo cung đường địa lý thuận tiện nhất, tránh đi vòng gây lãng phí thời gian di chuyển.
2. Tính toán thời lượng di chuyển và dừng chân hợp lý theo phương tiện (xe máy, ô tô, đi bộ).
3. Ưu tiên các địa điểm check-in, ẩm thực và văn hoá uy tín đã được cộng đồng WanderAI xác minh.
4. Minh bạch chi phí ước tính, phân bổ hạng mục ngân sách (Ăn uống, Di chuyển, Vé tham quan, Lưu trú).
5. Luôn kèm lời khuyên trang phục, thời tiết và khung giờ vàng săn ảnh cho từng điểm dừng.`,
  tone: 'friendly',
  hateSpeech: 'high',
  harassment: 'high',
  sexualContent: 'strict',
  dangerousContent: 'high',
  seasonMultiplier: 1.15
};

export const TONES = [
  { id: 'friendly', label: 'Thân thiện & Tinh tế', icon: 'Smile' },
  { id: 'inspiring', label: 'Truyền cảm hứng sống ảo', icon: 'Flame' },
  { id: 'local', label: 'Chuyên sâu bản địa (Local Expert)', icon: 'Compass' },
  { id: 'budget', label: 'Tối ưu ngân sách (Budget Friendly)', icon: 'Wallet' }
];

export const PROMPT_HISTORY = [
  {
    version: 'v3.8 (Hiện tại)',
    updatedAt: '2026-09-16 19:20:00',
    author: 'Quản trị viên Minh Quân',
    note: 'Tối ưu nguyên tắc di chuyển địa lý và quy chuẩn 5 hạng mục ngân sách.',
    prompt: DEFAULT_CONFIG.systemPrompt
  },
  {
    version: 'v3.7',
    updatedAt: '2026-09-10 14:15:30',
    author: 'AI Engineering Lead',
    note: 'Bổ sung hướng dẫn thời tiết và khung giờ vàng chụp ảnh.',
    prompt: `Bạn là WanderAI - Trợ lý du lịch thông minh bản địa.
1. Gợi ý lịch trình hợp lý theo địa lý bản đồ.
2. Tích hợp điểm check-in uy tín trên hệ thống WanderAI.
3. Ước tính chi phí chi tiết theo từng ngày.
4. Nêu rõ khung giờ lý tưởng để chụp ảnh đẹp.`
  },
  {
    version: 'v3.5',
    updatedAt: '2026-08-25 09:30:00',
    author: 'Hệ thống khởi tạo',
    note: 'Phiên bản cơ bản hỗ trợ hỏi đáp địa điểm du lịch.',
    prompt: `Bạn là trợ lý du lịch Việt Nam. Hãy trả lời thân thiện, gợi ý điểm tham quan, ẩm thực và khách sạn phù hợp với ngân sách của du khách.`
  }
];

export function validateConfig(config) {
  const errors = {};
  if (!MODELS.some(m => m.id === config.model)) {
    errors.model = 'Chọn một model trong danh sách hợp lệ.';
  }
  const ranges = {
    temperature: [0, 1],
    maxTokens: [128, 8192],
    topP: [0.05, 1],
    timeout: [1, 60],
    seasonMultiplier: [1, 3]
  };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (config[key] === '' || !Number.isFinite(Number(config[key])) || Number(config[key]) < min || Number(config[key]) > max) {
      errors[key] = `Nhập giá trị hợp lệ từ ${min} đến ${max}.`;
    }
  }
  if (!Number.isInteger(Number(config.maxTokens))) {
    errors.maxTokens = 'Số token tối đa phải là số nguyên.';
  }
  if (config.fallback && config.model === config.fallbackModel) {
    errors.fallbackModel = 'Model dự phòng phải khác model chính.';
  }
  if (typeof config.systemPrompt !== 'string' || !config.systemPrompt.trim()) {
    errors.systemPrompt = 'Nhập nội dung Master System Prompt.';
  } else if (config.systemPrompt.length > 5000) {
    errors.systemPrompt = 'Prompt không được vượt quá 5.000 ký tự.';
  }
  if (!TONES.some(t => t.id === config.tone)) {
    errors.tone = 'Chọn phong cách đàm thoại hợp lệ.';
  }
  for (const key of ['hateSpeech', 'harassment', 'sexualContent', 'dangerousContent']) {
    if (!['high', 'medium', 'strict'].includes(config[key])) {
      errors[key] = 'Chọn mức độ lọc an toàn hợp lệ.';
    }
  }
  return errors;
}

export function readDraft() {
  try {
    const stored = JSON.parse(localStorage.getItem(DRAFT_KEY) || sessionStorage.getItem(DRAFT_KEY) || 'null');
    if (!stored || typeof stored.config !== 'object') {
      return { config: { ...DEFAULT_CONFIG }, savedAt: null };
    }
    const config = Object.fromEntries(
      Object.keys(DEFAULT_CONFIG).map(key => [key, stored.config[key] ?? DEFAULT_CONFIG[key]])
    );
    if (Object.keys(validateConfig(config)).length || ['cache', 'fallback', 'grounding'].some(k => typeof config[k] !== 'boolean')) {
      return { config: { ...DEFAULT_CONFIG }, savedAt: null };
    }
    return { config, savedAt: typeof stored.savedAt === 'string' ? stored.savedAt : null };
  } catch {
    return { config: { ...DEFAULT_CONFIG }, savedAt: null };
  }
}

export const SAMPLE_PROMPT = 'Lên lịch trình 2N1Đ đi Ninh Bình cho 2 người, thích chụp ảnh sống ảo và ẩm thực dê núi';

export const PRESET_PROMPTS = [
  'Lên lịch trình 2N1Đ đi Ninh Bình cho 2 người, thích chụp ảnh sống ảo và ẩm thực dê núi',
  'Gợi ý lộ trình 3N2Đ Đà Nẵng - Hội An nghỉ dưỡng biển và ẩm thực miền Trung',
  'Lịch trình săn mây Đà Lạt 2N1Đ chi phí tiết kiệm cho nhóm bạn trẻ'
];

export const SAMPLE_ITINERARIES = {
  ninhBinh: {
    title: 'Lịch trình Ninh Bình 2N1Đ: Check-in Non Nước & Hương Vị Cố Đô',
    destination: 'Ninh Bình',
    duration: '2 ngày 1 đêm',
    estimatedBudgetPerPerson: 1450000,
    currency: 'VND',
    targetAudience: 'Cặp đôi / Bạn thân (2 người)',
    days: [
      {
        day: 1,
        title: 'Ngày 1: Hang Múa Săn Mây - Tràng An Thuyền Nan',
        activities: [
          { time: '08:30', title: 'Đỉnh Ngọa Long Hang Múa', note: 'Check-in view Tam Cốc 360 độ hùng vĩ giữa mây trời.' },
          { time: '12:00', title: 'Ăn trưa Dê Núi Chính Thư', note: 'Thịt dê tái chanh + Cơm cháy Ninh Bình giòn tan đậm vị.' },
          { time: '14:30', title: 'Tuyến thuyền 2 Tràng An', note: 'Thăm thủy đình, hang động tự nhiên và phim trường Kong Skull Island.' }
        ]
      },
      {
        day: 2,
        title: 'Ngày 2: Tuyệt Tình Cốc - Cố Đô Hoa Lư',
        activities: [
          { time: '07:30', title: 'Tuyệt Tình Cốc (Động Am Tiên)', note: 'Mặt hồ ngọc bích phẳng lặng, không gian thanh tịnh tuyệt đẹp.' },
          { time: '11:00', title: 'Cố đô Hoa Lư linh thiêng', note: 'Dâng hương Đền Vua Đinh - Vua Lê cổ kính rêu phong.' },
          { time: '14:00', title: 'Thưởng thức ốc núi & trở về', note: 'Mua đặc sản cơm cháy ruốc làm quà cho người thân.' }
        ]
      }
    ]
  },
  daNang: {
    title: 'Hành trình Đà Nẵng - Hội An 3N2Đ: Nắng Vàng Biển Xanh & Phố Hoài',
    destination: 'Đà Nẵng & Hội An',
    duration: '3 ngày 2 đêm',
    estimatedBudgetPerPerson: 2850000,
    currency: 'VND',
    targetAudience: 'Gia đình / Cặp đôi',
    days: [
      {
        day: 1,
        title: 'Ngày 1: Biển Mỹ Khê - Bán đảo Sơn Trà & Chùa Linh Ứng',
        activities: [
          { time: '09:00', title: 'Bán đảo Sơn Trà', note: 'Ngắm tượng Phật Bà 67m và toàn cảnh vịnh Đà Nẵng.' },
          { time: '12:30', title: 'Ăn trưa Bánh tráng cuốn thịt heo Đại Lộc', note: 'Đậm đà hương vị mắm nêm truyền thống xứ Quảng.' },
          { time: '16:00', title: 'Tắm biển Mỹ Khê', note: 'Top bãi biển quyến rũ nhất hành tinh.' }
        ]
      },
      {
        day: 2,
        title: 'Ngày 2: Phố Cổ Hội An lung linh đèn lồng',
        activities: [
          { time: '09:30', title: 'Chợ Hội An & Cơm gà Bà Buội', note: 'Thưởng thức cơm gà thơm lừng, thịt gà ta dai ngọt.' },
          { time: '15:00', title: 'Thả hoa đăng trên sông Hoài', note: 'Đi thuyền gỗ ngắm hoàng hôn và đèn lồng đa sắc.' }
        ]
      }
    ]
  }
};

export const STATUS = {
  success: { label: '200 OK', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  cached: { label: 'Cached', className: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  fallback: { label: 'GPT-4o Fallback', className: 'bg-amber-50 text-amber-800 ring-amber-600/20' },
  blocked: { label: 'Blocked', className: 'bg-rose-50 text-rose-700 ring-rose-600/20' }
};

export const SAMPLE_LOGS = [
  {
    id: 'REQ-8824',
    time: '14:32:08',
    minutesAgo: 2,
    task: 'Tạo lịch trình 3N2Đ Đà Nẵng',
    user: 'linh_hoang92',
    userType: 'User',
    avatarText: 'LH',
    avatarColor: 'bg-sky-600 text-white',
    model: 'Gemini 1.5 Pro',
    input: 142,
    output: 820,
    latency: 1.12,
    status: 'success',
    endpoint: '/api/v1/ai/generate-itinerary',
    safetyScore: '0.02 (Safe)',
    details: {
      promptTokens: 142,
      completionTokens: 820,
      totalTokens: 962,
      temperature: 0.4,
      costEstimate: '$0.0014',
      cacheHit: false,
      groundingEntities: ['Bán đảo Sơn Trà', 'Biển Mỹ Khê', 'Chùa Linh Ứng']
    }
  },
  {
    id: 'REQ-8823',
    time: '14:31:45',
    minutesAgo: 3,
    task: 'Gợi ý 5 quán cafe view đồi Đà Lạt',
    user: 'Guest_9918',
    userType: 'Guest',
    avatarText: '?',
    avatarColor: 'bg-slate-200 text-slate-600',
    model: 'Gemini 1.5 Pro',
    input: 88,
    output: 310,
    latency: 0.08,
    status: 'cached',
    endpoint: '/api/v1/ai/suggest-places',
    safetyScore: '0.00 (Safe)',
    details: {
      promptTokens: 88,
      completionTokens: 310,
      totalTokens: 398,
      temperature: 0.4,
      costEstimate: '$0.0000 (Redis Cache)',
      cacheHit: true,
      cacheSimilarity: '97.4%',
      groundingEntities: ['Tiệm Cafe Túi Mơ To', 'Cheo Veooo Cafe']
    }
  },
  {
    id: 'REQ-8822',
    time: '14:30:16',
    minutesAgo: 4,
    task: 'Tóm tắt 120 review Đảo Phú Quý',
    user: 'minh_nguyen',
    userType: 'User',
    avatarText: 'MN',
    avatarColor: 'bg-orange-500 text-white',
    model: 'GPT-4o-mini',
    input: 1250,
    output: 410,
    latency: 2.45,
    status: 'fallback',
    endpoint: '/api/v1/ai/summarize-reviews',
    safetyScore: '0.01 (Safe)',
    details: {
      promptTokens: 1250,
      completionTokens: 410,
      totalTokens: 1660,
      fallbackReason: 'Gemini 1.5 Pro primary timeout (> 3.5s limit)',
      costEstimate: '$0.0028',
      cacheHit: false
    }
  },
  {
    id: 'REQ-8821',
    time: '14:28:50',
    minutesAgo: 6,
    task: 'Prompt Injection / Vi phạm An Toàn',
    user: '14.241.xx.xx',
    userType: 'Blocked IP',
    avatarText: 'IP',
    avatarColor: 'bg-rose-600 text-white',
    model: 'Safety Shield',
    input: 45,
    output: 0,
    latency: 0.12,
    status: 'blocked',
    endpoint: '/api/v1/ai/chat',
    safetyScore: '0.94 (Violated: Jailbreak & Manipulation)',
    details: {
      promptTokens: 45,
      completionTokens: 0,
      totalTokens: 45,
      blockCategory: 'Jailbreak Pattern: System Prompt Override Attempt',
      actionTaken: 'Blocked at Gateway Layer'
    }
  },
  {
    id: 'REQ-8820',
    time: '13:12:20',
    minutesAgo: 82,
    task: 'Lên lịch trình cuối tuần Hà Giang',
    user: 'anh_tran',
    userType: 'User',
    avatarText: 'AT',
    avatarColor: 'bg-indigo-600 text-white',
    model: 'Gemini 1.5 Pro',
    input: 210,
    output: 960,
    latency: 1.48,
    status: 'success',
    endpoint: '/api/v1/ai/generate-itinerary',
    safetyScore: '0.01 (Safe)',
    details: {
      promptTokens: 210,
      completionTokens: 960,
      totalTokens: 1170,
      costEstimate: '$0.0017',
      cacheHit: false
    }
  },
  {
    id: 'REQ-8819',
    time: '12:40:11',
    minutesAgo: 114,
    task: 'Gợi ý địa điểm ăn uống Hội An',
    user: 'ha_pham',
    userType: 'User',
    avatarText: 'HP',
    avatarColor: 'bg-emerald-600 text-white',
    model: 'Gemini 1.5 Pro',
    input: 105,
    output: 480,
    latency: 0.09,
    status: 'cached',
    endpoint: '/api/v1/ai/suggest-places',
    safetyScore: '0.00 (Safe)',
    details: {
      promptTokens: 105,
      completionTokens: 480,
      totalTokens: 585,
      costEstimate: '$0.0000',
      cacheHit: true
    }
  },
  {
    id: 'REQ-8818',
    time: '11:18:04',
    minutesAgo: 196,
    task: 'Ước tính ngân sách chuyến đi Sa Pa',
    user: 'Guest_8102',
    userType: 'Guest',
    avatarText: '?',
    avatarColor: 'bg-slate-200 text-slate-600',
    model: 'GPT-4o-mini',
    input: 320,
    output: 640,
    latency: 2.80,
    status: 'fallback',
    endpoint: '/api/v1/ai/budget-calculator',
    safetyScore: '0.02 (Safe)',
    details: {
      promptTokens: 320,
      completionTokens: 640,
      totalTokens: 960,
      fallbackReason: 'Primary Model HTTP 429 Rate Limit',
      costEstimate: '$0.0019',
      cacheHit: false
    }
  },
  {
    id: 'REQ-8817',
    time: '09:05:32',
    minutesAgo: 328,
    task: 'Tạo lịch trình khám phá Cố Đô Huế',
    user: 'thao_le',
    userType: 'User',
    avatarText: 'TL',
    avatarColor: 'bg-purple-600 text-white',
    model: 'Gemini 1.5 Pro',
    input: 180,
    output: 780,
    latency: 1.23,
    status: 'success',
    endpoint: '/api/v1/ai/generate-itinerary',
    safetyScore: '0.01 (Safe)',
    details: {
      promptTokens: 180,
      completionTokens: 780,
      totalTokens: 960,
      costEstimate: '$0.0015',
      cacheHit: false
    }
  }
];

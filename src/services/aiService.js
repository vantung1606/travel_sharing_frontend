import { BASE_URL, getAuthHeader } from './api';

/**
 * WanderAI Core Service - Google Gemini Integration
 */
const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = import.meta.env?.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.5-flash';

export const aiService = {
  getApiKey() {
    try {
      const stored = JSON.parse(localStorage.getItem('wayfare_a06_ai_config_v2') || '{}');
      if (stored?.config?.apiKey && stored.config.apiKey !== 'AIzaSyDk9941_SecretKey_WanderAI_Production') {
        return stored.config.apiKey;
      }
    } catch {
      // ignore
    }
    return GEMINI_API_KEY;
  },

  getApiEndpoint() {
    try {
      const stored = JSON.parse(localStorage.getItem('wayfare_a06_ai_config_v2') || '{}');
      if (stored?.config?.apiEndpoint) {
        return stored.config.apiEndpoint.replace(/\/+$/, '');
      }
    } catch {
      // ignore
    }
    return GEMINI_API_URL.replace(/\/+$/, '');
  },

  /**
   * Ping & verify API key with Google Generative Language API
   */
  async testConnection(customKey, customEndpoint) {
    const key = customKey || this.getApiKey();
    const endpoint = (customEndpoint || this.getApiEndpoint()).replace(/\/+$/, '');
    const startTime = performance.now();
    try {
      const res = await fetch(`${endpoint}/models?key=${key}`);
      const latency = Math.round(performance.now() - startTime);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, latency, error: err.error?.message || `HTTP ${res.status}` };
      }
      const data = await res.json();
      return { ok: true, latency, modelsCount: data.models?.length || 0, activeModel: DEFAULT_MODEL };
    } catch (err) {
      return { ok: false, latency: Math.round(performance.now() - startTime), error: err.message };
    }
  },

  /**
   * Trực tiếp gọi Google Generative Language API từ Frontend với VITE_GEMINI_API_KEY
   */
  async executeGeminiDirect({ prompt, systemPrompt, model = DEFAULT_MODEL, temperature = 0.3, maxTokens = 8192, responseMimeType = 'application/json' }) {
    const key = this.getApiKey();
    if (!key) throw new Error('VITE_GEMINI_API_KEY chưa được cấu hình.');

    const endpoint = this.getApiEndpoint();
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: Number(temperature) || 0.3,
        maxOutputTokens: Number(maxTokens) || 8192,
        ...(responseMimeType ? { responseMimeType } : {})
      }
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const executeCall = async (modelName) => {
      const url = `${endpoint}/models/${modelName}:generateContent?key=${key}`;
      return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    };

    let res = await executeCall(model);
    if (res.status === 404 && model !== DEFAULT_MODEL) {
      console.warn(`[WanderAI] Model ${model} không khả dụng (404), tự động chuyển sang ${DEFAULT_MODEL}...`);
      res = await executeCall(DEFAULT_MODEL);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini API Error: ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },

  /**
   * Sinh nội dung AI: Ưu tiên dùng VITE_GEMINI_API_KEY của Frontend khi đã cấu hình trên Railway,
   * đồng thời hỗ trợ song song Backend AI Proxy (Secure).
   */
  async generateText({ prompt, systemPrompt, model = DEFAULT_MODEL, temperature = 0.3, maxTokens = 8192, responseMimeType = 'application/json' }) {
    let targetModel = model || DEFAULT_MODEL;
    if (!targetModel.startsWith('gemini-') || targetModel.includes('3.8')) {
      targetModel = DEFAULT_MODEL;
    }

    const clientKey = this.getApiKey();

    // 1. NẾU FRONTEND ĐÃ CÓ VITE_GEMINI_API_KEY (trên Railway Variables hoặc file .env):
    // Ưu tiên gọi thẳng Google Gemini 2.5 Flash để có tốc độ cao nhất và chính xác 100%
    if (clientKey) {
      try {
        console.info('[WanderAI] Kích hoạt gọi trực tiếp Google Gemini với VITE_GEMINI_API_KEY từ Frontend...');
        const directText = await this.executeGeminiDirect({
          prompt,
          systemPrompt,
          model: targetModel,
          temperature,
          maxTokens,
          responseMimeType
        });
        if (directText && directText.trim().length > 0) {
          return directText;
        }
      } catch (clientErr) {
        console.warn('[WanderAI] Gọi trực tiếp từ Client gặp lỗi, chuyển sang Backend Proxy:', clientErr.message);
      }
    }

    // 2. GỌI QUA BACKEND AI PROXY (Nếu Client chưa có key hoặc direct call gặp sự cố)
    try {
      const backendRes = await fetch(`${BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          prompt,
          systemPrompt,
          model: targetModel,
          temperature: Number(temperature) || 0.3,
          maxTokens: Number(maxTokens) || 8192,
          responseMimeType
        })
      });

      if (backendRes.status === 429) {
        const errData = await backendRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Hệ thống AI đang bận hoặc vượt quá giới hạn gọi (20 req/phút). Vui lòng thử lại sau giây lát!');
      }

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.success && data.data?.text) {
          // Nếu backend trả về kết quả live từ Gemini thật (không phải fallback), trả về ngay
          if (!data.data.model?.includes('fallback')) {
            return data.data.text;
          }
          // Nếu backend chỉ trả fallback (do chưa set GEMINI_API_KEY trên Railway Backend) mà Client có key:
          if (clientKey) {
            try {
              const retryDirect = await this.executeGeminiDirect({
                prompt,
                systemPrompt,
                model: targetModel,
                temperature,
                maxTokens,
                responseMimeType
              });
              if (retryDirect) return retryDirect;
            } catch (e) {
              console.warn('[WanderAI] Thử lại trực tiếp từ Client thất bại:', e.message);
            }
          }
          return data.data.text;
        }
      }
    } catch (proxyError) {
      if (proxyError.message?.includes('vượt quá giới hạn')) {
        throw proxyError;
      }
      console.warn('[WanderAI] Backend AI proxy request failed:', proxyError.message);
    }

    // 3. Fallback cuối cùng nếu cả 2 phương thức trên đều thất bại
    if (clientKey) {
      return await this.executeGeminiDirect({
        prompt,
        systemPrompt,
        model: targetModel,
        temperature,
        maxTokens,
        responseMimeType
      });
    }

    throw new Error('Tính năng AI hiện chưa khả dụng. Vui lòng cấu hình VITE_GEMINI_API_KEY hoặc thử lại sau!');
  }
};

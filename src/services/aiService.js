import { BASE_URL, getAuthHeader } from './api';

/**
 * WanderAI Core Service - Google Gemini Integration
 */
const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = import.meta.env?.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-3.8-flash';

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
   * Ask Gemini to generate content via Backend AI Proxy (Secure)
   */
  async generateText({ prompt, systemPrompt, model = DEFAULT_MODEL, temperature = 0.3, maxTokens = 8192, responseMimeType = 'application/json' }) {
    let targetModel = model || DEFAULT_MODEL;
    if (!targetModel.startsWith('gemini-') || targetModel === 'gemini-1.5-flash' || targetModel.includes('1.5-flash')) {
      targetModel = DEFAULT_MODEL;
    }

    // 1. ƯU TIÊN GỌI QUA BACKEND AI PROXY (Bảo mật tuyệt đối, không lộ API key ra client)
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
          return data.data.text;
        }
      }
    } catch (proxyError) {
      if (proxyError.message.includes('vượt quá giới hạn')) {
        throw proxyError;
      }
      console.warn('[WanderAI] Backend AI proxy request failed, checking client fallback:', proxyError.message);
    }

    // 2. Client Fallback: Chỉ dùng khi Admin nhập API Key trực tiếp trên giao diện Cấu hình AI
    const customKey = this.getApiKey();
    if (!customKey) {
      throw new Error('Tính năng AI hiện chưa khả dụng. Vui lòng thử lại sau hoặc liên hệ Quản trị viên!');
    }

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
      const url = `${endpoint}/models/${modelName}:generateContent?key=${customKey}`;
      return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    };

    let res = await executeCall(targetModel);
    if (res.status === 404 && targetModel !== DEFAULT_MODEL) {
      console.warn(`[WanderAI] Model ${targetModel} không khả dụng (404), tự động chuyển sang ${DEFAULT_MODEL}...`);
      res = await executeCall(DEFAULT_MODEL);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini API Error: ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
};

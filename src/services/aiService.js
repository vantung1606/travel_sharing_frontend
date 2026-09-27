/**
 * WanderAI Core Service - Google Gemini Integration
 */
const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = import.meta.env?.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-3.6-flash';

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
   * Ask Gemini to generate content
   */
  async generateText({ prompt, systemPrompt, model = DEFAULT_MODEL, temperature = 0.4, maxTokens = 2048 }) {
    const key = this.getApiKey();
    const endpoint = this.getApiEndpoint();
    const targetModel = model.includes('gemini') ? model : DEFAULT_MODEL;
    const url = `${endpoint}/models/${targetModel}:generateContent?key=${key}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: Number(temperature) || 0.4,
        maxOutputTokens: Number(maxTokens) || 2048
      }
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini API Error: ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
};

import { BASE_URL, getAuthHeader } from './api';

const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * WanderAI Core Service - 100% Tập trung bảo mật tại Backend Proxy
 * Toàn bộ khóa bảo mật Google Gemini API được lưu trữ độc quyền trên máy chủ Backend.
 */
export const aiService = {
  /**
   * Yêu cầu AI sinh nội dung thông qua Backend AI Proxy bảo mật
   */
  async generateText({
    prompt,
    systemPrompt,
    model = DEFAULT_MODEL,
    temperature = 0.3,
    maxTokens = 8192,
    responseMimeType = 'application/json'
  }) {
    let targetModel = model || DEFAULT_MODEL;
    if (!targetModel.startsWith('gemini-') || targetModel.includes('3.8')) {
      targetModel = DEFAULT_MODEL;
    }

    try {
      const res = await fetch(`${BASE_URL}/ai/generate`, {
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

      if (res.status === 429) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Hệ thống AI đang bận hoặc vượt quá giới hạn gọi (20 req/phút). Vui lòng thử lại sau giây lát!');
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Lỗi máy chủ AI (${res.status}). Vui lòng kiểm tra lại cấu hình GEMINI_API_KEY trên Backend.`);
      }

      const data = await res.json();
      if (!data.success || !data.data?.text) {
        throw new Error(data.message || 'Máy chủ AI không trả về dữ liệu hợp lệ.');
      }

      return data.data.text;
    } catch (err) {
      console.error('[WanderAI] Backend AI generate error:', err);
      throw err;
    }
  }
};

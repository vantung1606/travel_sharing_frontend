/**
 * Utility Service lấy thời tiết thời gian thực từ Open-Meteo API
 * Hoàn toàn miễn phí, hỗ trợ toàn cầu theo tọa độ GPS, không cần API Key
 */

const weatherCache = new Map();

// Ánh xạ mã thời tiết WMO (World Meteorological Organization)
export const parseWeatherCode = (code) => {
  if (code === 0) return { label: 'Trời quang, nắng đẹp', icon: '☀️', vibe: 'Rất lý tưởng chụp ảnh & ngắm cảnh' };
  if (code === 1 || code === 2) return { label: 'Nắng nhẹ, có mây', icon: '🌤️', vibe: 'Thời tiết mát mẻ, dễ chịu' };
  if (code === 3) return { label: 'Mây rải rác', icon: '⛅', vibe: 'Thích hợp dạo bộ & dã ngoại' };
  if (code === 45 || code === 48) return { label: 'Sương mù lãng đãng', icon: '🌫️', vibe: 'Khung giờ vàng săn mây' };
  if ([51, 53, 55, 61].includes(code)) return { label: 'Mưa phùn nhỏ', icon: '🌦️', vibe: 'Nên mang theo ô nhỏ' };
  if ([63, 65, 80, 81, 82].includes(code)) return { label: 'Mưa rào', icon: '🌧️', vibe: 'Nên ghé quán cafe trú mưa' };
  if ([95, 96, 99].includes(code)) return { label: 'Dông sét', icon: '⛈️', vibe: 'Hạn chế hoạt động ngoài trời' };
  return { label: 'Thời tiết êm dịu', icon: '🌤️', vibe: 'Phù hợp du lịch' };
};

// Gợi ý thời tiết theo địa danh / vùng miền nếu chưa có tọa độ GPS
export const getEstimatedWeatherByCity = (cityName = '') => {
  // (giữ lại cho các trang cũ chưa sửa — trang Khám phá đã thay hết bằng thời tiết THẬT)
  const c = String(cityName).toLowerCase();
  if (c.includes('đà lạt') || c.includes('lâm đồng') || c.includes('măng đen')) {
    return { temp: 18, label: 'Se lạnh, sương mai', icon: '🌫️', humidity: 85, vibe: 'Lý tưởng săn mây & thưởng trà' };
  }
  if (c.includes('sa pa') || c.includes('sapa') || c.includes('hà giang') || c.includes('fansipan') || c.includes('mẫu sơn')) {
    return { temp: 16, label: 'Lạnh sương mù', icon: '⛅', humidity: 82, vibe: 'Không khí trong lành, view đèo đẹp' };
  }
  if (c.includes('phú quốc') || c.includes('nha trang') || c.includes('mũi né') || c.includes('quy nhơn') || c.includes('vũng tàu')) {
    return { temp: 29, label: 'Nắng ấm biển êm', icon: '☀️', humidity: 72, vibe: 'Tuyệt hảo để tắm biển & lặn ngắm san hô' };
  }
  if (c.includes('đà nẵng') || c.includes('hội an') || c.includes('huế')) {
    return { temp: 26, label: 'Nắng dịu gió thoảng', icon: '🌤️', humidity: 75, vibe: 'Rất hợp tản bộ phố cổ & ngắm cầu' };
  }
  if (c.includes('hà nội') || c.includes('ninh bình') || c.includes('hạ long')) {
    return { temp: 24, label: 'Mát mẻ, thu êm', icon: '⛅', humidity: 70, vibe: 'Thích hợp khám phá danh thắng' };
  }
  return { temp: 25, label: 'Mát mẻ, dễ chịu', icon: '🌤️', humidity: 75, vibe: 'Thích hợp tham quan' };
};

// Gọi Live Weather API từ Open-Meteo theo vĩ độ/kinh độ
export const fetchLiveWeather = async (lat, lng) => {
  if (!lat || !lng) return null;
  const key = `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;

  // Kiểm tra cache (15 phút)
  if (weatherCache.has(key)) {
    const cached = weatherCache.get(key);
    if (Date.now() - cached.timestamp < 15 * 60 * 1000) {
      return cached.data;
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const cur = data.current;
    if (!cur) return null;

    const parsed = parseWeatherCode(cur.weather_code);
    const result = {
      temp: Math.round(cur.temperature_2m),
      humidity: cur.relative_humidity_2m,
      windSpeed: cur.wind_speed_10m,
      label: parsed.label,
      icon: parsed.icon,
      vibe: parsed.vibe,
      updatedAt: cur.time
    };

    weatherCache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } catch {
    return null;
  }
};

/**
 * Lấy thời tiết THẬT cho NHIỀU điểm trong MỘT request.
 * Open-Meteo hỗ trợ list tọa độ: ?latitude=a,b,c&longitude=x,y,z -> trả về mảng
 * kết quả đúng theo thứ tự đầu vào. Trả về { "lat,lng": result }.
 */
export const fetchLiveWeatherBatch = async (points = []) => {
  const clean = (points || [])
    .filter(p => p && p.lat != null && p.lng != null)
    .map(p => ({
      key: `${Number(p.lat).toFixed(2)},${Number(p.lng).toFixed(2)}`,
      lat: Number(p.lat).toFixed(2),
      lng: Number(p.lng).toFixed(2)
    }));

  const results = {};
  const now = Date.now();
  const missing = [];
  clean.forEach(p => {
    if (results[p.key]) return;
    const cached = weatherCache.get(p.key);
    if (cached && now - cached.timestamp < 15 * 60 * 1000) {
      results[p.key] = cached.data;
    } else {
      missing.push(p);
    }
  });
  if (!missing.length) return results;

  try {
    const lat = missing.map(m => m.lat).join(',');
    const lng = missing.map(m => m.lng).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [data];

    list.forEach((entry, i) => {
      const cur = entry && entry.current;
      const p = missing[i];
      if (!cur || !p) return;
      const parsed = parseWeatherCode(cur.weather_code);
      const result = {
        temp: Math.round(cur.temperature_2m),
        humidity: cur.relative_humidity_2m,
        label: parsed.label,
        icon: parsed.icon,
        vibe: parsed.vibe,
        updatedAt: cur.time
      };
      weatherCache.set(p.key, { data: result, timestamp: now });
      results[p.key] = result;
    });
  } catch {}
  return results;
};

// Xử lý ảnh địa điểm dùng chung cho web (bản JS thuần, đối ứng với
// travel_mobile/src/utils/placeImages.ts — giữ 2 bên đồng bộ logic).
import { PLACE_IMAGE_POOL, SHARED_PLACEHOLDER_IMAGE } from './placeImagePool';

/**
 * Nhiều URL ảnh trong CSDL bị lỗi mã hoá: dấu '%' bị ghi thành '\%'
 * (ví dụ ".../Hoang\%20Lien.jpg") khiến ảnh trả về 404.
 * Sửa ngay phía client nên ảnh hiện được mà không cần đụng tới CSDL.
 */
export function fixImageUrl(url) {
  if (!url) return undefined;
  const trimmed = String(url).trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\\%/g, '%');
}

/**
 * Băm id thành chỉ số ổn định (Knuth multiplicative hashing) để hai địa điểm
 * nằm liền nhau không bao giờ rơi vào cùng một ảnh.
 */
function poolIndex(id, length) {
  const mixed = Math.imul(Number(id) || 0, 2654435761) >>> 0;
  return mixed % length;
}

/** Ảnh thật dự phòng ổn định cho một id (dùng khi ảnh gốc lỗi/trùng). */
export function pickFallbackImage(id) {
  if (!PLACE_IMAGE_POOL.length) return SHARED_PLACEHOLDER_IMAGE;
  return PLACE_IMAGE_POOL[poolIndex(id, PLACE_IMAGE_POOL.length)];
}

/**
 * Chọn ảnh hiển thị cho một địa điểm:
 * 1. Ưu tiên ảnh riêng của địa điểm (sau khi sửa lỗi mã hoá '%').
 * 2. Ảnh dùng chung (464 địa điểm CSDL đang share 1 ảnh Unsplash) hoặc
 *    thiếu ảnh -> thay bằng ảnh thật khác từ kho (không bao giờ lưới trùng 1 ảnh).
 */
export function resolvePlaceImage(place) {
  if (!place) return SHARED_PLACEHOLDER_IMAGE;

  const shared = fixImageUrl(place.coverImageUrl ?? place.coverImage ?? place.image);
  if (shared && shared !== SHARED_PLACEHOLDER_IMAGE) return shared;

  return pickFallbackImage(place.id ?? place.rawId ?? 0);
}

// Re-export để các component import 1 nguồn duy nhất
export { PLACE_IMAGE_POOL, SHARED_PLACEHOLDER_IMAGE };

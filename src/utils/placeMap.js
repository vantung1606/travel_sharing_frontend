import { fixImageUrl, PLACE_IMAGE_POOL, resolvePlaceImage, SHARED_PLACEHOLDER_IMAGE } from './placeImages';

const FAKE_FALLBACK_SET = new Set([SHARED_PLACEHOLDER_IMAGE, ...(PLACE_IMAGE_POOL || [])]);

function extractRealImages(p) {
  const seen = new Set();
  const list = [];
  const pushIfReal = (raw) => {
    const fixed = fixImageUrl(raw);
    if (!fixed) return;
    if (FAKE_FALLBACK_SET.has(fixed)) return;
    if (seen.has(fixed)) return;
    seen.add(fixed);
    list.push(fixed);
  };
  if (Array.isArray(p?.images)) {
    p.images.forEach(pushIfReal);
  }
  pushIfReal(p?.coverImageUrl ?? p?.coverImage);
  return list;
}

/**
 * Chuyển 1 địa điểm thô từ API /places sang item thống nhất dùng xuyên suốt
 * (Explore card, trang chi tiết /places/:id, wishlist). Văn bản map thủ công
 * từng chỗ gây lệch trường — giờ là nguồn sự thật duy nhất cho phía web.
 */
export function mapApiSpot(p) {
  if (!p || p.id == null) return null;
  const realImages = extractRealImages(p);
  return {
    id: `spot-${p.id}`,
    rawId: p.id,
    isLocalSpot: true,
    name: p.name,
    category: p.categoryName || 'Tọa độ bản địa',
    city: p.city || 'Việt Nam',
    address: p.address,
    image: resolvePlaceImage(p),
    images: realImages,
    realImages,
    latitude: p.latitude,
    longitude: p.longitude,
    rating: p.averageRating ? Number(p.averageRating).toFixed(1) : null,
    reviewsCount: p.reviewCount || 0,
    phoneNumber: p.phoneNumber,
    openHours: p.openHours || null,
    priceEstimate: p.priceRange || (p.ticketPrice ? `${Number(p.ticketPrice).toLocaleString()}đ` : 'Miễn phí'),
    ticketPrice: p.ticketPrice,
    amenities: p.amenities ? p.amenities.split(',').map(s => s.trim()) : [],
    isVerifiedHost: p.isVerifiedHost,
    ownerName: p.ownerName,
    ownerHandle: p.ownerHandle,
    ownerAvatar: p.ownerAvatar,
    tagline: p.description || 'Tọa độ check-in & trải nghiệm do người dùng và cơ sở bản địa chia sẻ.',
    description: p.description || '',
    isFeatured: Boolean(p.isFeatured),
    featuredOrder: p.featuredOrder != null ? Number(p.featuredOrder) : 0,
    featuredBadge: p.featuredBadge || '',
  };
}

import { resolvePlaceImage } from './placeImages';

/**
 * Chuyển 1 địa điểm thô từ API /places sang item thống nhất dùng xuyên suốt
 * (Explore card, trang chi tiết /places/:id, wishlist). Văn bản map thủ công
 * từng chỗ gây lệch trường — giờ là nguồn sự thật duy nhất cho phía web.
 */
export function mapApiSpot(p) {
  if (!p || p.id == null) return null;
  return {
    id: `spot-${p.id}`,
    rawId: p.id,
    isLocalSpot: true,
    name: p.name,
    category: p.categoryName || 'Tọa độ bản địa',
    city: p.city || 'Việt Nam',
    address: p.address,
    image: resolvePlaceImage(p),
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (resolvePlaceImage(p) ? [resolvePlaceImage(p)] : []),
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
  };
}

import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Bookmark, CalendarDays, Check, Compass, Copy, Heart, MapPin, Search } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/common/Toast';
import { itineraryApi, normalizeMediaUrl, placeApi, postApi } from '../../../services/api';
import './HomePage.css';

const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value));
const excerpt = (text, length = 160) => {
  const plain = String(text || '').replace(/<[^>]*>/g, '').trim();
  return plain.length > length ? plain.slice(0, length).trimEnd() + '…' : plain;
};
const postImage = post => post.images?.[0] || post.imageUrl || post.placeCoverImageUrl || post.sharedPost?.images?.[0];

function Photo({ src, alt, className = '', eager = false }) {
  const [failedSrc, setFailedSrc] = useState(null);
  return src && failedSrc !== src
    ? <img src={normalizeMediaUrl(src)} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} fetchpriority={eager ? 'high' : 'auto'} onError={() => setFailedSrc(src)} />
    : <div role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={!alt || undefined} className={`home-photo-placeholder ${className}`}><Compass aria-hidden="true" /></div>;
}

function SectionTitle({ number, eyebrow, title, description, to, link }) {
  return <div className="home-section-heading">
    <div><p className="home-kicker"><span>{number}</span>{eyebrow}</p><h2>{title}</h2>{description && <p className="home-section-description">{description}</p>}</div>
    <Link to={to} className="home-text-link">{link}<ArrowUpRight size={18} aria-hidden="true" /></Link>
  </div>;
}

function EmptyContent({ loading, onRetry }) {
  return <div className={`home-empty ${loading ? 'home-loading' : ''}`} role="status">
    <Compass size={24} aria-hidden="true" /><p>{loading ? 'Đang tìm cảm hứng cho chuyến đi của bạn…' : 'Chưa có nội dung để hiển thị lúc này.'}</p>
    {!loading && <button className="home-text-link" onClick={onRetry}>Tải lại<ArrowRight size={16} /></button>}
  </div>;
}

export const HomePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoggedIn, currentUser, setIsAuthModalOpen, openAIGeneratorWithItem } = useApp();
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [stories, setStories] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [copied, setCopied] = useState({});
  const [pending, setPending] = useState({});
  const busy = useRef(new Set());

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const loadPlaces = async () => {
      const featured = await placeApi.getFeaturedPlaces();
      if (featured.length) return featured;
      return (await placeApi.getPlacesPaged({ page: 0, size: 32, status: 'ACTIVE' }))?.items || [];
    };
    Promise.allSettled([loadPlaces(), postApi.getPosts({ email: currentUser?.email || '' }), itineraryApi.getAllItineraries()]).then(([placeResult, postResult, tripResult]) => {
      if (!alive) return;
      const livePlaces = placeResult.status === 'fulfilled' && Array.isArray(placeResult.value) ? placeResult.value.filter(p => p.id && p.status === 'ACTIVE') : [];
      // Give different cities a place on the page, while retaining the server order within each city.
      const cities = new Set();
      const diverse = livePlaces.filter(place => { const key = place.city || place.id; if (cities.has(key)) return false; cities.add(key); return true; });
      setPlaces([...diverse, ...livePlaces.filter(place => !diverse.includes(place))].slice(0, 4));
      setStories(postResult.status === 'fulfilled' && Array.isArray(postResult.value) ? postResult.value.filter(p => p.id && p.visibility === 'PUBLIC' && p.status === 'ACTIVE').sort((a, b) => Number(b.likeCount || 0) - Number(a.likeCount || 0)).slice(0, 3) : []);
      setJourneys(tripResult.status === 'fulfilled' && Array.isArray(tripResult.value) ? tripResult.value.filter(t => t.id && t.isPublic === true).slice(0, 3) : []);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [retry, currentUser?.email]);

  const requireAuth = () => {
    if (isLoggedIn) return true;
    toast.info('Đăng nhập để lưu những trải nghiệm và lịch trình của riêng bạn.');
    setIsAuthModalOpen(true);
    return false;
  };
  const planTrip = () => {
    if (requireAuth()) openAIGeneratorWithItem(query.trim() ? { name: query.trim() } : null);
  };
  const interact = async (post, action) => {
    if (!requireAuth()) return;
    const key = `${action}-${post.id}`;
    if (busy.current.has(key)) return;
    busy.current.add(key); setPending(prev => ({ ...prev, [key]: true }));
    try {
      const result = action === 'like' ? await postApi.toggleLike(post.id, currentUser.email) : await postApi.toggleBookmark(post.id, currentUser.email);
      setStories(prev => prev.map(item => item.id !== post.id ? item : action === 'like'
        ? { ...item, isLiked: result.isLiked, likeCount: result.likeCount }
        : { ...item, isBookmarked: result.isBookmarked }));
      if (action === 'save') toast.success(result.isBookmarked ? 'Đã lưu bài viết.' : 'Đã bỏ lưu bài viết.');
    } catch { toast.error('Chưa lưu được thay đổi. Vui lòng thử lại.'); }
    finally { busy.current.delete(key); setPending(prev => ({ ...prev, [key]: false })); }
  };
  const copyJourney = async trip => {
    if (!requireAuth() || copied[trip.id] || busy.current.has(`trip-${trip.id}`)) return;
    if (Number(trip.creatorId) === Number(currentUser.id)) { toast.info('Lịch trình này đã nằm trong bộ sưu tập của bạn.'); return; }
    if (!window.confirm(`Sao chép lịch trình “${trip.title}” vào bộ sưu tập của bạn?`)) return;
    const key = `trip-${trip.id}`;
    busy.current.add(key); setPending(prev => ({ ...prev, [key]: true }));
    try { await itineraryApi.cloneItinerary(trip.id, currentUser.email); setCopied(prev => ({ ...prev, [trip.id]: true })); toast.success('Đã sao chép lịch trình vào bộ sưu tập của bạn.'); }
    catch { toast.error('Chưa sao chép được lịch trình. Vui lòng thử lại.'); }
    finally { busy.current.delete(key); setPending(prev => ({ ...prev, [key]: false })); }
  };
  const submitSearch = event => {
    event.preventDefault();
    navigate(query.trim() ? `/explore?keyword=${encodeURIComponent(query.trim())}` : '/explore');
  };

  return <div className="home-journal">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-container home-hero-grid">
        <div className="home-hero-copy">
          <p className="home-kicker home-hero-kicker"><span className="home-kicker-line" />VIỆT NAM, THEO CÁCH CỦA BẠN</p>
          <h1 id="home-title">Đi để có<br /><em>chuyện kể.</em></h1>
          <p className="home-hero-description">Một cung đường chưa đi. Một món ngon chưa thử.<br className="hidden sm:block" /> Một phiên bản khác của chính mình.</p>
          <div className="home-hero-actions"><a href="#diem-den" className="home-button home-button-primary">Tìm nơi muốn đến<ArrowUpRight size={20} /></a><button className="home-hero-plan" onClick={planTrip}>Lên lịch trình riêng<ArrowRight size={18} /></button></div>
          <a href="#diem-den" className="home-scroll-cue"><span>CUỘN XUỐNG, MỞ RA MỘT CHUYẾN ĐI</span><ArrowDown size={18} aria-hidden="true" /></a>
        </div>
        <figure className="home-hero-photo">
          <img src="/images/hero/ninh-binh.jpg" alt="Núi đá vôi soi bóng xuống mặt nước yên bình ở Ninh Bình" fetchpriority="high" />
          <span className="home-photo-edition">THE WAYFARE JOURNAL / VIETNAM</span>
          <figcaption><div><span className="home-photo-label">MỘT CHÚT CẢM HỨNG</span><p>Chậm một nhịp.<br />Thấy nhiều hơn.</p></div><span className="home-photo-location"><MapPin size={14} />Ninh Bình, Việt Nam</span></figcaption>
        </figure>
      </div>
    </section>

    <div className="home-container home-search-wrap">
      <form onSubmit={submitSearch} className="home-search" role="search" aria-label="Tìm điểm đến">
        <div className="home-search-intro"><Compass size={25} /><div><span>ĐI ĐÂU TIẾP?</span><p>Bắt đầu từ một nơi bạn thích.</p></div></div>
        <div className="home-search-input"><MapPin size={20} aria-hidden="true" /><label className="sr-only" htmlFor="home-destination">Điểm đến hoặc địa điểm</label><input id="home-destination" value={query} onChange={event => setQuery(event.target.value)} placeholder="Bạn đang nghĩ về nơi nào?" autoComplete="off" /></div>
        <button type="submit" className="home-button home-button-dark"><Search size={18} />Khám phá</button>
      </form>
    </div>

    <section id="diem-den" className="home-container home-section" aria-labelledby="places-title">
      <SectionTitle number="01" eyebrow="ĐIỂM ĐẾN" title={<span id="places-title">Có những nơi,<br />chỉ muốn xách ba lô lên.</span>} description="Ghé một nơi mới, hoặc tìm một góc khác ở nơi đã quen." to="/explore" link="Mở bản đồ khám phá" />
      {places.length ? <div className="home-place-grid">{places.map((place, index) => <Link className="home-place" to={`/places/${place.id}`} key={place.id}>
        <div className="home-place-photo"><Photo src={place.coverImageUrl || place.images?.[0]} alt={place.name} /><span className="home-place-number">0{index + 1}</span><span className="home-place-arrow"><ArrowUpRight size={22} /></span>{place.city && <span className="home-place-city"><MapPin size={13} />{place.city}</span>}</div>
        <div className="home-place-caption"><div><span className="home-small-label">{place.categoryName || 'Khám phá địa phương'}</span><h3>{place.name}</h3></div>{Number(place.reviewCount) > 0 && <span className="home-rating">★ {Number(place.averageRating).toFixed(1)}<small>{place.reviewCount} đánh giá</small></span>}</div>
      </Link>)}</div> : <EmptyContent loading={loading} onRetry={() => setRetry(value => value + 1)} />}
    </section>

    <section className="home-stories-section" aria-labelledby="stories-title"><div className="home-container home-section">
      <SectionTitle number="02" eyebrow="NHỮNG NGƯỜI ĐÃ ĐI" title={<span id="stories-title">Đi một chuyến.<br />Mang về cả một câu chuyện.</span>} description="Kinh nghiệm, khoảnh khắc và những điều nhỏ đáng nhớ từ cộng đồng Wayfare." to="/community" link="Ghé cộng đồng" />
      {stories.length ? <div className="home-story-grid">{stories.map((post, index) => <article className={`home-story ${index === 0 ? 'home-story-lead' : ''}`} key={post.id}>
        <Link to={`/community?postId=${post.id}`} className="home-story-photo" aria-label={`Đọc ${post.title}`}><Photo src={postImage(post)} alt={post.title} /><span className="home-story-category">{post.category || 'Chuyện trên đường'}</span></Link>
        <div className="home-story-body"><div className="home-story-author">{post.authorAvatar ? <Photo src={post.authorAvatar} alt="" className="home-author-avatar" /> : <span className="home-author-initial">{(post.authorName || 'W').charAt(0)}</span>}<span>{post.authorName || 'Thành viên Wayfare'}</span>{post.locationTag && <span className="home-author-location">· {post.locationTag}</span>}</div>
          <Link to={`/community?postId=${post.id}`}><h3>{post.title}</h3></Link><p className="home-story-excerpt">{excerpt(post.content, index === 0 ? 180 : 105)}</p>
          <div className="home-story-footer"><Link to={`/community?postId=${post.id}`} className="home-text-link">Đọc câu chuyện<ArrowUpRight size={16} /></Link><div className="home-story-tools"><button aria-label={post.isLiked ? 'Bỏ thích bài viết' : 'Thích bài viết'} aria-pressed={!!post.isLiked} disabled={pending[`like-${post.id}`]} onClick={() => interact(post, 'like')}><Heart size={17} fill={post.isLiked ? 'currentColor' : 'none'} /><span>{post.likeCount || 0}</span></button><button aria-label={post.isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'} aria-pressed={!!post.isBookmarked} disabled={pending[`save-${post.id}`]} onClick={() => interact(post, 'save')}><Bookmark size={17} fill={post.isBookmarked ? 'currentColor' : 'none'} /></button></div></div>
        </div>
      </article>)}</div> : <EmptyContent loading={loading} onRetry={() => setRetry(value => value + 1)} />}
    </div></section>

    <section className="home-container home-section" aria-labelledby="journeys-title">
      <SectionTitle number="03" eyebrow="TỪ CẢM HỨNG ĐẾN LỊCH TRÌNH" title={<span id="journeys-title">Một khởi đầu hay.<br />Phần còn lại là của bạn.</span>} description="Tham khảo hành trình được chia sẻ, lưu lại và điều chỉnh theo nhịp đi của mình." to="/itineraries" link="Bộ sưu tập lịch trình" />
      {journeys.length ? <div className="home-journey-grid">{journeys.map((trip, index) => <article className="home-journey" key={trip.id}>
        <div className="home-journey-top"><span className="home-small-label">{trip.destination || 'Hành trình khám phá'}</span><span className="home-journey-number">0{index + 1}</span></div>
        <Link to={`/itineraries?id=${trip.id}`}><h3>{trip.title}</h3></Link><p className="home-journey-author">Chia sẻ bởi {trip.creatorName || 'thành viên Wayfare'}</p>
        <div className="home-journey-meta">{trip.durationDays > 0 && <span><CalendarDays size={16} />{trip.durationDays} ngày</span>}{Number(trip.budgetTotal) > 0 && <span>Dự toán {money(trip.budgetTotal)}</span>}</div>
        <div className="home-journey-footer"><Link className="home-text-link" to={`/itineraries?id=${trip.id}`}>Xem hành trình<ArrowUpRight size={17} /></Link><button aria-label={`Sao chép ${trip.title}`} className="home-copy-button" disabled={pending[`trip-${trip.id}`] || copied[trip.id]} onClick={() => copyJourney(trip)}>{copied[trip.id] ? <Check size={17} /> : <Copy size={17} />}{copied[trip.id] ? 'Đã lưu' : pending[`trip-${trip.id}`] ? 'Đang lưu…' : 'Sao chép'}</button></div>
      </article>)}</div> : <EmptyContent loading={loading} onRetry={() => setRetry(value => value + 1)} />}
    </section>

    <section className="home-finale"><div className="home-container home-finale-inner"><div><p className="home-kicker">CHUYẾN ĐI TIẾP THEO</p><h2>Đừng chỉ lưu cảm hứng.<br /><em>Hãy đi thôi.</em></h2><p>Chọn nơi muốn đến. Wayfare cùng bạn sắp xếp phần còn lại.</p></div><button className="home-finale-button" onClick={planTrip} aria-label="Bắt đầu lên lịch trình"><ArrowUpRight aria-hidden="true" /><span>Lên lịch trình<br />của tôi</span></button></div></section>
  </div>;
};

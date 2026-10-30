import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, MapPin, ImageIcon, Video, Upload, Loader2, Send, ShieldCheck, Sparkles, Lock, Globe, Flame, Compass, CheckCircle2 } from 'lucide-react';
import { postApi, uploadApi, placeApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { CustomSelect } from '../common/CustomSelect';
import { RichTextToolbar } from './RichTextToolbar';

export const EditPostModal = ({ post, onClose, onPostUpdated }) => {
  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || '');
  const [category, setCategory] = useState(post.category || 'Ẩm thực & Check-in');
  const [visibility, setVisibility] = useState(post.visibility || 'PUBLIC');
  const [images, setImages] = useState(post.images || []);
  const [videoUrl, setVideoUrl] = useState(post.videoUrl || '');
  const [placeId, setPlaceId] = useState(post.placeId ? String(post.placeId) : (post.locationTag && post.locationTag !== 'Việt Nam' ? `custom:${post.locationTag}` : ''));
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    placeApi.getPlaces({ status: 'ACTIVE' })
      .then(data => setPlaces(Array.isArray(data) ? data : []))
      .catch(err => console.warn('Could not load places:', err));
  }, []);

  const selectedPlace = useMemo(() => {
    if (!placeId) return null;
    if (typeof placeId === 'string' && placeId.startsWith('custom:')) {
      return {
        id: null,
        name: placeId.replace('custom:', '').trim(),
        isCustom: true,
        address: 'Địa điểm mới do bạn đề xuất',
        city: 'Chờ duyệt',
        coverImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      };
    }
    return places.find(p => String(p.id) === String(placeId));
  }, [placeId, places]);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [moderationStep, setModerationStep] = useState(0);

  const fileInputRef = useRef(null);
  const editTextareaRef = useRef(null);
  const toast = useToast();

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadedUrls = await uploadApi.uploadFiles(files);
      if (uploadedUrls && uploadedUrls.length > 0) {
        const newImages = [...images];
        uploadedUrls.forEach(url => {
          if (url.match(/\.(mp4|webm|mov|mkv)$/i)) {
            setVideoUrl(url);
          } else {
            newImages.push(url);
          }
        });
        setImages(newImages);
        toast.showSuccess(`Đã tải lên ${uploadedUrls.length} tệp thành công! 📸`);
      }
    } catch (err) {
      toast.showError('Tải tệp lên thất bại: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.showWarning('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }

    try {
      setSubmitting(true);
      setModerationStep(1);

      await new Promise(r => setTimeout(r, 550));
      setModerationStep(2);

      await new Promise(r => setTimeout(r, 550));
      setModerationStep(3);

      const isCustomPlace = typeof placeId === 'string' && placeId.startsWith('custom:');
      const customPlaceName = isCustomPlace ? placeId.replace('custom:', '').trim() : '';
      const computedLocationTag = isCustomPlace
        ? customPlaceName
        : (selectedPlace ? (selectedPlace.city ? `${selectedPlace.name}, ${selectedPlace.city}` : selectedPlace.name) : (post.locationTag || 'Việt Nam'));

      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        locationTag: computedLocationTag,
        visibility,
        images,
        videoUrl: videoUrl || null,
        placeId: isCustomPlace || !placeId ? (post.placeId ? 0 : null) : Number(placeId)
      };

      const updated = await postApi.update(post.id, payload);

      if (updated.status === 'PENDING_REVIEW') {
        toast.showWarning('Bài viết đã chỉnh sửa và chuyển vào hàng đợi CHỜ ADMIN DUYỆT THỦ CÔNG do AI phát hiện cảnh báo! 🛡️');
      } else {
        toast.showSuccess('Đã cập nhật bài viết thành công và AI đã phê duyệt! 🎉');
      }

      if (typeof onPostUpdated === 'function') {
        onPostUpdated(updated);
      }
      onClose();
    } catch (err) {
      toast.showError('Không thể lưu chỉnh sửa bài viết: ' + err.message);
    } finally {
      setSubmitting(false);
      setModerationStep(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200 relative">
        
        {/* AI Moderation Overlay */}
        {submitting && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl ocean-gradient text-white flex items-center justify-center shadow-lg shadow-sky-500/25 animate-pulse">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-spin" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="font-extrabold text-sm text-slate-900">
                {moderationStep === 1
                  ? 'Đang tái thẩm định ngữ cảnh an toàn du lịch...'
                  : moderationStep === 2
                  ? 'Đang rà soát quy tắc cộng đồng & PCCC...'
                  : 'Đang chấm điểm WanderAI Safety Shield...'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống AI đang kiểm duyệt lại toàn bộ nội dung chỉnh sửa để đảm bảo không vi phạm quy định cộng đồng.
              </p>
            </div>
            <div className="w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-sky-500 to-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${(moderationStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>Chỉnh sửa bài viết</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">
                Có AI Duyệt lại
              </span>
            </h3>
            <p className="text-xs text-slate-500">Cập nhật nội dung, ảnh minh họa hoặc quyền riêng tư</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Visibility Selector */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-700">Quyền riêng tư:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  visibility === 'PUBLIC'
                    ? 'bg-clay-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Công khai</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  visibility === 'PRIVATE'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Chỉ mình tôi</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bài viết *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-semibold"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề bài viết *</label>
            <CustomSelect
              value={category}
              onChange={setCategory}
              size="sm"
              buttonClassName="bg-slate-50 border-slate-200 py-2.5 rounded-xl font-semibold text-xs"
              options={[
                { value: 'Ẩm thực & Check-in', label: 'Ẩm thực & Check-in', icon: MapPin },
                { value: 'Phượt & Khám phá', label: 'Phượt & Khám phá', icon: Flame },
                { value: 'Biển đảo & Nghỉ dưỡng', label: 'Biển đảo & Nghỉ dưỡng', icon: Sparkles },
                { value: 'Văn hóa & Lịch sử', label: 'Văn hóa & Lịch sử', icon: Compass }
              ]}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chia sẻ *</label>
            <textarea
              ref={editTextareaRef}
              rows={4}
              value={content}
              placeholder="Chia sẻ trải nghiệm, kinh nghiệm du lịch hoặc cảm nghĩ của bạn... (Gõ @ để gắn thẻ bạn bè)"
              onChange={e => setContent(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-clay-500/20 focus:border-clay-600 transition-all resize-none leading-relaxed"
              required
            />
          </div>

          {/* ATTACH CHECK-IN PLACE SELECTOR */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-clay-600" />
                <span>Vị trí check-in địa điểm</span>
              </label>
              {placeId && (
                <button
                  type="button"
                  onClick={() => setPlaceId('')}
                  className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Bỏ check-in
                </button>
              )}
            </div>

            <CustomSelect
              value={placeId}
              onChange={setPlaceId}
              placeholder="-- Chọn địa điểm du lịch muốn check-in --"
              searchable={true}
              allowCustom={true}
              searchPlaceholder="Tìm kiếm địa điểm hoặc gõ tên điểm mới để đề xuất..."
              clearable={true}
              onClear={() => setPlaceId('')}
              buttonClassName="bg-white border-slate-200 hover:border-clay-600/50 py-2.5 rounded-xl text-xs font-semibold"
              options={[
                {
                  value: '',
                  label: '-- Không check-in địa điểm cụ thể --',
                  description: 'Bài viết không gắn vị trí địa điểm'
                },
                ...places.map(p => ({
                  value: String(p.id),
                  label: p.name,
                  description: `${p.city || ''} • ${p.categoryName || 'Địa điểm'} • ⭐ ${p.averageRating ? Number(p.averageRating).toFixed(1) : '5.0'}`,
                  image: p.coverImageUrl,
                  badge: p.city || 'Việt Nam'
                }))
              ]}
            />

            {selectedPlace && (
              <div className={`p-3 rounded-xl border flex items-center gap-3 mt-2 shadow-2xs ${
                selectedPlace.isCustom
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}>
                <img
                  src={selectedPlace.coverImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                  alt={selectedPlace.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h5 className="font-bold text-xs text-slate-900 truncate">
                      {selectedPlace.name}
                    </h5>
                    {selectedPlace.isCustom && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-extrabold border border-amber-300">
                        Điểm mới đề xuất
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] font-semibold truncate ${
                    selectedPlace.isCustom ? 'text-amber-800' : 'text-clay-700'
                  }`}>
                    📍 {selectedPlace.address || selectedPlace.city}
                  </p>
                </div>
                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${
                  selectedPlace.isCustom ? 'text-amber-600' : 'text-clay-600'
                }`} />
              </div>
            )}
          </div>

          {/* Media Section: Cloudinary Upload */}
          <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>Ảnh & Video đính kèm ({images.length} ảnh{videoUrl ? ', 1 video' : ''})</span>
              </label>
              {(images.length > 0 || videoUrl) && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3 h-3" />
                  <span>Thêm tệp</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Upload Status Banner */}
            {uploading && (
              <div className="flex items-center gap-2.5 px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-700 font-semibold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
                <span>Đang tải và tối ưu ảnh / video qua Cloudinary CDN...</span>
              </div>
            )}

            {/* Empty State: Dropzone button */}
            {images.length === 0 && !videoUrl && !uploading && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/40 rounded-xl p-4 text-center cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-sky-100/70 group-hover:bg-sky-100 text-sky-600 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-sky-700">
                  Tải ảnh hoặc video thước phim từ thiết bị
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hỗ trợ tải nhiều ảnh (JPG, PNG, WEBP) và video (MP4, MOV) • Lưu trên Cloudinary
                </p>
              </div>
            )}

            {/* Thumbnails grid */}
            {(images.length > 0 || videoUrl) && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white shadow-2xs">
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-sky-600/90 backdrop-blur-xs text-white text-[9px] font-extrabold shadow-xs">
                        Ảnh bìa
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer shadow-xs"
                      title="Xóa ảnh"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {videoUrl && (
                  <div className="relative group rounded-xl overflow-hidden aspect-square border border-sky-300 bg-slate-900 flex flex-col items-center justify-center text-white shadow-2xs">
                    <Video className="w-6 h-6 text-sky-400 mb-1" />
                    <span className="text-[9px] font-bold text-slate-300 bg-slate-800/80 px-1 rounded">Video</span>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer shadow-xs"
                      title="Xóa video"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="ocean-gradient text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải tệp...</span>
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu & Duyệt AI...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


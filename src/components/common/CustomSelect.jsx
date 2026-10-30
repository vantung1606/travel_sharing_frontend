import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X, Plus } from 'lucide-react';

/**
 * Reusable Modern Custom Select Dropdown
 * Replaces native HTML <select> with a polished, accessible, and theme-consistent dropdown.
 */
export const CustomSelect = ({
  value,
  onChange,
  options = [], // [{ value, label, icon, badge, description, image, disabled }]
  placeholder = 'Chọn tùy chọn...',
  disabled = false,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...',
  size = 'md', // 'sm' | 'md'
  icon: LeadingIcon = null,
  clearable = false,
  onClear = null,
  allowCustom = false,
  customPrefix = 'custom:',
  onSelectCustom = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input and ensure visibility on open
  useEffect(() => {
    if (isOpen) {
      if (searchable && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isCustomValue = typeof value === 'string' && value.startsWith(customPrefix);
  const customLabel = isCustomValue ? value.slice(customPrefix.length) : null;

  const selectedOption = isCustomValue
    ? {
        value,
        label: `📍 ${customLabel} (Vị trí tự do)`,
        badge: 'Tùy chỉnh'
      }
    : options.find(opt => String(opt.value) === String(value));

  const normalizeText = (str) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd');

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter(opt => {
        const query = searchQuery.toLowerCase().trim();
        const qNorm = normalizeText(query);
        const label = (opt.label || '').toLowerCase();
        const desc = (opt.description || '').toLowerCase();
        const badge = (opt.badge || '').toLowerCase();
        return (
          label.includes(query) ||
          desc.includes(query) ||
          badge.includes(query) ||
          normalizeText(label).includes(qNorm) ||
          normalizeText(desc).includes(qNorm) ||
          normalizeText(badge).includes(qNorm)
        );
      })
    : options;

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-xs'
    : 'px-3.5 py-2.5 text-xs sm:text-sm';

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-2 rounded-sm border transition-all cursor-pointer ${sizeClasses} ${
          disabled
            ? 'bg-[#F3EDE2] border-[#1E1A15]/10 text-[#8A7F70] cursor-not-allowed'
            : isOpen
            ? 'bg-[#FFFDF8] border-clay-600 ring-2 ring-clay-500/20 shadow-xs text-[#1E1A15]'
            : 'bg-[#FFFDF8] border-[#1E1A15]/15 hover:border-clay-600/50 text-[#1E1A15] shadow-2xs hover:shadow-xs'
        } ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {LeadingIcon && (
            <LeadingIcon className={`shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-clay-600`} />
          )}

          {selectedOption?.image && (
            <img
              src={selectedOption.image}
              alt=""
              className="w-5 h-5 rounded-sm object-cover shrink-0 border border-[#1E1A15]/10"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80';
              }}
            />
          )}

          {selectedOption?.icon && !LeadingIcon && (
            <selectedOption.icon className={`shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-clay-600`} />
          )}

          <span className={`truncate font-semibold ${!selectedOption ? 'text-[#8A7F70]' : 'text-[#1E1A15]'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.badge && (
            <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded-sm bg-[#F3EDE2] text-clay-800 font-extrabold border border-[#1E1A15]/10">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-sm text-[#8A7F70] hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Xóa lựa chọn"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#8A7F70] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-clay-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Floating Options Dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-1.5 z-50 bg-[#FFFDF8] rounded-sm border border-[#1E1A15]/15 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 ${dropdownClassName}`}
          style={{ minWidth: '100%' }}
        >
          {/* Optional Search bar */}
          {searchable && (
            <div className="p-2 border-b border-[#1E1A15]/10 bg-[#FAF6EE]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8A7F70] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#1E1A15]/15 rounded-sm text-[#1E1A15] placeholder-[#8A7F70] outline-hidden focus:outline-hidden focus:border-clay-600 focus:ring-1 focus:ring-clay-500/20 font-medium"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 custom-dropdown-scroll">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-5 text-center text-xs text-[#8A7F70]">
                Không tìm thấy tùy chọn phù hợp
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const IconComponent = opt.icon;

                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => handleSelect(opt)}
                    className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-sm text-xs transition-colors cursor-pointer ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#F3EDE2] text-clay-800 font-extrabold border-l-2 border-clay-600'
                        : 'text-[#3B332A] hover:bg-[#FAF6EE] hover:text-[#1E1A15] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {opt.image && (
                        <img
                          src={opt.image}
                          alt=""
                          className="w-7 h-7 rounded-sm object-cover shrink-0 border border-[#1E1A15]/10 shadow-2xs"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                      )}

                      {IconComponent && (
                        <div className={`p-1.5 rounded-sm shrink-0 ${isSelected ? 'bg-clay-100 text-clay-700' : 'bg-[#F3EDE2] text-[#6B6154]'}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{opt.label}</span>
                          {opt.badge && (
                            <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded-sm bg-[#F3EDE2] text-[#5A5146] font-bold border border-[#1E1A15]/10">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <p className="text-[11px] text-[#8A7F70] truncate font-normal mt-0.5">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-clay-600 shrink-0" />
                    )}
                  </div>
                );
              })
            )}

            {/* Custom check-in location option when allowCustom is active */}
            {allowCustom && searchQuery.trim().length > 1 && (
              <div
                onClick={() => {
                  const customVal = `${customPrefix}${searchQuery.trim()}`;
                  if (onSelectCustom) {
                    onSelectCustom(searchQuery.trim());
                  } else {
                    onChange(customVal);
                  }
                  setIsOpen(false);
                }}
                className="mt-1.5 p-2 rounded-sm border border-dashed border-[#1E1A15]/20 bg-[#FAF6EE] hover:bg-[#F3EDE2] text-[#1E1A15] flex items-center justify-between gap-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-sm bg-clay-600 text-white flex items-center justify-center shrink-0">
                    <Plus className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold truncate">
                      Gắn vị trí check-in tự do: <span className="underline font-extrabold text-clay-700">"{searchQuery.trim()}"</span>
                    </p>
                    <p className="text-[10.5px] text-[#8A7F70]">
                      Lưu làm nhãn vị trí check-in riêng cho bài viết này
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-[#F3EDE2] text-clay-800 border border-clay-300/60 shrink-0">
                  Gắn vị trí
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

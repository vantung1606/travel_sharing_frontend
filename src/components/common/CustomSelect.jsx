import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

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
  onClear = null
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

  const selectedOption = options.find(
    opt => String(opt.value) === String(value)
  );

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter(opt => {
        const query = searchQuery.toLowerCase();
        const label = (opt.label || '').toLowerCase();
        const desc = (opt.description || '').toLowerCase();
        return label.includes(query) || desc.includes(query);
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
        className={`w-full flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${sizeClasses} ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-sky-500 ring-3 ring-sky-500/15 shadow-sm text-slate-800'
            : 'bg-white border-slate-200 hover:border-sky-300 text-slate-800 shadow-2xs hover:shadow-xs'
        } ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {LeadingIcon && (
            <LeadingIcon className={`shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-sky-600`} />
          )}

          {selectedOption?.image && (
            <img
              src={selectedOption.image}
              alt=""
              className="w-5 h-5 rounded-lg object-cover shrink-0 border border-slate-200"
            />
          )}

          {selectedOption?.icon && !LeadingIcon && (
            <selectedOption.icon className={`shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-sky-600`} />
          )}

          <span className={`truncate font-medium ${!selectedOption ? 'text-slate-400' : 'text-slate-800'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.badge && (
            <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded-md bg-sky-50 text-sky-700 font-bold border border-sky-100">
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
              className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title="Xóa lựa chọn"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-sky-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Floating Options Dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 ${dropdownClassName}`}
          style={{ minWidth: '100%' }}
        >
          {/* Optional Search bar */}
          {searchable && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 custom-dropdown-scroll">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-5 text-center text-xs text-slate-400">
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
                    className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-sky-50/80 text-sky-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {opt.image && (
                        <img
                          src={opt.image}
                          alt=""
                          className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-200 shadow-2xs"
                        />
                      )}

                      {IconComponent && (
                        <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{opt.label}</span>
                          {opt.badge && (
                            <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-bold">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <p className="text-[11px] text-slate-400 truncate font-normal mt-0.5">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-sky-600 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

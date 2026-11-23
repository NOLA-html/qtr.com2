import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, Eye, Cpu, Boxes, HardDrive, Zap, Database, Fan, Server, BatteryCharging, Wind, Layers } from 'lucide-react';

interface ProductImageWithPreviewProps {
  src: string;
  alt: string;
  name: string;
  category?: string;
  specs?: Record<string, string>;
  className?: string;
  thumbnailClassName?: string;
}

export const ProductImageWithPreview: React.FC<ProductImageWithPreviewProps> = ({
  src,
  alt,
  name,
  category,
  specs,
  className = '',
  thumbnailClassName = 'w-12 h-12 object-contain rounded-md'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (window.innerWidth < 1024) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const placeAbove = rect.bottom + 260 > window.innerHeight;
      setCoords({
        top: placeAbove ? Math.max(10, rect.top - 260) : rect.bottom + 8,
        left: Math.min(window.innerWidth - 280, Math.max(16, rect.left - 100)),
        placeAbove
      });
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
    setIsHovered(false);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const getCategoryIcon = (cat?: string) => {
    const iconCls = 'w-5 h-5 text-slate-400';
    switch (cat?.toLowerCase()) {
      case 'cpu':
        return <Cpu className={iconCls} />;
      case 'motherboard':
        return <Boxes className={iconCls} />;
      case 'ram':
        return <HardDrive className={iconCls} />;
      case 'gpu':
        return <Zap className={iconCls} />;
      case 'storage':
        return <Database className={iconCls} />;
      case 'cooler':
        return <Fan className={iconCls} />;
      case 'case':
        return <Server className={iconCls} />;
      case 'psu':
        return <BatteryCharging className={iconCls} />;
      case 'fans':
        return <Wind className={iconCls} />;
      case 'os':
        return <Layers className={iconCls} />;
      default:
        return <Cpu className={iconCls} />;
    }
  };

  const isGenericOrMissing = !src || src.trim() === '' || src.includes('images.unsplash.com');
  const showFallback = imageError || isGenericOrMissing;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`relative group/img cursor-zoom-in inline-block shrink-0 ${className}`}
        title={`Click or tap to inspect ${name}`}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className={`${thumbnailClassName} transition-transform duration-200 group-hover/img:scale-105 bg-white border border-slate-200`}
            loading="lazy"
          />
        ) : (
          <div className={`${thumbnailClassName} bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-1 text-center`}>
            {getCategoryIcon(category)}
            <span className="text-[7.5px] font-semibold text-slate-400 mt-0.5 uppercase tracking-tight">
              No image
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-navy/10 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-md flex items-center justify-center pointer-events-none">
          <ZoomIn className="w-3.5 h-3.5 text-navy drop-shadow" />
        </div>
      </div>

      {isHovered && coords && typeof document !== 'undefined' && createPortal(
        <div
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[100] w-64 bg-white border border-slate-200 text-navy rounded-md shadow-xl p-3 pointer-events-none transition-all"
        >
          <div className="w-full h-44 bg-slate-50 rounded border border-slate-200 overflow-hidden flex items-center justify-center mb-2.5">
            {!showFallback ? (
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain p-2 bg-white"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5">
                <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center">
                  {getCategoryIcon(category)}
                </div>
                <span className="text-[11px] font-semibold text-slate-600">Image unavailable</span>
                <span className="text-[9.5px] text-slate-500 leading-tight">
                  Awaiting verified Centre Com product photo
                </span>
              </div>
            )}
          </div>
          <div className="text-[12.5px] font-bold text-navy truncate">{name}</div>
          {category && (
            <div className="text-[10px] uppercase font-semibold text-brand-blue tracking-wider mt-0.5">
              {category}
            </div>
          )}
          {specs && Object.keys(specs).length > 0 && (
            <div className="text-[10.5px] text-slate-600 mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5">
              {Object.entries(specs).slice(0, 2).map(([k, v]) => (
                <div key={k} className="truncate">
                  <span className="text-slate-400">{k}:</span> {v}
                </div>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}

      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-[120] bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 text-navy rounded-md max-w-lg w-full p-6 shadow-2xl space-y-4 relative overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-md transition-colors z-10"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full h-64 sm:h-72 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center p-4 overflow-hidden">
              {!showFallback ? (
                <img
                  src={src}
                  alt={alt}
                  className="max-h-full max-w-full object-contain bg-white"
                />
              ) : (
                <div className="text-center space-y-2 p-4">
                  <div className="w-14 h-14 rounded-md bg-white border border-slate-200 flex items-center justify-center mx-auto">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="text-[13.5px] font-bold text-navy">Genuine Centre Com Image Unavailable</div>
                  <p className="text-[12px] text-slate-600 max-w-xs mx-auto">
                    Awaiting verified Centre Com product photography asset. Placeholder and AI-generated images are excluded.
                  </p>
                </div>
              )}
            </div>

            <div>
              {category && (
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-blue">
                  {category}
                </span>
              )}
              <h3 className="font-heading text-[18px] font-bold text-navy mt-0.5">{name}</h3>
            </div>

            {specs && Object.keys(specs).length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-[12px] border-t border-slate-200 pt-3">
                {Object.entries(specs).slice(0, 6).map(([k, v]) => (
                  <div key={k} className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">{k}</span>
                    <span className="text-navy font-medium truncate block">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-md font-semibold text-[13px] bg-navy hover:bg-navy-800 text-white transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

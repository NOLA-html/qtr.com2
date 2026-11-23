import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  Scale,
  ArrowUpDown,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { BuilderPart } from '../data/builderCatalog.ts';
import { formatAud } from '../utils/pricing.ts';
import { ProductImageWithPreview } from './ProductImageWithPreview.tsx';

interface ComponentComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: BuilderPart[];
  category: BuilderPart['category'];
  onRemovePart: (id: string) => void;
  onClearAll: () => void;
  onSelectForBuild: (part: BuilderPart) => void;
  activeBuild: Partial<Record<BuilderPart['category'], BuilderPart>>;
  selectedPlatform: 'AMD' | 'Intel';
}

export const ComponentComparisonModal: React.FC<ComponentComparisonModalProps> = ({
  isOpen,
  onClose,
  parts,
  category,
  onRemovePart,
  onClearAll,
  onSelectForBuild,
  activeBuild,
  selectedPlatform
}) => {
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');

  // Sorted list of parts
  const sortedParts = useMemo(() => {
    const list = [...parts];
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [parts, sortBy]);

  // Lowest price in selection
  const minPrice = useMemo(() => {
    if (parts.length === 0) return 0;
    return Math.min(...parts.map((p) => p.price));
  }, [parts]);

  // Gather all unique spec keys across compared parts
  const allSpecKeys = useMemo(() => {
    const keysSet = new Set<string>();
    parts.forEach((p) => {
      Object.keys(p.specs).forEach((k) => keysSet.add(k));
    });
    return Array.from(keysSet);
  }, [parts]);

  // Check if a spec value differs among compared items
  const isSpecDifferent = (key: string) => {
    if (parts.length < 2) return false;
    const firstVal = parts[0]?.specs[key] || '';
    return parts.some((p) => (p.specs[key] || '') !== firstVal);
  };

  // Check compatibility of a specific part with current active build
  const getCompatibilityStatus = (part: BuilderPart): { isCompatible: boolean; message: string } => {
    const activeCpu = activeBuild.cpu;
    const activeMobo = activeBuild.motherboard;
    const activeRam = activeBuild.ram;
    const activeGpu = activeBuild.gpu;
    const activeCase = activeBuild.case;
    const activePsu = activeBuild.psu;

    if (part.category === 'cpu') {
      if (part.platform !== 'Both' && part.platform !== selectedPlatform) {
        return {
          isCompatible: false,
          message: `Incompatible with active ${selectedPlatform} platform.`
        };
      }
      if (activeMobo && part.socket && activeMobo.socket && part.socket !== activeMobo.socket) {
        return {
          isCompatible: false,
          message: `Socket mismatch: ${part.socket} vs Motherboard ${activeMobo.socket}.`
        };
      }
    }

    if (part.category === 'motherboard') {
      if (part.platform !== 'Both' && part.platform !== selectedPlatform) {
        return {
          isCompatible: false,
          message: `Incompatible with ${selectedPlatform} socket.`
        };
      }
      if (activeCpu && part.socket && activeCpu.socket && part.socket !== activeCpu.socket) {
        return {
          isCompatible: false,
          message: `Socket mismatch: ${part.socket} vs CPU ${activeCpu.socket}.`
        };
      }
      if (activeRam && part.ramType && activeRam.ramType && part.ramType !== activeRam.ramType) {
        return {
          isCompatible: false,
          message: `Memory generation mismatch: ${part.ramType} vs RAM ${activeRam.ramType}.`
        };
      }
      if (activeCase && part.formFactor && activeCase.supportedFormFactors) {
        if (!activeCase.supportedFormFactors.includes(part.formFactor)) {
          return {
            isCompatible: false,
            message: `${part.formFactor} does not fit in ${activeCase.name}.`
          };
        }
      }
    }

    if (part.category === 'ram') {
      if (activeMobo && part.ramType && activeMobo.ramType && part.ramType !== activeMobo.ramType) {
        return {
          isCompatible: false,
          message: `DDR generation mismatch: ${part.ramType} vs Motherboard ${activeMobo.ramType}.`
        };
      }
    }

    if (part.category === 'gpu') {
      if (activeCase && part.gpuLengthMm && activeCase.maxGpuLengthMm) {
        if (part.gpuLengthMm > activeCase.maxGpuLengthMm) {
          return {
            isCompatible: false,
            message: `Length (${part.gpuLengthMm}mm) exceeds case limit (${activeCase.maxGpuLengthMm}mm).`
          };
        }
      }
    }

    if (part.category === 'case') {
      if (activeMobo && activeMobo.formFactor && part.supportedFormFactors) {
        if (!part.supportedFormFactors.includes(activeMobo.formFactor)) {
          return {
            isCompatible: false,
            message: `Case does not support ${activeMobo.formFactor} motherboards.`
          };
        }
      }
      if (activeGpu && activeGpu.gpuLengthMm && part.maxGpuLengthMm) {
        if (activeGpu.gpuLengthMm > part.maxGpuLengthMm) {
          return {
            isCompatible: false,
            message: `GPU length (${activeGpu.gpuLengthMm}mm) exceeds case clearance (${part.maxGpuLengthMm}mm).`
          };
        }
      }
    }

    return {
      isCompatible: true,
      message: 'Verified compatible with current build.'
    };
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-6xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {category.toUpperCase()} COMPARISON
                </span>
                <span className="text-xs text-slate-400">
                  ({parts.length} {parts.length === 1 ? 'product' : 'products'})
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Side-by-Side Hardware Comparison
              </h2>
            </div>
          </div>

          {/* Controls: Highlight Differences, Sort, Clear, Close */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Differences Toggle */}
            <button
              type="button"
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                highlightDifferences
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{highlightDifferences ? 'Differences Highlighted' : 'Highlight Differences'}</span>
            </button>

            {/* Price Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="default">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {/* Clear All */}
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-700 hover:border-rose-900 transition-colors"
            >
              Clear
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 space-y-6">
          {sortedParts.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No components selected for comparison</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select 2 or more products from the same hardware category using the "+ Compare" button on component cards.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                Back to Component Selection
              </button>
            </div>
          ) : (
            <div className="min-w-[640px]">
              {/* Product Top Cards Grid */}
              <div
                className="grid gap-4 pb-6 border-b border-slate-800"
                style={{
                  gridTemplateColumns: `repeat(${sortedParts.length}, minmax(220px, 1fr))`
                }}
              >
                {sortedParts.map((part) => {
                  const isCurrentInBuild = activeBuild[part.category]?.id === part.id;
                  const priceDiff = part.price - minPrice;
                  const compat = getCompatibilityStatus(part);

                  return (
                    <div
                      key={part.id}
                      className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 relative group"
                    >
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onRemovePart(part.id)}
                        className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Product Image */}
                      <div className="w-full h-36 bg-slate-900 rounded-xl flex items-center justify-center p-2 border border-slate-800/80">
                        <ProductImageWithPreview
                          src={part.image}
                          alt={part.name}
                          name={part.name}
                          category={part.category}
                          specs={part.specs}
                          thumbnailClassName="w-28 h-28 object-contain"
                        />
                      </div>

                      {/* Brand & Name */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                          {part.brand}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                          {part.name}
                        </h4>
                      </div>

                      {/* Price & Price Delta */}
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-400">Price:</span>
                          <span className="text-lg font-black font-mono text-white">
                            {formatAud(part.price)}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-right">
                          {priceDiff === 0 ? (
                            <span className="text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded">
                              ★ Lowest in Comparison
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              +{formatAud(priceDiff)} vs lowest
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Compatibility Badge */}
                      <div
                        className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                          compat.isCompatible
                            ? 'bg-emerald-950/40 border border-emerald-900/60 text-emerald-300'
                            : 'bg-rose-950/40 border border-rose-900/60 text-rose-300'
                        }`}
                      >
                        {compat.isCompatible ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-[11px] leading-tight font-medium">
                          {compat.message}
                        </span>
                      </div>

                      {/* Add to Build / Current Status */}
                      <div>
                        {isCurrentInBuild ? (
                          <div className="w-full py-2.5 px-3 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30">
                            <Check className="w-4 h-4 text-amber-400" />
                            <span>Currently in Build</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectForBuild(part);
                              onClose();
                            }}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                              compat.isCompatible
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            <span>{compat.isCompatible ? 'Select for Build' : 'Select Anyway'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Specifications Matrix Table */}
              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Detailed Specification Comparison</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {allSpecKeys.length} verified specifications
                  </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80">
                  {/* Common Power & Thermal Specs Row */}
                  <div
                    className="grid items-center text-xs p-3.5 hover:bg-slate-900/50 transition-colors"
                    style={{
                      gridTemplateColumns: `repeat(${sortedParts.length}, minmax(220px, 1fr))`
                    }}
                  >
                    {sortedParts.map((part) => (
                      <div key={part.id} className="pr-4">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                          TDP / Power Draw
                        </span>
                        <span className="font-mono font-bold text-white">
                          {part.wattage > 0 ? `${part.wattage} Watts` : 'Minimal (Passive)'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Individual Spec Keys */}
                  {allSpecKeys.map((key) => {
                    const isDiff = isSpecDifferent(key);
                    const shouldHighlight = highlightDifferences && isDiff;

                    return (
                      <div
                        key={key}
                        className={`grid items-center text-xs p-3.5 transition-colors ${
                          shouldHighlight
                            ? 'bg-amber-500/10 border-l-4 border-l-amber-500 hover:bg-amber-500/15'
                            : 'hover:bg-slate-900/50'
                        }`}
                        style={{
                          gridTemplateColumns: `repeat(${sortedParts.length}, minmax(220px, 1fr))`
                        }}
                      >
                        {sortedParts.map((part) => {
                          const val = part.specs[key] || '—';
                          return (
                            <div key={part.id} className="pr-4">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                                {key}
                              </span>
                              <span
                                className={`font-medium block truncate ${
                                  shouldHighlight ? 'text-amber-300 font-bold' : 'text-slate-200'
                                }`}
                              >
                                {val}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Specifications verified against official manufacturer documentation in AUD pricing.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors"
          >
            Done Comparing
          </button>
        </div>
      </div>
    </div>
  );
};

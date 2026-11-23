import React, { useState } from 'react';
import { ShieldCheck, X, Check, PackageCheck, AlertCircle, ExternalLink, Wrench } from 'lucide-react';
import { BuilderPart } from '../data/builderCatalog.ts';

export interface CustomerSuppliedPartData {
  category: BuilderPart['category'];
  brand: string;
  model: string;
  url?: string;
  specsSummary?: string;
  socket?: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851';
  ramType?: 'DDR4' | 'DDR5';
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
  gpuLengthMm?: number;
  wattage?: number;
  conditionNotes?: string;
}

interface CustomerSuppliedPartModalProps {
  isOpen: boolean;
  category: BuilderPart['category'];
  categoryLabel: string;
  initialData?: CustomerSuppliedPartData | null;
  onConfirm: (data: CustomerSuppliedPartData) => void;
  onCancel: () => void;
}

export const CustomerSuppliedPartModal: React.FC<CustomerSuppliedPartModalProps> = ({
  isOpen,
  category,
  categoryLabel,
  initialData,
  onConfirm,
  onCancel
}) => {
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [socket, setSocket] = useState<'AM4' | 'AM5' | 'LGA1700' | 'LGA1851' | undefined>(initialData?.socket);
  const [ramType, setRamType] = useState<'DDR4' | 'DDR5' | undefined>(initialData?.ramType);
  const [formFactor, setFormFactor] = useState<'ATX' | 'Micro-ATX' | 'Mini-ITX' | undefined>(initialData?.formFactor);
  const [gpuLengthMm, setGpuLengthMm] = useState<number | undefined>(initialData?.gpuLengthMm);
  const [wattage, setWattage] = useState<number | undefined>(initialData?.wattage);
  const [conditionNotes, setConditionNotes] = useState(initialData?.conditionNotes || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) {
      setError('Please provide the component brand/manufacturer.');
      return;
    }
    if (!model.trim()) {
      setError('Please provide the exact model name or part number.');
      return;
    }

    onConfirm({
      category,
      brand: brand.trim(),
      model: model.trim(),
      url: url.trim() || undefined,
      socket,
      ramType,
      formFactor,
      gpuLengthMm,
      wattage,
      conditionNotes: conditionNotes.trim() || undefined,
      specsSummary: `${brand.trim()} ${model.trim()}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                Customer-Supplied Component
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Supply Your Own {categoryLabel}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Wrench className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>$0.00 purchase charge</strong> will be applied for this component. You supply the physical part before assembly begins. We inspect and test it prior to installation.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brand / Manufacturer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Corsair, ASUS, AMD"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Exact Model Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Ryzen 7 7800X3D"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Compatibility Fields based on category */}
          {(category === 'cpu' || category === 'motherboard') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Socket Compatibility
              </label>
              <select
                value={socket || ''}
                onChange={(e) => setSocket((e.target.value as any) || undefined)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="">Select socket (Optional but recommended for compatibility check)</option>
                <option value="AM5">AMD AM5 (Ryzen 7000 / 9000)</option>
                <option value="AM4">AMD AM4 (Ryzen 5000 / 3000)</option>
                <option value="LGA1700">Intel LGA1700 (12th / 13th / 14th Gen)</option>
                <option value="LGA1851">Intel LGA1851 (Core Ultra)</option>
              </select>
            </div>
          )}

          {(category === 'ram' || category === 'motherboard') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Memory Generation (RAM Type)
              </label>
              <select
                value={ramType || ''}
                onChange={(e) => setRamType((e.target.value as any) || undefined)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="">Select memory standard</option>
                <option value="DDR5">DDR5</option>
                <option value="DDR4">DDR4</option>
              </select>
            </div>
          )}

          {category === 'motherboard' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motherboard Form Factor
              </label>
              <select
                value={formFactor || ''}
                onChange={(e) => setFormFactor((e.target.value as any) || undefined)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="">Select form factor</option>
                <option value="ATX">Standard ATX</option>
                <option value="Micro-ATX">Micro-ATX</option>
                <option value="Mini-ITX">Mini-ITX</option>
              </select>
            </div>
          )}

          {category === 'gpu' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Card Length (mm, optional)
              </label>
              <input
                type="number"
                value={gpuLengthMm || ''}
                onChange={(e) => setGpuLengthMm(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 305"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          {category === 'psu' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Wattage (W, optional)
              </label>
              <input
                type="number"
                value={wattage || ''}
                onChange={(e) => setWattage(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 850"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Link or Spec Sheet (Optional)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://manufacturer.com/product-page"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Condition &amp; Details Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="e.g. Brand new sealed with manufacturer warranty receipt, or previously used in good working order."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Confirm Customer Supplied</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

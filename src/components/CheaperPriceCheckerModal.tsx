import React, { useState } from 'react';
import {
  Tag,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Check,
  Send,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { BuilderPart, getPartPriceAudit } from '../data/builderCatalog.ts';
import { formatAud } from '../utils/pricing.ts';

interface CheaperPriceCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedParts: Partial<Record<BuilderPart['category'], BuilderPart>>;
  initialPart?: BuilderPart | null;
}

export const CheaperPriceCheckerModal: React.FC<CheaperPriceCheckerModalProps> = ({
  isOpen,
  onClose,
  selectedParts,
  initialPart
}) => {
  // Qualification questions state
  const [selectedPartId, setSelectedPartId] = useState<string>(initialPart?.id || '');
  const [exactModel, setExactModel] = useState<string>(initialPart?.name || '');
  const [competitorUrl, setCompetitorUrl] = useState<string>('');
  const [advertisedPrice, setAdvertisedPrice] = useState<string>('');
  const [isBrandNew, setIsBrandNew] = useState<boolean>(true);
  const [isInStock, setIsInStock] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Submission & Result state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    outcome: 'verified' | 'needs_review' | 'rejected';
    message: string;
    referenceNumber?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Active chosen component from build
  const activePart = Object.values(selectedParts).find((p) => p && p.id === selectedPartId) || initialPart || null;
  const centreComPrice = activePart?.price || 0;
  const centreComAudit = activePart ? getPartPriceAudit(activePart) : null;

  // Reset form
  const handleReset = () => {
    setResult(null);
    setErrorMessage(null);
    setCompetitorUrl('');
    setAdvertisedPrice('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!competitorUrl.trim()) {
      setErrorMessage('Please provide the competitor product URL.');
      return;
    }
    const priceNum = parseFloat(advertisedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Please enter a valid advertised price in AUD.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/cheaper-price-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          email: email.trim(),
          partId: activePart?.id,
          partName: exactModel || activePart?.name || 'Custom Component',
          category: activePart?.category || 'component',
          centreComPrice: centreComPrice,
          centreComUrl: centreComAudit?.centreComUrl || 'https://www.centrecom.com.au',
          competitorUrl: competitorUrl.trim(),
          competitorPrice: priceNum,
          isBrandNew,
          isInStock,
          notes: notes.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to evaluate price');
      }

      setResult({
        outcome: data.outcome,
        message: data.message,
        referenceNumber: data.referenceNumber
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while evaluating the competitor price.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-black">
              <Tag className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                Official Price Match Policy
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                Found a Cheaper Price?
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Centre Com Standard Policy Notice */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Primary Retail Source:</span>
              <span className="font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                Centre Com (centrecom.com.au)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              All catalogue prices are synchronized directly with Centre Com AUD retail pricing (incl. GST). If you found an identical brand-new in-stock item cheaper from an authorized Australian retailer, submit it below for review.
            </p>
          </div>

          {result ? (
            /* Result Banner & Outcome Details */
            <div className="space-y-4 animate-fade-in">
              {result.outcome === 'verified' && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-black text-sm text-emerald-950">
                        Cheaper price verified — eligible for review.
                      </h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Your price match reference is <strong>{result.referenceNumber}</strong>.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-100">
                    The competitor offer meets our Australian authorized retailer criteria. Our workshop administrator has received this request and will apply the approved price adjustment to your quotation/order upon confirmation.
                  </p>
                </div>
              )}

              {result.outcome === 'needs_review' && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-black text-sm text-amber-950">
                        This offer needs a manual review before it can be accepted.
                      </h4>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Request Reference: <strong>{result.referenceNumber}</strong>.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-100">
                    The product or retailer requires manual inspection (to confirm exact Australian model specifications, local warranty, and shipping stock readiness). Our technician will verify the listing and contact you.
                  </p>
                </div>
              )}

              {result.outcome === 'rejected' && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                    <div>
                      <h4 className="font-black text-sm text-rose-950">
                        This price cannot be accepted because the listing does not meet the verification requirements.
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-100">
                    {result.message}
                  </p>
                  <p className="text-[11px] text-rose-600 italic">
                    Note: Amazon, Amazon Marketplace, peer-to-peer auction sites, and grey-market imports without official Australian distributor warranties are excluded from our price match policy.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Check Another Price
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 text-amber-400 border border-amber-500/40 font-bold text-xs rounded-xl hover:bg-black transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* 5 Qualification Questions Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Component in Build */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Which component in your build? <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedPartId}
                  onChange={(e) => {
                    setSelectedPartId(e.target.value);
                    const match = Object.values(selectedParts).find((p) => p && p.id === e.target.value);
                    if (match) setExactModel(match.name);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
                >
                  <option value="">Select a component from your current build...</option>
                  {Object.entries(selectedParts).map(([cat, part]) => {
                    if (!part) return null;
                    return (
                      <option key={part.id} value={part.id}>
                        {cat.toUpperCase()}: {part.name} ({formatAud(part.price)})
                      </option>
                    );
                  })}
                </select>
                {activePart && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Centre Com Reference Price:{' '}
                      <strong className="text-slate-800">{formatAud(activePart.price)}</strong>
                    </span>
                    <a
                      href={centreComAudit?.centreComUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 hover:underline flex items-center gap-0.5"
                    >
                      <span>View on Centre Com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* 2. Exact Model Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Exact Product Model Name / Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={exactModel}
                  onChange={(e) => setExactModel(e.target.value)}
                  placeholder="e.g. ASUS Dual GeForce RTX 5050 8GB OC GDDR6"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* 3. Competitor URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Competitor Product URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  placeholder="https://www.scorptec.com.au/product/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Must be an authorized Australian computer retailer with genuine local warranty (Amazon listings excluded).
                </p>
              </div>

              {/* 4. Advertised Price in AUD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Advertised Price in AUD (incl. GST) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={advertisedPrice}
                    onChange={(e) => setAdvertisedPrice(e.target.value)}
                    placeholder="e.g. 479.00"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* 5. Condition and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBrandNew}
                    onChange={(e) => setIsBrandNew(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">Brand new &amp; factory sealed</span>
                </label>
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInStock}
                    onChange={(e) => setIsInStock(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">In stock ready to ship</span>
                </label>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. In stock at Melbourne store pickup, or promotional weekend discount code..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Price...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Verify &amp; Submit Price Check</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

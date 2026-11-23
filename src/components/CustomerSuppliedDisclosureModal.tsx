import React, { useState } from 'react';
import { ShieldCheck, X, Check, AlertTriangle, FileText } from 'lucide-react';

interface CustomerSuppliedDisclosureModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  suppliedPartsSummary?: Array<{ category: string; name: string }>;
}

export const CustomerSuppliedDisclosureModal: React.FC<CustomerSuppliedDisclosureModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  suppliedPartsSummary = []
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                Customer-Supplied Components Disclosure
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Terms of Assembly &amp; Compatibility
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700">
          {suppliedPartsSummary.length > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Your Supplied Components ($0.00 component cost)
              </span>
              <ul className="space-y-1">
                {suppliedPartsSummary.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs font-medium text-slate-800">
                    <span className="capitalize text-slate-500">{item.category}:</span>
                    <span className="font-bold">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory exact legal text */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl text-xs sm:text-sm text-amber-950 font-medium leading-relaxed space-y-2">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Customer-Supplied Components Agreement:
            </p>
            <p>
              You are responsible for supplying the component you selected. The component must match the specifications agreed for your build and be provided before assembly begins. Compatibility, condition, completeness and suitability must be checked before installation. Any additional work or replacement parts must be explained and approved before additional charges are applied.
            </p>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-amber-500 rounded text-amber-500"
            />
            <span className="text-xs font-semibold text-slate-800 leading-snug">
              I have read, understood, and agree to the customer-supplied component terms and responsibility conditions.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!agreed}
            onClick={onConfirm}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept Terms &amp; Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};

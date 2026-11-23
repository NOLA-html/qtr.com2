import React from 'react';
import { AlertCircle, ArrowRight, X, ExternalLink, RefreshCw } from 'lucide-react';
import { formatAud } from '../utils/pricing.ts';

export interface PriceDifferenceItem {
  partId: string;
  name: string;
  oldPrice: number;
  currentPrice: number;
  delta: number;
}

interface PriceChangeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  priceChanges: PriceDifferenceItem[];
  originalTotal: number;
  revisedTotal: number;
}

export const PriceChangeModal: React.FC<PriceChangeModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  priceChanges,
  originalTotal,
  revisedTotal
}) => {
  if (!isOpen) return null;

  const netDiff = revisedTotal - originalTotal;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                Live Centre Com Price Recheck
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                Component Prices Updated
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice text */}
        <p className="text-xs text-slate-600 leading-relaxed">
          Before completing your order, component prices are automatically re-verified in real time against{' '}
          <strong className="text-slate-900">Centre Com</strong>. Some components have updated since they were selected:
        </p>

        {/* Price list changes */}
        <div className="overflow-y-auto max-h-56 space-y-2.5 pr-1">
          {priceChanges.map((change) => {
            const isIncrease = change.delta > 0;
            return (
              <div
                key={change.partId}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{change.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Was: <span className="line-through">{formatAud(change.oldPrice)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-slate-900 text-sm">
                    {formatAud(change.currentPrice)}
                  </div>
                  <div
                    className={`text-[10px] font-bold ${
                      isIncrease ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isIncrease ? `+${formatAud(change.delta)}` : formatAud(change.delta)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals Summary */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Previous Parts Total:</span>
            <span className="font-mono line-through">{formatAud(originalTotal)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1 border-t border-slate-800">
            <span className="text-xs font-bold text-amber-400">Updated Parts Total:</span>
            <span className="text-xl font-mono font-black text-white">{formatAud(revisedTotal)}</span>
          </div>
          <div className="text-[11px] text-slate-400 text-right">
            Net difference:{' '}
            <strong className={netDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}>
              {netDiff > 0 ? `+${formatAud(netDiff)}` : formatAud(netDiff)}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Review Build
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Accept Updated Total</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

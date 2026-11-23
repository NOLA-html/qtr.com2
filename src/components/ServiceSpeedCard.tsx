import React from 'react';
import { Clock, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface ServiceSpeedSectionProps {
  onSelectSpeed?: (speed: 'Regular' | 'Express') => void;
  selectedSpeed?: 'Regular' | 'Express';
  interactive?: boolean;
}

export const ServiceSpeedCard: React.FC<ServiceSpeedSectionProps> = ({
  onSelectSpeed,
  selectedSpeed,
  interactive = false
}) => {
  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Service Speed
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
            Choose how fast you need it back
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Two simple options. The repair or upgrade cost is worked out after assessment — this is just about turnaround.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Regular Service */}
          <div
            onClick={() => interactive && onSelectSpeed?.('Regular')}
            className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all ${
              interactive ? 'cursor-pointer hover:border-blue-400' : ''
            } ${
              selectedSpeed === 'Regular'
                ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/30'
                : 'border-slate-200 bg-white shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                  Standard Queue
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Regular Service
              </h3>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold text-slate-900">FREE</span>
                <span className="text-sm font-medium text-slate-500">· 5–7 day turnaround</span>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                For customers who don't need their computer fixed urgently.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Comprehensive diagnostic assessment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard queue sequencing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No turnaround surcharge</span>
                </li>
              </ul>
            </div>

            {interactive && (
              <button
                type="button"
                className={`mt-6 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  selectedSpeed === 'Regular'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {selectedSpeed === 'Regular' ? 'Selected' : 'Select Regular Service'}
              </button>
            )}
          </div>

          {/* Express Service */}
          <div
            onClick={() => interactive && onSelectSpeed?.('Express')}
            className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all ${
              interactive ? 'cursor-pointer hover:border-blue-400' : ''
            } ${
              selectedSpeed === 'Express'
                ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/40'
                : 'border-blue-200 bg-white shadow-sm'
            }`}
          >
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Faster
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full mr-14">
                  Priority Bench
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Express Service
              </h3>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold text-blue-600">$10–$20</span>
                <span className="text-sm font-medium text-slate-500">· 1–2 day turnaround</span>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                For customers who need their computer fixed quickly.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Immediate priority workbench placement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>1–2 day swift turnaround</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Direct technician communication priority</span>
                </li>
              </ul>
            </div>

            {interactive && (
              <button
                type="button"
                className={`mt-6 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  selectedSpeed === 'Express'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {selectedSpeed === 'Express' ? 'Selected' : 'Select Express Service'}
              </button>
            )}
          </div>
        </div>

        {/* Clear pricing disclaimer callout */}
        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Clear Pricing Notice: </strong>
            Express Service is for customers who need their computer fixed quickly. The Express fee is additional to the repair or upgrade cost. The final repair or upgrade cost will be calculated after the computer has been assessed.
          </p>
        </div>
      </div>
    </section>
  );
};

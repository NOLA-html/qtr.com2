import React from 'react';
import { Apple, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AppleSectionProps {
  onSelectAppleRepair: () => void;
}

export const AppleRestrictionBanner: React.FC<AppleSectionProps> = ({ onSelectAppleRepair }) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-lg relative overflow-hidden">
      {/* Decorative subtle background element */}
      <div className="absolute -right-8 -bottom-8 opacity-5 text-slate-100 pointer-events-none">
        <Apple className="w-64 h-64" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Apple className="w-3.5 h-3.5" /> Apple Services
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Apple Repairs Available
          </h2>

          <p className="text-slate-300 text-base leading-relaxed">
            We repair MacBooks and other Apple computers.
          </p>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h4 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Upgrades are different
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              MacBook and Apple computer upgrades are not currently available.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              We can repair Apple computers, but we don't offer upgrades for them. Windows laptops and desktops can be upgraded.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <span className="font-semibold text-white">Pricing note: </span>
            Apple repairs may cost a little more depending on the model, parts required, and difficulty of the repair.
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-800/60 rounded-xl p-6 border border-slate-700/80 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Apple Diagnostic Matrix
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>MacBook Air &amp; Pro Screen &amp; Battery Repairs</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>iMac &amp; Mac mini power / logic board diagnostics</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>macOS boot recovery &amp; data transfer</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400 line-through">
                <span className="w-4 h-4 text-slate-500 font-bold shrink-0 mt-0.5 text-center">✕</span>
                <span>Soldered RAM &amp; SSD Hardware Upgrades</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onSelectAppleRepair}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg"
          >
            <span>Request Apple Computer Repair</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

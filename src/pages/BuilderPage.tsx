import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PcPartPickerBuilder } from '../components/PcPartPickerBuilder.tsx';

interface BuilderPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onNavigateToCheckout: () => void;
}

export const BuilderPage: React.FC<BuilderPageProps> = ({
  onNavigate,
  onNavigateToCheckout
}) => {
  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <div className="qtr-wrap py-10 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-1 text-[11.5px] text-slate-500"
          >
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              className="hover:text-brand-blue"
            >
              Home
            </a>
            <span className="flex items-center gap-1">
              <ChevronRight className="w-[11px] h-[11px] text-slate-400" />
              <span className="text-slate-700">Custom PC Builder</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Custom PC builder</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            Build your PC, with the checks done for you
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Choose each part and we'll test it against everything else in the build — socket, memory type, clearance,
            power and connectors. A part is only shown as compatible when we hold the technical data for both sides.
          </p>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-slate-600">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Compatible
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Warning — needs a closer look
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Unverified — data missing
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Incompatible
              </span>
            </div>
          </div>
        </div>
      </div>

      <PcPartPickerBuilder
        onNavigateToCheckout={onNavigateToCheckout}
      />
    </div>
  );
};

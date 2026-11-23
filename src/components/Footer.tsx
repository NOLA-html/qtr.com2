import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const go = (e: React.MouseEvent, page: string, params: Record<string, string> = {}) => {
    e.preventDefault();
    onNavigate(page, params);
  };

  return (
    <footer className="mt-auto border-t border-navy-700 bg-navy text-slate-300">
      <div className="qtr-wrap grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-8">
        <div className="max-w-sm">
          <span className="flex items-center gap-2.5">
            <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" className="shrink-0">
              <rect width="34" height="34" rx="5" fill="#FFFFFF" />
              <circle cx="15" cy="15" r="6.2" stroke="#0F172A" strokeWidth="2.1" fill="none" />
              <path d="M19.6 19.6 L24.8 24.8" stroke="#0EA5E9" strokeWidth="2.1" strokeLinecap="round" />
              <path d="M8 27.5 H26" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="flex flex-col leading-none">
              <span className="font-heading text-[15px] font-extrabold tracking-tight text-white">
                Qwick Tech
              </span>
              <span className="mt-1 font-heading text-[9.5px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
                Repairs
              </span>
            </span>
          </span>
          <p className="mt-5 text-[13.5px] leading-relaxed text-slate-400">
            Custom gaming PCs, computer hardware and specialist repairs. Qwick Tech Repairs is a service of AB Services,
            an Australian technology service business.
          </p>
          <div className="mt-6 space-y-2.5 text-[13px]">
            <a
              href="/contact"
              onClick={(e) => go(e, 'contact')}
              className="inline-flex items-center gap-1.5 font-semibold text-cyan-300 transition hover:text-white"
            >
              <span>Contact the team</span>
              <ArrowUpRight className="w-[13px] h-[13px]" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="qtr-label text-cyan-300">Shop</h3>
          <ul className="mt-5 space-y-3">
            <li>
              <a
                href="/prebuilt-pcs"
                onClick={(e) => go(e, 'prebuilt-pcs')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Prebuilt gaming PCs
              </a>
            </li>
            <li>
              <a
                href="/builder"
                onClick={(e) => go(e, 'builder')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Custom PC builder
              </a>
            </li>
            <li>
              <a
                href="/components"
                onClick={(e) => go(e, 'components')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Components
              </a>
            </li>
            <li>
              <a
                href="/cart"
                onClick={(e) => go(e, 'cart')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Your cart
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="qtr-label text-cyan-300">Service</h3>
          <ul className="mt-5 space-y-3">
            <li>
              <a
                href="/repairs"
                onClick={(e) => go(e, 'repairs')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Repair services
              </a>
            </li>
            <li>
              <a
                href="/repairs#request"
                onClick={(e) => go(e, 'repairs', { scrollTo: 'request' })}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Request a repair
              </a>
            </li>
            <li>
              <a
                href="/track"
                onClick={(e) => go(e, 'track')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Track a repair
              </a>
            </li>
            <li>
              <a
                href="/reviews"
                onClick={(e) => go(e, 'reviews')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Customer reviews
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="qtr-label text-cyan-300">Company</h3>
          <ul className="mt-5 space-y-3">
            <li>
              <a
                href="/about"
                onClick={(e) => go(e, 'about')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                About QTR
              </a>
            </li>
            <li>
              <a
                href="/contact"
                onClick={(e) => go(e, 'contact')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="/privacy"
                onClick={(e) => go(e, 'privacy')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Privacy
              </a>
            </li>
            <li>
              <a
                href="/admin"
                onClick={(e) => go(e, 'admin')}
                className="text-[13.5px] text-slate-400 transition-colors hover:text-white"
              >
                Admin access
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-700">
        <div className="qtr-wrap flex flex-col gap-3 py-6 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Qwick Tech Repairs, a service of AB Services.</p>
          <p>All prices in Australian dollars and include GST.</p>
        </div>
      </div>
    </footer>
  );
};

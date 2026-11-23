import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingCart, Lock, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const NAV_ITEMS = [
  { id: 'prebuilt-pcs', href: '/prebuilt-pcs', label: 'Prebuilt PCs' },
  { id: 'builder', href: '/builder', label: 'Custom PC Builder' },
  { id: 'components', href: '/components', label: 'Components' },
  { id: 'repairs', href: '/repairs', label: 'Repair Services' },
  { id: 'track', href: '/track', label: 'Track Repair' },
  { id: 'reviews', href: '/reviews', label: 'Reviews' },
  { id: 'about', href: '/about', label: 'About' },
  { id: 'contact', href: '/contact', label: 'Contact' }
];

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { totalItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent, page: string, params: Record<string, string> = {}) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(page, params);
  };

  const isNavActive = (id: string) => {
    if (id === 'prebuilt-pcs' && (currentPage === 'prebuilt-pcs' || currentPage === 'prebuilt-detail')) return true;
    if (id === 'components' && (currentPage === 'components' || currentPage === 'component-detail')) return true;
    return currentPage === id;
  };

  return (
    <>
      {/* Top Navy Utility Bar */}
      <div className="hidden border-b border-navy-700 bg-navy text-white md:block">
        <div className="qtr-wrap flex h-9 items-center justify-between text-[11.5px]">
          <p className="font-medium tracking-wide text-slate-300">
            Qwick Tech Repairs — a service of <span className="text-white">AB Services</span>
          </p>
          <div className="flex items-center gap-5">
            <a
              href="/track"
              onClick={(e) => handleLinkClick(e, 'track')}
              className="flex items-center gap-1.5 font-semibold text-cyan-300 transition hover:text-white"
            >
              <span>Track a repair</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="qtr-wrap flex h-[68px] items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, 'home')}
            className="flex items-center"
            aria-label="Qwick Tech Repairs home"
          >
            <span className="flex items-center gap-2.5">
              <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" className="shrink-0">
                <rect width="34" height="34" rx="5" fill="#0F172A" />
                <circle cx="15" cy="15" r="6.2" stroke="#22D3EE" strokeWidth="2.1" fill="none" />
                <path d="M19.6 19.6 L24.8 24.8" stroke="#0EA5E9" strokeWidth="2.1" strokeLinecap="round" />
                <path d="M8 27.5 H26" stroke="#1D2E4A" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="flex flex-col leading-none">
                <span className="font-heading text-[15px] font-extrabold tracking-tight text-navy">
                  Qwick Tech
                </span>
                <span className="mt-1 font-heading text-[9.5px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  Repairs
                </span>
              </span>
            </span>
          </a>

          {/* Desktop Links */}
          <nav className="hidden items-center gap-[18px] xl:flex" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.id)}
                className={`whitespace-nowrap text-[12.5px] font-medium transition-colors ${
                  isNavActive(item.id) ? 'text-brand-blue font-semibold' : 'text-slate-600 hover:text-navy'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1">
            <a
              href="/cart"
              onClick={(e) => handleLinkClick(e, 'cart')}
              className="relative flex h-11 w-11 items-center justify-center rounded-md text-navy transition hover:bg-slate-100"
              aria-label={`Cart, ${totalItemCount} item${totalItemCount === 1 ? '' : 's'}`}
            >
              <ShoppingCart className="w-[19px] h-[19px]" strokeWidth={1.9} />
              {totalItemCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-blue px-1 text-[10px] font-bold leading-none text-white">
                  {totalItemCount}
                </span>
              )}
            </a>

            <a
              href="/admin"
              onClick={(e) => handleLinkClick(e, 'admin')}
              className={`hidden h-11 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-semibold transition sm:flex ${
                currentPage === 'admin'
                  ? 'bg-slate-100 text-navy'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-navy'
              }`}
            >
              <Lock className="w-[13px] h-[13px]" />
              <span>Admin</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-md text-navy transition hover:bg-slate-100 xl:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-[21px] h-[21px]" /> : <Menu className="w-[21px] h-[21px]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="fixed inset-0 bg-navy/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white border-l border-slate-200 shadow-2xl flex flex-col">
            <div className="flex h-[68px] items-center justify-between border-b border-slate-200 px-5">
              <span className="font-heading text-[15px] font-extrabold text-navy">Navigation</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-navy"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.id)}
                  className={`flex h-11 items-center rounded-md px-3 text-[14px] font-medium transition ${
                    isNavActive(item.id)
                      ? 'bg-sky-50 text-brand-blue font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-navy'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <div className="my-3 border-t border-slate-200 pt-3 space-y-1">
                <a
                  href="/cart"
                  onClick={(e) => handleLinkClick(e, 'cart')}
                  className="flex h-11 items-center justify-between rounded-md px-3 text-[14px] font-medium text-navy hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-brand-blue" />
                    Cart
                  </span>
                  {totalItemCount > 0 && (
                    <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[11px] font-bold text-white">
                      {totalItemCount}
                    </span>
                  )}
                </a>
                <a
                  href="/admin"
                  onClick={(e) => handleLinkClick(e, 'admin')}
                  className="flex h-11 items-center gap-2 rounded-md px-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50 hover:text-navy"
                >
                  <Lock className="w-4 h-4" />
                  Admin access
                </a>
              </div>
            </nav>
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-[11.5px] text-slate-500">
              Qwick Tech Repairs — a service of AB Services
            </div>
          </div>
        </div>
      )}
    </>
  );
};

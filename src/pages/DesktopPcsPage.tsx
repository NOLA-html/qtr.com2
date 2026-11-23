import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Wrench,
  X
} from 'lucide-react';
import {
  THREE_CUSTOM_PCS,
  CustomPcProduct,
  formatAud
} from '../utils/pricing.ts';
import { useCart } from '../context/CartContext.tsx';

interface DesktopPcsPageProps {
  selectedSlug?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onNavigateToCheckout?: (pcId?: string) => void;
}

const GPU_FILTERS = [
  { label: 'ASUS Dual GeForce RTX 5050 8GB OC', match: '5050' },
  { label: 'Palit GeForce RTX 3060 12GB', match: '3060' },
  { label: 'PowerColor Radeon RX 9070 XT 16GB', match: '9070' }
];

const CPU_FILTERS = [
  { label: 'AMD Ryzen 5 5600X', match: '5600X' },
  { label: 'AMD Ryzen 5 7500X3D', match: '7500X3D' },
  { label: 'AMD Ryzen 7 9800X3D', match: '9800X3D' }
];

const RAM_FILTERS = ['16 GB', '32 GB'];
const STORAGE_FILTERS = ['512 GB', '2 TB'];
const RESOLUTION_FILTERS = ['1080p', '1440p', '1440p high refresh / 4K'] as const;

export const DesktopPcsPage: React.FC<DesktopPcsPageProps> = ({
  selectedSlug,
  onNavigate,
  onNavigateToCheckout
}) => {
  const { addToCart, buildServiceId } = useCart();

  // Filters state
  const [availability, setAvailability] = useState<'all' | 'available' | 'in_development'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedGpus, setSelectedGpus] = useState<string[]>([]);
  const [selectedCpus, setSelectedCpus] = useState<string[]>([]);
  const [selectedRams, setSelectedRams] = useState<string[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<string[]>([]);
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // If viewing detail route (/prebuilt-pcs/:slug)
  const detailPc: CustomPcProduct | undefined = selectedSlug
    ? THREE_CUSTOM_PCS.find(
        (pc) =>
          pc.id.toLowerCase() === selectedSlug.toLowerCase() ||
          pc.name.toLowerCase().replace(/\s+/g, '-') === selectedSlug.toLowerCase()
      )
    : undefined;

  const toggleArr = (arr: string[], val: string, setter: (next: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const clearAllFilters = () => {
    setAvailability('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedGpus([]);
    setSelectedCpus([]);
    setSelectedRams([]);
    setSelectedStorages([]);
    setSelectedResolutions([]);
    setSearchQuery('');
  };

  const filteredSystems = useMemo(() => {
    let list = THREE_CUSTOM_PCS.filter((pc) => {
      if (availability !== 'all' && (pc.availability || 'available') !== availability) return false;
      if (minPrice && pc.basePrice < Number(minPrice)) return false;
      if (maxPrice && pc.basePrice > Number(maxPrice)) return false;
      if (selectedGpus.length > 0 && !selectedGpus.some((g) => pc.specsSummary.gpu.includes(g))) return false;
      if (selectedCpus.length > 0 && !selectedCpus.some((c) => pc.specsSummary.cpu.includes(c))) return false;
      if (
        selectedRams.length > 0 &&
        !selectedRams.some((r) => pc.specsSummary.ram.includes(r.replace(' ', '')) || pc.specsSummary.ram.includes(r))
      ) {
        return false;
      }
      if (
        selectedStorages.length > 0 &&
        !selectedStorages.some(
          (s) => pc.specsSummary.storage.includes(s.replace(' ', '')) || pc.specsSummary.storage.includes(s)
        )
      ) {
        return false;
      }
      if (selectedResolutions.length > 0 && !selectedResolutions.includes(pc.resolution || '')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${pc.name} ${pc.tagline} ${pc.specsSummary.cpu} ${pc.specsSummary.gpu}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => b.basePrice - a.basePrice);
    }
    return list;
  }, [
    availability,
    minPrice,
    maxPrice,
    selectedGpus,
    selectedCpus,
    selectedRams,
    selectedStorages,
    selectedResolutions,
    searchQuery,
    sortBy
  ]);

  // DETAIL VIEW (/prebuilt-pcs/:slug)
  if (selectedSlug) {
    if (!detailPc) {
      return (
        <div className="qtr-wrap py-16 text-center">
          <h1 className="font-heading text-[26px] font-bold text-navy">System not found</h1>
          <p className="mt-2 text-[14px] text-slate-600">That prebuilt system could not be located.</p>
          <button
            type="button"
            onClick={() => onNavigate('prebuilt-pcs')}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800"
          >
            Back to Prebuilt PCs
          </button>
        </div>
      );
    }

    const cpuShort = detailPc.specsSummary.cpu.split('—')[0].trim();
    const gpuShort = detailPc.specsSummary.gpu.replace('Infinity 2 OC ', '').replace('GDDR6', '').trim();
    const ramShort = detailPc.specsSummary.ram.includes('32GB') ? '32 GB' : '16 GB';
    const storageShort = detailPc.specsSummary.storage.includes('2TB') ? '2 TB' : '512 GB';

    const specRows = [
      { label: 'Processor', value: detailPc.specsSummary.cpu },
      { label: 'CPU cooler', value: detailPc.specsSummary.cooler },
      { label: 'Motherboard', value: detailPc.specsSummary.motherboard },
      { label: 'Memory', value: detailPc.specsSummary.ram },
      { label: 'Graphics', value: detailPc.specsSummary.gpu },
      { label: 'Storage', value: detailPc.specsSummary.storage },
      { label: 'Case', value: detailPc.specsSummary.case },
      { label: 'Power supply', value: detailPc.specsSummary.psu },
      { label: 'Operating system', value: detailPc.specsSummary.os },
      { label: 'Networking', value: detailPc.specsSummary.networking || 'Gigabit Ethernet on the motherboard' }
    ];

    const handleAddToCartDetail = () => {
      addToCart(detailPc.id, buildServiceId || 'fast', false);
      if (onNavigateToCheckout) {
        onNavigateToCheckout(detailPc.id);
      } else {
        onNavigate('cart');
      }
    };

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
                <a
                  href="/prebuilt-pcs"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('prebuilt-pcs');
                  }}
                  className="hover:text-brand-blue"
                >
                  Prebuilt PCs
                </a>
              </span>
              <span className="flex items-center gap-1">
                <ChevronRight className="w-[11px] h-[11px] text-slate-400" />
                <span className="text-slate-700">{detailPc.name}</span>
              </span>
            </nav>

            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-brand-blue" />
              <span className="qtr-label text-brand-blue">Qwick Tech Repairs</span>
            </div>

            <h1 className="mt-4 max-w-3xl text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
              {detailPc.name}
            </h1>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
              {detailPc.shortDescription || detailPc.tagline}
            </p>
          </div>
        </div>

        <div className="qtr-wrap grid gap-10 py-10 sm:py-12 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
          <div className="min-w-0 space-y-10">
            <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={detailPc.image}
                  alt={`${detailPc.name} gaming PC`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 sm:grid-cols-4">
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Processor</p>
                <p className="mt-1 font-heading text-[13.5px] font-bold text-navy">{cpuShort}</p>
              </div>
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Graphics</p>
                <p className="mt-1 font-heading text-[13.5px] font-bold text-navy">{gpuShort}</p>
              </div>
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Memory</p>
                <p className="mt-1 font-heading text-[13.5px] font-bold text-navy">{ramShort}</p>
              </div>
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Storage</p>
                <p className="mt-1 font-heading text-[13.5px] font-bold text-navy">{storageShort}</p>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-[20px] font-bold text-navy">About this build</h2>
              <p className="mt-3 whitespace-pre-line text-[14.5px] leading-[1.75] text-slate-700">
                {(detailPc.aboutParagraphs && detailPc.aboutParagraphs.join('\n\n')) || detailPc.description}
              </p>
            </div>

            <div>
              <h2 className="font-heading text-[20px] font-bold text-navy">What's inside</h2>
              <p className="mt-2 text-[13px] text-slate-600">
                Every part is listed by name, with a plain-English note on what it does for you.
              </p>

              <div className="mt-5 space-y-4">
                {detailPc.components.map((comp, idx) => (
                  <div key={idx} className="rounded-md border border-slate-200 p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-blue">
                          {comp.category}
                        </p>
                        <p className="mt-1 font-heading text-[13.5px] font-bold text-navy">{comp.name}</p>
                      </div>
                      <span className="shrink-0 font-heading text-[13.5px] font-bold text-navy">
                        {comp.price === 0 ? 'Included' : formatAud(comp.price)}
                      </span>
                    </div>
                    {comp.specNote && (
                      <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">{comp.specNote}</p>
                    )}
                    {comp.plainNote && (
                      <p className="mt-2 border-l-2 border-slate-200 pl-3 text-[12.5px] leading-relaxed text-slate-700">
                        {comp.plainNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[13px] font-bold text-navy">Parts and Windows subtotal</span>
                <span className="font-heading text-[17px] font-extrabold text-navy">
                  {formatAud(detailPc.basePrice)}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-600">
                Includes the Windows 11 Home licence. Labour and delivery calculated at checkout.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-[20px] font-bold text-navy">Full specifications</h2>
              <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                <dl>
                  {specRows.map((row, idx) => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-1 gap-1 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:grid-cols-[210px_1fr] sm:gap-5 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        {row.label}
                      </dt>
                      <dd className="text-[13.5px] leading-relaxed text-slate-800">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-[84px] lg:h-fit">
            <div className="rounded-md border border-slate-200 bg-white p-6">
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-heading text-[26px] font-extrabold text-navy">
                    {formatAud(detailPc.basePrice)}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">AUD inc. GST</span>
                </div>
              </div>
              <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-600">
                Labour and delivery calculated at checkout.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Price confirmed
                </span>
                {detailPc.resolution && (
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    {detailPc.resolution}
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={handleAddToCartDetail}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 py-2 text-[13.5px] font-semibold text-white shadow transition-colors hover:bg-navy-800"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to cart
                </button>
                <a
                  href="/builder"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('builder');
                  }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-300 text-[13px] font-semibold text-navy transition hover:bg-slate-50"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Build something similar
                </a>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="qtr-label text-slate-500">What happens next</p>
                <ol className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed text-slate-700">
                  <li className="flex gap-2">
                    <span className="font-mono text-[11px] text-brand-blue">01</span> We confirm the specification and
                    price with you.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-[11px] text-brand-blue">02</span> The system is assembled, cabled and
                    stress tested.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-[11px] text-brand-blue">03</span> You're contacted when it's ready to
                    collect.
                  </li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Reusable Filter Controls
  const renderFilterSections = () => (
    <div className="text-[13px]">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="font-heading text-[13.5px] font-bold text-navy">Filters</h2>
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-[11.5px] font-semibold text-brand-blue hover:text-navy"
        >
          Clear all
        </button>
      </div>

      <div className="border-t border-slate-200 py-4 first:border-t-0 first:pt-0">
        <h3 className="qtr-label mb-3 text-slate-500">Availability</h3>
        <div className="space-y-2">
          {[
            { id: 'all', label: 'All systems' },
            { id: 'available', label: 'Available now' },
            { id: 'in_development', label: 'In development' }
          ].map((opt) => (
            <label key={opt.id} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-700">
              <input
                type="radio"
                name="availability"
                checked={availability === opt.id}
                onChange={() => setAvailability(opt.id as any)}
                className="h-4 w-4 accent-sky-500"
              />
              <span className={availability === opt.id ? 'font-semibold text-navy' : ''}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <h3 className="qtr-label mb-3 text-slate-500">Price (AUD)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 w-full rounded border border-slate-300 px-2 text-[12.5px] focus:border-brand-blue focus:outline-none"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 w-full rounded border border-slate-300 px-2 text-[12.5px] focus:border-brand-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <h3 className="qtr-label mb-3 text-slate-500">Graphics card</h3>
        <div className="space-y-2">
          {GPU_FILTERS.map((f) => (
            <label key={f.match} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={selectedGpus.includes(f.match)}
                onChange={() => toggleArr(selectedGpus, f.match, setSelectedGpus)}
                className="h-4 w-4 rounded border-slate-300 text-brand-blue accent-sky-500"
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <h3 className="qtr-label mb-3 text-slate-500">Processor</h3>
        <div className="space-y-2">
          {CPU_FILTERS.map((f) => (
            <label key={f.match} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={selectedCpus.includes(f.match)}
                onChange={() => toggleArr(selectedCpus, f.match, setSelectedCpus)}
                className="h-4 w-4 rounded border-slate-300 text-brand-blue accent-sky-500"
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <h3 className="qtr-label mb-3 text-slate-500">Memory</h3>
        <div className="space-y-2">
          {RAM_FILTERS.map((ram) => (
            <label key={ram} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={selectedRams.includes(ram)}
                onChange={() => toggleArr(selectedRams, ram, setSelectedRams)}
                className="h-4 w-4 rounded border-slate-300 text-brand-blue accent-sky-500"
              />
              <span>{ram}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <h3 className="qtr-label mb-3 text-slate-500">Storage</h3>
        <div className="space-y-2">
          {STORAGE_FILTERS.map((st) => (
            <label key={st} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={selectedStorages.includes(st)}
                onChange={() => toggleArr(selectedStorages, st, setSelectedStorages)}
                className="h-4 w-4 rounded border-slate-300 text-brand-blue accent-sky-500"
              />
              <span>{st}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <h3 className="qtr-label mb-3 text-slate-500">Gaming resolution</h3>
        <div className="space-y-2">
          {RESOLUTION_FILTERS.map((res) => (
            <label key={res} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={selectedResolutions.includes(res)}
                onChange={() => toggleArr(selectedResolutions, res, setSelectedResolutions)}
                className="h-4 w-4 rounded border-slate-300 text-brand-blue accent-sky-500"
              />
              <span>{res}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // CATALOGUE LIST VIEW (/prebuilt-pcs)
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
              <span className="text-slate-700">Prebuilt PCs</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Prebuilt systems</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            Gaming PCs, specified part by part
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Each system is assembled and tested before collection. Where a price is provisional we label it — a target
            budget is not a confirmed retail price.
          </p>
        </div>
      </div>

      <div className="qtr-wrap py-10 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-[248px] shrink-0 lg:block">
            <div className="sticky top-[84px]">{renderFilterSections()}</div>
          </aside>

          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-[12.5px] font-semibold text-navy"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter systems">
              <div className="fixed inset-0 bg-navy/50" onClick={() => setMobileFiltersOpen(false)} />
              <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white p-5 overflow-y-auto shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-heading text-[15px] font-bold text-navy">Filter systems</span>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-navy"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {renderFilterSections()}
              </div>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-[340px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search systems, processors or graphics cards"
                  aria-label="Search prebuilt PCs"
                  className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-[13px] text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-[12px] text-slate-500 sm:inline">
                  {filteredSystems.length} system{filteredSystems.length === 1 ? '' : 's'}
                </span>
                <select
                  aria-label="Sort systems"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 w-[180px] rounded-md border border-slate-300 bg-white px-3 text-[12.5px] font-medium text-navy focus:border-brand-blue focus:outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {filteredSystems.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <p className="font-heading text-[16px] font-bold text-navy">No matching systems</p>
                <p className="mt-1 text-[13px] text-slate-600">Try clearing one or more filters.</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-4 inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-[12.5px] font-semibold text-navy hover:bg-slate-50"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredSystems.map((pc) => (
                  <a
                    key={pc.id}
                    href={`/prebuilt-pcs/${pc.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('prebuilt-detail', { slug: pc.id });
                    }}
                    className="group flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                      <img
                        src={pc.image}
                        alt={pc.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-white px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="qtr-label text-slate-500">Qwick Tech Repairs</p>
                      <h3 className="mt-1.5 font-heading text-[16.5px] font-bold leading-snug text-navy transition group-hover:text-brand-blue">
                        {pc.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-600">
                        {pc.tagline}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded bg-slate-100 px-2 py-1 text-[10.5px] font-medium text-slate-600">
                          {pc.components.find((c) => c.category === 'CPU Cooler')?.name || pc.specsSummary.cooler}
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-1 text-[10.5px] font-medium text-slate-600">
                          {pc.components.find((c) => c.category === 'Graphics')?.name || pc.specsSummary.gpu}
                        </span>
                      </div>
                      <div className="mt-auto pt-5">
                        <div className="flex items-end justify-between gap-3">
                          <p className="font-heading text-[20px] font-extrabold leading-none text-navy">
                            {formatAud(pc.basePrice)}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-blue">
                            Details <ArrowRight className="w-[13px] h-[13px]" />
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11.5px] leading-snug text-slate-600">
                          Labour and delivery calculated at checkout.
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Search,
  ShoppingCart,
  Wrench,
  Minus,
  Plus,
  ExternalLink,
  Tag,
  Check
} from 'lucide-react';
import {
  BUILDER_PARTS,
  BUILDER_CATEGORIES,
  BuilderPart,
  getPartCentreComUrl
} from '../data/builderCatalog.ts';
import { formatAud } from '../utils/pricing.ts';
import { useCart } from '../context/CartContext.tsx';
import { ProductImageWithPreview } from '../components/ProductImageWithPreview.tsx';
import { CheaperPriceCheckerModal } from '../components/CheaperPriceCheckerModal.tsx';

interface ComponentsPageProps {
  selectedId?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const ComponentsPage: React.FC<ComponentsPageProps> = ({
  selectedId,
  onNavigate
}) => {
  const { addComponentToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name'>('price_asc');
  const [detailQty, setDetailQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [priceCheckerPart, setPriceCheckerPart] = useState<BuilderPart | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: BUILDER_PARTS.length };
    for (const part of BUILDER_PARTS) {
      counts[part.category] = (counts[part.category] || 0) + 1;
    }
    return counts;
  }, []);

  const detailPart: BuilderPart | undefined = selectedId
    ? BUILDER_PARTS.find((p) => p.id === selectedId)
    : undefined;

  const filteredParts = useMemo(() => {
    let list = BUILDER_PARTS.filter((p) => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${p.name} ${p.brand} ${p.category} ${p.description} ${Object.values(p.specs || {}).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  // COMPONENT DETAIL VIEW (/components/:id)
  if (selectedId) {
    if (!detailPart) {
      return (
        <div className="qtr-wrap py-16 text-center">
          <h1 className="font-heading text-[26px] font-bold text-navy">Component not found</h1>
          <p className="mt-2 text-[14px] text-slate-600">That hardware listing could not be located.</p>
          <button
            type="button"
            onClick={() => onNavigate('components')}
            className="mt-6 inline-flex h-11 items-center rounded-md bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800"
          >
            Browse all components
          </button>
        </div>
      );
    }

    const centreUrl = getPartCentreComUrl(detailPart);
    const catMeta = BUILDER_CATEGORIES.find((c) => c.category === detailPart.category);

    const handleAddDetailToCart = () => {
      addComponentToCart(detailPart, detailQty);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2500);
    };

    const compatibilityRows = [
      detailPart.socket && { label: 'Socket', value: detailPart.socket },
      detailPart.ramType && { label: 'Memory type', value: detailPart.ramType },
      detailPart.formFactor && { label: 'Form factor', value: detailPart.formFactor },
      detailPart.specs?.TDP && { label: 'Thermal design power', value: detailPart.specs.TDP },
      detailPart.wattage && { label: 'Power draw / capacity', value: `${detailPart.wattage} W` },
      detailPart.gpuLengthMm && { label: 'Card length', value: `${detailPart.gpuLengthMm} mm` },
      detailPart.maxGpuLengthMm && { label: 'Max GPU clearance', value: `${detailPart.maxGpuLengthMm} mm` },
      detailPart.maxCoolerHeightMm && { label: 'Max cooler height', value: `${detailPart.maxCoolerHeightMm} mm` },
      detailPart.coolerHeightMm && { label: 'Cooler height', value: `${detailPart.coolerHeightMm} mm` }
    ].filter(Boolean) as Array<{ label: string; value: string }>;

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
                  href="/components"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('components');
                  }}
                  className="hover:text-brand-blue"
                >
                  Components
                </a>
              </span>
              <span className="flex items-center gap-1">
                <ChevronRight className="w-[11px] h-[11px] text-slate-400" />
                <span className="text-slate-700">{detailPart.name}</span>
              </span>
            </nav>

            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-brand-blue" />
              <span className="qtr-label text-brand-blue">
                {detailPart.brand} &middot; {catMeta?.label || detailPart.category.toUpperCase()}
              </span>
            </div>

            <h1 className="mt-4 max-w-3xl text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
              {detailPart.name}
            </h1>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">{detailPart.description}</p>
          </div>
        </div>

        <div className="qtr-wrap grid gap-10 py-10 sm:py-12 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <div className="min-w-0 space-y-8">
            <div className="flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-8">
              <ProductImageWithPreview
                src={detailPart.image}
                alt={detailPart.name}
                name={detailPart.name}
                category={detailPart.category}
                specs={detailPart.specs}
                thumbnailClassName="w-44 h-44 object-contain rounded-md"
              />
            </div>

            <div>
              <h2 className="font-heading text-[20px] font-bold text-navy">Overview</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-slate-700">{detailPart.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(detailPart.specs || {}).map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11.5px] font-medium text-slate-700"
                  >
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-[20px] font-bold text-navy">Specifications</h2>
              <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                <dl>
                  <div className="grid grid-cols-1 gap-1 border-b border-slate-100 bg-white px-4 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
                    <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">Brand</dt>
                    <dd className="text-[13.5px] text-slate-800">{detailPart.brand}</dd>
                  </div>
                  <div className="grid grid-cols-1 gap-1 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
                    <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">Category</dt>
                    <dd className="text-[13.5px] text-slate-800">{catMeta?.label || detailPart.category}</dd>
                  </div>
                  <div className="grid grid-cols-1 gap-1 border-b border-slate-100 bg-white px-4 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
                    <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">Platform</dt>
                    <dd className="text-[13.5px] text-slate-800">{detailPart.platform}</dd>
                  </div>
                  {Object.entries(detailPart.specs || {}).map(([k, v], i) => (
                    <div
                      key={k}
                      className={`grid grid-cols-1 gap-1 border-t border-slate-100 px-4 py-3 sm:grid-cols-[200px_1fr] sm:gap-4 ${
                        i % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                      }`}
                    >
                      <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        {k}
                      </dt>
                      <dd className="text-[13.5px] text-slate-800">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {compatibilityRows.length > 0 && (
              <div>
                <h2 className="font-heading text-[20px] font-bold text-navy">Compatibility data</h2>
                <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                  <dl>
                    {compatibilityRows.map((row, idx) => (
                      <div
                        key={row.label}
                        className={`grid grid-cols-1 gap-1 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:grid-cols-[200px_1fr] sm:gap-4 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        }`}
                      >
                        <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                          {row.label}
                        </dt>
                        <dd className="text-[13.5px] text-slate-800">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-[12.5px]">
              {centreUrl ? (
                <a
                  href={centreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-blue hover:text-navy"
                >
                  View direct Centre Com product page <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-slate-600">Indicative supplier reference — awaiting direct Centre Com URL verification</span>
              )}
              <button
                type="button"
                onClick={() => setPriceCheckerPart(detailPart)}
                className="ml-auto inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-navy hover:border-brand-blue"
              >
                <Tag className="w-3.5 h-3.5 text-brand-blue" />
                Found Cheaper Price?
              </button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-[84px] lg:h-fit">
            <div className="rounded-md border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-heading text-[26px] font-extrabold text-navy">
                  {formatAud(detailPart.price)}
                </span>
                <span className="text-[11px] font-medium text-slate-500">AUD inc. GST</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {detailPart.priceStatus === 'current' || detailPart.centreComUrl ? (
                  <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Verified price
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                    Estimated price
                  </span>
                )}
              </div>

              <div className="mt-5">
                <label className="block text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Quantity
                </label>
                <div className="mt-1.5 inline-flex h-10 items-center rounded-md border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                    className="flex h-full w-10 items-center justify-center text-slate-600 hover:text-navy"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-[13px] font-bold text-navy">{detailQty}</span>
                  <button
                    type="button"
                    onClick={() => setDetailQty((q) => q + 1)}
                    className="flex h-full w-10 items-center justify-center text-slate-600 hover:text-navy"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={handleAddDetailToCart}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 text-[13.5px] font-semibold text-white transition hover:bg-navy-800"
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4 text-cyan-300" />
                      Added to cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to cart
                    </>
                  )}
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
                  Use in a custom build
                </a>
              </div>

              <dl className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-[12px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Category</dt>
                  <dd className="font-semibold text-navy">{catMeta?.label || detailPart.category}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Manufacturer</dt>
                  <dd className="font-semibold text-navy">{detailPart.brand}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Availability</dt>
                  <dd className="font-semibold text-navy">
                    {detailPart.stockStatus === 'unavailable' ? 'Check availability' : 'Order enquiry'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Price checked</dt>
                  <dd className="font-semibold text-navy">
                    {detailPart.lastPriceCheck ? detailPart.lastPriceCheck.slice(0, 10) : 'Indicative'}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        <CheaperPriceCheckerModal
          isOpen={Boolean(priceCheckerPart)}
          selectedParts={{}}
          initialPart={priceCheckerPart}
          onClose={() => setPriceCheckerPart(null)}
        />
      </div>
    );
  }

  // COMPONENTS CATALOGUE VIEW (/components)
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
              <span className="text-slate-700">Components</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Component catalogue</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            Individual PC parts and hardware
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Every processor, graphics card, memory kit and power supply listed individually. Verified supplier prices are
            labelled; indicative parts are marked as estimates until checked.
          </p>
        </div>
      </div>

      <div className="qtr-wrap py-10 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-[248px] lg:shrink-0">
            <div className="rounded-md border border-slate-200 bg-white lg:sticky lg:top-[84px]">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="qtr-label text-slate-500">Categories</h2>
              </div>
              <ul className="divide-y divide-slate-100">
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ALL')}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[12.5px] transition ${
                      selectedCategory === 'ALL'
                        ? 'bg-sky-50 font-semibold text-brand-blue'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>ALL</span>
                    <span className="font-mono text-[11px] text-slate-400">{categoryCounts.ALL || 0}</span>
                  </button>
                </li>
                {BUILDER_CATEGORIES.map((cat) => (
                  <li key={cat.category}>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(cat.category)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[12.5px] transition ${
                        selectedCategory === cat.category
                          ? 'bg-sky-50 font-semibold text-brand-blue'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {categoryCounts[cat.category] || 0}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-[340px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parts, brands or specs"
                  aria-label="Search components"
                  className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-[13px] text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-[12px] text-slate-500 sm:inline">
                  {filteredParts.length} component{filteredParts.length === 1 ? '' : 's'}
                </span>
                <select
                  aria-label="Sort components"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 w-[160px] rounded-md border border-slate-300 bg-white px-3 text-[12.5px] font-medium text-navy focus:border-brand-blue focus:outline-none"
                >
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredParts.map((part) => {
                const isVerified = part.priceStatus === 'current' || Boolean(part.centreComUrl);
                return (
                  <div
                    key={part.id}
                    className="flex flex-col rounded-md border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-card"
                  >
                    <a
                      href={`/components/${part.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('component-detail', { id: part.id });
                      }}
                      className="flex items-start gap-3.5 text-left"
                    >
                      <ProductImageWithPreview
                        src={part.image}
                        alt={part.name}
                        name={part.name}
                        category={part.category}
                        specs={part.specs}
                        thumbnailClassName="w-14 h-14 object-contain rounded-md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-blue">
                          {part.brand}
                        </p>
                        <h3 className="mt-0.5 font-heading text-[14px] font-bold leading-snug text-navy hover:text-brand-blue">
                          {part.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-600">
                          {part.description}
                        </p>
                      </div>
                    </a>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {Object.values(part.specs || {})
                        .slice(0, 3)
                        .map((badge) => (
                          <span
                            key={badge}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {badge}
                          </span>
                        ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3.5 mt-4">
                      <div>
                        <p className="font-heading text-[16px] font-extrabold text-navy">{formatAud(part.price)}</p>
                        <span
                          className={`inline-block text-[9.5px] font-bold uppercase tracking-wider ${
                            isVerified ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {isVerified ? 'VERIFIED' : 'ESTIMATED'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onNavigate('component-detail', { id: part.id })}
                          className="inline-flex h-8 items-center rounded border border-slate-300 px-2.5 text-[11.5px] font-semibold text-navy hover:bg-slate-50"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => addComponentToCart(part, 1)}
                          className="inline-flex h-8 items-center rounded bg-navy px-3 text-[11.5px] font-semibold text-white hover:bg-navy-800"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

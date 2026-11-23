import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Cpu,
  MonitorPlay,
  Wrench,
  Search,
  ShieldCheck,
  Check,
  MessageSquare,
  Star,
  MemoryStick
} from 'lucide-react';
import { THREE_CUSTOM_PCS, formatAud } from '../utils/pricing.ts';
import { LeaveReviewModal } from '../components/LeaveReviewModal.tsx';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const REPAIR_SERVICE_LINKS = [
  {
    id: 'diagnostics',
    title: 'Diagnostics',
    desc: 'A structured fault-finding assessment to establish what has actually failed.'
  },
  {
    id: 'hardware-repair',
    title: 'Hardware repairs',
    desc: 'Component-level replacement for failing parts — power supplies, storage, memory, cooling.'
  },
  {
    id: 'upgrades',
    title: 'RAM and SSD upgrades',
    desc: 'More memory and faster storage for machines that have become slow.'
  },
  {
    id: 'os-install',
    title: 'Operating system installation',
    desc: 'Clean Windows installation with drivers, updates and your data handled carefully.'
  },
  {
    id: 'windows-troubleshooting',
    title: 'Windows troubleshooting',
    desc: 'Startup failures, blue screens, driver conflicts and stubborn software faults.'
  },
  {
    id: 'migration',
    title: 'Data migration',
    desc: 'Moving your files, profile and installed applications to a new drive or machine.'
  },
  {
    id: 'data-recovery-assessment',
    title: 'Data recovery assessment',
    desc: 'An assessment of whether data on a failing drive can be retrieved.'
  },
  {
    id: 'assembly',
    title: 'PC assembly',
    desc: 'Professional assembly and testing of parts you have supplied yourself.'
  },
  {
    id: 'gaming-troubleshooting',
    title: 'Gaming performance troubleshooting',
    desc: 'Low frame rates, stutter, overheating and instability under load.'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [trackRef, setTrackRef] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const loadReviews = () => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews.filter((r: any) => r.approved));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = trackRef.trim().toUpperCase();
    onNavigate('track', cleaned ? { code: cleaned } : {});
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-navy-700 bg-navy">
        <div className="qtr-wrap grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12 lg:py-24">
          <div className="qtr-rise">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-cyan-400" />
              <span className="qtr-label text-cyan-300">Custom PCs &middot; Hardware &middot; Repairs</span>
            </div>

            <h1 className="mt-5 font-heading text-[36px] font-extrabold leading-[1.06] tracking-[-0.025em] text-white sm:text-[50px] lg:text-[56px]">
              Gaming PCs specified properly.
              <span className="block text-cyan-300">Repairs done honestly.</span>
            </h1>

            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-slate-300 sm:text-[16.5px]">
              Qwick Tech Repairs builds custom systems part by part, sells verified prebuilt gaming PCs, and repairs
              desktops and laptops. Every build is assembled and tested before it leaves the bench.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="/builder"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('builder');
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-blue px-6 text-[13.5px] font-semibold text-white transition hover:bg-sky-500"
              >
                <span>Build Your PC</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="/prebuilt-pcs"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('prebuilt-pcs');
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-600 bg-navy-800/70 px-6 text-[13.5px] font-semibold text-white transition hover:border-slate-400 hover:bg-navy-800"
              >
                <MonitorPlay className="w-4 h-4 text-slate-300" />
                <span>Explore Gaming PCs</span>
              </a>

              <a
                href="/repairs#request"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('repairs', { scrollTo: 'request' });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 px-4 text-[13.5px] font-semibold text-cyan-300 transition hover:text-white"
              >
                <Wrench className="w-4 h-4" />
                <span>Book a Repair</span>
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-navy-700 pt-7">
              <div>
                <Cpu className="w-[15px] h-[15px] text-cyan-400" />
                <p className="mt-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Custom builds
                </p>
                <p className="mt-1 font-heading text-[13.5px] font-bold text-white">Part by part</p>
              </div>
              <div>
                <ShieldCheck className="w-[15px] h-[15px] text-cyan-400" />
                <p className="mt-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Assembly fee
                </p>
                <p className="mt-1 font-heading text-[13.5px] font-bold text-white">A$150 once</p>
              </div>
              <div>
                <Wrench className="w-[15px] h-[15px] text-cyan-400" />
                <p className="mt-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Repairs
                </p>
                <p className="mt-1 font-heading text-[13.5px] font-bold text-white">Quoted first</p>
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <a
              href="/prebuilt-pcs/nitroforge-x3060"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('prebuilt-detail', { slug: 'nitroforge-x3060' });
              }}
              className="group relative block overflow-hidden rounded-md border border-navy-700 bg-navy-900"
            >
              <div className="aspect-[4/4.3] w-full overflow-hidden">
                <img
                  src="https://media.base44.com/images/public/6ad82e9d98c7f6fdc12bb981/7f3ddab4c_generated_78c9a3ed.png"
                  alt="NitroForge X3060 custom gaming PC"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                <div className="flex items-center justify-between gap-4 rounded-md border border-navy-700 bg-navy/92 px-4 py-3.5 backdrop-blur-xs">
                  <div>
                    <p className="qtr-label text-cyan-300">Prebuilt range</p>
                    <p className="mt-1 font-heading text-[15px] font-extrabold tracking-wide text-white">
                      NITROFORGE X3060
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-cyan-300 transition group-hover:text-white">
                    View build <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 2. CAPABILITIES STRIP */}
      <section className="border-b border-slate-200 bg-white">
        <div className="qtr-wrap grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          <div className="px-0 py-8 sm:px-6 sm:first:pl-0 lg:py-10">
            <Cpu className="w-5 h-5 text-brand-blue" strokeWidth={1.8} />
            <h2 className="mt-4 font-heading text-[15.5px] font-bold text-navy">Custom PC builds</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              Choose every part yourself. We check compatibility, assemble it and test it before collection.
            </p>
            <a
              href="/builder"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('builder');
              }}
              className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-blue transition hover:text-navy"
            >
              Open the builder <ArrowRight className="w-[13px] h-[13px]" />
            </a>
          </div>

          <div className="px-0 py-8 sm:px-6 sm:first:pl-0 lg:py-10">
            <MonitorPlay className="w-5 h-5 text-brand-blue" strokeWidth={1.8} />
            <h2 className="mt-4 font-heading text-[15.5px] font-bold text-navy">Prebuilt gaming PCs</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              Systems we've specified, assembled and priced. Full component lists, no mystery parts.
            </p>
            <a
              href="/prebuilt-pcs"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('prebuilt-pcs');
              }}
              className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-blue transition hover:text-navy"
            >
              See the range <ArrowRight className="w-[13px] h-[13px]" />
            </a>
          </div>

          <div className="px-0 py-8 sm:px-6 sm:first:pl-0 lg:py-10">
            <MemoryStick className="w-5 h-5 text-brand-blue" strokeWidth={1.8} />
            <h2 className="mt-4 font-heading text-[15.5px] font-bold text-navy">Components</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              CPUs, graphics cards, memory, storage and peripherals with the technical detail that matters.
            </p>
            <a
              href="/components"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('components');
              }}
              className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-blue transition hover:text-navy"
            >
              Browse parts <ArrowRight className="w-[13px] h-[13px]" />
            </a>
          </div>

          <div className="px-0 py-8 sm:px-6 sm:first:pl-0 lg:py-10">
            <Wrench className="w-5 h-5 text-brand-blue" strokeWidth={1.8} />
            <h2 className="mt-4 font-heading text-[15.5px] font-bold text-navy">Repairs &amp; upgrades</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              Diagnostics and hardware repairs, quoted before any work starts. Track your job online.
            </p>
            <a
              href="/repairs"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('repairs');
              }}
              className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-blue transition hover:text-navy"
            >
              Book a repair <ArrowRight className="w-[13px] h-[13px]" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. PREBUILT SYSTEMS */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="qtr-wrap">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-brand-blue" />
                <span className="qtr-label text-brand-blue">Prebuilt systems</span>
              </div>
              <h2 className="mt-4 text-[30px] font-extrabold leading-[1.12] text-navy sm:text-[40px]">
                Systems we've specified and built
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
                Each prebuilt is listed with its full component breakdown. Where a price is still provisional we say
                so — we don't publish a number we haven't confirmed.
              </p>
            </div>
            <div className="shrink-0 self-start sm:self-center">
              <a
                href="/prebuilt-pcs"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('prebuilt-pcs');
                }}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 px-5 text-[13px] font-semibold text-navy transition hover:border-slate-400 hover:bg-slate-50"
              >
                All prebuilt PCs <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {THREE_CUSTOM_PCS.map((pc) => (
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
        </div>
      </section>

      {/* 4. CUSTOM PC BUILDER */}
      <section className="border-b border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="qtr-wrap grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src="https://media.base44.com/images/public/6ad82e9d98c7f6fdc12bb981/e37660143_generated_13504991.png"
                alt="PC components laid out for a custom build: processor, memory, graphics card and motherboard"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-brand-blue" />
              <span className="qtr-label text-brand-blue">Custom PC builder</span>
            </div>
            <h2 className="mt-4 text-[30px] font-extrabold leading-[1.12] text-navy sm:text-[40px]">
              Build it part by part, with the checks done for you
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
              The builder works the way a technician would: choose a processor, then a motherboard that actually takes
              it, memory that matches the board, and a case the graphics card will fit inside. Anything we can't
              confirm is flagged as unverified rather than assumed to be fine.
            </p>

            <ol className="mt-8 space-y-5">
              <li className="flex gap-4">
                <span className="mt-0.5 font-mono text-[12px] font-semibold text-brand-blue">01</span>
                <div>
                  <p className="font-heading text-[14.5px] font-bold text-navy">Pick your parts</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                    Filter by budget, socket, memory type or graphics card and see the price change as you go.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-0.5 font-mono text-[12px] font-semibold text-brand-blue">02</span>
                <div>
                  <p className="font-heading text-[14.5px] font-bold text-navy">We check the fit</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                    Every selection is tested against the others — socket, clearance, power and connectors.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-0.5 font-mono text-[12px] font-semibold text-brand-blue">03</span>
                <div>
                  <p className="font-heading text-[14.5px] font-bold text-navy">We assemble and test</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                    Cable management, BIOS configuration and a stress test before the system is handed over.
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-8 flex flex-wrap gap-1.5">
              {[
                'CPU',
                'CPU Cooler',
                'Motherboard',
                'Memory',
                'Graphics Card',
                'Storage',
                'Power Supply',
                'Case'
              ].map((pill) => (
                <span
                  key={pill}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/builder"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('builder');
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-navy px-6 text-[13.5px] font-semibold text-white transition hover:bg-navy-800"
              >
                Start a build <ArrowRight className="w-[15px] h-[15px]" />
              </a>
              <p className="flex items-center gap-2 text-[12.5px] text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                A$150 assembly and testing, applied once
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REPAIR SERVICES */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="qtr-wrap">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-brand-blue" />
                <span className="qtr-label text-brand-blue">Repair services</span>
              </div>
              <h2 className="mt-4 text-[30px] font-extrabold leading-[1.12] text-navy sm:text-[40px]">
                Fault-finding before guesswork
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
                Every repair starts with a diagnosis and a quoted price. We won't replace parts hoping something works,
                and we won't promise a repair or a data recovery outcome before we've looked at the machine.
              </p>
            </div>
            <div className="shrink-0 self-start sm:self-center">
              <a
                href="/repairs#request"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('repairs', { scrollTo: 'request' });
                }}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-blue px-5 text-[13px] font-semibold text-white transition hover:bg-sky-500"
              >
                Request a repair <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {REPAIR_SERVICE_LINKS.map((item) => (
              <a
                key={item.id}
                href={`/repairs#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('repairs', { scrollTo: item.id });
                }}
                className="group flex items-start gap-3 border-t border-slate-200 py-4 transition hover:border-brand-blue"
              >
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
                <span>
                  <span className="block font-heading text-[13.5px] font-bold text-navy group-hover:text-brand-blue">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-slate-600">{item.desc}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6. REPAIR TRACKING BAND */}
      <section className="border-b border-navy-700 bg-navy py-12 sm:py-14">
        <div className="qtr-wrap grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-cyan-400" />
              <span className="qtr-label text-cyan-300">Repair tracking</span>
            </div>
            <h2 className="mt-4 text-[26px] font-extrabold leading-tight text-white sm:text-[32px]">
              Already lodged a repair?
            </h2>
            <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-slate-300">
              Enter the reference from your confirmation to see the current status and any update our technician has
              published for you.
            </p>
          </div>

          <form onSubmit={handleTrackSubmit} className="w-full">
            <label
              htmlFor="track-reference"
              className="mb-2 block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-400"
            >
              Repair reference
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="track-reference"
                placeholder="QTR-XXXX-XXXXX"
                value={trackRef}
                onChange={(e) => setTrackRef(e.target.value)}
                className="h-12 flex-1 rounded-md border border-slate-600 bg-navy-800 px-4 font-mono text-[14px] uppercase tracking-wider text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-cyan-400 px-6 text-[13.5px] font-bold text-navy transition hover:bg-cyan-300"
              >
                <Search className="w-[15px] h-[15px]" />
                Track
              </button>
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Status updates are published by our technicians only.
            </p>
          </form>
        </div>
      </section>

      {/* 7. REVIEWS SECTION */}
      <section id="reviews" className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="qtr-wrap">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-brand-blue" />
                <span className="qtr-label text-brand-blue">Reviews</span>
              </div>
              <h2 className="mt-4 text-[32px] font-extrabold leading-[1.1] text-[#164E63] sm:text-[44px]">
                What Our Customers Say
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-[13px] font-semibold text-navy shadow-sm transition-colors hover:bg-slate-50"
            >
              <MessageSquare className="w-[15px] h-[15px] text-brand-blue" />
              Leave a Review
            </button>
          </div>

          <div className="mt-10">
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-brand-blue">
                  <Star className="w-[22px] h-[22px]" strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 font-heading text-[19px] font-bold text-navy">
                  No reviews published yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-slate-600">
                  We've only just opened the review book. If you've bought a PC or had a repair with QTR, yours would be
                  the first one here.
                </p>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-[13px] font-semibold text-white shadow transition-colors hover:bg-navy-800"
                >
                  <MessageSquare className="w-[15px] h-[15px]" />
                  Write the first review
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-6"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(rev.rating || 5)].map((_, idx) => (
                            <Star key={idx} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[11.5px] text-slate-500">{rev.date}</span>
                      </div>
                      <p className="mt-4 text-[13.5px] leading-relaxed text-slate-700">"{rev.text}"</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[12px]">
                      <span className="font-heading font-bold text-navy">{rev.name}</span>
                      {rev.serviceType && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {rev.serviceType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={loadReviews}
      />
    </div>
  );
};

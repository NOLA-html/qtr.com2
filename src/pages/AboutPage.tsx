import React from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  MonitorPlay,
  Wrench
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
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
              <span className="text-slate-700">About</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">About QTR</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            A computer repair and retail service, run like a workshop
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Qwick Tech Repairs builds gaming PCs, sells computer hardware and repairs desktops and laptops. We're a
            service of AB Services, an Australian technology service business.
          </p>
        </div>
      </div>

      <section className="border-b border-slate-200 bg-white py-14 sm:py-16">
        <div className="qtr-wrap grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <h2 className="font-heading text-[26px] font-bold leading-tight text-navy sm:text-[32px]">
              One business, two sides of the same bench
            </h2>
            <div className="mt-5 space-y-4 text-[14.5px] leading-[1.8] text-slate-700">
              <p>
                AB Services is the technology service business. Qwick Tech Repairs — QTR — is the part of it that sells
                and builds computers, and repairs them. Keeping the two names connected matters: the same people who
                assemble a system are the people who service it afterwards.
              </p>
              <p>
                That's deliberate. A prebuilt PC is only as good as the workshop behind it, and a repair is only worth
                paying for if someone can explain what went wrong in language you can follow.
              </p>
              <p>
                We work on desktops, laptops and gaming systems, build custom machines from parts you choose, and
                supply components individually. Where we don't hold verified information — a confirmed price, a
                compatibility data point, a frame rate we've measured ourselves — we say so rather than filling the gap.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/builder"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('builder');
                }}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800"
              >
                Build a PC <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('contact');
                }}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 px-5 text-[13px] font-semibold text-navy hover:bg-slate-50"
              >
                Contact the team
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src="https://media.base44.com/images/public/6ad82e9d98c7f6fdc12bb981/260f29ece_generated_edef5682.png"
                alt="The QTR repair workshop bench with tools, an open PC case and diagnostic equipment"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-14 sm:py-16">
        <div className="qtr-wrap">
          <h2 className="font-heading text-[24px] font-bold text-navy">How we work</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-white p-5">
              <span className="font-mono text-[11px] font-semibold text-brand-blue">01</span>
              <h3 className="mt-2 font-heading text-[14.5px] font-bold text-navy">We verify before we publish</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">
                Component prices are marked as estimates until a supplier price has actually been checked. Where a full
                system price is still a target, it's labelled that way instead of being presented as a retail price.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-5">
              <span className="font-mono text-[11px] font-semibold text-brand-blue">02</span>
              <h3 className="mt-2 font-heading text-[14.5px] font-bold text-navy">We diagnose before we quote</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">
                Repair work starts with an assessment of what has actually failed. You get a quoted price before any
                part is ordered or any labour is charged.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-5">
              <span className="font-mono text-[11px] font-semibold text-brand-blue">03</span>
              <h3 className="mt-2 font-heading text-[14.5px] font-bold text-navy">We don't guarantee outcomes</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">
                Not every fault is repairable and not every drive can be read. If a repair or a data recovery isn't
                going to work, we'd rather tell you than take the job.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-14 sm:py-16">
        <div className="qtr-wrap">
          <h2 className="font-heading text-[24px] font-bold text-navy">What we do</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <a
              href="/builder"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('builder');
              }}
              className="group rounded-md border border-slate-200 p-5 transition hover:border-brand-blue hover:shadow-card"
            >
              <Cpu className="w-[19px] h-[19px] text-brand-blue" strokeWidth={1.7} />
              <h3 className="mt-3 font-heading text-[14.5px] font-bold text-navy group-hover:text-brand-blue">
                Custom PC builds
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                Specified part by part with compatibility checks on every selection.
              </p>
            </a>

            <a
              href="/prebuilt-pcs"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('prebuilt-pcs');
              }}
              className="group rounded-md border border-slate-200 p-5 transition hover:border-brand-blue hover:shadow-card"
            >
              <MonitorPlay className="w-[19px] h-[19px] text-brand-blue" strokeWidth={1.7} />
              <h3 className="mt-3 font-heading text-[14.5px] font-bold text-navy group-hover:text-brand-blue">
                Prebuilt systems
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                Configurations we assemble, test and list with their full component breakdown.
              </p>
            </a>

            <a
              href="/repairs"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('repairs');
              }}
              className="group rounded-md border border-slate-200 p-5 transition hover:border-brand-blue hover:shadow-card"
            >
              <Wrench className="w-[19px] h-[19px] text-brand-blue" strokeWidth={1.7} />
              <h3 className="mt-3 font-heading text-[14.5px] font-bold text-navy group-hover:text-brand-blue">
                Repairs and upgrades
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                Diagnostics, hardware repair, storage and memory upgrades, OS work.
              </p>
            </a>
          </div>
        </div>
      </section>

      <section className="bg-navy py-14 sm:py-16">
        <div className="qtr-wrap grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-cyan-400" />
              <span className="qtr-label text-cyan-300">Business details</span>
            </div>
            <h2 className="mt-4 text-[24px] font-bold text-white sm:text-[28px]">
              Registered details are published once verified
            </h2>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-slate-300">
              ABN, trading address and service hours appear on this site only after they've been confirmed and entered by
              QTR through the business settings. We don't display placeholder contact information, and we don't advertise
              certifications or warranty terms we haven't agreed to in writing.
            </p>
            <ul className="mt-5 space-y-2">
              <li className="flex items-center gap-2 text-[13px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                No invented statistics or testimonials
              </li>
              <li className="flex items-center gap-2 text-[13px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                No fabricated review scores
              </li>
              <li className="flex items-center gap-2 text-[13px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                No claims of live market pricing
              </li>
            </ul>
          </div>

          <div className="rounded-md border border-navy-700 bg-navy-800 p-5">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <p className="mt-3 font-heading text-[14px] font-bold text-white">Qwick Tech Repairs</p>
            <p className="mt-1 text-[12.5px] text-slate-400">A service of AB Services</p>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('contact');
              }}
              className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-cyan-300 hover:text-white"
            >
              Ask us a question <ArrowRight className="w-[13px] h-[13px]" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

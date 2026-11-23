import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Lock,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AddToCalendarButton } from '../components/AddToCalendarButton.tsx';

interface RepairsPageProps {
  scrollToId?: string;
  initialCategory?: string;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
  onNavigateToTrack?: (code: string) => void;
}

const SERVICES = [
  {
    id: 'diagnostics',
    title: 'Diagnostics',
    summary: 'A structured fault-finding assessment to establish what has actually failed.',
    detail:
      "We test power delivery, storage health, memory integrity, thermal behaviour and Windows event history, then explain what we found in plain English. No repair work starts without your approval of the quoted price."
  },
  {
    id: 'hardware-repair',
    title: 'Hardware repairs',
    summary: 'Component-level replacement for failing parts — power supplies, storage, memory, cooling.',
    detail:
      'Repairs are quoted after diagnosis. Replacement parts are priced separately and confirmed with you before ordering. We do not guarantee that every fault is repairable.'
  },
  {
    id: 'upgrades',
    title: 'RAM and SSD upgrades',
    summary: 'More memory and faster storage for machines that have become slow.',
    detail:
      "We confirm the exact memory generation, slot count and drive interface your machine supports before recommending parts, so you don't pay for something that won't fit."
  },
  {
    id: 'os-install',
    title: 'Operating system installation',
    summary: 'Clean Windows installation with drivers, updates and your data handled carefully.',
    detail:
      'Where data can be backed up first, we will ask whether you want that done. A clean install erases the drive — we will never proceed without written confirmation.'
  },
  {
    id: 'windows-troubleshooting',
    title: 'Windows troubleshooting',
    summary: 'Startup failures, blue screens, driver conflicts and stubborn software faults.',
    detail:
      'We work through the fault methodically and tell you when a clean install is the more economical option than further troubleshooting.'
  },
  {
    id: 'migration',
    title: 'Data migration',
    summary: 'Moving your files, profile and installed applications to a new drive or machine.',
    detail:
      'Migration is attempted, not guaranteed — drives that are already failing may not be readable. We will tell you honestly if a drive is too unstable to work with.'
  },
  {
    id: 'data-recovery-assessment',
    title: 'Data recovery assessment',
    summary: 'An assessment of whether data on a failing drive can be retrieved.',
    detail:
      'This is an assessment service, not a guarantee of recovery. Where a drive needs cleanroom work we will say so rather than attempt something that risks the data further.'
  },
  {
    id: 'assembly',
    title: 'PC assembly',
    summary: 'Professional assembly and testing of parts you have supplied yourself.',
    detail:
      'Assembly includes cable management, a POST and stress test, and BIOS configuration. Parts you supply are not covered by any warranty from us.'
  },
  {
    id: 'gaming-troubleshooting',
    title: 'Gaming performance troubleshooting',
    summary: 'Low frame rates, stutter, overheating and instability under load.',
    detail:
      'We measure temperatures and clocks under load, check driver and BIOS configuration, and identify whether the limit is thermal, power, driver or hardware related.'
  }
];

export const RepairsPage: React.FC<RepairsPageProps> = ({
  scrollToId,
  initialCategory,
  onNavigate,
  onNavigateToTrack
}) => {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [model, setModel] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [serviceRequired, setServiceRequired] = useState(initialCategory || '');
  const [serviceSpeed, setServiceSpeed] = useState<'Regular' | 'Express'>('Regular');
  const [issueDescription, setIssueDescription] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedSummary, setSubmittedSummary] = useState<any | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setServiceRequired(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (scrollToId) {
      const el = document.getElementById(scrollToId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      }
    }
  }, [scrollToId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a contact number.');
      return;
    }
    if (!deviceType) {
      setError('Please choose a device type.');
      return;
    }
    if (!serviceRequired) {
      setError('Please choose a service required.');
      return;
    }
    if (!issueDescription.trim()) {
      setError("Please describe what's happening with the machine.");
      return;
    }
    if (!agreedDisclaimer) {
      setError('Please confirm you understand repairs and diagnoses are quoted before work begins.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          deviceType,
          manufacturerAndModel: model.trim() || 'Not specified',
          operatingSystem: operatingSystem || 'Not sure',
          repairCategory: serviceRequired,
          problemDescription: issueDescription.trim(),
          serviceSpeed,
          turnsOn: 'Yes',
          importantDataAffected: 'Not sure',
          additionalNotes: attachedFileName ? `Photo attached: ${attachedFileName}` : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not submit repair request.');
      }

      setSubmittedRef(data.referenceNumber);
      setSubmittedSummary({
        referenceNumber: data.referenceNumber,
        deviceType,
        serviceRequired,
        serviceSpeed,
        model: model.trim() || 'Not specified'
      });
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header Banner */}
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
                onNavigate?.('home');
              }}
              className="hover:text-brand-blue"
            >
              Home
            </a>
            <span className="flex items-center gap-1">
              <ChevronRight className="w-[11px] h-[11px] text-slate-400" />
              <span className="text-slate-700">Repair Services</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Repair services</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            Computer repairs, diagnosed properly
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Desktops, laptops and gaming systems — diagnosed, quoted and then repaired. If you've already lodged a job,
            you can track its progress at any time.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#request"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-blue px-5 text-[13px] font-semibold text-white transition hover:bg-sky-500"
            >
              Request a repair <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="/track"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('track');
              }}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 px-5 text-[13px] font-semibold text-navy transition hover:bg-slate-50"
            >
              Track an existing repair
            </a>
          </div>
        </div>
      </div>

      {/* What We Work On */}
      <section className="border-b border-slate-200 bg-white py-14 sm:py-16">
        <div className="qtr-wrap">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            <div>
              <h2 className="font-heading text-[24px] font-bold text-navy">What we work on</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {SERVICES.map((svc) => (
                  <div key={svc.id} id={svc.id} className="scroll-mt-24 rounded-md border border-slate-200 p-5">
                    <h3 className="font-heading text-[14px] font-bold text-navy">{svc.title}</h3>
                    <p className="mt-1.5 text-[12.5px] font-medium text-slate-700">{svc.summary}</p>
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-600">{svc.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-[84px]">
              <div className="overflow-hidden rounded-md border border-slate-200">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <img
                    src="https://media.base44.com/images/public/6ad82e9d98c7f6fdc12bb981/ed42a9a1d_generated_36f6e178.png"
                    alt="Precision screwdriver working on a motherboard at the QTR repair bench"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-5">
                <div className="flex gap-3">
                  <Clock className="mt-0.5 w-4 h-4 shrink-0 text-brand-blue" />
                  <div>
                    <p className="text-[12.5px] font-bold text-navy">Quoted before work starts</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                      We diagnose first, then quote. Nothing is replaced or charged until you've approved the price.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 w-4 h-4 shrink-0 text-brand-blue" />
                  <div>
                    <p className="text-[12.5px] font-bold text-navy">No promised outcomes</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                      Some faults can't be repaired and some drives can't be read. We'll tell you plainly rather than
                      guess.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Lock className="mt-0.5 w-4 h-4 shrink-0 text-brand-blue" />
                  <div>
                    <p className="text-[12.5px] font-bold text-navy">Your data stays yours</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                      We don't ask for passwords through this site. If testing needs access, we'll arrange it with you
                      directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section id="request" className="scroll-mt-20 bg-slate-50 py-14 sm:py-16">
        <div className="qtr-wrap">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            {submittedRef ? (
              <div className="rounded-md border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                  <div>
                    <p className="qtr-label text-emerald-700">Repair request received</p>
                    <h3 className="mt-1 font-heading text-[22px] font-bold text-navy">
                      Reference: <span className="font-mono">{submittedRef}</span>
                    </h3>
                    <p className="mt-1.5 text-[13px] text-slate-600">
                      Save your reference code to track diagnostic and quote progress online at any time.
                    </p>
                  </div>
                </div>

                {submittedSummary && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-[12.5px] space-y-1.5 text-slate-700">
                    <div>
                      <strong>Device:</strong> {submittedSummary.deviceType} ({submittedSummary.model})
                    </div>
                    <div>
                      <strong>Service:</strong> {submittedSummary.serviceRequired}
                    </div>
                    <div>
                      <strong>Turnaround speed:</strong> {submittedSummary.serviceSpeed}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigateToTrack?.(submittedRef)}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800"
                  >
                    Track this repair <ArrowRight className="w-4 h-4" />
                  </button>

                  <AddToCalendarButton
                    title={`QTR Repair Drop-off [${submittedRef}]`}
                    description={`Repair booking for ${submittedSummary?.deviceType || 'Computer'} (${submittedSummary?.serviceRequired || ''}). Reference: ${submittedRef}.`}
                    daysFromNow={1}
                    buttonText="Add reminder to Google Calendar"
                    className="h-11 rounded-md border border-slate-300 bg-white px-4 text-[12.5px] font-semibold text-navy hover:bg-slate-50"
                  />
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-md border border-slate-200 bg-white p-6 sm:p-8"
              >
                <h3 className="font-heading text-[19px] font-bold text-navy">Request a repair</h3>
                <p className="mt-1.5 text-[13px] text-slate-600">
                  Tell us what's happening with the machine. Everything marked required helps us quote accurately.
                </p>

                {error && (
                  <div className="mt-5 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="r-name" className="text-[12.5px] font-semibold text-slate-700">
                      Full name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="r-name"
                      autoComplete="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="r-email" className="text-[12.5px] font-semibold text-slate-700">
                      Email <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="r-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="r-phone" className="text-[12.5px] font-semibold text-slate-700">
                      Contact number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="r-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="04XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="r-device" className="text-[12.5px] font-semibold text-slate-700">
                      Device type <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="r-device"
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy focus:border-brand-blue focus:outline-none"
                    >
                      <option value="">Choose device type</option>
                      <option value="Desktop PC">Desktop PC</option>
                      <option value="Laptop">Laptop</option>
                      <option value="All-in-one">All-in-one</option>
                      <option value="Gaming console">Gaming console</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="r-model" className="text-[12.5px] font-semibold text-slate-700">
                      Make and model
                    </label>
                    <input
                      id="r-model"
                      placeholder="e.g. HP Pavilion 15, or custom desktop"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="r-os" className="text-[12.5px] font-semibold text-slate-700">
                      Operating system
                    </label>
                    <select
                      id="r-os"
                      value={operatingSystem}
                      onChange={(e) => setOperatingSystem(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy focus:border-brand-blue focus:outline-none"
                    >
                      <option value="">Choose operating system</option>
                      <option value="Windows 11">Windows 11</option>
                      <option value="Windows 10">Windows 10</option>
                      <option value="macOS">macOS</option>
                      <option value="Linux">Linux</option>
                      <option value="ChromeOS">ChromeOS</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="r-service" className="text-[12.5px] font-semibold text-slate-700">
                      Service required <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="r-service"
                      value={serviceRequired}
                      onChange={(e) => setServiceRequired(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy focus:border-brand-blue focus:outline-none"
                    >
                      <option value="">Choose a service</option>
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="r-speed" className="text-[12.5px] font-semibold text-slate-700">
                      Turnaround speed
                    </label>
                    <select
                      id="r-speed"
                      value={serviceSpeed}
                      onChange={(e) => setServiceSpeed(e.target.value as 'Regular' | 'Express')}
                      className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[13.5px] text-navy focus:border-brand-blue focus:outline-none"
                    >
                      <option value="Regular">Regular queue (Free)</option>
                      <option value="Express">Express priority (A$15.00 fee)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="r-issue" className="text-[12.5px] font-semibold text-slate-700">
                      What's happening? <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      id="r-issue"
                      rows={5}
                      maxLength={2000}
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="When did it start, what happens, and anything you've already tried. Please don't include passwords."
                      className="flex w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-[13.5px] text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                    />
                    <p className="text-right text-[11px] text-slate-500">{issueDescription.length}/2000</p>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="r-file" className="text-[12.5px] font-semibold text-slate-700">
                      Photo of the fault <span className="font-normal text-slate-500">(optional)</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label
                        htmlFor="r-file"
                        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 text-[12.5px] font-semibold text-navy hover:bg-slate-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Choose file
                      </label>
                      <span className="min-w-0 truncate text-[12px] text-slate-500">
                        {attachedFileName || 'JPG, PNG or PDF up to 8 MB — stored privately'}
                      </span>
                    </div>
                    <input
                      id="r-file"
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                      onChange={(e) => setAttachedFileName(e.target.files?.[0]?.name || '')}
                    />
                  </div>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreedDisclaimer}
                    onChange={(e) => setAgreedDisclaimer(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-sky-500"
                  />
                  <span>
                    I understand a repair, a successful diagnosis and any data recovery are not guaranteed, and that work
                    only begins once I've approved a quoted price.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 text-[13.5px] font-semibold text-white shadow transition-colors hover:bg-sky-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit repair request
                </button>
                <p className="mt-3 text-center text-[11px] text-slate-500">
                  You'll receive a unique reference immediately after submitting.
                </p>
              </form>
            )}

            <aside className="space-y-5 lg:sticky lg:top-[84px]">
              <div className="rounded-md border border-slate-200 bg-white p-5">
                <h3 className="font-heading text-[15px] font-bold text-navy">What happens after you submit</h3>
                <ol className="mt-4 space-y-4">
                  <li className="flex gap-3">
                    <span className="font-mono text-[11px] font-semibold text-brand-blue">01</span>
                    <div>
                      <p className="text-[12.5px] font-semibold text-navy">Reference issued</p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                        You'll get a QTR reference immediately — save it to track progress.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[11px] font-semibold text-brand-blue">02</span>
                    <div>
                      <p className="text-[12.5px] font-semibold text-navy">Bench assessment</p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                        Once dropped off or scheduled, we run structured diagnostics to pinpoint the fault.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[11px] font-semibold text-brand-blue">03</span>
                    <div>
                      <p className="text-[12.5px] font-semibold text-navy">Plain-English quote</p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                        Nothing is ordered or billed until you've approved the repair quote.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

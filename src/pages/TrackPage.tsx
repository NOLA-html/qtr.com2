import React, { useState, useEffect } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Wrench,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface TrackPageProps {
  initialCode?: string;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export const TrackPage: React.FC<TrackPageProps> = ({ initialCode = '', onNavigate }) => {
  const [lookupQuery, setLookupQuery] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [recordData, setRecordData] = useState<any | null>(null);
  const [recordType, setRecordType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performLookup = async (code: string) => {
    const q = code.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setRecordData(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No record found with that reference code.');
      }
      setRecordData(data.record);
      setRecordType(data.type);
    } catch (err: any) {
      setError(err.message || 'Service tracking lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setLookupQuery(initialCode);
      performLookup(initialCode);
    }
  }, [initialCode]);

  const repairStages = [
    'Received',
    'Under Review',
    'Assessment & Quote',
    'In Progress',
    'Ready for Pickup',
    'Completed'
  ];

  const orderStages = [
    'Order Placed',
    'Parts Ordered',
    'In Assembly',
    'Bench Testing',
    'Ready for Dispatch',
    'Completed'
  ];

  const activeStages = recordType === 'pc_order' ? orderStages : repairStages;

  const getStageIndex = (status: string) => {
    const idx = activeStages.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div>
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="qtr-wrap py-10 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-1 text-[11.5px] text-slate-500"
          >
            <a
              href="/"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('home');
                }
              }}
              className="hover:text-brand-blue"
            >
              Home
            </a>
            <span className="flex items-center gap-1">
              <ChevronRight className="w-[11px] h-[11px] text-slate-400" />
              <span className="text-slate-700">Track Repair</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Repair tracking</span>
          </div>

          <h1 className="mt-4 max-w-3xl font-heading text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            Track your repair
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Enter the reference from your confirmation email. This page shows the customer-safe status
            only — never your personal details or technician notes.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="qtr-wrap py-10 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performLookup(lookupQuery);
            }}
            className="rounded-md border border-slate-200 bg-white p-5 sm:p-6"
          >
            <label htmlFor="reference" className="text-[12.5px] font-semibold text-slate-700">
              Repair reference
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="reference"
                type="text"
                required
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="QTR-XXXX-XXXXX"
                className="h-12 flex-1 rounded-md border border-slate-300 px-4 font-mono text-[15px] uppercase tracking-wider text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-navy px-6 text-[13.5px] font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-[15px] h-[15px] animate-spin" /> : <Search className="w-[15px] h-[15px]" />}
                <span>Find my repair</span>
              </button>
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <ShieldCheck className="w-3 h-3 shrink-0 text-brand-blue" />
              References are long and randomly generated so nobody can guess another customer&apos;s ticket.
            </p>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Empty state vs Found record */}
          {!recordData ? (
            <div className="mt-6">
              <div className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <p className="text-[13px] text-slate-600">
                  Enter a reference above to see where your repair is up to.
                </p>
                <a
                  href="/repairs#request"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('repairs', { scrollTo: 'request' });
                    }
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-blue hover:text-navy"
                >
                  <ArrowLeft className="w-[13px] h-[13px]" />
                  <span>Haven&apos;t lodged a repair yet?</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-md border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-blue">
                      {recordType === 'repair'
                        ? 'Repair Ticket'
                        : recordType === 'upgrade'
                        ? 'Upgrade Request'
                        : recordType === 'pc_order'
                        ? 'PC Order Enquiry'
                        : 'Custom PC Quote'}
                    </span>
                    <span className="font-mono text-[12.5px] text-slate-500">
                      {recordData.referenceNumber}
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-heading text-[20px] font-bold text-navy">
                    {recordData.manufacturerAndModel || recordData.pcName || recordData.prebuiltName || 'Workshop Service'}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Logged{' '}
                    {new Date(recordData.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Current stage
                  </div>
                  <div className="mt-0.5 font-heading text-[18px] font-extrabold text-brand-blue">
                    {recordData.status}
                  </div>
                  <div className="text-[12px] text-slate-500">
                    Service: <strong className="text-navy">{recordData.repairCategory || recordData.buildService?.name || recordData.serviceSpeed || 'Standard'}</strong>
                  </div>
                </div>
              </div>

              {/* 6-Stage Progress Pipeline */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Workflow Status
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  {activeStages.map((stage, i) => {
                    const currentIdx = getStageIndex(recordData.status);
                    const isCurrent = i === currentIdx;
                    const isDone = i < currentIdx;

                    return (
                      <div
                        key={stage}
                        className={`rounded-md border p-3 text-center transition-colors ${
                          isCurrent
                            ? 'border-navy bg-navy text-white'
                            : isDone
                            ? 'border-sky-200 bg-sky-50 text-navy'
                            : 'border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">
                          {isDone && <CheckCircle2 className="w-3 h-3 text-brand-blue" />}
                          <span>0{i + 1}</span>
                        </div>
                        <div className="mt-1 text-[11.5px] font-semibold leading-tight">{stage}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safe Service Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-[12.5px]">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Service Type
                  </span>
                  <span className="mt-0.5 block font-semibold text-navy">
                    {recordData.repairCategory || recordData.intendedUse || recordData.buildService?.name || 'Custom PC'}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Priority / Delivery
                  </span>
                  <span className="mt-0.5 block font-semibold text-navy">
                    {recordData.deliveryMethod?.name || recordData.serviceSpeed || 'Regular'}
                  </span>
                </div>
              </div>

              {/* Workshop info note */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[12px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Qwick Tech Repairs · Mon–Sat, 9am–8pm</span>
                </span>
                <span>25 Emma St Caulfield South 3162 · 0493 711 832</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

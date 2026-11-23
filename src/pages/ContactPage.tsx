import React, { useState } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  MapPin,
  Clock,
  Copy,
  Check
} from 'lucide-react';

interface ContactPageProps {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText('0493 711 832');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText('25 Emma St Caulfield South 3162');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email address, and message.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim() || 'General Enquiry',
          message: message.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit message.');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Error sending message. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
              <span className="text-slate-700">Contact</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Contact</span>
          </div>

          <h1 className="mt-4 max-w-3xl font-heading text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            Talk to Qwick Tech Repairs
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Questions about a build, a component, a repair or an order enquiry — send a message and
            we&apos;ll get back to you.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="qtr-wrap grid gap-10 py-10 sm:py-12 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          {success ? (
            <div className="rounded-md border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h2 className="font-heading text-[18px] font-bold text-navy">Message sent</h2>
              <p className="text-[13px] text-slate-600 max-w-md mx-auto">
                Thank you for getting in touch. We&apos;ve recorded your message and will reply via
                phone or email shortly.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-md border border-slate-200 bg-white p-6 sm:p-8"
              noValidate
            >
              <h2 className="font-heading text-[17px] font-bold text-navy">Send a message</h2>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="m-name" className="text-[12.5px] font-semibold text-slate-700">
                    Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="m-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="m-email" className="text-[12.5px] font-semibold text-slate-700">
                    Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="m-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="m-phone" className="text-[12.5px] font-semibold text-slate-700">
                    Phone <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input
                    id="m-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="m-subject" className="text-[12.5px] font-semibold text-slate-700">
                    Subject
                  </label>
                  <input
                    id="m-subject"
                    type="text"
                    placeholder="What's this about?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="m-message" className="text-[12.5px] font-semibold text-slate-700">
                    Message <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="m-message"
                    rows={6}
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need help with. Please don't include passwords."
                    className="flex min-h-[60px] w-full resize-none rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 py-2 text-[13.5px] font-semibold text-white shadow transition-colors hover:bg-navy-800 disabled:pointer-events-none disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Send message</span>
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3 h-3 shrink-0 text-brand-blue" />
                Your message is only visible to QTR administrators.
              </p>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-heading text-[14px] font-bold text-navy">Business details</h2>
            <p className="text-[12.5px] leading-relaxed text-slate-600">
              Our workshop is a local Melbourne computer building and repair service operating under
              AB Services. Include a contact number in the form or reach out directly below.
            </p>

            <div className="space-y-3 border-t border-slate-100 pt-3 text-[12.5px]">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <a href="tel:0493711832" className="font-semibold text-navy hover:text-brand-blue">
                    0493 711 832
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="ml-2 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-navy"
                  >
                    {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-navy">25 Emma St Caulfield South 3162</div>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-navy"
                  >
                    {copiedAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAddress ? 'Copied address' : 'Copy address'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <div className="text-slate-600">Monday–Saturday, 9am–8pm</div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-heading text-[13.5px] font-bold text-navy">Need a repair instead?</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
              The repair request form captures the device details we need and gives you a reference
              to track progress.
            </p>
            <a
              href="/repairs#request"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('repairs', { scrollTo: 'request' });
                }
              }}
              className="mt-3 inline-flex text-[12.5px] font-semibold text-brand-blue hover:text-navy"
            >
              Request a repair →
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};

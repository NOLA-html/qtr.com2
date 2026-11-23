import React from 'react';
import { ChevronRight, Eye, Lock, ShieldCheck, Trash2 } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
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
              <span className="text-slate-700">Privacy</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Privacy</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            What this website stores, and who can see it
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            A plain description of the information Qwick Tech Repairs collects through this website, why it's collected,
            and how access is restricted.
          </p>
        </div>
      </div>

      <div className="qtr-wrap py-12">
        <div className="max-w-3xl">
          <div className="space-y-8">
            <section>
              <h2 className="flex items-center gap-2.5 font-heading text-[18px] font-bold text-navy">
                <Eye className="w-[17px] h-[17px] text-brand-blue" />
                What this website collects
              </h2>
              <ul className="mt-3 space-y-2.5">
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    Repair requests: your name, email address, contact number, device details and the fault description
                    you provide. A photo is stored only if you attach one.
                  </span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    Order and contact enquiries: your name, email address, phone number, suburb and the message or items
                    you submit.
                  </span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>Reviews: the display name, star rating and review text you choose to publish.</span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>Builds: the components you select in the custom PC builder, saved under a random link.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="flex items-center gap-2.5 font-heading text-[18px] font-bold text-navy">
                <Lock className="w-[17px] h-[17px] text-brand-blue" />
                Who can see it
              </h2>
              <ul className="mt-3 space-y-2.5">
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    Repair tickets and their internal technician notes are readable only by QTR administrators.
                  </span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    The public repair tracking page shows only the status, device type and service for a reference —
                    never names, contact details or notes.
                  </span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    Order enquiries, contact messages and the email attached to a review are visible only to
                    administrators.
                  </span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>Published reviews show your chosen display name and review text only.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="flex items-center gap-2.5 font-heading text-[18px] font-bold text-navy">
                <Trash2 className="w-[17px] h-[17px] text-brand-blue" />
                What is never stored
              </h2>
              <ul className="mt-3 space-y-2.5">
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    No card or bank details are collected on this site. Payment is arranged directly with QTR once a
                    total is confirmed.
                  </span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>No passwords. Please don't send device passwords through any form on this site.</span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>No advertising or tracking cookies are used by this website.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="flex items-center gap-2.5 font-heading text-[18px] font-bold text-navy">
                <ShieldCheck className="w-[17px] h-[17px] text-brand-blue" />
                Your choices
              </h2>
              <ul className="mt-3 space-y-2.5">
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    You can ask us to correct or delete a repair ticket, enquiry or review by contacting us with the
                    reference.
                  </span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    Reviews are published only after moderation, and a rejected review is never shown publicly.
                  </span>
                </li>
                <li className="flex gap-2.5 text-[13.5px] leading-relaxed text-slate-700">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>
                    Repair references are long and randomly generated, so a ticket cannot be found by guessing.
                  </span>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-10 rounded-md border border-slate-200 bg-slate-50 p-5">
            <p className="text-[12.5px] leading-relaxed text-slate-600">
              Access to submitted records is enforced by the database itself, not just by hiding buttons in the
              interface. Qwick Tech Repairs is a service of AB Services. If you have a question about a record we hold,
              contact us with the reference and we'll help.{' '}
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('contact');
                }}
                className="font-semibold text-brand-blue hover:text-navy"
              >
                Contact QTR
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

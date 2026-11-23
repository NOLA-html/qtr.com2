import React from 'react';
import {
  Send,
  Search,
  CheckCircle,
  PackageCheck,
  Clock,
  Shield,
  HelpCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { HowItWorksTimeline } from '../components/HowItWorksTimeline.tsx';
import { ServiceSpeedCard } from '../components/ServiceSpeedCard.tsx';

interface HowItWorksPageProps {
  onNavigateToRequest: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigateToRequest }) => {
  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider">
          Straightforward Process
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          How It Works
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          No jargon, no surprises. Here's exactly what to expect from the moment you submit your request to collecting your restored machine.
        </p>
      </div>

      {/* Main 4 Steps Timeline */}
      <HowItWorksTimeline />

      {/* Deep Dive Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            01 &amp; 02
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Initial Request &amp; Technician Review
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you complete our online form, tell us the device make, model, and what symptoms you've observed. We review the request right away to confirm whether it requires bench testing, parts ordering, or immediate diagnostic drop-off.
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>We never ask for user login passwords on forms.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Receive a tracking code (e.g. QTR-REP-XXXX) instantly.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            03 &amp; 04
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Physical Assessment &amp; Transparent Quote
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Once dropped off at 25 Emma St Caulfield South, we run hardware diagnostics (power rails, memory integrity, thermal throttling, drive health). We then provide you with the exact quote. No work is started until you approve it.
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All replaced parts are shown and explained to you.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Flexible evening pickup hours: Monday–Saturday, 9am–8pm.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Service Speed Options */}
      <ServiceSpeedCard />

      {/* Preparation Checklist */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6">
        <div className="max-w-2xl">
          <h3 className="text-2xl font-bold text-white mb-2">
            What to bring when dropping off your computer
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Follow this simple checklist to make your drop-off fast and seamless:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-bold text-sm text-blue-400">For Laptops &amp; MacBooks</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Please bring your laptop along with its original AC power adapter / charger.
            </p>
          </div>
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-bold text-sm text-blue-400">For Desktop PCs</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Just bring the computer tower unit itself. You do not need to bring power cords, monitors, keyboard, or mouse unless they are directly exhibiting faults.
            </p>
          </div>
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-bold text-sm text-blue-400">For Upgrades</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you have already purchased upgrade components yourself (e.g. an SSD or RAM sticks), bring them along in their original packaging.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={onNavigateToRequest}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all shadow-md"
          >
            <span>Start Your Service Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

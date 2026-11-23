import React from 'react';
import { Send, Search, CheckCircle, PackageCheck } from 'lucide-react';

interface HowItWorksProps {
  onSeeDetails?: () => void;
}

export const HowItWorksTimeline: React.FC<HowItWorksProps> = ({ onSeeDetails }) => {
  const steps = [
    {
      step: '01',
      title: 'Send a Request',
      description: 'Tell us about your computer and what you need help with.',
      icon: Send,
    },
    {
      step: '02',
      title: 'We Review It',
      description: "We review the information you've provided.",
      icon: Search,
    },
    {
      step: '03',
      title: 'Computer Assessment',
      description: 'We assess your computer to determine the problem, possible repair or upgrade options, and the final cost.',
      icon: CheckCircle,
    },
    {
      step: '04',
      title: 'Repair & Return',
      description: 'Once the service is agreed upon and completed, arrange to collect your computer.',
      icon: PackageCheck,
    },
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
            How It Works
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
            A simple, straightforward process
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            No jargon, no surprises. Here's how getting your computer fixed works.
          </p>
        </div>

        {/* Timeline Container: Horizontal on desktop (lg+), Vertical on mobile/tablet */}
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden lg:block absolute top-1/4 left-16 right-16 h-0.5 bg-blue-100 z-0 transform -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top step badge & icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-slate-300 group-hover:text-blue-500 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.step} — {item.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Step {index + 1} of 4</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {onSeeDetails && (
          <div className="mt-10 text-center">
            <button
              onClick={onSeeDetails}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>See how it works in detail</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

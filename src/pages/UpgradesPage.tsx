import React from 'react';
import {
  Zap,
  HardDrive,
  Database,
  Cpu,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { UPGRADE_SERVICES, UpgradeCategory } from '../data/servicesData.ts';

interface UpgradesPageProps {
  onStartUpgradeEnquiry: (upgradeName?: string) => void;
  onNavigateToRepairs: () => void;
}

export const UpgradesPage: React.FC<UpgradesPageProps> = ({
  onStartUpgradeEnquiry,
  onNavigateToRepairs
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'HardDrive': return HardDrive;
      case 'Database': return Database;
      case 'Cpu': return Cpu;
      case 'TrendingUp': return TrendingUp;
      default: return ShieldCheck;
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider">
          Performance &amp; Hardware Enhancements
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Computer Upgrades
        </h1>

        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Unlock significant speed gains, larger storage capacities, and modern gaming readiness with targeted hardware upgrades.
        </p>

        {/* Clear compatibility explanation */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto">
          <span className="font-semibold text-slate-900">Note on Hardware Compatibility: </span>
          Upgrade compatibility strictly depends on your exact device, motherboard chipset, power supply wattage, and component form-factor. We always assess your exact model before recommending parts.
        </div>
      </div>

      {/* CRITICAL APPLE HARDWARE RESTRICTION BANNER */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 sm:p-8 text-amber-950 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Important Apple &amp; MacBook Hardware Policy</span>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed max-w-3xl">
              <strong>Apple and MacBook hardware upgrades are not offered.</strong> Apple and MacBook repairs are available.
              Modern Apple computers feature permanently unified, soldered memory and storage on the logic board that cannot be safely upgraded after manufacturing.
            </p>
            <p className="text-xs text-amber-800 font-medium">
              ✓ Windows laptops and desktop PCs can receive hardware upgrades. <br />
              ✗ MacBooks and Apple computers cannot receive hardware upgrades.
            </p>
          </div>

          <button
            onClick={onNavigateToRepairs}
            className="shrink-0 inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <span>View Apple Repairs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upgrade Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {UPGRADE_SERVICES.map((category) => {
          const Icon = getIcon(category.icon);
          return (
            <div
              key={category.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-700 mt-1">
                    {category.eligiblePlatforms}
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {category.description}
                </p>

                {/* Key Benefits */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Upgrade Advantages:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {category.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">Compatibility: </span>
                  {category.compatibilityNote}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => onStartUpgradeEnquiry(category.name)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-colors"
                >
                  <span>Enquire About {category.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Callout: Replace vs Upgrade */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Cost-Effective Alternative
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Why spend $1,500 on a new laptop when a $150 upgrade does the job?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            In 80% of sluggish Windows computers, the CPU is still perfectly capable. The real bottleneck is almost always an aging spinning mechanical drive, insufficient RAM, or thermal throttling dust buildup. An SSD swap and memory bump will make your machine feel brand new.
          </p>
        </div>

        <div className="lg:col-span-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Get a Personal Upgrade Recommendation</h3>
          <p className="text-xs text-slate-300">
            Send us your device model and what software you run. We'll give you honest options.
          </p>
          <button
            onClick={() => onStartUpgradeEnquiry()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-colors shadow-md"
          >
            Start Upgrade Enquiry
          </button>
        </div>
      </div>
    </div>
  );
};

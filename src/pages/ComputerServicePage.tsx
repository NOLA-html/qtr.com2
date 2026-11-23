import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
  ArrowRight,
  HardDrive,
  Copy,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { REPAIR_SERVICES } from '../data/servicesData.ts';
import { AddToCalendarButton } from '../components/AddToCalendarButton.tsx';

interface ComputerServicePageProps {
  initialTab?: 'repair' | 'upgrade';
  initialCategory?: string;
  initialDeviceType?: string;
  initialSpeed?: 'Regular' | 'Express';
  onNavigateToTrack?: (referenceNumber: string) => void;
}

export const ComputerServicePage: React.FC<ComputerServicePageProps> = ({
  initialTab = 'repair',
  initialCategory,
  initialDeviceType,
  initialSpeed = 'Regular',
  onNavigateToTrack
}) => {
  const [activeTab, setActiveTab] = useState<'repair' | 'upgrade'>(initialTab);

  // Sync initial tab if changed from outside
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ==========================================
  // REPAIR FORM STATE
  // ==========================================
  const [repairCustomerName, setRepairCustomerName] = useState('');
  const [repairEmail, setRepairEmail] = useState('');
  const [repairPhone, setRepairPhone] = useState('');
  const [repairDeviceType, setRepairDeviceType] = useState(initialDeviceType || 'Laptop');
  const [repairManufacturerModel, setRepairManufacturerModel] = useState('');
  const [repairOS, setRepairOS] = useState('Windows 11');
  const [repairCategory, setRepairCategory] = useState(initialCategory || 'Computer Repairs');
  const [repairProblemDescription, setRepairProblemDescription] = useState('');
  const [repairSymptoms, setRepairSymptoms] = useState('');
  const [repairTurnsOn, setRepairTurnsOn] = useState<'Yes' | 'No' | 'Intermittent'>('Yes');
  const [repairImportantDataAffected, setRepairImportantDataAffected] = useState<'Yes' | 'No' | 'Not sure'>('Not sure');
  const [repairSpeed, setRepairSpeed] = useState<'Regular' | 'Express'>(initialSpeed);
  const [repairAdditionalNotes, setRepairAdditionalNotes] = useState('');

  const [repairSubmitting, setRepairSubmitting] = useState(false);
  const [repairError, setRepairError] = useState<string | null>(null);
  const [repairSuccessData, setRepairSuccessData] = useState<any | null>(null);

  // Sync category if passed
  useEffect(() => {
    if (initialCategory) {
      setRepairCategory(initialCategory);
    }
  }, [initialCategory]);

  // ==========================================
  // UPGRADE FORM STATE
  // ==========================================
  const [upgCustomerName, setUpgCustomerName] = useState('');
  const [upgEmail, setUpgEmail] = useState('');
  const [upgPhone, setUpgPhone] = useState('');
  const [upgDeviceType, setUpgDeviceType] = useState('Windows Desktop PC');
  const [upgManufacturerModel, setUpgManufacturerModel] = useState('');
  const [upgCurrentSpecs, setUpgCurrentSpecs] = useState('');
  const [upgDesiredUpgrades, setUpgDesiredUpgrades] = useState<string[]>(['RAM Upgrade']);
  const [upgIntendedUse, setUpgIntendedUse] = useState('Productivity & Everyday Work');
  const [upgBudget, setUpgBudget] = useState('$200–$400');
  const [upgSpeed, setUpgSpeed] = useState<'Regular' | 'Express'>('Regular');
  const [upgNotes, setUpgNotes] = useState('');

  const [upgSubmitting, setUpgSubmitting] = useState(false);
  const [upgError, setUpgError] = useState<string | null>(null);
  const [upgSuccessData, setUpgSuccessData] = useState<any | null>(null);

  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const toggleUpgradeSelection = (item: string) => {
    if (upgDesiredUpgrades.includes(item)) {
      if (upgDesiredUpgrades.length > 1) {
        setUpgDesiredUpgrades(upgDesiredUpgrades.filter((u) => u !== item));
      }
    } else {
      setUpgDesiredUpgrades([...upgDesiredUpgrades, item]);
    }
  };

  // Submit Repair Form
  const handleRepairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepairError(null);

    if (!repairCustomerName.trim()) {
      setRepairError('Please provide your customer name.');
      return;
    }
    if (!repairEmail.trim() || !repairEmail.includes('@')) {
      setRepairError('Please enter a valid email address.');
      return;
    }
    if (!repairManufacturerModel.trim()) {
      setRepairError('Please enter the computer manufacturer and model (e.g. Dell Inspiron 15, MacBook Air M1).');
      return;
    }
    if (!repairProblemDescription.trim()) {
      setRepairError('Please describe the problem your computer is experiencing.');
      return;
    }

    setRepairSubmitting(true);

    try {
      const payload = {
        customerName: repairCustomerName,
        email: repairEmail,
        phone: repairPhone,
        deviceType: repairDeviceType,
        manufacturerAndModel: repairManufacturerModel,
        operatingSystem: repairOS,
        repairCategory,
        problemDescription: repairProblemDescription,
        symptoms: repairSymptoms,
        turnsOn: repairTurnsOn,
        importantDataAffected: repairImportantDataAffected,
        serviceSpeed: repairSpeed,
        additionalNotes: repairAdditionalNotes
      };

      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server error while submitting repair request');
      }

      setRepairSuccessData(data);
    } catch (err: any) {
      console.error('Repair request submission error:', err);
      setRepairError(err.message || 'Could not save repair request. Please try again.');
    } finally {
      setRepairSubmitting(false);
    }
  };

  // Submit Upgrade Form
  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgError(null);

    // Guard against Apple selection
    if (upgDeviceType.toLowerCase().includes('apple') || upgDeviceType.toLowerCase().includes('macbook')) {
      setUpgError('MacBook and Apple computer hardware upgrades are not currently available. Please switch to the Repair tab to submit an Apple repair request.');
      return;
    }

    if (!upgCustomerName.trim()) {
      setUpgError('Please enter your name.');
      return;
    }
    if (!upgEmail.trim() || !upgEmail.includes('@')) {
      setUpgError('Please enter a valid email address.');
      return;
    }
    if (!upgManufacturerModel.trim()) {
      setUpgError('Please enter your computer manufacturer and model.');
      return;
    }

    setUpgSubmitting(true);

    try {
      const payload = {
        customerName: upgCustomerName,
        email: upgEmail,
        phone: upgPhone,
        deviceType: upgDeviceType,
        manufacturerAndModel: upgManufacturerModel,
        currentSpecifications: upgCurrentSpecs,
        desiredUpgrades: upgDesiredUpgrades,
        intendedUse: upgIntendedUse,
        budget: upgBudget,
        serviceSpeed: upgSpeed,
        additionalNotes: upgNotes
      };

      const res = await fetch('/api/upgrades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server error while submitting upgrade enquiry');
      }

      setUpgSuccessData(data);
    } catch (err: any) {
      console.error('Upgrade request error:', err);
      setUpgError(err.message || 'Could not save upgrade request. Please try again.');
    } finally {
      setUpgSubmitting(false);
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Service Request Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          {activeTab === 'repair' ? 'Computer Repair Request' : 'Computer Upgrade Enquiry'}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Tell us about your computer and what you need help with. We'll review your information and guide you through the next steps.
        </p>

        {/* Tab Switcher */}
        <div className="pt-3 flex justify-center">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('repair');
                setRepairSuccessData(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'repair'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Computer Repair Request</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('upgrade');
                setUpgSuccessData(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'upgrade'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Hardware Upgrade Enquiry</span>
            </button>
          </div>
        </div>
      </div>

      {/* PERSONAL HONEST COMMITMENT PROMISE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-slate-700 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">Our Straightforward Promise: </span>
          "Straight up with you: I'm not a certified pro or a licensed shop — just someone who's good with computers and loves fixing them. If something goes wrong and it's my fault, I'll pay to ship your device back and cover the repair to make it right. That's my promise to you."
        </div>
      </div>

      {/* ========================================== */}
      {/* 1. REPAIR REQUEST FORM                      */}
      {/* ========================================== */}
      {activeTab === 'repair' && (
        <>
          {repairSuccessData ? (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Repair Request Received!
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  Your repair submission has been registered directly in our workshop queue. We are reviewing the diagnostic details now.
                </p>
              </div>

              {/* Reference Number Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-center space-y-3">
                <div className="text-xs uppercase font-semibold text-slate-500">
                  Your Tracking Reference Code
                </div>
                <div className="text-2xl font-mono font-extrabold text-blue-600 flex items-center justify-center gap-3">
                  <span>{repairSuccessData.referenceNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(repairSuccessData.referenceNumber)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    title="Copy code"
                  >
                    {copiedRef ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  Service Speed: <strong className="text-slate-800">{repairSuccessData.serviceSpeed}</strong> ({repairSuccessData.estimatedTurnaround})
                </div>
              </div>

              {/* Google Calendar Workshop Drop-off Sync */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-slate-800">
                  Book Workshop Drop-off into Google Calendar
                </div>
                <AddToCalendarButton
                  title={`QTR Repair Drop-off [${repairSuccessData.referenceNumber}]`}
                  description={`Repair Reference: ${repairSuccessData.referenceNumber}\nSpeed: ${repairSuccessData.serviceSpeed}\nLocation: 25 Emma St Caulfield south 3162\nPhone: 0493 711 832\nHours: Mon–Sat 9am–8pm`}
                  daysFromNow={1}
                  buttonText="Add Drop-off to Google Calendar"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTrack?.(repairSuccessData.referenceNumber)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
                >
                  <span>Track Live Repair Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRepairSuccessData(null);
                    setRepairProblemDescription('');
                    setRepairSymptoms('');
                  }}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Submit Another Device
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRepairSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
              {repairError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Please check the form: </span>
                    {repairError}
                  </div>
                </div>
              )}

              {/* Section 1: Customer Contact Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
                  <span>Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={repairCustomerName}
                      onChange={(e) => setRepairCustomerName(e.target.value)}
                      placeholder="e.g. David Morrison"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={repairEmail}
                      onChange={(e) => setRepairEmail(e.target.value)}
                      placeholder="e.g. david@example.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={repairPhone}
                      onChange={(e) => setRepairPhone(e.target.value)}
                      placeholder="e.g. 0493 711 832"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Useful for urgent questions or when collection is ready.
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Device Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
                  <span>Computer &amp; System Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Device Type *
                    </label>
                    <select
                      value={repairDeviceType}
                      onChange={(e) => setRepairDeviceType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Laptop">Laptop (Windows / PC)</option>
                      <option value="Desktop PC">Desktop Tower / Custom PC</option>
                      <option value="MacBook">MacBook (Air / Pro)</option>
                      <option value="Apple Computer">Other Apple Computer (iMac / Mac mini)</option>
                      <option value="All-in-One">All-in-One PC</option>
                      <option value="Other">Other Computer Hardware</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Operating System *
                    </label>
                    <select
                      value={repairOS}
                      onChange={(e) => setRepairOS(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Windows 11">Windows 11</option>
                      <option value="Windows 10">Windows 10</option>
                      <option value="macOS">macOS (Apple)</option>
                      <option value="Linux / Other">Linux / Other</option>
                      <option value="Not Sure">Not Sure / Cannot Boot</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Manufacturer and Model *
                    </label>
                    <input
                      type="text"
                      required
                      value={repairManufacturerModel}
                      onChange={(e) => setRepairManufacturerModel(e.target.value)}
                      placeholder="e.g. Dell XPS 15 9520, Lenovo ThinkPad X1, Custom AMD Desktop, MacBook Pro 14 M1"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Usually found on a sticker underneath the laptop or on the desktop casing.
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Repair Category * (11 Standard Service Categories)
                    </label>
                    <select
                      value={repairCategory}
                      onChange={(e) => setRepairCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-white"
                    >
                      {REPAIR_SERVICES.map((svc) => (
                        <option key={svc.name} value={svc.name}>
                          {svc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Diagnostic Problem Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
                  <span>Problem Symptoms &amp; Device State</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description of the Problem *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={repairProblemDescription}
                      onChange={(e) => setRepairProblemDescription(e.target.value)}
                      placeholder="Describe what happens when you use or start the computer. When did it begin?"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Error Messages or Specific Symptoms (Optional)
                    </label>
                    <input
                      type="text"
                      value={repairSymptoms}
                      onChange={(e) => setRepairSymptoms(e.target.value)}
                      placeholder="e.g. Blue screen error WHEA_UNCORRECTABLE_ERROR, flashing question mark folder, loud buzzing fan"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Does the computer turn on? */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <label className="block text-xs font-semibold text-slate-800">
                        Does the computer turn on? *
                      </label>
                      <div className="flex gap-2">
                        {(['Yes', 'No', 'Intermittent'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setRepairTurnsOn(opt)}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                              repairTurnsOn === opt
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Important data affected? */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <label className="block text-xs font-semibold text-slate-800">
                        Is important data affected? *
                      </label>
                      <div className="flex gap-2">
                        {(['Yes', 'No', 'Not sure'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setRepairImportantDataAffected(opt)}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                              repairImportantDataAffected === opt
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={repairAdditionalNotes}
                      onChange={(e) => setRepairAdditionalNotes(e.target.value)}
                      placeholder="Any recent software installed, liquid spills, timeline urgency, or backup preferences..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Password warning statement */}
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Privacy Notice: </strong> Never send or write your Windows or Apple user password in this form. If login is required for diagnostics, we will guide you on creating a temporary guest profile.
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Service Speed Choice */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">4</span>
                  <span>Turnaround Speed Option</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Regular */}
                  <div
                    onClick={() => setRepairSpeed('Regular')}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                      repairSpeed === 'Regular'
                        ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">Regular Service</span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">FREE</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">5–7 day turnaround</div>
                      <p className="text-xs text-slate-600">For customers who don't need their computer fixed urgently.</p>
                    </div>
                  </div>

                  {/* Express */}
                  <div
                    onClick={() => setRepairSpeed('Express')}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between relative ${
                      repairSpeed === 'Express'
                        ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="absolute top-2 right-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-600 text-white rounded">
                      Faster
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">Express Service</span>
                        <span className="text-xs font-extrabold text-blue-700 mr-12">$15 Priority</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">1–2 day turnaround</div>
                      <p className="text-xs text-slate-600">For customers who need their computer fixed quickly.</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  * Note: Express Service is for customers who need their computer fixed quickly. The Express fee is additional to the repair or upgrade cost. The final repair or upgrade cost will be calculated after the computer has been assessed.
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Drop-off location: <span className="text-slate-800 font-semibold">25 Emma St Caufield south 3162</span>
                </div>

                <button
                  type="submit"
                  disabled={repairSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  {repairSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit Repair Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* ========================================== */}
      {/* 2. UPGRADE ENQUIRY FORM                    */}
      {/* ========================================== */}
      {activeTab === 'upgrade' && (
        <>
          {upgSuccessData ? (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Upgrade Enquiry Received!
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  We will analyze your computer specifications and determine the most cost-effective hardware upgrade path for your workflow.
                </p>
              </div>

              {/* Reference Number Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-center space-y-3">
                <div className="text-xs uppercase font-semibold text-slate-500">
                  Your Tracking Reference Code
                </div>
                <div className="text-2xl font-mono font-extrabold text-blue-600 flex items-center justify-center gap-3">
                  <span>{upgSuccessData.referenceNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(upgSuccessData.referenceNumber)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    {copiedRef ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  Service Speed: <strong className="text-slate-800">{upgSuccessData.serviceSpeed}</strong> ({upgSuccessData.estimatedTurnaround})
                </div>
              </div>

              {/* Google Calendar Consultation Drop-off Sync */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-slate-800">
                  Book Upgrade Assessment into Google Calendar
                </div>
                <AddToCalendarButton
                  title={`QTR Upgrade Assessment [${upgSuccessData.referenceNumber}]`}
                  description={`Upgrade Enquiry Reference: ${upgSuccessData.referenceNumber}\nSpeed: ${upgSuccessData.serviceSpeed}\nLocation: 25 Emma St Caulfield south 3162\nPhone: 0493 711 832\nHours: Mon–Sat 9am–8pm`}
                  daysFromNow={1}
                  buttonText="Add Assessment to Google Calendar"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTrack?.(upgSuccessData.referenceNumber)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
                >
                  <span>Track Live Upgrade Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setUpgSuccessData(null)}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Submit Another Enquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpgradeSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
              {upgError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Upgrade Notice: </span>
                    {upgError}
                  </div>
                </div>
              )}

              {/* Apple Hardware Warning Callout */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Apple Hardware Restriction: </strong>
                  Apple and MacBook hardware upgrades are not currently offered. We can repair Apple computers, but we do not offer hardware upgrades for them. Windows laptops and desktops can be upgraded.
                </div>
              </div>

              {/* Section 1: Customer Contact Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
                  <span>Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={upgCustomerName}
                      onChange={(e) => setUpgCustomerName(e.target.value)}
                      placeholder="e.g. Rachel Campbell"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={upgEmail}
                      onChange={(e) => setUpgEmail(e.target.value)}
                      placeholder="e.g. rachel@example.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={upgPhone}
                      onChange={(e) => setUpgPhone(e.target.value)}
                      placeholder="e.g. 0493 711 832"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Device & Current Specs */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
                  <span>Device &amp; Existing Hardware</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Device Type (Eligible for Upgrades) *
                    </label>
                    <select
                      value={upgDeviceType}
                      onChange={(e) => setUpgDeviceType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Windows Desktop PC">Windows Desktop Tower / PC</option>
                      <option value="Windows Laptop">Windows Laptop</option>
                      <option value="Custom Gaming Rig">Custom Gaming Desktop</option>
                      <option value="Mini PC / Workstation">Mini PC / Workstation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Manufacturer and Model *
                    </label>
                    <input
                      type="text"
                      required
                      value={upgManufacturerModel}
                      onChange={(e) => setUpgManufacturerModel(e.target.value)}
                      placeholder="e.g. HP Pavilion Gaming Desktop, Acer Swift 3, Custom AM4 PC"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Existing Specifications (If known)
                    </label>
                    <input
                      type="text"
                      value={upgCurrentSpecs}
                      onChange={(e) => setUpgCurrentSpecs(e.target.value)}
                      placeholder="e.g. 8GB RAM, 256GB SSD, Intel i5-8400, GTX 1050 (or 'Not sure')"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Desired Upgrades & Intended Use */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
                  <span>Desired Upgrades &amp; Intended Purpose</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select Desired Upgrades (Choose all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      'RAM Upgrade',
                      'SSD / Fast Storage',
                      'Storage Expansion (2TB+)',
                      'Graphics Card (GPU)',
                      'CPU / Motherboard',
                      'Power Supply (PSU)',
                      'Cooling / Fans',
                      'General Speed Boost'
                    ].map((item) => {
                      const isChecked = upgDesiredUpgrades.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleUpgradeSelection(item)}
                          className={`p-2.5 text-xs font-semibold rounded-xl border text-left flex items-center justify-between transition-all ${
                            isChecked
                              ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{item}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Intended Use / Main Goals
                    </label>
                    <select
                      value={upgIntendedUse}
                      onChange={(e) => setUpgIntendedUse(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Productivity & Everyday Work">Office &amp; Everyday Multitasking</option>
                      <option value="Modern 1080p / 1440p Gaming">Gaming (Better framerate &amp; graphics)</option>
                      <option value="Video Editing & Content Creation">4K Video Editing / Photo Rendering</option>
                      <option value="Software Development / VMs">Software Development &amp; Virtual Machines</option>
                      <option value="Audio Production / Music">Audio Production / Music DAWs</option>
                      <option value="General Speed Fix">Just want the computer to stop freezing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Upgrade Budget (Optional)
                    </label>
                    <select
                      value={upgBudget}
                      onChange={(e) => setUpgBudget(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Under $150">Under $150 (Essential RAM or SSD boost)</option>
                      <option value="$150–$300">$150–$300 (Sweet spot: SSD + RAM combo)</option>
                      <option value="$300–$600">$300–$600 (GPU upgrade or major storage)</option>
                      <option value="$600–$1000">$600–$1,000 (High-tier graphics / platform)</option>
                      <option value="Flexible / Best Value">Flexible / Recommend best value</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={upgNotes}
                    onChange={(e) => setUpgNotes(e.target.value)}
                    placeholder="Specific games you want to play, programs you run, or components you already own..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Service Speed */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Turnaround Speed
                </h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setUpgSpeed('Regular')}
                    className={`flex-1 p-3.5 rounded-xl border text-left transition-all ${
                      upgSpeed === 'Regular'
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">Regular Service (FREE)</div>
                    <div className="text-[11px] text-slate-500">5–7 day turnaround</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpgSpeed('Express')}
                    className={`flex-1 p-3.5 rounded-xl border text-left transition-all ${
                      upgSpeed === 'Express'
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">Express Service ($15)</div>
                    <div className="text-[11px] text-slate-500">1–2 day turnaround</div>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Drop-off location: <span className="text-slate-800 font-semibold">25 Emma St Caufield south 3162</span>
                </div>

                <button
                  type="submit"
                  disabled={upgSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  {upgSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Submit Upgrade Enquiry</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

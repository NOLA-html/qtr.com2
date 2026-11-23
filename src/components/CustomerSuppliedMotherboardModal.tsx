import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  Info,
  ShieldCheck,
  Boxes,
  Layers,
  HardDrive,
  Package
} from 'lucide-react';
import type { BuilderPart } from '../data/builderCatalog.ts';
import type { ResearchedMotherboardSpecs, MotherboardCompatibilityReport } from '../../server/aiMotherboardResearcher.ts';

interface CustomerSuppliedMotherboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMotherboard: BuilderPart | null;
  selectedParts: Record<string, BuilderPart | null>;
  onConfirmSuppliedMotherboard: (suppliedData: {
    brand: string;
    model: string;
    socket?: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851' | string;
    ramType?: 'DDR4' | 'DDR5' | string;
    formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | string;
    conditionNotes?: string;
    sourceType: 'catalogue_conversion' | 'custom_entry';
    cataloguePartId?: string;
    researchedSpecs?: ResearchedMotherboardSpecs;
    compatibilityReport?: MotherboardCompatibilityReport;
  }) => void;
}

export const CustomerSuppliedMotherboardModal: React.FC<CustomerSuppliedMotherboardModalProps> = ({
  isOpen,
  onClose,
  selectedMotherboard,
  selectedParts,
  onConfirmSuppliedMotherboard
}) => {
  // Case mode: 'case_a' (already selected in build) vs 'case_b' (custom entry)
  const isCaseA = Boolean(selectedMotherboard);

  // Form inputs for Case B
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');

  // Research state
  const [researchStage, setResearchStage] = useState<'idle' | 'researching' | 'completed' | 'error'>('idle');
  const [stageMessage, setStageMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [researchedSpecs, setResearchedSpecs] = useState<ResearchedMotherboardSpecs | null>(null);
  const [compatibilityReport, setCompatibilityReport] = useState<MotherboardCompatibilityReport | null>(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isCaseA && selectedMotherboard) {
        // Auto-fill Case A
        setBrand(selectedMotherboard.brand);
        setModel(selectedMotherboard.name);
        setConditionNotes('');
        setResearchStage('idle');
        setResearchedSpecs(null);
        setCompatibilityReport(null);
      } else {
        // Reset Case B
        setBrand('');
        setModel('');
        setConditionNotes('');
        setResearchStage('idle');
        setErrorMessage('');
        setResearchedSpecs(null);
        setCompatibilityReport(null);
      }
    }
  }, [isOpen, selectedMotherboard, isCaseA]);

  if (!isOpen) return null;

  // Trigger AI Motherboard Research & Compatibility Check
  const handleRunResearch = async () => {
    if (!brand.trim() || !model.trim()) {
      setErrorMessage('Please enter both manufacturer brand and exact motherboard model name.');
      return;
    }

    setErrorMessage('');
    setResearchStage('researching');
    setStageMessage('Querying hardware research engine for manufacturer specifications...');

    try {
      // Step feedback animation
      setTimeout(() => {
        setStageMessage('Extracting socket, chipset, VRM, and memory architecture...');
      }, 700);

      setTimeout(() => {
        setStageMessage('Cross-referencing whole-build compatibility with selected CPU, RAM & Chassis...');
      }, 1400);

      const res = await fetch('/api/motherboard/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          cataloguePartId: selectedMotherboard?.id,
          sourceType: isCaseA ? 'catalogue_conversion' : 'custom_entry',
          conditionNotes: conditionNotes.trim() || undefined,
          buildParts: {
            cpu: selectedParts.cpu,
            ram: selectedParts.ram,
            case: selectedParts.case,
            gpu: selectedParts.gpu
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to research motherboard specifications');
      }

      setResearchedSpecs(data.researchedSpecs);
      setCompatibilityReport(data.compatibility);
      setResearchStage('completed');
    } catch (err: any) {
      console.error('Motherboard research error:', err);
      setResearchStage('error');
      setErrorMessage(err.message || 'An error occurred while researching motherboard.');
    }
  };

  // Case A direct submission
  const handleConfirmCaseA = () => {
    if (!selectedMotherboard) return;
    onConfirmSuppliedMotherboard({
      brand: selectedMotherboard.brand,
      model: selectedMotherboard.name,
      socket: selectedMotherboard.socket,
      ramType: selectedMotherboard.ramType,
      formFactor: selectedMotherboard.formFactor,
      conditionNotes: conditionNotes.trim() || 'Supplying verified catalogue model from customer stock',
      sourceType: 'catalogue_conversion',
      cataloguePartId: selectedMotherboard.id
    });
    onClose();
  };

  // Case B submission after research
  const handleConfirmCaseB = () => {
    if (!researchedSpecs) return;
    if (compatibilityReport?.status === 'incompatible') return;

    onConfirmSuppliedMotherboard({
      brand: researchedSpecs.brand,
      model: researchedSpecs.model,
      socket: researchedSpecs.socket,
      ramType: researchedSpecs.ramType,
      formFactor: researchedSpecs.formFactor,
      conditionNotes: conditionNotes.trim() || undefined,
      sourceType: 'custom_entry',
      researchedSpecs,
      compatibilityReport: compatibilityReport || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Customer Hardware Integration
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {isCaseA ? 'Supply Your Selected Motherboard' : 'Supply Your Own Motherboard'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* ========================================================================= */}
          {/* CASE A: MOTHERBOARD ALREADY IN BUILD                                      */}
          {/* ========================================================================= */}
          {isCaseA && selectedMotherboard ? (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Existing Build Component Detected</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  You already have a verified motherboard selected in your build checklist. By choosing to supply it yourself, the component retail price will be set to <strong>$0.00 AUD</strong>, saving you <strong>${selectedMotherboard.price.toFixed(2)} AUD</strong> on parts cost.
                </p>
              </div>

              {/* Motherboard Details Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  <Boxes className="w-8 h-8 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {selectedMotherboard.brand}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {selectedMotherboard.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {selectedMotherboard.socket && (
                      <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                        Socket {selectedMotherboard.socket}
                      </span>
                    )}
                    {selectedMotherboard.ramType && (
                      <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {selectedMotherboard.ramType}
                      </span>
                    )}
                    {selectedMotherboard.formFactor && (
                      <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {selectedMotherboard.formFactor}
                      </span>
                    )}
                  </div>
                  {selectedMotherboard.centreComUrl && (
                    <a
                      href={selectedMotherboard.centreComUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline pt-1"
                    >
                      <span>Verified Centre Com Product Reference</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 line-through block">
                    ${selectedMotherboard.price.toFixed(2)}
                  </span>
                  <span className="text-base font-black font-mono text-emerald-700 block">
                    $0.00 AUD
                  </span>
                </div>
              </div>

              {/* Physical Delivery & Bench Testing Requirements */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span>Workshop Drop-Off & Bench Inspection Process</span>
                </h5>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Drop-off / Courier:</strong> Deliver to QTR workshop at <strong>25 Emma St, Caulfield South VIC 3162</strong>.
                  </li>
                  <li>
                    <strong>Technician Bench Inspection:</strong> We perform visual pin inspection (socket pins, VRM capacitors, PCB traces) and a POST power rail diagnostic before assembly.
                  </li>
                  <li>
                    <strong>Accessories:</strong> Please include original I/O shield, Wi-Fi antennas (if applicable), and M.2 screws/standoffs.
                  </li>
                </ul>
              </div>

              {/* Optional Condition Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Condition / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="e.g. Brand new in sealed anti-static bag, or pulled from previous working gaming PC"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCaseA}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Customer Motherboard ($0.00 AUD)</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* CASE B: NO MOTHERBOARD CURRENTLY SELECTED (SMART RESEARCH & VERIFY)       */
            /* ========================================================================= */
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI Hardware Research & Whole-Build Compatibility Engine</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You can provide any existing AM4, AM5, LGA1700 or LGA1851 motherboard. Enter the brand and exact model; our AI engine will automatically research manufacturer specifications and verify compatibility against your selected CPU, RAM, and Case.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motherboard Brand / Manufacturer <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. ASUS, MSI, Gigabyte, ASRock"
                    className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    disabled={researchStage === 'researching'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exact Motherboard Model Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. ASUS TUF GAMING B650-PLUS WIFI"
                    className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                    disabled={researchStage === 'researching'}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physical Condition / Hardware History (Optional)
                </label>
                <input
                  type="text"
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="e.g. Brand new in sealed box with I/O shield, or lightly used from previous gaming rig"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  disabled={researchStage === 'researching'}
                />
              </div>

              {/* Research Trigger Button */}
              {researchStage !== 'completed' && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleRunResearch}
                    disabled={researchStage === 'researching' || !brand.trim() || !model.trim()}
                    className="w-full py-3 px-4 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    {researchStage === 'researching' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>{stageMessage || 'Researching Motherboard...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Research Motherboard & Verify Compatibility</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Results & Verification Card */}
              {researchStage === 'completed' && researchedSpecs && compatibilityReport && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  {/* Researched Specs Summary */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                          Verified Specification
                        </span>
                        <h4 className="text-base font-black text-white mt-0.5">
                          {researchedSpecs.brand} {researchedSpecs.model}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {researchedSpecs.socket} • {researchedSpecs.ramType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Socket</span>
                        <span className="font-bold text-white">{researchedSpecs.socket}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Chipset</span>
                        <span className="font-bold text-white">{researchedSpecs.chipset}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">RAM Format</span>
                        <span className="font-bold text-white">{researchedSpecs.ramType}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Form Factor</span>
                        <span className="font-bold text-white">{researchedSpecs.formFactor}</span>
                      </div>
                    </div>

                    {researchedSpecs.officialSourceUrl && (
                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                        <span>Research source:</span>
                        <a
                          href={researchedSpecs.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <span>Official Technical Specifications</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Compatibility Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      compatibilityReport.status === 'compatible'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : compatibilityReport.status === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {compatibilityReport.status === 'compatible' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : compatibilityReport.status === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="font-black text-xs uppercase tracking-wider">
                        Whole-Build Compatibility: {compatibilityReport.status}
                      </div>
                      <p className="text-xs leading-relaxed">{compatibilityReport.summary}</p>
                    </div>
                  </div>

                  {/* Checks Breakdown */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Hardware Interlock Checks:
                    </span>
                    {compatibilityReport.checks.map((c, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          c.status === 'pass'
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : c.status === 'warning'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[10px] uppercase w-20 shrink-0">
                            {c.category}
                          </span>
                          <span>{c.message}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            c.status === 'pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Workshop Drop-off Notice */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 flex items-center gap-3">
                    <Package className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      Customer parts are accepted at <strong>25 Emma St, Caulfield South VIC 3162</strong> for workshop inspection and assembly.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setResearchStage('idle');
                        setResearchedSpecs(null);
                        setCompatibilityReport(null);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Research Another Model
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmCaseB}
                      disabled={!compatibilityReport.canProceedToAssembly}
                      className="w-full sm:w-auto px-6 py-2.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {compatibilityReport.canProceedToAssembly
                          ? 'Confirm Customer Motherboard ($0.00 AUD)'
                          : 'Incompatible — Cannot Proceed to Assembly'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

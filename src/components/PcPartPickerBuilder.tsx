import React, { useState, useMemo, useEffect } from 'react';
import {
  Cpu,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  ExternalLink,
  ShoppingCart,
  Share2,
  Scale,
  Tag,
  Trash2,
  X,
  Eye,
  PackageCheck
} from 'lucide-react';
import {
  BuilderPart,
  BUILDER_CATEGORIES,
  getPartsByCategory,
  getPartCentreComUrl
} from '../data/builderCatalog.ts';
import { Motherboard3DViewer } from './Motherboard3DViewer.tsx';
import { ProductImageWithPreview } from './ProductImageWithPreview.tsx';
import { ComponentComparisonModal } from './ComponentComparisonModal.tsx';
import {
  CustomerSuppliedPartModal,
  CustomerSuppliedPartData
} from './CustomerSuppliedPartModal.tsx';
import { CustomerSuppliedMotherboardModal } from './CustomerSuppliedMotherboardModal.tsx';
import { CustomerSuppliedDisclosureModal } from './CustomerSuppliedDisclosureModal.tsx';
import { CheaperPriceCheckerModal } from './CheaperPriceCheckerModal.tsx';
import { PriceChangeModal, PriceDifferenceItem } from './PriceChangeModal.tsx';
import { formatAud, BUILD_SERVICES, CustomPcProduct } from '../utils/pricing.ts';
import { useCart } from '../context/CartContext.tsx';

interface PcPartPickerBuilderProps {
  onNavigateToCheckout?: () => void;
  onRequestQuote?: (parts: Record<string, BuilderPart>, total: number) => void;
}

const BUILDER_STORAGE_KEY = 'qtr_builder_draft_v2';

const STEP_LIST: Array<{
  category: BuilderPart['category'];
  label: string;
  optional?: boolean;
}> = [
  { category: 'cpu', label: 'CPU' },
  { category: 'cooler', label: 'CPU Cooler' },
  { category: 'motherboard', label: 'Motherboard' },
  { category: 'ram', label: 'Memory' },
  { category: 'gpu', label: 'Graphics Card' },
  { category: 'storage', label: 'Storage' },
  { category: 'psu', label: 'Power Supply' },
  { category: 'case', label: 'Case' },
  { category: 'fans', label: 'Additional Fans', optional: true },
  { category: 'os', label: 'Operating System', optional: true }
];

export const PcPartPickerBuilder: React.FC<PcPartPickerBuilderProps> = ({
  onNavigateToCheckout
}) => {
  const { addToCart } = useCart();

  // Active platform & step
  const [platform, setPlatform] = useState<'AMD' | 'Intel' | null>(() => {
    try {
      const saved = localStorage.getItem(BUILDER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.platform === 'AMD' || parsed.platform === 'Intel') return parsed.platform;
      }
    } catch {}
    return 'AMD';
  });

  const [activeCategory, setActiveCategory] = useState<BuilderPart['category']>('cpu');

  const [selectedParts, setSelectedParts] = useState<Partial<Record<BuilderPart['category'], BuilderPart>>>(() => {
    try {
      const saved = localStorage.getItem(BUILDER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedParts) return parsed.selectedParts;
      }
    } catch {}
    return {};
  });

  const [customerSuppliedParts, setCustomerSuppliedParts] = useState<
    Partial<Record<BuilderPart['category'], CustomerSuppliedPartData>>
  >(() => {
    try {
      const saved = localStorage.getItem(BUILDER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customerSuppliedParts) return parsed.customerSuppliedParts;
      }
    } catch {}
    return {};
  });

  // Assembly & testing toggle (Base44 displays A$150.00 toggle)
  const [includeAssembly, setIncludeAssembly] = useState(true);
  const [selectedBuildService] = useState<'fast' | 'full'>('full');

  // Persist builder state on device as user goes
  useEffect(() => {
    try {
      localStorage.setItem(
        BUILDER_STORAGE_KEY,
        JSON.stringify({ platform, selectedParts, customerSuppliedParts })
      );
    } catch {}
  }, [platform, selectedParts, customerSuppliedParts]);

  // Filters & search in center pane
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('asc');
  const [priceRange, setPriceRange] = useState<'all' | 'under250' | '250to600' | 'over600'>('all');

  // Modals & notifications
  const [modalCustomerSupplyingCategory, setModalCustomerSupplyingCategory] = useState<{
    category: BuilderPart['category'];
    label: string;
  } | null>(null);
  const [isMotherboardSuppliedModalOpen, setIsMotherboardSuppliedModalOpen] = useState(false);
  const [showSuppliedDisclosureModal, setShowSuppliedDisclosureModal] = useState(false);
  const [hasAgreedSuppliedDisclosure, setHasAgreedSuppliedDisclosure] = useState(false);
  const [pendingActionAfterDisclosure, setPendingActionAfterDisclosure] = useState<'cart' | 'checkout' | null>(null);

  const [isPriceCheckerOpen, setIsPriceCheckerOpen] = useState(false);
  const [priceCheckerInitialPart, setPriceCheckerInitialPart] = useState<BuilderPart | null>(null);

  const [firebaseCatalog, setFirebaseCatalog] = useState<Record<string, any>>({});
  const [priceChangeModalOpen, setPriceChangeModalOpen] = useState(false);
  const [recheckPriceChanges, setRecheckPriceChanges] = useState<PriceDifferenceItem[]>([]);
  const [recheckOriginalTotal, setRecheckOriginalTotal] = useState(0);
  const [recheckRevisedTotal, setRecheckRevisedTotal] = useState(0);

  const [compareParts, setCompareParts] = useState<BuilderPart[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [previewMobo, setPreviewMobo] = useState<BuilderPart | null>(null);
  const [pendingPlatformSwitch, setPendingPlatformSwitch] = useState<'AMD' | 'Intel' | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Load live Firebase Centre Com pricing
  useEffect(() => {
    let isMounted = true;
    fetch('/api/firebase/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && isMounted) {
          const map: Record<string, any> = {};
          (data.products || []).forEach((p: any) => {
            map[p.productId] = p;
          });
          setFirebaseCatalog(map);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const getLivePart = (part: BuilderPart): BuilderPart => {
    const live = firebaseCatalog[part.id];
    if (!live) return part;
    return {
      ...part,
      price: live.priceAUD !== null ? live.priceAUD : part.price,
      centreComUrl: live.productUrl || part.centreComUrl,
      image: live.imageUrl && !live.imageUrl.includes('unsplash') ? live.imageUrl : part.image,
      priceStatus: live.status === 'active' ? 'current' : live.status === 'stale' ? 'stale' : 'needs_check',
      lastPriceCheck: live.lastSuccessfulCheckAt || part.lastPriceCheck,
      stockStatus: live.status === 'unavailable' ? 'unavailable' : part.stockStatus
    };
  };

  // Switch Category cleanly and reset category filters
  const handleSelectStepCategory = (cat: BuilderPart['category']) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setSelectedBrand('All');
    setPriceRange('all');
  };

  // Platform switching with compatibility check
  const handlePlatformClick = (targetPlatform: 'AMD' | 'Intel') => {
    if (targetPlatform === platform) return;
    const currentCpu = selectedParts.cpu;
    const currentMobo = selectedParts.motherboard;
    const hasConflict =
      (currentCpu && currentCpu.platform !== 'Both' && currentCpu.platform !== targetPlatform) ||
      (currentMobo && currentMobo.platform !== 'Both' && currentMobo.platform !== targetPlatform);
    if (hasConflict) {
      setPendingPlatformSwitch(targetPlatform);
    } else {
      setPlatform(targetPlatform);
    }
  };

  const confirmPlatformSwitch = () => {
    if (!pendingPlatformSwitch) return;
    const nextPlatform = pendingPlatformSwitch;
    setSelectedParts((prev) => {
      const next = { ...prev };
      if (next.cpu && next.cpu.platform !== 'Both' && next.cpu.platform !== nextPlatform) {
        delete next.cpu;
      }
      if (next.motherboard && next.motherboard.platform !== 'Both' && next.motherboard.platform !== nextPlatform) {
        delete next.motherboard;
      }
      return next;
    });
    setPlatform(nextPlatform);
    setPendingPlatformSwitch(null);
  };

  // Compatibility engine
  const compatibilityReport = useMemo(() => {
    const issues: { level: 'error' | 'warning'; message: string }[] = [];
    const cpu = selectedParts.cpu;
    const mobo = selectedParts.motherboard;
    const ram = selectedParts.ram;
    const gpu = selectedParts.gpu;
    const pcCase = selectedParts.case;
    const cooler = selectedParts.cooler;
    const psu = selectedParts.psu;

    if (cpu && mobo && cpu.socket && mobo.socket && cpu.socket !== mobo.socket) {
      issues.push({
        level: 'error',
        message: `Incompatible socket: ${cpu.name} (${cpu.socket}) does not fit ${mobo.name} (${mobo.socket}).`
      });
    }
    if (mobo && ram && mobo.ramType && ram.ramType && mobo.ramType !== ram.ramType) {
      issues.push({
        level: 'error',
        message: `Incompatible memory: ${mobo.name} requires ${mobo.ramType}, selected ${ram.name} is ${ram.ramType}.`
      });
    }
    if (pcCase && mobo && pcCase.supportedFormFactors && mobo.formFactor) {
      if (!pcCase.supportedFormFactors.includes(mobo.formFactor)) {
        issues.push({
          level: 'error',
          message: `Case clearance: ${pcCase.name} does not fit ${mobo.formFactor} motherboards.`
        });
      }
    }
    if (pcCase && gpu && pcCase.maxGpuLengthMm && gpu.gpuLengthMm && gpu.gpuLengthMm > pcCase.maxGpuLengthMm) {
      issues.push({
        level: 'error',
        message: `Graphics card length: ${gpu.name} (${gpu.gpuLengthMm}mm) exceeds ${pcCase.name} limit (${pcCase.maxGpuLengthMm}mm).`
      });
    }
    if (pcCase && cooler) {
      if (
        cooler.coolerType === 'air' &&
        pcCase.maxCoolerHeightMm &&
        cooler.coolerHeightMm &&
        cooler.coolerHeightMm > pcCase.maxCoolerHeightMm
      ) {
        issues.push({
          level: 'error',
          message: `Cooler height (${cooler.coolerHeightMm}mm) exceeds ${pcCase.name} limit (${pcCase.maxCoolerHeightMm}mm).`
        });
      } else if (
        cooler.coolerType?.startsWith('aio_') &&
        pcCase.radiatorSupport &&
        !pcCase.radiatorSupport.includes(cooler.coolerType)
      ) {
        issues.push({
          level: 'warning',
          message: `Verify radiator mounting clearance in ${pcCase.name} for ${cooler.name}.`
        });
      }
    }

    const hasAnyComponent = Object.values(selectedParts).some(Boolean);
    const estimatedWattage = hasAnyComponent
      ? (cpu?.wattage || 0) +
        (mobo?.wattage || 0) +
        (ram?.wattage || 0) +
        (gpu?.wattage || 0) +
        (selectedParts.storage?.wattage || 0) +
        (cooler?.wattage || 0) +
        (selectedParts.fans?.wattage || 0) +
        (cpu || mobo || gpu ? 75 : 0)
      : 0;

    if (psu && psu.wattage && estimatedWattage > 0) {
      if (estimatedWattage > psu.wattage) {
        issues.push({
          level: 'error',
          message: `Power supply capacity (${psu.wattage}W) is below estimated load (${estimatedWattage}W).`
        });
      } else if (estimatedWattage > psu.wattage * 0.85) {
        issues.push({
          level: 'warning',
          message: `Estimated load (${estimatedWattage}W) is close to ${psu.name} capacity (${psu.wattage}W).`
        });
      }
    }

    return {
      issues,
      estimatedWattage,
      hasAnyComponent,
      isCompatible: !issues.some((i) => i.level === 'error')
    };
  }, [selectedParts]);

  const partsSubtotal = useMemo(() => {
    return Object.entries(selectedParts).reduce((sum, [cat, part]) => {
      if (!part) return sum;
      if (customerSuppliedParts[cat as BuilderPart['category']]) return sum;
      return sum + part.price;
    }, 0);
  }, [selectedParts, customerSuppliedParts]);

  const assemblyFee = includeAssembly ? 150.0 : 0;
  const grandTotal = partsSubtotal + assemblyFee;

  const requiredCategories = STEP_LIST.filter((s) => !s.optional);
  const missingRequiredLabels = requiredCategories
    .filter((s) => !selectedParts[s.category] && !customerSuppliedParts[s.category])
    .map((s) => s.label);
  const isBuildComplete = missingRequiredLabels.length === 0;

  const suppliedPartsList = useMemo(() => {
    return Object.entries(customerSuppliedParts)
      .filter(([_, data]) => Boolean(data))
      .map(([cat, data]) => ({
        category: cat,
        name: `${data!.brand} ${data!.model}`
      }));
  }, [customerSuppliedParts]);

  const handleConfirmCustomerSupplied = (data: CustomerSuppliedPartData) => {
    setCustomerSuppliedParts((prev) => ({
      ...prev,
      [data.category]: data
    }));

    const pseudoPart: BuilderPart = {
      id: `supplied-${data.category}`,
      name: `${data.brand} ${data.model} (Customer Supplied)`,
      brand: data.brand,
      category: data.category,
      platform: 'Both',
      price: 0,
      image: '',
      wattage: data.wattage || 0,
      socket: data.socket,
      ramType: data.ramType,
      formFactor: data.formFactor,
      gpuLengthMm: data.gpuLengthMm,
      specs: {
        Source: 'Customer Supplied ($0.00)',
        Component: `${data.brand} ${data.model}`,
        ...(data.socket ? { Socket: data.socket } : {}),
        ...(data.ramType ? { Memory: data.ramType } : {}),
        ...(data.formFactor ? { 'Form Factor': data.formFactor } : {})
      },
      description: `Customer-supplied ${data.category}. Provided before assembly; inspected on bench.`
    };

    setSelectedParts((prev) => ({
      ...prev,
      [data.category]: pseudoPart
    }));
    setModalCustomerSupplyingCategory(null);
  };

  const handleConfirmCustomerSuppliedMotherboard = (data: {
    brand: string;
    model: string;
    socket?: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851' | string;
    ramType?: 'DDR4' | 'DDR5' | string;
    formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | string;
    conditionNotes?: string;
    sourceType: 'catalogue_conversion' | 'custom_entry';
    cataloguePartId?: string;
  }) => {
    setCustomerSuppliedParts((prev) => ({
      ...prev,
      motherboard: {
        category: 'motherboard',
        brand: data.brand,
        model: data.model,
        socket: (data.socket as any) || undefined,
        ramType: (data.ramType as any) || undefined,
        formFactor: (data.formFactor as any) || undefined,
        conditionNotes: data.conditionNotes
      }
    }));

    const moboPart: BuilderPart = {
      id: data.cataloguePartId || `csm-${Date.now()}`,
      name: `${data.brand} ${data.model}`,
      brand: data.brand,
      category: 'motherboard',
      platform: data.socket === 'AM4' || data.socket === 'AM5' ? 'AMD' : 'Intel',
      price: 0,
      image: '',
      wattage: 50,
      socket: (data.socket as any) || undefined,
      ramType: (data.ramType as any) || undefined,
      formFactor: (data.formFactor as any) || undefined,
      specs: {
        Brand: data.brand,
        Model: data.model,
        Socket: data.socket || 'Verified',
        Memory: data.ramType || 'Verified',
        'Form Factor': data.formFactor || 'Verified'
      },
      description: `Customer-supplied motherboard (${data.brand} ${data.model}). Charged at $0.00 AUD; bench inspection scheduled upon drop-off.`
    };

    setSelectedParts((prev) => ({
      ...prev,
      motherboard: moboPart
    }));
  };

  const handleRemoveSuppliedPart = (category: BuilderPart['category']) => {
    setCustomerSuppliedParts((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
    setSelectedParts((prev) => {
      const next = { ...prev };
      if (next[category]?.id.startsWith('supplied-') || next[category]?.id.startsWith('csm-') || next[category]?.price === 0) {
        delete next[category];
      }
      return next;
    });
  };

  // Counts & parts list for active category
  const activeParts = useMemo(() => {
    let list = getPartsByCategory(activeCategory);

    if (activeCategory === 'cpu' && platform) {
      list = list.filter((p) => p.platform === platform || p.platform === 'Both');
    } else if (activeCategory === 'motherboard') {
      if (selectedParts.cpu?.socket) {
        list = list.filter((p) => p.socket === selectedParts.cpu!.socket);
      } else if (platform) {
        list = list.filter((p) => p.platform === platform || p.platform === 'Both');
      }
    }

    if (activeCategory === 'ram' && selectedParts.motherboard?.ramType) {
      list = list.filter((p) => p.ramType === selectedParts.motherboard!.ramType);
    }
    if (activeCategory === 'case' && selectedParts.motherboard?.formFactor) {
      list = list.filter((p) => p.supportedFormFactors?.includes(selectedParts.motherboard!.formFactor!));
    }
    if (activeCategory === 'gpu' && selectedParts.case?.maxGpuLengthMm) {
      list = list.filter((p) => !p.gpuLengthMm || p.gpuLengthMm <= selectedParts.case!.maxGpuLengthMm!);
    }
    if (activeCategory === 'cooler' && selectedParts.case?.maxCoolerHeightMm) {
      list = list.filter((p) => {
        if (p.coolerType === 'air' && p.coolerHeightMm) {
          return p.coolerHeightMm <= selectedParts.case!.maxCoolerHeightMm!;
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          Object.values(p.specs || {}).join(' ').toLowerCase().includes(q)
      );
    }

    if (selectedBrand !== 'All') {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    list = list.map((p) => getLivePart(p));

    if (priceRange === 'under250') {
      list = list.filter((p) => p.price < 250);
    } else if (priceRange === '250to600') {
      list = list.filter((p) => p.price >= 250 && p.price <= 600);
    } else if (priceRange === 'over600') {
      list = list.filter((p) => p.price > 600);
    }

    list = [...list].sort((a, b) => (priceSort === 'asc' ? a.price - b.price : b.price - a.price));
    return list;
  }, [activeCategory, platform, selectedParts, searchQuery, selectedBrand, priceRange, priceSort, firebaseCatalog]);

  const availableBrands = useMemo(() => {
    const all = getPartsByCategory(activeCategory);
    return ['All', ...Array.from(new Set(all.map((p) => p.brand))).filter(Boolean)];
  }, [activeCategory]);

  const amdCpuCount = useMemo(
    () => getPartsByCategory('cpu').filter((p) => p.platform === 'AMD').length,
    []
  );
  const intelCpuCount = useMemo(
    () => getPartsByCategory('cpu').filter((p) => p.platform === 'Intel').length,
    []
  );

  const handleSelectPart = (part: BuilderPart) => {
    if (customerSuppliedParts[part.category]) {
      setCustomerSuppliedParts((prev) => {
        const next = { ...prev };
        delete next[part.category];
        return next;
      });
    }
    setSelectedParts((prev) => ({
      ...prev,
      [part.category]: part
    }));

    // Auto-advance to next unpicked required step if currently picking CPU -> Cooler/Motherboard
    const currentIndex = STEP_LIST.findIndex((s) => s.category === part.category);
    if (currentIndex !== -1 && currentIndex < 7) {
      const nextStep = STEP_LIST[currentIndex + 1];
      if (nextStep && !selectedParts[nextStep.category]) {
        setActiveCategory(nextStep.category);
      }
    }
  };

  const handleRemovePart = (category: BuilderPart['category']) => {
    if (customerSuppliedParts[category]) {
      handleRemoveSuppliedPart(category);
      return;
    }
    setSelectedParts((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  };

  const handleToggleCompare = (part: BuilderPart) => {
    setCompareParts((prev) => {
      if (prev.length > 0 && prev[0].category !== part.category) return [part];
      if (prev.some((p) => p.id === part.id)) return prev.filter((p) => p.id !== part.id);
      if (prev.length >= 4) return [...prev.slice(1), part];
      return [...prev, part];
    });
  };

  const executeAddToCart = () => {
    const customPc: CustomPcProduct = {
      id: 'custom-pc-build',
      name: `Custom ${platform || 'AMD'} Gaming PC`,
      tagline: `Configured with ${selectedParts.cpu?.name || 'Custom CPU'} & ${
        selectedParts.gpu?.name || 'Custom Graphics'
      }`,
      tier: 'Custom Build',
      basePrice: partsSubtotal,
      image:
        selectedParts.case?.image ||
        'https://media.base44.com/images/public/6ad82e9d98c7f6fdc12bb981/47c7ca544_generated_image.png',
      accentColor: 'blue',
      badge: `${platform || 'AMD'} CUSTOM BUILD`,
      description: `Custom PC configured part by part on ${platform || 'AMD'} with verified compatibility checks.`,
      targetAudience: 'Configured in the QTR Custom PC Builder.',
      components: Object.entries(selectedParts)
        .filter(([_, part]) => Boolean(part))
        .map(([cat, part]) => ({
          name: part!.name,
          category: cat.toUpperCase(),
          price: customerSuppliedParts[cat as BuilderPart['category']] ? 0 : part!.price
        })),
      specsSummary: {
        cpu: selectedParts.cpu ? selectedParts.cpu.name : 'Not selected',
        gpu: selectedParts.gpu ? selectedParts.gpu.name : 'Not selected',
        ram: selectedParts.ram ? selectedParts.ram.name : 'Not selected',
        motherboard: selectedParts.motherboard ? selectedParts.motherboard.name : 'Not selected',
        storage: selectedParts.storage ? selectedParts.storage.name : 'Not selected',
        cooler: selectedParts.cooler ? selectedParts.cooler.name : 'Not selected',
        case: selectedParts.case ? selectedParts.case.name : 'Not selected',
        psu: selectedParts.psu ? selectedParts.psu.name : 'Not selected',
        os: selectedParts.os ? selectedParts.os.name : 'Not selected'
      },
      features: [
        ...(suppliedPartsList.length > 0 ? [`Customer-supplied: ${suppliedPartsList.map((p) => p.name).join(', ')}`] : []),
        'Labour and delivery calculated at checkout'
      ]
    };

    try {
      localStorage.setItem('qtr_custom_pc_build', JSON.stringify(customPc));
    } catch {}

    addToCart('custom-pc-build', selectedBuildService, false);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    }
  };

  const checkPricesBeforeAction = async (action: 'cart' | 'checkout') => {
    const purchasedParts = Object.entries(selectedParts)
      .filter(([cat, part]) => Boolean(part) && !customerSuppliedParts[cat as BuilderPart['category']])
      .map(([_, part]) => ({
        id: part!.id,
        price: part!.price
      }));

    if (purchasedParts.length > 0) {
      try {
        const res = await fetch('/api/centrecom/recheck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parts: purchasedParts })
        });
        const data = await res.json();
        if (data.hasChanges && Array.isArray(data.priceChanges) && data.priceChanges.length > 0) {
          setRecheckPriceChanges(data.priceChanges);
          setRecheckOriginalTotal(data.originalTotal || partsSubtotal);
          setRecheckRevisedTotal(data.revisedTotal || partsSubtotal);
          setPendingActionAfterDisclosure(action);
          setPriceChangeModalOpen(true);
          return;
        }
      } catch {}
    }
    executeAddToCart();
  };

  const handleAddBuildToCart = () => {
    if (suppliedPartsList.length > 0 && !hasAgreedSuppliedDisclosure) {
      setPendingActionAfterDisclosure('checkout');
      setShowSuppliedDisclosureModal(true);
      return;
    }
    checkPricesBeforeAction('checkout');
  };

  const handleConfirmPriceChange = () => {
    if (recheckPriceChanges.length > 0) {
      setSelectedParts((prev) => {
        const next = { ...prev };
        for (const change of recheckPriceChanges) {
          for (const [cat, part] of Object.entries(next)) {
            if (part && part.id === change.partId) {
              next[cat as BuilderPart['category']] = {
                ...part,
                price: change.currentPrice
              };
            }
          }
        }
        return next;
      });
    }
    setPriceChangeModalOpen(false);
    setPendingActionAfterDisclosure(null);
    executeAddToCart();
  };

  const handleConfirmDisclosure = () => {
    setHasAgreedSuppliedDisclosure(true);
    setShowSuppliedDisclosureModal(false);
    const action = pendingActionAfterDisclosure || 'checkout';
    setPendingActionAfterDisclosure(null);
    checkPricesBeforeAction(action);
  };

  const handleShareBuild = () => {
    const lines = Object.entries(selectedParts)
      .filter(([_, part]) => Boolean(part))
      .map(([cat, part]) => `${cat.toUpperCase()}: ${part!.name} — ${formatAud(part!.price)}`);
    lines.push(`\nSubtotal: ${formatAud(partsSubtotal)}`);
    lines.push(`Assembly & testing: ${formatAud(assemblyFee)}`);
    lines.push(`Total: ${formatAud(grandTotal)} AUD`);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const activeCategoryHeading =
    BUILDER_CATEGORIES.find((c) => c.category === activeCategory)?.label || activeCategory;

  return (
    <div className="qtr-wrap py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left + Center Builder Workspace */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* LEFT: 11-step Parts Sidebar */}
          <div className="lg:w-[236px] lg:shrink-0">
            <nav aria-label="Build categories" className="rounded-md border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className="qtr-label text-slate-500">Parts</p>
              </div>
              <ul className="divide-y divide-slate-100">
                {STEP_LIST.map((step, idx) => {
                  const isActive = activeCategory === step.category;
                  const picked = selectedParts[step.category];
                  const isSupplied = Boolean(customerSuppliedParts[step.category]);
                  return (
                    <li key={step.category}>
                      <div
                        className={`flex items-start gap-2 px-3 py-2.5 transition ${
                          isActive ? 'bg-sky-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectStepCategory(step.category)}
                          aria-current={isActive ? 'true' : undefined}
                          className="flex flex-1 items-start gap-2.5 text-left min-w-0"
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                              isActive
                                ? 'border-brand-blue bg-white text-brand-blue'
                                : picked
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-200 bg-white text-slate-400'
                            }`}
                          >
                            {picked && !isActive ? <Check className="w-3 h-3" /> : idx + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block text-[11px] font-semibold uppercase tracking-[0.08em] ${
                                isActive ? 'text-brand-blue' : 'text-slate-500'
                              }`}
                            >
                              {step.label}
                              {step.optional && (
                                <span className="ml-1 normal-case tracking-normal text-slate-400">optional</span>
                              )}
                            </span>
                            <span
                              className={`mt-0.5 block truncate text-[12.5px] ${
                                picked ? 'font-medium text-navy' : 'text-slate-400'
                              }`}
                            >
                              {picked
                                ? `${picked.name}${isSupplied ? ' (Yours)' : ''}`
                                : 'Not selected'}
                            </span>
                          </span>
                        </button>
                        {picked && (
                          <button
                            type="button"
                            onClick={() => handleRemovePart(step.category)}
                            title={`Remove ${step.label}`}
                            aria-label={`Remove ${step.label}`}
                            className="mt-0.5 p-1 text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-start gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600">
                <AlertCircle className="mt-0.5 w-3 h-3 shrink-0 text-slate-400" />
                <span>Optional parts aren't required to complete a build.</span>
              </div>
            </nav>

            <div className="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
              <Info className="mt-0.5 w-[13px] h-[13px] shrink-0 text-slate-400" />
              <span>Prices are indicative until supplier pricing is verified. Your build is saved on this device as you go.</span>
            </div>
          </div>

          {/* CENTER: Platform Card + Part Picker List */}
          <div className="min-w-0 flex-1">
            {/* Step 1 Platform Selector */}
            <div className="mb-6">
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="font-heading text-[15px] font-bold text-navy">Choose your platform</h2>
                    <p className="mt-0.5 text-[12px] text-slate-600">
                      AMD and Intel processors use different sockets. Pick one first — only processors and
                      motherboards that physically fit will be shown.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Step 1
                  </span>
                </div>

                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    aria-pressed={platform === 'AMD'}
                    onClick={() => handlePlatformClick('AMD')}
                    className={`relative flex flex-col rounded-md border px-4 py-3.5 text-left transition bg-navy-900 ${
                      platform === 'AMD'
                        ? 'border-gold shadow-[0_0_0_1px_rgba(200,162,74,0.55)]'
                        : 'border-navy-800 hover:border-gold/70'
                    }`}
                  >
                    <span className="absolute inset-y-0 left-0 w-[3px] rounded-l bg-gold" aria-hidden="true" />
                    <span className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 shrink-0 text-gold" />
                      <span className="font-heading text-[14px] font-bold text-white">AMD Ryzen</span>
                      {platform === 'AMD' && <Check className="ml-auto w-[13px] h-[13px] shrink-0 text-gold" strokeWidth={3} />}
                    </span>
                    <span className="mt-1.5 font-mono text-[11px] tracking-wide text-gold-300">AM4 &middot; AM5</span>
                    <span className="mt-1 text-[11.5px] leading-relaxed text-slate-300">
                      Ryzen 5000 on AM4; Ryzen 7000 and 9000 on AM5.
                    </span>
                    <span className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                      {amdCpuCount} processors available
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={platform === 'Intel'}
                    onClick={() => handlePlatformClick('Intel')}
                    className={`relative flex flex-col rounded-md border px-4 py-3.5 text-left transition bg-navy-900 ${
                      platform === 'Intel'
                        ? 'border-gold shadow-[0_0_0_1px_rgba(200,162,74,0.55)]'
                        : 'border-navy-800 hover:border-gold/70'
                    }`}
                  >
                    <span className="absolute inset-y-0 left-0 w-[3px] rounded-l bg-gold" aria-hidden="true" />
                    <span className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 shrink-0 text-gold" />
                      <span className="font-heading text-[14px] font-bold text-white">Intel Core</span>
                      {platform === 'Intel' && <Check className="ml-auto w-[13px] h-[13px] shrink-0 text-gold" strokeWidth={3} />}
                    </span>
                    <span className="mt-1.5 font-mono text-[11px] tracking-wide text-gold-300">LGA1700 &middot; LGA1851</span>
                    <span className="mt-1 text-[11.5px] leading-relaxed text-slate-300">
                      12th–14th Gen on LGA1700; Core Ultra on LGA1851.
                    </span>
                    <span className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                      {intelCpuCount} processors available
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Compatibility notices when issues exist */}
            {compatibilityReport.issues.length > 0 && (
              <div className="mb-5 space-y-2">
                {compatibilityReport.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-[12px] ${
                      issue.level === 'error'
                        ? 'border-rose-200 bg-rose-50 text-rose-900'
                        : 'border-amber-200 bg-amber-50 text-amber-900'
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" />
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Category Header, Customer-Supplied Action, Search & Filter Controls */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-[17px] font-bold text-navy">
                    Choose your {activeCategoryHeading.toLowerCase()}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    {activeParts.length} option{activeParts.length === 1 ? '' : 's'} available
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-[220px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search parts"
                      aria-label="Search components"
                      className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-[12.5px] focus:border-brand-blue focus:outline-none"
                    />
                  </div>
                  <select
                    aria-label="Sort components"
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value as 'asc' | 'desc')}
                    className="h-9 w-[120px] rounded-md border border-slate-300 bg-white px-2.5 text-[12px] font-medium text-navy focus:border-brand-blue focus:outline-none"
                  >
                    <option value="asc">Price ↑</option>
                    <option value="desc">Price ↓</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <select
                    aria-label="Filter by manufacturer"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-700 focus:border-brand-blue focus:outline-none"
                  >
                    <option value="All">All manufacturers</option>
                    {availableBrands
                      .filter((b) => b !== 'All')
                      .map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                  </select>

                  <select
                    aria-label="Filter by price"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-[12px] text-slate-700 focus:border-brand-blue focus:outline-none"
                  >
                    <option value="all">Any price</option>
                    <option value="under250">Under A$250</option>
                    <option value="250to600">A$250 – A$600</option>
                    <option value="over600">Over A$600</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (activeCategory === 'motherboard') {
                      setIsMotherboardSuppliedModalOpen(true);
                    } else {
                      setModalCustomerSupplyingCategory({
                        category: activeCategory,
                        label: activeCategoryHeading
                      });
                    }
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gold/60 bg-amber-50/70 px-3 text-[11.5px] font-semibold text-navy transition hover:bg-amber-100/70"
                >
                  <PackageCheck className="w-3.5 h-3.5 text-amber-700" />
                  {activeCategory === 'motherboard'
                    ? "I'm supplying my own motherboard ($0)"
                    : `Supply your own ${activeCategoryHeading.toLowerCase()} ($0)`}
                </button>
              </div>

              {/* Part Option Cards */}
              <div className="mt-4 space-y-3">
                {activeParts.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                    <p className="font-heading text-[14.5px] font-bold text-navy">No matching parts found</p>
                    <p className="mt-1 text-[12.5px] text-slate-600">
                      Try clearing the search query or filter criteria.
                    </p>
                  </div>
                ) : (
                  activeParts.map((part) => {
                    const isPicked = selectedParts[part.category]?.id === part.id;
                    const isSupplied = isPicked && Boolean(customerSuppliedParts[part.category]);
                    const isVerified = part.priceStatus === 'current' || Boolean(part.centreComUrl);
                    const centreUrl = getPartCentreComUrl(part);
                    const isComparing = compareParts.some((c) => c.id === part.id);

                    return (
                      <div
                        key={part.id}
                        className={`rounded-md border p-4 transition ${
                          isPicked
                            ? 'border-brand-blue bg-sky-50/30 ring-1 ring-brand-blue'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <ProductImageWithPreview
                              src={part.image}
                              alt={part.name}
                              name={part.name}
                              category={part.category}
                              specs={part.specs}
                              thumbnailClassName="w-14 h-14 object-contain rounded-md"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-heading text-[14.5px] font-bold text-navy">{part.name}</h3>
                                {isSupplied && (
                                  <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                                    Customer Supplied
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-[12.5px] text-slate-600">{part.description}</p>

                              <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {Object.entries(part.specs || {})
                                  .slice(0, 4)
                                  .map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                                    >
                                      {v}
                                    </span>
                                  ))}
                              </div>

                              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCompare(part)}
                                  className={`inline-flex items-center gap-1 font-semibold transition ${
                                    isComparing ? 'text-brand-blue' : 'text-slate-500 hover:text-navy'
                                  }`}
                                >
                                  <Scale className="w-3 h-3" />
                                  {isComparing ? 'Comparing' : '+ Compare'}
                                </button>

                                {part.category === 'motherboard' && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewMobo(part)}
                                    className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-navy"
                                  >
                                    <Eye className="w-3 h-3" />
                                    3D Map
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPriceCheckerInitialPart(part);
                                    setIsPriceCheckerOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-navy"
                                >
                                  <Tag className="w-3 h-3" />
                                  Found Cheaper?
                                </button>

                                {centreUrl && (
                                  <a
                                    href={centreUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:text-navy"
                                  >
                                    Centre Com <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start shrink-0">
                            <div className="sm:text-right">
                              <p className="font-heading text-[16px] font-extrabold text-navy">
                                {isSupplied ? 'A$0.00' : formatAud(part.price)}
                              </p>
                              <p
                                className={`mt-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  isVerified ? 'text-emerald-700' : 'text-slate-500'
                                }`}
                              >
                                {isVerified ? 'VERIFIED' : 'ESTIMATED'}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => (isPicked ? handleRemovePart(part.category) : handleSelectPart(part))}
                              className={`inline-flex h-9 items-center justify-center rounded-md px-4 text-[12.5px] font-semibold transition ${
                                isPicked
                                  ? 'border border-slate-300 bg-white text-navy hover:bg-slate-50'
                                  : 'bg-navy text-white hover:bg-navy-800'
                              }`}
                            >
                              {isPicked ? 'Selected ✓' : 'Select'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Build Summary Card */}
        <aside className="lg:sticky lg:top-[84px] lg:h-fit">
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-heading text-[16px] font-bold text-navy">Build summary</h2>
              <span
                className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${
                  isBuildComplete
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {isBuildComplete ? 'Ready to build' : 'Incomplete build'}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {!compatibilityReport.hasAnyComponent ? (
                <div className="px-5 py-6 text-center text-[12.5px] text-slate-500">
                  No parts selected yet. Start with a processor.
                </div>
              ) : (
                <div className="max-h-[260px] divide-y divide-slate-100 overflow-y-auto px-5 py-2">
                  {STEP_LIST.map((step) => {
                    const part = selectedParts[step.category];
                    if (!part) return null;
                    const isSupplied = Boolean(customerSuppliedParts[step.category]);
                    return (
                      <div key={step.category} className="flex items-start justify-between gap-3 py-2 text-[12px]">
                        <div className="min-w-0">
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            {step.label}
                          </span>
                          <span className="block truncate font-medium text-navy">{part.name}</span>
                        </div>
                        <span className="shrink-0 font-semibold text-navy">
                          {isSupplied ? 'A$0.00' : formatAud(part.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-[13px] font-semibold text-navy">Assembly &amp; testing</p>
                  <p className="text-[11.5px] text-slate-500">A$150.00 — charged once per build</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeAssembly}
                  aria-label="Toggle assembly and testing"
                  onClick={() => setIncludeAssembly((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                    includeAssembly ? 'bg-navy' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      includeAssembly ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2.5 px-5 py-4">
                <div className="flex justify-between text-[13px] text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-navy">{formatAud(partsSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-slate-600">
                  <span>Assembly &amp; testing</span>
                  <span className="font-semibold text-navy">{formatAud(assemblyFee)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <span className="text-[14px] font-bold text-navy">Total</span>
                  <span className="font-heading text-[22px] font-extrabold text-navy">
                    {formatAud(grandTotal)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">AUD including GST. Final price confirmed before payment.</p>
              </div>

              {missingRequiredLabels.length > 0 && (
                <div className="bg-slate-50 px-5 py-3 text-[11.5px] leading-relaxed text-slate-600">
                  <span className="font-semibold text-navy">Still needed: </span>
                  {missingRequiredLabels.join(', ')}.
                </div>
              )}

              <div className="space-y-2.5 p-5">
                <button
                  type="button"
                  disabled={!compatibilityReport.hasAnyComponent}
                  onClick={handleAddBuildToCart}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 text-[13px] font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addedNotice ? 'Added to cart ✓' : 'Add build to cart'}
                </button>
                <button
                  type="button"
                  disabled={!compatibilityReport.hasAnyComponent}
                  onClick={handleShareBuild}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-[12.5px] font-semibold text-navy transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiedShare ? 'Copied build list!' : 'Save & share build'}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
            Compatibility checks appear as you select parts. We only show a check as compatible when the technical data
            for both parts is recorded.
          </p>
        </aside>
      </div>

      {/* Compare Dock */}
      {compareParts.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl bg-navy text-white rounded-lg border border-navy-700 p-3.5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-x-auto max-w-full w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider shrink-0">
              <Scale className="w-4 h-4" />
              <span>Compare ({compareParts.length}/4)</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              {compareParts.map((part) => (
                <div
                  key={part.id}
                  className="flex items-center gap-2 bg-navy-800 border border-navy-700 px-2.5 py-1.5 rounded text-xs shrink-0"
                >
                  <span className="font-medium text-white max-w-[130px] truncate">{part.name}</span>
                  <button
                    type="button"
                    onClick={() => setCompareParts((prev) => prev.filter((p) => p.id !== part.id))}
                    className="text-slate-400 hover:text-rose-400"
                    aria-label={`Remove ${part.name} from comparison`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCompareParts([])}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              disabled={compareParts.length < 2}
              className="px-4 py-1.5 bg-brand-blue hover:bg-sky-500 disabled:opacity-40 text-white font-semibold rounded text-xs"
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}

      {/* 3D Motherboard Modal */}
      {previewMobo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 rounded-lg max-w-2xl w-full border border-navy-700 shadow-2xl overflow-hidden text-white">
            <div className="p-4 border-b border-navy-700 flex items-center justify-between">
              <h3 className="font-heading text-[16px] font-bold">{previewMobo.name} — 3D PCB Explorer</h3>
              <button type="button" onClick={() => setPreviewMobo(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex justify-center">
              <Motherboard3DViewer
                name={previewMobo.name}
                socket={previewMobo.socket}
                chipset={previewMobo.chipset}
                ramType={previewMobo.ramType}
                formFactor={previewMobo.formFactor}
                moboMapUrl={previewMobo.moboMapUrl || 'https://mobomaps.com/boards'}
              />
            </div>
            <div className="p-4 border-t border-navy-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewMobo(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSelectPart(previewMobo);
                  setPreviewMobo(null);
                }}
                className="px-4 py-2 bg-brand-blue hover:bg-sky-500 text-white text-xs font-semibold rounded"
              >
                Select Motherboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platform Switch Dialog */}
      {pendingPlatformSwitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-heading text-[17px] font-bold text-navy">
              Switch platform to {pendingPlatformSwitch}?
            </h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Switching to {pendingPlatformSwitch} will remove your currently selected {platform} CPU and motherboard so
              incompatible parts aren't kept in the build.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingPlatformSwitch(null)}
                className="h-9 rounded-md border border-slate-300 px-4 text-[12.5px] font-semibold text-navy hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPlatformSwitch}
                className="h-9 rounded-md bg-navy px-4 text-[12.5px] font-semibold text-white hover:bg-navy-800"
              >
                Switch platform
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preserved Custom Modals */}
      <ComponentComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        parts={compareParts}
        category={compareParts[0]?.category || activeCategory}
        onRemovePart={(id) => setCompareParts((prev) => prev.filter((p) => p.id !== id))}
        onClearAll={() => setCompareParts([])}
        onSelectForBuild={(part) => {
          handleSelectPart(part);
          setIsCompareModalOpen(false);
        }}
        activeBuild={selectedParts}
        selectedPlatform={platform || 'AMD'}
      />

      <CustomerSuppliedMotherboardModal
        isOpen={isMotherboardSuppliedModalOpen}
        onClose={() => setIsMotherboardSuppliedModalOpen(false)}
        selectedMotherboard={selectedParts.motherboard || null}
        selectedParts={selectedParts}
        onConfirmSuppliedMotherboard={handleConfirmCustomerSuppliedMotherboard}
      />

      {modalCustomerSupplyingCategory && (
        <CustomerSuppliedPartModal
          isOpen={Boolean(modalCustomerSupplyingCategory)}
          category={modalCustomerSupplyingCategory.category}
          categoryLabel={modalCustomerSupplyingCategory.label}
          initialData={customerSuppliedParts[modalCustomerSupplyingCategory.category] || null}
          onConfirm={handleConfirmCustomerSupplied}
          onCancel={() => setModalCustomerSupplyingCategory(null)}
        />
      )}

      <CustomerSuppliedDisclosureModal
        isOpen={showSuppliedDisclosureModal}
        onConfirm={handleConfirmDisclosure}
        onCancel={() => {
          setShowSuppliedDisclosureModal(false);
          setPendingActionAfterDisclosure(null);
        }}
        suppliedPartsSummary={suppliedPartsList}
      />

      <CheaperPriceCheckerModal
        isOpen={isPriceCheckerOpen}
        onClose={() => setIsPriceCheckerOpen(false)}
        selectedParts={selectedParts}
        initialPart={priceCheckerInitialPart}
      />

      <PriceChangeModal
        isOpen={priceChangeModalOpen}
        onConfirm={handleConfirmPriceChange}
        onCancel={() => {
          setPriceChangeModalOpen(false);
          setPendingActionAfterDisclosure(null);
        }}
        priceChanges={recheckPriceChanges}
        originalTotal={recheckOriginalTotal}
        revisedTotal={recheckRevisedTotal}
      />
    </div>
  );
};

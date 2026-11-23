export interface ServiceItem {
  id: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  commonIssues: string[];
  turnaroundEstimate: string;
  startingFrom: string;
  platform: 'Both' | 'Windows' | 'Apple';
  icon: string;
}

export const REPAIR_SERVICES: ServiceItem[] = [
  {
    id: 'computer-repairs',
    name: 'Computer Repairs',
    shortDescription: 'General diagnostic and repair solutions for all desktop PCs and laptops, covering hardware faults and system crashes.',
    detailedDescription: 'Full diagnostic testing to find the exact root cause of desktop and laptop hardware or operating system failures. We inspect motherboards, power delivery, memory, drives, and software conflicts.',
    commonIssues: ['No power or sudden shutdown', 'Blue screen crashes (BSOD)', 'Freezing during normal tasks', 'Unusual clicking or beeping noises'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Both',
    icon: 'Wrench'
  },
  {
    id: 'laptop-repairs',
    name: 'Laptop Repairs',
    shortDescription: 'Physical hardware and internal servicing for portable laptops across all major Windows and Apple brands.',
    detailedDescription: 'Laptops endure heat, movement, and physical strain. We fix broken hinges, damaged power jacks, faulty charging circuits, trackpads, keyboards, and internal ribbon cables.',
    commonIssues: ['Broken hinges or casing separation', 'Damaged DC power jack or loose USB-C port', 'Keyboard keys sticking or unresponsive', 'Trackpad erratic or failing to click'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Both',
    icon: 'Laptop'
  },
  {
    id: 'desktop-pc-repairs',
    name: 'Desktop PC Repairs',
    shortDescription: 'Comprehensive component-level diagnosis and repair for tower PCs, custom builds, and workstations.',
    detailedDescription: 'Whether it is a custom gaming rig, business workstation, or family desktop, we test power supplies, graphics cards, motherboards, CPU coolers, and storage controllers with professional bench tools.',
    commonIssues: ['Computer turns on with fans spinning but no display signal', 'Power supply tripping breakers or failing to power on', 'Graphics card artifacts, tearing or game crashes', 'Excessive fan noise or pump failure in liquid coolers'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Both',
    icon: 'Monitor'
  },
  {
    id: 'macbook-repairs',
    name: 'MacBook Repairs',
    shortDescription: 'Specialised repairs for MacBook Air and MacBook Pro laptops, including screen, battery, and logic board issues.',
    detailedDescription: 'Careful disassembly and precision repairs for Apple MacBook Air and MacBook Pro laptops. We handle keyboard replacements, battery health diagnostics, charging circuit troubleshooting, and screen repairs.',
    commonIssues: ['Battery "Service Recommended" warning or rapid drain', 'Screen flex cable faults (stage light effect or blank screen)', 'Liquid spill inspection and ultrasonic cleaning', 'Trackpad or butterfly/scissor keyboard malfunction'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Apple',
    icon: 'Apple'
  },
  {
    id: 'apple-computer-repairs',
    name: 'Apple Computer Repairs',
    shortDescription: 'Diagnostic and repair services for iMacs, Mac mini, Mac Studio, and vintage Apple desktop systems.',
    detailedDescription: 'Service and repair for desktop Apple hardware. We diagnose power supplies, display panels, fan assemblies, and macOS startup loops for iMac and Mac mini computers.',
    commonIssues: ['Flashing question mark folder on boot', 'Kernel panics or recurring reboot loops', 'iMac power supply failure', 'macOS corruption or failed system updates'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Apple',
    icon: 'Cpu'
  },
  {
    id: 'windows-problems',
    name: 'Windows Problems',
    shortDescription: 'Resolution of Windows 11 and Windows 10 update failures, blue screens, boot loops, and corrupt registries.',
    detailedDescription: 'Fix stubborn Windows operating system defects without losing personal photos and files. We repair corrupt master boot records (MBR/GPT), resolve infinite "Automatic Repair" loops, and fix broken Windows updates.',
    commonIssues: ['Stuck on "Preparing Automatic Repair" loop', 'Windows Update failed error codes (0x800...)', 'User profile corrupted or temporary profile logged in', 'Missing critical DLL files or corrupted system services'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Windows',
    icon: 'Layers'
  },
  {
    id: 'software-troubleshooting',
    name: 'Software Troubleshooting',
    shortDescription: 'Elimination of stubborn software conflicts, malware/spyware infections, application crashes, and driver errors.',
    detailedDescription: 'Deep cleaning and software sanitisation. We remove browser hijackers, aggressive adware, cryptocurrency miners, and driver conflicts, restoring peak stability to everyday software.',
    commonIssues: ['Suspicious pop-ups and fake security alerts', 'Software refusing to open or crashing silently', 'Audio or display driver compatibility errors', 'Outlook or email client sync failures'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Both',
    icon: 'Bug'
  },
  {
    id: 'hardware-problems',
    name: 'Hardware Problems',
    shortDescription: 'Pinpoint diagnostic bench testing to identify failing physical components before catastrophic loss.',
    detailedDescription: 'Using dedicated hardware diagnostics (MemTest86 for RAM, CrystalDiskInfo for SMART drive health, OCCT for power delivery and FurMark for GPU stress testing), we identify exact faulty silicon components.',
    commonIssues: ['Hard drive SMART failure warning', 'Random memory page fault crashes', 'Motherboard capacitor bulge or burn smells', 'USB ports failing to recognise external devices'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Both',
    icon: 'HardDrive'
  },
  {
    id: 'computer-cleaning-maintenance',
    name: 'Computer Cleaning & Maintenance',
    shortDescription: 'Full internal dust removal, fan ultrasonic cleaning, and thermal compound repasting to restore cool, quiet operation.',
    detailedDescription: 'Laptops and desktops accumulate dust and hair that suffocates cooling heatsinks, causing fans to whine and processors to thermal throttle. We disassemble, clean fans, and apply premium thermal compound.',
    commonIssues: ['Computer feels scalding hot to the touch', 'Loud fan noise even during simple web browsing', 'Thermal throttling and severe stuttering', 'Years of accumulated pet hair and household dust'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Both',
    icon: 'Sparkles'
  },
  {
    id: 'performance-troubleshooting',
    name: 'Performance Troubleshooting',
    shortDescription: 'Identification and eradication of boot bottlenecks, sluggish response times, and background resource hogs.',
    detailedDescription: 'Transform a sluggish, frustrating computer into a responsive machine. We analyze disk queue depth, startup tasks, background bloatware, and thermal constraints to eliminate system lag.',
    commonIssues: ['Takes 5+ minutes to start up and reach the desktop', 'Spinning wheel/cursor lag opening simple applications', '100% disk usage in Windows Task Manager', 'High CPU usage while computer is idle'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Both',
    icon: 'Activity'
  },
  {
    id: 'other-computer-repairs',
    name: 'Other Computer Repairs',
    shortDescription: 'Custom repairs for niche setups, peripherals, external backups, data recovery, and unique hardware challenges.',
    detailedDescription: 'Have a problem not listed above? We assist with lost file recovery from damaged storage, BIOS corruption re-flashing, home office cabling, network adapters, and custom computer configurations.',
    commonIssues: ['Accidentally formatted flash drives or external drives', 'Corrupted BIOS firmware after failed flash', 'Internal Wi-Fi / Bluetooth card replacement', 'Custom cabling or proprietary device troubleshooting'],
    turnaroundEstimate: 'Regular: 5–7 days · Express: 1–2 days',
    startingFrom: 'Assessment based',
    platform: 'Both',
    icon: 'HelpCircle'
  }
];

export interface UpgradeCategory {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  eligiblePlatforms: string;
  compatibilityNote: string;
  icon: string;
}

export const UPGRADE_SERVICES: UpgradeCategory[] = [
  {
    id: 'ram-upgrades',
    name: 'RAM Upgrades',
    description: 'Double or quadruple your system memory for smooth multitasking, video editing, and eliminating browser tab lag.',
    benefits: ['Run multiple intensive apps simultaneously without stutter', 'Improve responsiveness in photo and video editing software', 'Eliminate pagefile swapping on slow drives'],
    eligiblePlatforms: 'Windows Laptops & Desktop PCs only',
    compatibilityNote: 'Requires compatible DDR4 or DDR5 form-factors. (Not available for Apple/MacBook computers).',
    icon: 'Zap'
  },
  {
    id: 'ssd-upgrades',
    name: 'SSD Upgrades & Migration',
    description: 'Replace an old spinning mechanical hard drive or slow SATA drive with an ultra-fast M.2 NVMe SSD with full OS clone.',
    benefits: ['Up to 10x to 30x faster boot times and file transfers', 'Near-instant application loading', 'Your existing files, apps, and Windows license copied over intact'],
    eligiblePlatforms: 'Windows Laptops & Desktop PCs only',
    compatibilityNote: 'Device must have SATA bay or M.2 NVMe PCIe slot. (Not available for Apple/MacBook computers).',
    icon: 'HardDrive'
  },
  {
    id: 'storage-expansion',
    name: 'Storage Expansion',
    description: 'Add secondary 2TB to 4TB internal SSDs or high-capacity hard drives for games, 4K media, and local backups.',
    benefits: ['Never worry about "Storage Full" warnings again', 'Separate OS from bulk game libraries and media projects', 'Configured with automatic drive health monitoring'],
    eligiblePlatforms: 'Windows Laptops & Desktop PCs only',
    compatibilityNote: 'Subject to available internal drive bays and SATA/M.2 ports.',
    icon: 'Database'
  },
  {
    id: 'desktop-component-upgrades',
    name: 'Compatible Desktop Component Upgrades',
    description: 'Upgrade your graphics card (GPU), processor (CPU), motherboard, power supply, or CPU cooling system.',
    benefits: ['Play modern games at high framerates and resolutions', 'Speed up 3D rendering and compilation workloads', 'Quieter operation with high-efficiency coolers'],
    eligiblePlatforms: 'Windows Desktop PCs only',
    compatibilityNote: 'Requires power supply wattage, case dimensions, and motherboard socket compatibility checks.',
    icon: 'Cpu'
  },
  {
    id: 'performance-improvements',
    name: 'Performance Improvements & Tuning',
    description: 'Hardware optimization including memory XMP/EXPO profile configuration, fan curves, and BIOS updates.',
    benefits: ['Maximize the true clock speed of your installed memory', 'Optimized thermal profile for quieter everyday operation', 'Improved frame pacing and minimum 1% FPS stability'],
    eligiblePlatforms: 'Windows Laptops & Desktop PCs only',
    compatibilityNote: 'Adjusted safely within manufacturer thermal specifications.',
    icon: 'TrendingUp'
  },
  {
    id: 'hardware-compatibility-assessments',
    name: 'Hardware Compatibility Assessments',
    description: 'Bring or send in your PC specs before purchasing parts. We verify power, clearance, socket, and bus compatibility.',
    benefits: ['Avoid costly mistakes ordering incompatible parts', 'Get clear recommendations on the best value upgrade path', 'Free assessment when upgrade service is booked'],
    eligiblePlatforms: 'Windows Laptops & Desktop PCs only',
    compatibilityNote: 'Full report provided with exact recommended part numbers.',
    icon: 'ShieldCheck'
  }
];

import {
  THREE_CUSTOM_PCS,
  CustomPcProduct,
  PcComponentItem,
  BUILD_SERVICES,
  DEFAULT_SHIPPING_CONFIG,
  calculatePcOrderPricing,
  formatAud
} from '../utils/pricing.ts';

export {
  THREE_CUSTOM_PCS,
  BUILD_SERVICES,
  DEFAULT_SHIPPING_CONFIG,
  calculatePcOrderPricing,
  formatAud
};
export type { CustomPcProduct, PcComponentItem };

// Prebuilt PCs catalogue
export interface PrebuiltPc {
  id: string;
  name: string;
  tier: string;
  priceAud: number;
  description: string;
  targetAudience: string;
  badge?: string;
  image?: string;
  accentColor?: string;
  components: PcComponentItem[];
  specs: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    motherboard: string;
    powerSupply: string;
    cooling: string;
    case: string;
    os: string;
  };
  features: string[];
}

export const PREBUILT_PCS: PrebuiltPc[] = THREE_CUSTOM_PCS.map((pc) => ({
  id: pc.id,
  name: pc.name,
  tier: pc.tier,
  priceAud: pc.basePrice,
  description: pc.description,
  targetAudience: pc.targetAudience,
  badge: pc.badge,
  image: pc.image,
  accentColor: pc.accentColor,
  components: pc.components,
  specs: {
    cpu: pc.specsSummary.cpu,
    gpu: pc.specsSummary.gpu,
    ram: pc.specsSummary.ram,
    storage: pc.specsSummary.storage,
    motherboard: pc.specsSummary.motherboard,
    powerSupply: pc.specsSummary.psu,
    cooling: pc.specsSummary.cooler,
    case: pc.specsSummary.case,
    os: pc.specsSummary.os
  },
  features: pc.features
}));

// Interactive PC Builder Component Catalog
export interface PcComponentOption {
  id: string;
  name: string;
  category: 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'cooler' | 'case' | 'psu' | 'os';
  price: number;
  wattage: number;
  socket?: 'AM4' | 'AM5' | 'LGA1700';
  ramType?: 'DDR4' | 'DDR5';
  formFactor?: 'ATX' | 'Micro-ATX';
  details: string;
}

export const PC_BUILDER_COMPONENTS: Record<string, PcComponentOption[]> = {
  cpu: [
    { id: 'cpu-i5-12400f', name: 'Intel Core i5-12400F (6C/12T, 4.4GHz)', category: 'cpu', price: 189, wattage: 65, socket: 'LGA1700', details: 'Great budget CPU for gaming and general computing.' },
    { id: 'cpu-i5-14600kf', name: 'Intel Core i5-14600KF (14C/20T, 5.3GHz)', category: 'cpu', price: 429, wattage: 125, socket: 'LGA1700', details: 'Excellent balanced CPU for high refresh rate gaming and creative work.' },
    { id: 'cpu-i7-14700kf', name: 'Intel Core i7-14700KF (20C/28T, 5.6GHz)', category: 'cpu', price: 589, wattage: 180, socket: 'LGA1700', details: 'High-end multi-threaded workhorse for video editing and heavy multitasking.' },
    { id: 'cpu-r5-5600', name: 'AMD Ryzen 5 5600 (6C/12T, 4.4GHz)', category: 'cpu', price: 179, wattage: 65, socket: 'AM4', details: 'Legendary budget AM4 king, reliable and cool running.' },
    { id: 'cpu-r5-7600', name: 'AMD Ryzen 5 7600 (6C/12T, 5.1GHz)', category: 'cpu', price: 319, wattage: 65, socket: 'AM5', details: 'Next-gen AM5 Zen 4 platform with integrated graphics backup.' },
    { id: 'cpu-r7-7800x3d', name: 'AMD Ryzen 7 7800X3D (8C/16T, 3D V-Cache)', category: 'cpu', price: 649, wattage: 120, socket: 'AM5', details: 'The undisputed #1 gaming processor in the world.' }
  ],
  motherboard: [
    { id: 'mb-b760m-d4', name: 'MSI PRO B760M-A WiFi DDR4', category: 'motherboard', price: 199, wattage: 25, socket: 'LGA1700', ramType: 'DDR4', formFactor: 'Micro-ATX', details: 'Micro-ATX with Wi-Fi 6E, dual M.2 slots, DDR4 memory.' },
    { id: 'mb-b760-d5', name: 'ASUS TUF Gaming B760-PLUS WiFi DDR5', category: 'motherboard', price: 289, wattage: 30, socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX', details: 'Full-size ATX with PCIe 5.0, Wi-Fi 6, robust VRM for high power.' },
    { id: 'mb-b550m-d4', name: 'ASUS Prime B550M-A WiFi II DDR4', category: 'motherboard', price: 159, wattage: 20, socket: 'AM4', ramType: 'DDR4', formFactor: 'Micro-ATX', details: 'Reliable AM4 board with built-in Wi-Fi and Bluetooth.' },
    { id: 'mb-b650-d5', name: 'MSI B650 Gaming Plus WiFi DDR5', category: 'motherboard', price: 269, wattage: 30, socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX', details: 'AM5 platform with heavy heatsinks, Wi-Fi 6E, and DDR5 support.' },
    { id: 'mb-x670e-d5', name: 'MSI MAG X670E TOMAHAWK WiFi DDR5', category: 'motherboard', price: 479, wattage: 40, socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX', details: 'Flagship AM5 with PCIe 5.0 GPU and SSD lanes.' }
  ],
  ram: [
    { id: 'ram-16-d4', name: '16GB (2x8GB) Corsair Vengeance DDR4 3200MHz', category: 'ram', price: 65, wattage: 10, ramType: 'DDR4', details: 'Low-profile high-reliability dual-channel DDR4 memory.' },
    { id: 'ram-32-d4', name: '32GB (2x16GB) Kingston Fury DDR4 3200MHz', category: 'ram', price: 119, wattage: 12, ramType: 'DDR4', details: 'High-capacity dual-channel DDR4 for demanding productivity.' },
    { id: 'ram-32-d5', name: '32GB (2x16GB) Corsair Vengeance DDR5 6000MHz CL30', category: 'ram', price: 189, wattage: 15, ramType: 'DDR5', details: 'The sweet-spot speed and latency for Intel 14th gen and AMD AM5.' },
    { id: 'ram-64-d5', name: '64GB (2x32GB) G.Skill Trident Z5 Neo DDR5 6000MHz', category: 'ram', price: 339, wattage: 20, ramType: 'DDR5', details: 'Maximum memory for 4K video rendering and large software workloads.' }
  ],
  gpu: [
    { id: 'gpu-rtx3050', name: 'NVIDIA GeForce RTX 3050 6GB GDDR6', category: 'gpu', price: 269, wattage: 90, details: 'Budget friendly card for light 1080p gaming and multimedia.' },
    { id: 'gpu-rtx4060', name: 'NVIDIA GeForce RTX 4060 8GB GDDR6', category: 'gpu', price: 459, wattage: 115, details: 'Popular 1080p card with DLSS 3 frame generation and AV1 encoder.' },
    { id: 'gpu-rx7600', name: 'AMD Radeon RX 7600 8GB GDDR6', category: 'gpu', price: 399, wattage: 165, details: 'Great rasterization value for 1080p gaming.' },
    { id: 'gpu-rtx4070s', name: 'NVIDIA GeForce RTX 4070 Super 12GB GDDR6X', category: 'gpu', price: 949, wattage: 220, details: 'Best-in-class performance for 1440p ultra ray-tracing.' },
    { id: 'gpu-rx7800xt', name: 'AMD Radeon RX 7800 XT 16GB GDDR6', category: 'gpu', price: 789, wattage: 265, details: 'High 16GB VRAM for maxed out 1440p textures.' },
    { id: 'gpu-rtx4080s', name: 'NVIDIA GeForce RTX 4080 Super 16GB GDDR6X', category: 'gpu', price: 1599, wattage: 320, details: 'Unmatched 4K gaming and AI generative speed.' }
  ],
  storage: [
    { id: 'ssd-1tb', name: '1TB Crucial P3 Plus PCIe 4.0 M.2 NVMe (5000 MB/s)', category: 'storage', price: 105, wattage: 5, details: 'Speedy Gen4 NVMe for quick boot and game loading.' },
    { id: 'ssd-2tb', name: '2TB Kingston KC3000 PCIe 4.0 M.2 NVMe (7000 MB/s)', category: 'storage', price: 229, wattage: 8, details: 'Blazing top-tier Gen4 NVMe with DRAM cache.' },
    { id: 'ssd-4tb', name: '4TB Lexar NM790 PCIe 4.0 M.2 NVMe (7400 MB/s)', category: 'storage', price: 449, wattage: 10, details: 'Massive single-drive NVMe storage for all your games and media.' }
  ],
  cooler: [
    { id: 'cooler-air-single', name: 'Thermalright Assassin X 120 SE Air Cooler', category: 'cooler', price: 39, wattage: 5, details: 'Single-tower 4-heatpipe air cooler, whisper quiet up to 180W TDP.' },
    { id: 'cooler-air-dual', name: 'DeepCool AK620 Dual-Tower High Performance Cooler', category: 'cooler', price: 89, wattage: 10, details: 'Heavy dual-tower 6-heatpipe air cooler up to 260W TDP.' },
    { id: 'cooler-aio-240', name: 'Arctic Liquid Freezer III 240 A-RGB Liquid Cooler', category: 'cooler', price: 139, wattage: 15, details: 'Thick 38mm radiator with VRM fan and quiet PWM pumps.' },
    { id: 'cooler-aio-360', name: 'Arctic Liquid Freezer III 360 A-RGB Liquid Cooler', category: 'cooler', price: 189, wattage: 20, details: 'Triple 120mm fan 360mm AIO for max overclocked CPUs.' }
  ],
  case: [
    { id: 'case-montech-100', name: 'Montech AIR 100 ARGB Micro-ATX (4 Fans)', category: 'case', price: 79, wattage: 5, formFactor: 'Micro-ATX', details: 'Tempered glass side panel and 4 pre-installed ARGB fans.' },
    { id: 'case-corsair-4000d', name: 'Corsair 4000D Airflow Mid-Tower Tempered Glass', category: 'case', price: 139, wattage: 5, formFactor: 'ATX', details: 'Spacious cable channels, high airflow mesh front.' },
    { id: 'case-fractal-north', name: 'Fractal Design North Mesh Walnut Mid-Tower', category: 'case', price: 249, wattage: 5, formFactor: 'ATX', details: 'Real FSC-certified walnut wood front styling, modern aesthetic.' },
    { id: 'case-lianli-o11', name: 'Lian Li O11 Dynamic EVO Dual-Chamber Glass', category: 'case', price: 229, wattage: 5, formFactor: 'ATX', details: 'Showcase dual tempered glass aquarium design.' }
  ],
  psu: [
    { id: 'psu-650w', name: 'DeepCool PK650D 650W 80+ Bronze', category: 'psu', price: 79, wattage: 650, details: 'Solid budget power supply for mid-range builds.' },
    { id: 'psu-750w', name: 'Corsair RM750e 750W 80+ Gold Fully Modular ATX 3.0', category: 'psu', price: 149, wattage: 750, details: 'Japanese capacitors, zero-RPM fan mode, dedicated 12VHPWR cable.' },
    { id: 'psu-850w', name: 'Corsair RM850x 850W 80+ Gold Fully Modular ATX 3.0', category: 'psu', price: 199, wattage: 850, details: 'Premium 850W power for RTX 4070 Ti / 4080 Super.' },
    { id: 'psu-1000w', name: 'be quiet! Dark Power 13 1000W 80+ Titanium', category: 'psu', price: 329, wattage: 1000, details: 'Ultra-silent, highest titanium efficiency for flagship systems.' }
  ],
  os: [
    { id: 'os-win11-home', name: 'Windows 11 Home 64-bit (Installed & Activated)', category: 'os', price: 179, wattage: 0, details: 'Genuine Microsoft digital license, fully updated with latest drivers.' },
    { id: 'os-win11-pro', name: 'Windows 11 Pro 64-bit (BitLocker & Remote Desktop)', category: 'os', price: 229, wattage: 0, details: 'Professional license with BitLocker drive encryption & Hyper-V.' },
    { id: 'os-none', name: 'No OS / Bring Your Own License (Hardware Assembly Only)', category: 'os', price: 0, wattage: 0, details: 'Hardware fully bench-tested in UEFI with MemTest86 passed.' }
  ]
};

export const ASSEMBLY_FEE = 120; // QTR Professional Assembly, Cable Routing, BIOS Update & Stress Test Fee

export interface PcComponentItem {
  name: string;
  category: string;
  price: number;
  included?: boolean;
  specNote?: string;
  plainNote?: string;
}

export interface CustomPcProduct {
  id: string;
  name: string;
  tagline: string;
  shortDescription?: string;
  tier: string;
  resolution?: '1080p' | '1440p' | '1440p high refresh / 4K';
  availability?: 'available' | 'in_development';
  basePrice: number; // Parts and Windows price in AUD (excludes labour and delivery)
  image: string;
  accentColor: string;
  badge: string;
  description: string;
  aboutParagraphs?: string[];
  targetAudience: string;
  components: PcComponentItem[];
  specsSummary: {
    cpu: string;
    gpu: string;
    ram: string;
    motherboard: string;
    storage: string;
    cooler: string;
    case: string;
    psu: string;
    os: string;
    networking?: string;
  };
  features: string[];
}

export interface BuildServiceOption {
  id: 'fast' | 'full';
  name: string;
  price: number;
  description: string;
  shortSummary?: string;
  footnote?: string;
  includes: string[];
  doesNotInclude: string[];
}

export interface DeliveryOption {
  id: 'pickup' | 'normal' | 'express';
  name: string;
  price: number;
  timeframe: string;
  description: string;
}

export interface ShippingConfig {
  normalPrice: number;
  normalTimeframe: string;
  expressPrice: number;
  expressTimeframe: string;
}

export const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  normalPrice: 25.0,
  normalTimeframe: '3–5 business days',
  expressPrice: 49.0,
  expressTimeframe: '1–2 business days'
};

export const BUILD_SERVICES: Record<'fast' | 'full', BuildServiceOption> = {
  fast: {
    id: 'fast',
    name: 'Fast Build',
    price: 100.0,
    description: 'Assembled correctly, connections checked, power-on self-test (POST) only.',
    footnote: 'This option is assembly plus a basic POST test only. Windows, drivers and testing are not included.',
    includes: [
      'Correct PC assembly',
      'Basic checks of component connections',
      'A power-on self-test (POST)'
    ],
    doesNotInclude: [
      'Professional cable management',
      'Windows installation',
      'Driver or application installation',
      'Performance benchmarks',
      'Comprehensive testing or optimisation'
    ]
  },
  full: {
    id: 'full',
    name: 'Full Build & Setup',
    price: 250.0,
    description: 'Assembled, cabled, Windows installed, drivers loaded, benchmarked and quality checked.',
    footnote: 'Covers labour and setup only. Additional software licences are not included, and Windows is never charged twice.',
    includes: [
      'Correct PC assembly',
      'Professional cable management',
      'Windows installation using the included licence',
      'Essential driver installation',
      'Installation of agreed applications and software',
      'Comprehensive hardware and system testing',
      'Performance benchmarks and stability checks',
      'Final quality control before dispatch'
    ],
    doesNotInclude: [
      'Additional software licences (Windows 11 Home is already included with the parts)'
    ]
  }
};

export const THREE_CUSTOM_PCS: CustomPcProduct[] = [
  {
    id: 'project-eclipse',
    name: 'Project Eclipse',
    tagline: 'A 1080p gaming system built on AM4 — sensible money, honest parts.',
    shortDescription: 'A 1080p gaming system built on AM4 — sensible money, honest parts.',
    tier: 'Mainstream Gaming & Creative Workstation',
    resolution: '1080p',
    availability: 'available',
    basePrice: 1428.0,
    image: 'https://media.base44.com/images/public/6ad82e9d98c7f6fdc12bb981/0ef4f7510_generated_image.png',
    accentColor: 'indigo',
    badge: '1080p',
    description:
      'Engineered for exceptional value and esports performance, Project Eclipse combines the 6-core Ryzen 5 5600X with NVIDIA’s ASUS Dual GeForce RTX 5050 8GB OC architecture on a proven AM4 platform.',
    aboutParagraphs: [
      'Project Eclipse is built on AMD’s AM4 socket using proven components — a 6-core Ryzen 5 5600X paired with 16GB of DDR4-3600 CL16 memory and an ASUS Dual GeForce RTX 5050 8GB OC graphics card.',
      'The motherboard includes built-in Wi-Fi, a 512GB NVMe SSD handles fast startup and loading, and an ASUS Prime 750W 80+ Bronze supply provides stable power. The price below covers the parts and the Windows 11 Home licence; labour and delivery are selected at checkout.'
    ],
    targetAudience:
      'Competitive gamers seeking ultra-smooth 1080p high refresh rates, streaming, and smooth creative tasks at an accessible entry point.',
    components: [
      {
        name: 'AMD Ryzen 5 5600X, 6 cores / 12 threads',
        category: 'CPU',
        price: 199.0,
        specNote: 'Socket AM4, Zen 3 6-core processor.',
        plainNote: 'Dependable gaming speed without overspending on platform cost.'
      },
      {
        name: 'AMD Wraith Stealth, included with CPU',
        category: 'CPU Cooler',
        price: 0.0,
        included: true,
        specNote: 'Bundled low-profile air cooler.',
        plainNote: 'Included with the processor for quiet everyday cooling.'
      },
      {
        name: 'ASUS Prime B550M-A WiFi II AM4 Micro-ATX',
        category: 'Motherboard',
        price: 129.0,
        specNote: 'AM4 Micro-ATX with Wi-Fi and DDR4.',
        plainNote: 'Built-in Wi-Fi and dual M.2 slots in a compact layout.'
      },
      {
        name: 'ASUS Dual GeForce RTX 5050 8GB OC GDDR6',
        category: 'GPU',
        price: 499.0,
        specNote: '8GB GDDR6, dual-fan cooling.',
        plainNote: 'Modern 1080p graphics card with DLSS support.'
      },
      {
        name: 'G.Skill Trident Z RGB 16GB (2 × 8GB) DDR4-3600 CL16',
        category: 'RAM',
        price: 199.0,
        specNote: '16GB dual-channel DDR4-3600 CL16.',
        plainNote: 'Fast dual-channel memory tuned for Ryzen 5000 processors.'
      },
      {
        name: 'Biwin Black Opal NV3500 512GB PCIe Gen 3 M.2',
        category: 'SSD',
        price: 99.0,
        specNote: '512GB NVMe solid state drive.',
        plainNote: 'Quick boots and fast game loading.'
      },
      {
        name: 'Deepcool Matrexx 30 Tempered Glass Micro-ATX',
        category: 'Case',
        price: 45.0,
        specNote: 'Micro-ATX tower with tempered glass panel.',
        plainNote: 'Compact footprint that sits neatly on or under a desk.'
      },
      {
        name: 'ASUS Prime 750W 80+ Bronze',
        category: 'PSU',
        price: 79.0,
        specNote: '750W 80 PLUS Bronze efficiency.',
        plainNote: 'Generous wattage headroom with durable dual-ball bearings.'
      },
      {
        name: 'Microsoft Windows 11 Home OEM 64-bit',
        category: 'Operating System',
        price: 179.0,
        specNote: 'Licence included in the parts price.',
        plainNote: 'Your operating system, already paid for — never charged twice.'
      }
    ],
    specsSummary: {
      cpu: 'AMD Ryzen 5 5600X — 6 cores / 12 threads',
      gpu: 'ASUS Dual GeForce RTX 5050 8GB OC GDDR6',
      ram: 'G.Skill Trident Z RGB 16GB (2 × 8GB) DDR4-3600 CL16',
      motherboard: 'ASUS Prime B550M-A WiFi II AM4 Micro-ATX',
      storage: 'Biwin Black Opal NV3500 512GB PCIe Gen 3 M.2',
      cooler: 'AMD Wraith Stealth (included with CPU)',
      case: 'Deepcool Matrexx 30 Tempered Glass Micro-ATX',
      psu: 'ASUS Prime 750W 80+ Bronze',
      os: 'Microsoft Windows 11 Home OEM 64-bit (licence included)',
      networking: 'Wi-Fi 6 and Gigabit Ethernet on the motherboard'
    },
    features: [
      'Next-generation ASUS Dual RTX 5050 8GB graphics for modern ray-tracing and AI upscaling',
      'Dual-channel G.Skill Trident Z RGB memory running at DDR4-3600 CL16 tight timings',
      'ASUS Prime B550M motherboard with integrated Wi-Fi II and Bluetooth',
      'Parts and Windows price includes genuine Microsoft Windows 11 Home OEM license',
      'Labour and delivery calculated at checkout'
    ]
  },
  {
    id: 'nitroforge-x3060',
    name: 'NitroForge X3060',
    tagline: 'AM5 and DDR5 with a 12GB graphics card — the sweet spot for 1440p.',
    shortDescription: 'AM5 and DDR5 with a 12GB graphics card — the sweet spot for 1440p.',
    tier: 'High-Performance Gaming & 12GB Creator Rig',
    resolution: '1440p',
    availability: 'available',
    basePrice: 2015.0,
    image: 'https://media.base44.com/images/public/6ad82e9d98c7f6fdc12bb981/47c7ca544_generated_image.png',
    accentColor: 'blue',
    badge: '1440p',
    description:
      'The NitroForge X3060 moves onto AMD\'s AM5 platform with DDR5 memory and a 12GB GeForce RTX 3060. The extra video memory matters in modern titles that push past 8GB, and the AM5 socket means the processor can be upgraded for years to come.',
    aboutParagraphs: [
      'The NitroForge X3060 moves onto AMD\'s AM5 platform with DDR5 memory and a 12GB GeForce RTX 3060. The extra video memory matters in modern titles that push past 8GB, and the AM5 socket means the processor can be upgraded for years to come.',
      'Cooling is handled by a Montech NX600 dual-tower air cooler, and power comes from a fully modular 850W Gold supply with ATX 3.1 support. The price below covers the parts and the Windows 11 Home licence; labour and delivery are selected at checkout.'
    ],
    targetAudience:
      'Gamers and digital creators wanting high frame rates, video editing memory headroom, and future-proof AM5 DDR5 upgradability.',
    components: [
      {
        name: 'AMD Ryzen 5 7500X3D, 6 cores / 12 threads, listed at 4.2 GHz',
        category: 'CPU',
        price: 397.0,
        specNote: 'Socket AM5 with 3D V-Cache.',
        plainNote: 'Games love the extra cache — steady frame rates in busy scenes.'
      },
      {
        name: 'Montech NX600 ARGB dual-tower cooler, six heat pipes',
        category: 'CPU Cooler',
        price: 55.0,
        specNote: 'Dual-tower air cooler with ARGB fans.',
        plainNote: 'Keeps the processor cool and quiet under load.'
      },
      {
        name: 'Sapphire NITRO+ B850M Wi-Fi 6, AM5 DDR5 Micro-ATX',
        category: 'Motherboard',
        price: 179.0,
        specNote: 'Micro-ATX, AM5, DDR5, Wi-Fi 6.',
        plainNote: 'Modern platform with Wi-Fi 6 and room to upgrade the processor later.'
      },
      {
        name: 'Palit GeForce RTX 3060 Infinity 2 OC 12GB GDDR6',
        category: 'GPU',
        price: 539.0,
        specNote: '12GB GDDR6.',
        plainNote: '12GB of video memory copes with texture-heavy games at 1440p.'
      },
      {
        name: 'Patriot Viper Venom 16GB (1 × 16GB) DDR5-6000 CL30',
        category: 'RAM',
        price: 379.0,
        specNote: 'Single 16GB DDR5 module at 6000 MT/s.',
        plainNote: 'Fast DDR5 memory, with a free slot to add more later.'
      },
      {
        name: 'Biwin Black Opal NV3500 512GB PCIe Gen 3 M.2',
        category: 'SSD',
        price: 99.0,
        specNote: '512GB NVMe solid state drive.',
        plainNote: 'Quick boots and fast game loading.'
      },
      {
        name: 'OKINOS AQUA UNO Zebra Micro-ATX, tempered glass, three ARGB fans and USB-C',
        category: 'Case',
        price: 59.0,
        specNote: 'Micro-ATX tower, three ARGB fans, front USB-C.',
        plainNote: 'Good airflow out of the box and a USB-C port on the front.'
      },
      {
        name: 'Antec GSK850 V2 AU 850W 80+ Gold, fully modular, ATX 3.1',
        category: 'PSU',
        price: 129.0,
        specNote: '850W Gold, fully modular, ATX 3.1.',
        plainNote: 'Efficient, quiet and ready for a bigger graphics card.'
      },
      {
        name: 'Microsoft Windows 11 Home OEM 64-bit',
        category: 'Operating System',
        price: 179.0,
        specNote: 'Licence included in the parts price.',
        plainNote: 'Your operating system, already paid for — never charged twice.'
      }
    ],
    specsSummary: {
      cpu: 'AMD Ryzen 5 7500X3D — 6 cores / 12 threads, listed at 4.2 GHz',
      gpu: 'Palit GeForce RTX 3060 Infinity 2 OC 12GB GDDR6',
      ram: 'Patriot Viper Venom 16GB (1 × 16GB) DDR5-6000 CL30',
      motherboard: 'Sapphire NITRO+ B850M Wi-Fi 6, AM5 DDR5 Micro-ATX',
      storage: 'Biwin Black Opal NV3500 512GB PCIe Gen 3 M.2',
      cooler: 'Montech NX600 ARGB dual-tower cooler, six heat pipes',
      case: 'OKINOS AQUA UNO Zebra Micro-ATX, tempered glass, three ARGB fans and USB-C',
      psu: 'Antec GSK850 V2 AU 850W 80+ Gold, fully modular, ATX 3.1',
      os: 'Microsoft Windows 11 Home OEM 64-bit (licence included)',
      networking: 'Wi-Fi 6 and Gigabit Ethernet on the motherboard'
    },
    features: [
      'AMD 3D V-Cache technology delivers ultra-stable minimum 1% frame times in competitive titles',
      'Massive 12GB GDDR6 VRAM for high-resolution texture packs, Premiere Pro, and Blender',
      'High-grade Antec GSK850 850W 80+ Gold ATX 3.1 power supply with ample future headroom',
      'Montech NX600 dual-tower 6-heatpipe ARGB cooler keeps thermals low under sustained loads',
      'Labour and delivery calculated at checkout'
    ]
  },
  {
    id: 'overdrive',
    name: 'Overdrive',
    tagline: 'A 16GB Radeon RX 9070 XT and a Ryzen 7 9800X3D — high refresh 1440p and beyond.',
    shortDescription: 'A 16GB Radeon RX 9070 XT and a Ryzen 7 9800X3D — high refresh 1440p and beyond.',
    tier: 'Ultra-Enthusiast Flagship System',
    resolution: '1440p high refresh / 4K',
    availability: 'available',
    basePrice: 3743.0,
    image: 'https://media.base44.com/images/public/6ad82e9d98c7f6fdc12bb981/298386eab_generated_image.png',
    accentColor: 'rose',
    badge: '1440p high refresh / 4K',
    description:
      'Uncompromising enthusiast power. Powered by AMD’s crowning Ryzen 7 9800X3D (up to 5.2 GHz) and the PowerColor Radeon Reaper RX 9070 XT 16GB GDDR6, housed in the ASUS A32 PLUS panoramic dual-chamber chassis with 360mm AIO liquid cooling.',
    aboutParagraphs: [
      'Overdrive pairs AMD’s flagship Ryzen 7 9800X3D gaming processor with a 16GB PowerColor Radeon Reaper RX 9070 XT and 32GB of low-latency DDR5-6000 CL28 memory on an ASUS TUF Gaming B850M-E WIFI board.',
      'A 360mm liquid cooler manages sustained boosts inside the ASUS A32 PLUS dual-chamber chassis, backed by a 2TB PCIe Gen 4 NVMe drive and an 850W Gold PCIe 5.1 supply. The price below covers parts and Windows 11 Home; labour and delivery are selected at checkout.'
    ],
    targetAudience:
      'Hardcore gamers and power users demanding maxed-out 4K/Ultrawide graphical fidelity, ray-tracing, and blistering multi-threaded processing.',
    components: [
      {
        name: 'AMD Ryzen 7 9800X3D, 8 cores / 16 threads, listed at up to 5.2 GHz',
        category: 'CPU',
        price: 599.0,
        specNote: '8-core Zen 5 processor with 3D V-Cache.',
        plainNote: 'Top-tier gaming performance and smooth multitasking headroom.'
      },
      {
        name: 'ASUS LC 360 ARGB 360mm AIO liquid cooler',
        category: 'CPU Cooler',
        price: 109.0,
        specNote: '360mm closed-loop liquid cooler.',
        plainNote: 'Sustains high boost clocks quietly across long sessions.'
      },
      {
        name: 'ASUS TUF Gaming B850M-E WIFI AM5 Micro-ATX',
        category: 'Motherboard',
        price: 209.0,
        specNote: 'AM5 Micro-ATX with PCIe 5.0 and Wi-Fi.',
        plainNote: 'Heavy power delivery and wireless built straight onto the board.'
      },
      {
        name: 'PowerColor Radeon Reaper RX 9070 XT 16GB GDDR6',
        category: 'GPU',
        price: 1229.0,
        specNote: '16GB GDDR6 RDNA 4 graphics.',
        plainNote: 'High-refresh 1440p and 4K gaming with 16GB of video memory.'
      },
      {
        name: 'KLEVV FIT V 32GB (2 × 16GB) DDR5-6000 CL28',
        category: 'RAM',
        price: 769.0,
        specNote: '32GB dual-channel DDR5-6000 CL28.',
        plainNote: 'Tight CL28 timings for responsive high-refresh frame pacing.'
      },
      {
        name: 'Biwin Opal NV7400 2TB PCIe Gen 4',
        category: 'SSD',
        price: 399.0,
        specNote: '2TB PCIe Gen 4 NVMe SSD.',
        plainNote: 'Space for large modern libraries without juggling drives.'
      },
      {
        name: 'ASUS A32 PLUS TG ARGB dual-chamber panoramic tempered-glass ATX mid-tower',
        category: 'Case',
        price: 125.0,
        specNote: 'Dual-chamber tempered glass mid-tower.',
        plainNote: 'Hides cables behind the tray for clean airflow and presentation.'
      },
      {
        name: 'SilverStone TR850R-GF 850W 80+ Gold, ATX 3.1 and PCIe 5.1',
        category: 'PSU',
        price: 125.0,
        specNote: '850W 80+ Gold, ATX 3.1 & PCIe 5.1.',
        plainNote: 'Japanese capacitors and clean power delivery under peak GPU load.'
      },
      {
        name: 'Microsoft Windows 11 Home OEM 64-bit',
        category: 'Operating System',
        price: 179.0,
        specNote: 'Licence included in the parts price.',
        plainNote: 'Your operating system, already paid for — never charged twice.'
      }
    ],
    specsSummary: {
      cpu: 'AMD Ryzen 7 9800X3D — 8 cores / 16 threads, up to 5.2 GHz',
      gpu: 'PowerColor Radeon Reaper RX 9070 XT 16GB GDDR6',
      ram: 'KLEVV FIT V 32GB (2 × 16GB) DDR5-6000 CL28',
      motherboard: 'ASUS TUF Gaming B850M-E WIFI AM5 Micro-ATX',
      storage: 'Biwin Opal NV7400 2TB PCIe Gen 4 NVMe',
      cooler: 'ASUS LC 360 ARGB 360mm AIO liquid cooler',
      case: 'ASUS A32 PLUS TG ARGB dual-chamber panoramic chassis',
      psu: 'SilverStone TR850R-GF 850W 80+ Gold, ATX 3.1 / PCIe 5.1',
      os: 'Microsoft Windows 11 Home OEM 64-bit (licence included)',
      networking: 'Wi-Fi and 2.5Gb Ethernet on the motherboard'
    },
    features: [
      'AMD Ryzen 7 9800X3D flagship processor with up to 5.2 GHz boost clock',
      'PowerColor Reaper RX 9070 XT 16GB GDDR6 for uncompromising 4K rasterization and ray-tracing',
      'Ultra-fast low-latency KLEVV FIT V 32GB DDR5-6000 with elite CL28 memory timings',
      'Massive 2TB Biwin Opal NV7400 Gen 4 SSD with lightning-fast game loading speeds',
      'Premium 360mm triple-fan ARGB AIO liquid cooler in an aquarium dual-chamber view',
      'Labour and delivery calculated at checkout'
    ]
  }
];

export function getCustomPcById(id: string): CustomPcProduct | undefined {
  const normalized = id.toLowerCase().replace(/_/g, '-');
  if (normalized === 'custom-pc-build' || normalized.startsWith('custom-')) {
    try {
      const stored = localStorage.getItem('qtr_custom_pc_build');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }
  return THREE_CUSTOM_PCS.find(
    (pc) => pc.id.toLowerCase() === normalized || pc.name.toLowerCase().replace(/\s+/g, '-') === normalized
  );
}

export function formatAud(amount: number): string {
  return 'A$' + new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function calculatePcOrderPricing(
  pc: CustomPcProduct,
  buildServiceId: 'fast' | 'full',
  deliveryMethodId: 'pickup' | 'normal' | 'express',
  shippingConfig: ShippingConfig = DEFAULT_SHIPPING_CONFIG
) {
  const partsAndWindowsPrice = pc.basePrice;
  const buildService = BUILD_SERVICES[buildServiceId];
  const buildServicePrice = buildService.price;

  const subtotalBeforeDelivery = partsAndWindowsPrice + buildServicePrice;

  const deliveryPrice =
    deliveryMethodId === 'pickup'
      ? 0
      : deliveryMethodId === 'express'
      ? shippingConfig.expressPrice
      : shippingConfig.normalPrice;
  const deliveryTimeframe =
    deliveryMethodId === 'pickup'
      ? 'Workshop collection when ready'
      : deliveryMethodId === 'express'
      ? shippingConfig.expressTimeframe
      : shippingConfig.normalTimeframe;
  const deliveryMethodName =
    deliveryMethodId === 'pickup'
      ? 'Pick up'
      : deliveryMethodId === 'express'
      ? 'Express Delivery'
      : 'Normal Delivery';

  const finalTotal = subtotalBeforeDelivery + deliveryPrice;

  return {
    pcId: pc.id,
    pcName: pc.name,
    partsAndWindowsPrice,
    buildServiceId,
    buildServiceName: buildService.name,
    buildServicePrice,
    subtotalBeforeDelivery,
    deliveryMethodId,
    deliveryMethodName,
    deliveryPrice,
    deliveryTimeframe,
    finalTotal
  };
}

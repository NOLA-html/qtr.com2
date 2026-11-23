import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve(process.cwd(), 'public/images/parts');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Full catalogue data definition
interface BuilderPartData {
  id: string;
  name: string;
  brand: string;
  category: 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'cooler' | 'case' | 'psu' | 'fans' | 'os';
  platform: 'AMD' | 'Intel' | 'Both';
  price: number;
  image: string;
  wattage: number;
  socket?: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851';
  chipset?: string;
  ramType?: 'DDR4' | 'DDR5';
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
  supportedFormFactors?: ('ATX' | 'Micro-ATX' | 'Mini-ITX')[];
  gpuLengthMm?: number;
  maxGpuLengthMm?: number;
  coolerType?: 'air' | 'aio_240' | 'aio_360';
  coolerHeightMm?: number;
  maxCoolerHeightMm?: number;
  radiatorSupport?: string[];
  storageType?: 'M.2 NVMe' | '2.5" SATA' | '3.5" HDD';
  moboMapUrl?: string;
  has3dModel?: boolean;
  specs: Record<string, string>;
  description: string;
  inStock?: boolean;
}

const parts: BuilderPartData[] = [
  // =========================================================================
  // 1. AMD PROCESSORS
  // =========================================================================
  {
    id: 'cpu-r7-9800x3d',
    name: 'AMD Ryzen 7 9800X3D',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 599,
    image: '/images/parts/cpu-r7-9800x3d.svg',
    wattage: 120,
    socket: 'AM5',
    specs: {
      'Cores / Threads': '8 Cores / 16 Threads',
      'Architecture': 'Zen 5 with 2nd Gen 3D V-Cache',
      'Base Clock': '4.7 GHz',
      'Boost Clock': 'Up to 5.2 GHz',
      'L3 Cache': '96MB 3D V-Cache',
      'Socket': 'AM5',
      'TDP': '120W',
      'Memory Support': 'DDR5-6000+ Native'
    },
    description: 'The world’s fastest dedicated PC gaming processor, engineered on Zen 5 with direct IHS die contact.'
  },
  {
    id: 'cpu-r7-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 649,
    image: '/images/parts/cpu-r7-7800x3d.svg',
    wattage: 120,
    socket: 'AM5',
    specs: {
      'Cores / Threads': '8 Cores / 16 Threads',
      'Architecture': 'Zen 4 3D V-Cache',
      'Base Clock': '4.2 GHz',
      'Boost Clock': 'Up to 5.0 GHz',
      'L3 Cache': '96MB V-Cache',
      'Socket': 'AM5',
      'TDP': '120W',
      'Memory Support': 'DDR5'
    },
    description: 'Benchmark-dominating 8-core gaming powerhouse with industry-leading 1% low frame rates.'
  },
  {
    id: 'cpu-r9-7950x3d',
    name: 'AMD Ryzen 9 7950X3D',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 899,
    image: '/images/parts/cpu-r9-7950x3d.svg',
    wattage: 120,
    socket: 'AM5',
    specs: {
      'Cores / Threads': '16 Cores / 32 Threads',
      'Architecture': 'Zen 4 Dual-CCD (V-Cache + Frequency)',
      'Base Clock': '4.2 GHz',
      'Boost Clock': 'Up to 5.7 GHz',
      'L3 Cache': '128MB Cache',
      'Socket': 'AM5',
      'TDP': '120W',
      'Memory Support': 'DDR5'
    },
    description: 'Ultimate hybrid processor delivering both extreme 3D gaming performance and 32-thread workstation rendering.'
  },
  {
    id: 'cpu-r9-7900x',
    name: 'AMD Ryzen 9 7900X',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 589,
    image: '/images/parts/cpu-r9-7900x.svg',
    wattage: 170,
    socket: 'AM5',
    specs: {
      'Cores / Threads': '12 Cores / 24 Threads',
      'Architecture': 'Zen 4',
      'Base Clock': '4.7 GHz',
      'Boost Clock': 'Up to 5.6 GHz',
      'Socket': 'AM5',
      'TDP': '170W',
      'Memory Support': 'DDR5'
    },
    description: '12-core high-frequency production processor ideal for Blender, video grading, and multi-app multitasking.'
  },
  {
    id: 'cpu-r7-9700x',
    name: 'AMD Ryzen 7 9700X',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 529,
    image: '/images/parts/cpu-r7-9700x.svg',
    wattage: 65,
    socket: 'AM5',
    specs: {
      'Cores / Threads': '8 Cores / 16 Threads',
      'Architecture': 'Zen 5',
      'Base Clock': '3.8 GHz',
      'Boost Clock': 'Up to 5.5 GHz',
      'Socket': 'AM5',
      'TDP': '65W',
      'Memory Support': 'DDR5'
    },
    description: 'High-efficiency 65W Zen 5 processor delivering exceptional single-core responsiveness and cool operation.'
  },
  {
    id: 'cpu-r5-7600',
    name: 'AMD Ryzen 5 7600',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 319,
    image: '/images/parts/cpu-r5-7600.svg',
    wattage: 65,
    socket: 'AM5',
    specs: {
      'Cores / Threads': '6 Cores / 12 Threads',
      'Architecture': 'Zen 4',
      'Base Clock': '3.8 GHz',
      'Boost Clock': 'Up to 5.1 GHz',
      'Socket': 'AM5',
      'TDP': '65W',
      'Memory Support': 'DDR5'
    },
    description: 'The definitive entry into AM5 DDR5 platforms, combining high gaming frame rates with ultra-efficient 65W power.'
  },
  {
    id: 'cpu-r5-7500x3d',
    name: 'AMD Ryzen 5 7500X3D',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 397,
    image: '/images/parts/cpu-r5-7500x3d.svg',
    wattage: 85,
    socket: 'AM5',
    specs: {
      'Cores / Threads': '6 Cores / 12 Threads',
      'Base Clock': '4.2 GHz',
      'Boost Clock': 'Up to 4.8 GHz',
      'Socket': 'AM5',
      'L3 Cache': '96MB 3D V-Cache',
      'Memory Support': 'DDR5'
    },
    description: 'Specialist 3D V-Cache processor delivering unbelievable esports smoothness and competitive gaming frame times.'
  },
  {
    id: 'cpu-r7-5700x3d',
    name: 'AMD Ryzen 7 5700X3D',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 349,
    image: '/images/parts/cpu-r7-5700x3d.svg',
    wattage: 105,
    socket: 'AM4',
    specs: {
      'Cores / Threads': '8 Cores / 16 Threads',
      'Base Clock': '3.0 GHz',
      'Boost Clock': 'Up to 4.1 GHz',
      'L3 Cache': '96MB 3D V-Cache',
      'Socket': 'AM4',
      'TDP': '105W',
      'Memory Support': 'DDR4'
    },
    description: 'The supreme drop-in upgrade for existing AM4 systems, revitalising DDR4 rigs with stacked 3D V-Cache.'
  },
  {
    id: 'cpu-r5-5600x',
    name: 'AMD Ryzen 5 5600X',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 199,
    image: '/images/parts/cpu-r5-5600x.svg',
    wattage: 65,
    socket: 'AM4',
    specs: {
      'Cores / Threads': '6 Cores / 12 Threads',
      'Base Clock': '3.7 GHz',
      'Boost Clock': 'Up to 4.6 GHz',
      'Socket': 'AM4',
      'TDP': '65W',
      'Memory Support': 'DDR4-3200'
    },
    description: 'Proven Zen 3 performance king for esports and high frame-rate 1080p gaming on budget AM4 motherboards.'
  },

  // =========================================================================
  // 2. INTEL PROCESSORS
  // =========================================================================
  {
    id: 'cpu-cu9-285k',
    name: 'Intel Core Ultra 9 285K',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 949,
    image: '/images/parts/cpu-cu9-285k.svg',
    wattage: 250,
    socket: 'LGA1851',
    specs: {
      'Cores / Threads': '24 Cores (8P + 16E)',
      'Architecture': 'Arrow Lake with NPU',
      'Turbo Boost': 'Up to 5.7 GHz',
      'Socket': 'LGA1851',
      'NPU AI Acceleration': '13 TOPS Dedicated',
      'TDP': '250W Max',
      'Memory Support': 'DDR5 only'
    },
    description: 'Flagship Arrow Lake workstation computing with integrated AI Boost NPU and revolutionary energy efficiency.'
  },
  {
    id: 'cpu-cu7-265k',
    name: 'Intel Core Ultra 7 265K',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 629,
    image: '/images/parts/cpu-cu7-265k.svg',
    wattage: 125,
    socket: 'LGA1851',
    specs: {
      'Cores / Threads': '20 Cores (8P + 12E)',
      'Turbo Boost': 'Up to 5.5 GHz',
      'Socket': 'LGA1851',
      'NPU': 'Intel AI Boost NPU',
      'TDP': '125W Base / 250W Peak',
      'Memory Support': 'DDR5 only'
    },
    description: 'Next-gen performance hybrid CPU engineered with dedicated on-die AI acceleration and thermal optimizations.'
  },
  {
    id: 'cpu-cu5-245k',
    name: 'Intel Core Ultra 5 245K',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 479,
    image: '/images/parts/cpu-cu5-245k.svg',
    wattage: 125,
    socket: 'LGA1851',
    specs: {
      'Cores / Threads': '14 Cores (6P + 8E)',
      'Turbo Boost': 'Up to 5.2 GHz',
      'Socket': 'LGA1851',
      'NPU': 'Integrated AI Engine',
      'TDP': '125W Base / 159W Peak',
      'Memory Support': 'DDR5 only'
    },
    description: 'Enthusiast mainstream processor with cutting-edge LGA1851 features and integrated hardware AI capabilities.'
  },
  {
    id: 'cpu-i9-14900k',
    name: 'Intel Core i9-14900K',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 849,
    image: '/images/parts/cpu-i9-14900k.svg',
    wattage: 253,
    socket: 'LGA1700',
    specs: {
      'Cores / Threads': '24 Cores (8P + 16E) / 32 Threads',
      'Turbo Boost': 'Up to 6.0 GHz Thermal Velocity',
      'Socket': 'LGA1700',
      'TDP': '253W Max',
      'Memory Support': 'DDR5 or DDR4'
    },
    description: 'Uncapped 6.0 GHz clock speed monster delivering blazing single-thread responsiveness and 32 threads of brute power.'
  },
  {
    id: 'cpu-i7-14700k',
    name: 'Intel Core i7-14700K',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 599,
    image: '/images/parts/cpu-i7-14700k.svg',
    wattage: 253,
    socket: 'LGA1700',
    specs: {
      'Cores / Threads': '20 Cores (8P + 12E) / 28 Threads',
      'Turbo Boost': 'Up to 5.6 GHz',
      'Socket': 'LGA1700',
      'TDP': '253W Max',
      'Memory Support': 'DDR5 or DDR4'
    },
    description: '20-core powerhouse featuring expanded E-core cluster for effortless streaming and intense multitasking.'
  },
  {
    id: 'cpu-i5-14600kf',
    name: 'Intel Core i5-14600KF',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 429,
    image: '/images/parts/cpu-i5-14600kf.svg',
    wattage: 125,
    socket: 'LGA1700',
    specs: {
      'Cores / Threads': '14 Cores (6P + 8E) / 20 Threads',
      'Turbo Boost': 'Up to 5.3 GHz',
      'Socket': 'LGA1700',
      'TDP': '125W Base / 181W Peak',
      'Memory Support': 'DDR5 or DDR4'
    },
    description: 'Exceptional blend of gaming clock speeds and multi-threaded headroom on the proven LGA1700 platform.'
  },
  {
    id: 'cpu-i5-13400f',
    name: 'Intel Core i5-13400F',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 269,
    image: '/images/parts/cpu-i5-13400f.svg',
    wattage: 65,
    socket: 'LGA1700',
    specs: {
      'Cores / Threads': '10 Cores (6P + 4E) / 16 Threads',
      'Turbo Boost': 'Up to 4.6 GHz',
      'Socket': 'LGA1700',
      'TDP': '65W',
      'Memory Support': 'DDR4 or DDR5'
    },
    description: 'Balanced 10-core hybrid CPU offering tremendous value for entry-to-midrange gaming PCs.'
  },
  {
    id: 'cpu-i5-12400f',
    name: 'Intel Core i5-12400F',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 189,
    image: '/images/parts/cpu-i5-12400f.svg',
    wattage: 65,
    socket: 'LGA1700',
    specs: {
      'Cores / Threads': '6 P-Cores / 12 Threads',
      'Base Clock': '2.5 GHz',
      'Turbo Boost': 'Up to 4.4 GHz',
      'Socket': 'LGA1700',
      'TDP': '65W',
      'Memory Support': 'DDR4 or DDR5'
    },
    description: 'Budget-friendly 6-core performer offering exceptional value for 1080p and 1440p gaming systems.'
  },

  // =========================================================================
  // 3. MOTHERBOARDS (AMD & INTEL)
  // =========================================================================
  {
    id: 'mb-asus-b850m-e',
    name: 'ASUS TUF Gaming B850M-E WIFI',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'AMD',
    price: 209,
    image: '/images/parts/mb-asus-b850m-e.svg',
    wattage: 30,
    socket: 'AM5',
    chipset: 'B850',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B850',
      'Memory Slots': '4 x DDR5 (Up to 8000+ MT/s)',
      'PCIe Slots': '1 x PCIe 5.0 x16, 1 x PCIe 4.0 x16',
      'Networking': 'Wi-Fi 6E + 2.5Gb Ethernet'
    },
    description: 'Military-grade TUF components, PCIe 5.0 graphics support, and dual M.2 heatsinks on the AM5 platform.'
  },
  {
    id: 'mb-msi-b650-tomahawk',
    name: 'MSI MAG B650 TOMAHAWK WIFI',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'AMD',
    price: 329,
    image: '/images/parts/mb-msi-b650-tomahawk.svg',
    wattage: 35,
    socket: 'AM5',
    chipset: 'B650',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B650',
      'Power Delivery': '14+2+1 Duet Rail Power System',
      'Memory Slots': '4 x DDR5 (128GB Max)',
      'M.2 Slots': '3 x M.2 Shield Frozr',
      'Networking': 'Wi-Fi 6E + 2.5Gb LAN'
    },
    description: 'Renowned military-styled ATX board with heavy heatsinks and extended power stages for high-wattage Ryzen CPUs.'
  },
  {
    id: 'mb-gigabyte-b650-aorus-elite',
    name: 'Gigabyte B650 AORUS ELITE AX V2',
    brand: 'Gigabyte',
    category: 'motherboard',
    platform: 'AMD',
    price: 319,
    image: '/images/parts/mb-gigabyte-b650-aorus-elite.svg',
    wattage: 35,
    socket: 'AM5',
    chipset: 'B650',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B650',
      'Power Stages': '12+2+2 Twin Digital VRM',
      'M.2 Slots': '1 x PCIe 5.0 M.2 + 2 x PCIe 4.0 M.2',
      'Networking': 'Wi-Fi 6E + 2.5GbE LAN'
    },
    description: 'Premium AORUS aesthetics, full-coverage thermal armor, and EZ-Latch PCIe installation.'
  },
  {
    id: 'mb-sapphire-nitro-b850m',
    name: 'Sapphire NITRO+ B850M Wi-Fi 6',
    brand: 'Sapphire',
    category: 'motherboard',
    platform: 'AMD',
    price: 179,
    image: '/images/parts/mb-sapphire-nitro-b850m.svg',
    wattage: 30,
    socket: 'AM5',
    chipset: 'B850',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B850',
      'Memory Slots': '4 x DDR5 (Up to 7600 MT/s)',
      'PCIe Slots': '1 x PCIe 5.0 x16 Steel Slot',
      'Networking': 'Wi-Fi 6 + 2.5Gbps Realtek'
    },
    description: 'Clean brushed titanium aesthetics with premium VRM heatsinks and reinforced PCIe slot.'
  },
  {
    id: 'mb-asrock-b650i-lightning',
    name: 'ASRock B650I Lightning WiFi',
    brand: 'ASRock',
    category: 'motherboard',
    platform: 'AMD',
    price: 319,
    image: '/images/parts/mb-asrock-b650i-lightning.svg',
    wattage: 25,
    socket: 'AM5',
    chipset: 'B650',
    ramType: 'DDR5',
    formFactor: 'Mini-ITX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'Mini-ITX (Compact SFF)',
      'Socket': 'AM5',
      'Chipset': 'AMD B650',
      'Memory Slots': '2 x DDR5 (Up to 7200+ MT/s)',
      'PCIe Slot': '1 x PCIe 5.0 x16',
      'Networking': 'Wi-Fi 6E + Killer 2.5GbE'
    },
    description: 'Ultra-compact Mini-ITX motherboard crafted specifically for small form factor (SFF) enthusiast builds.'
  },
  {
    id: 'mb-asus-rog-x870e',
    name: 'ASUS ROG STRIX X870E-E GAMING WIFI',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'AMD',
    price: 749,
    image: '/images/parts/mb-asus-rog-x870e.svg',
    wattage: 50,
    socket: 'AM5',
    chipset: 'X870E',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD X870E Dual Chipset',
      'Power Stages': '18+2+2 Teamed Power Stages',
      'USB Ports': 'Dual USB4 40Gbps Ports',
      'Networking': 'Wi-Fi 7 + Intel 5Gbps LAN'
    },
    description: 'Extreme enthusiast X870E flagship engineered for record-setting Ryzen 9000 overclocks with dual USB4.'
  },
  {
    id: 'mb-asus-b550m-a',
    name: 'ASUS Prime B550M-A WiFi II',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'AMD',
    price: 129,
    image: '/images/parts/mb-asus-b550m-a.svg',
    wattage: 25,
    socket: 'AM4',
    chipset: 'B550',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'AM4',
      'Chipset': 'AMD B550',
      'Memory Slots': '4 x DDR4 (Up to 4866 MHz OC)',
      'PCIe Slots': '1 x PCIe 4.0 x16, 2 x PCIe 3.0 x1',
      'Networking': 'Wi-Fi 6 + Realtek 1Gb Ethernet'
    },
    description: 'Reliable Micro-ATX board with integrated Wi-Fi 6, dual M.2 slots, and proven AM4 DDR4 compatibility.'
  },
  // Intel Motherboards
  {
    id: 'mb-asus-z890-plus',
    name: 'ASUS TUF Gaming Z890-PLUS WIFI',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'Intel',
    price: 489,
    image: '/images/parts/mb-asus-z890-plus.svg',
    wattage: 45,
    socket: 'LGA1851',
    chipset: 'Z890',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1851 (Arrow Lake)',
      'Chipset': 'Intel Z890',
      'Power Stages': '16+1+2+1 DrMOS Power Stages',
      'PCIe Slots': 'PCIe 5.0 x16 with Q-Release Slim',
      'Networking': 'Wi-Fi 7 + Intel 2.5Gb Ethernet'
    },
    description: 'Next-generation Arrow Lake motherboard with Wi-Fi 7, Thunderbolt 4 support, and military TUF reliability.'
  },
  {
    id: 'mb-msi-z890-p',
    name: 'MSI PRO Z890-P WIFI',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'Intel',
    price: 399,
    image: '/images/parts/mb-msi-z890-p.svg',
    wattage: 40,
    socket: 'LGA1851',
    chipset: 'Z890',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1851 (Arrow Lake)',
      'Chipset': 'Intel Z890',
      'Memory Slots': '4 x DDR5 (Up to 8600+ MT/s)',
      'Storage': '4 x M.2 Connectors (1x Gen 5)',
      'Networking': 'Wi-Fi 7 + 5Gbps LAN'
    },
    description: 'Clean professional workstation board equipped with ultra-fast 5G LAN and PCIe 5.0 M.2 storage.'
  },
  {
    id: 'mb-asus-z790-plus',
    name: 'ASUS TUF Gaming Z790-PLUS WIFI',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'Intel',
    price: 369,
    image: '/images/parts/mb-asus-z790-plus.svg',
    wattage: 40,
    socket: 'LGA1700',
    chipset: 'Z790',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1700',
      'Chipset': 'Intel Z790',
      'Power Stages': '16+1 DrMOS Power Stages',
      'PCIe Slots': '1 x PCIe 5.0 x16 SafeSlot',
      'Networking': 'Intel Wi-Fi 6E + 2.5Gb Ethernet'
    },
    description: 'Workhorse LGA1700 platform with PCIe 5.0 graphics slot, 4x M.2 slots, and robust overclocking headroom.'
  },
  {
    id: 'mb-msi-b760m-d4',
    name: 'MSI PRO B760M-A WIFI DDR4',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'Intel',
    price: 199,
    image: '/images/parts/mb-msi-b760m-d4.svg',
    wattage: 30,
    socket: 'LGA1700',
    chipset: 'B760',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'LGA1700',
      'Chipset': 'Intel B760',
      'Memory Slots': '4 x DDR4 (Up to 5333 MHz OC)',
      'PCIe Slots': '2 x PCIe 4.0 x16',
      'Networking': 'Wi-Fi 6E + Realtek 2.5Gb LAN'
    },
    description: 'High-value LGA1700 motherboard supporting affordable DDR4 RAM with onboard Wi-Fi 6E.'
  },
  {
    id: 'mb-gigabyte-b760m-aorus-ax',
    name: 'Gigabyte B760M AORUS ELITE AX',
    brand: 'Gigabyte',
    category: 'motherboard',
    platform: 'Intel',
    price: 249,
    image: '/images/parts/mb-gigabyte-b760m-aorus-ax.svg',
    wattage: 30,
    socket: 'LGA1700',
    chipset: 'B760',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'LGA1700',
      'Chipset': 'Intel B760',
      'Memory Slots': '4 x DDR5 (Up to 7600 MT/s)',
      'M.2 Slots': '2 x PCIe 4.0 M.2 with Thermal Guard',
      'Networking': 'Wi-Fi 6E + 2.5GbE LAN'
    },
    description: 'Compact AORUS Micro-ATX board with high-speed DDR5 memory support and comprehensive thermal shielding.'
  },

  // =========================================================================
  // 4. GRAPHICS CARDS (GPUS)
  // =========================================================================
  {
    id: 'gpu-asus-rtx4090',
    name: 'ASUS ROG Strix GeForce RTX 4090 24GB OC',
    brand: 'ASUS',
    category: 'gpu',
    platform: 'Both',
    price: 3499,
    image: '/images/parts/gpu-asus-rtx4090.svg',
    wattage: 450,
    gpuLengthMm: 357,
    specs: {
      'VRAM': '24GB GDDR6X',
      'CUDA Cores': '16,384',
      'Memory Bus': '384-bit',
      'Boost Clock': '2640 MHz (OC Mode)',
      'Power Connectors': '1 x 16-pin (12VHPWR)',
      'Length': '357 mm (3.5 Slots)'
    },
    description: 'Uncontested flagship graphics card with massive patented vapor chamber and die-cast metal shroud.'
  },
  {
    id: 'gpu-gigabyte-rtx4080s',
    name: 'Gigabyte GeForce RTX 4080 SUPER Gaming OC 16GB',
    brand: 'Gigabyte',
    category: 'gpu',
    platform: 'Both',
    price: 1749,
    image: '/images/parts/gpu-gigabyte-rtx4080s.svg',
    wattage: 320,
    gpuLengthMm: 342,
    specs: {
      'VRAM': '16GB GDDR6X',
      'CUDA Cores': '10,240',
      'Memory Speed': '23 Gbps',
      'Boost Clock': '2595 MHz',
      'Cooling': 'WINDFORCE 3X 110mm Fans',
      'Length': '342 mm'
    },
    description: 'High-end 4K ray-tracing and DLSS 3.5 powerhouse with alternate-spinning fans and composite copper heatpipes.'
  },
  {
    id: 'gpu-asus-rtx4070tis',
    name: 'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB',
    brand: 'ASUS',
    category: 'gpu',
    platform: 'Both',
    price: 1399,
    image: '/images/parts/gpu-asus-rtx4070tis.svg',
    wattage: 285,
    gpuLengthMm: 305,
    specs: {
      'VRAM': '16GB GDDR6X',
      'CUDA Cores': '8,448',
      'Memory Bus': '256-bit',
      'Boost Clock': '2640 MHz',
      'Length': '305 mm (3.25 Slots)',
      'Form Factor': 'Full Metal Exoskeleton'
    },
    description: 'Upgraded 16GB memory buffer with wide 256-bit bus, ideal for high-framerate 1440p and 4K ultra textures.'
  },
  {
    id: 'gpu-msi-rtx4070s',
    name: 'MSI GeForce RTX 4070 SUPER 12G Ventus 2X OC',
    brand: 'MSI',
    category: 'gpu',
    platform: 'Both',
    price: 999,
    image: '/images/parts/gpu-msi-rtx4070s.svg',
    wattage: 220,
    gpuLengthMm: 242,
    specs: {
      'VRAM': '12GB GDDR6X',
      'CUDA Cores': '7,168',
      'Boost Clock': '2505 MHz',
      'Power Connectors': '1 x 16-pin (12VHPWR)',
      'Length': '242 mm (Dual Slot)'
    },
    description: 'Compact dual-fan form factor fitting virtually any case, delivering exceptional 1440p gaming performance.'
  },
  {
    id: 'gpu-asus-rtx4060ti',
    name: 'ASUS Dual GeForce RTX 4060 Ti EVO OC 8GB',
    brand: 'ASUS',
    category: 'gpu',
    platform: 'Both',
    price: 599,
    image: '/images/parts/gpu-asus-rtx4060ti.svg',
    wattage: 160,
    gpuLengthMm: 227,
    specs: {
      'VRAM': '8GB GDDR6',
      'CUDA Cores': '4,352',
      'Boost Clock': '2595 MHz (OC Mode)',
      'Power Connectors': '1 x 8-pin PCIe',
      'Length': '227 mm'
    },
    description: 'Mainstream 1080p and 1440p graphics card with DLSS 3 frame generation and Axial-tech fan design.'
  },
  {
    id: 'gpu-gigabyte-rtx4060',
    name: 'Gigabyte GeForce RTX 4060 WindForce OC 8GB',
    brand: 'Gigabyte',
    category: 'gpu',
    platform: 'Both',
    price: 459,
    image: '/images/parts/gpu-gigabyte-rtx4060.svg',
    wattage: 115,
    gpuLengthMm: 192,
    specs: {
      'VRAM': '8GB GDDR6',
      'CUDA Cores': '3,072',
      'Boost Clock': '2475 MHz',
      'Power Connectors': '1 x 8-pin PCIe',
      'Length': '192 mm (Ultra Compact)'
    },
    description: 'Highly accessible Ada Lovelace card consuming only 115W, with native AV1 hardware encoding.'
  },
  {
    id: 'gpu-asus-rtx5050',
    name: 'ASUS Dual GeForce RTX 5050 8GB OC GDDR6',
    brand: 'ASUS',
    category: 'gpu',
    platform: 'Both',
    price: 499,
    image: '/images/parts/gpu-asus-rtx5050.svg',
    wattage: 130,
    gpuLengthMm: 205,
    specs: {
      'VRAM': '8GB GDDR6',
      'Memory Interface': '128-bit',
      'Boost Clock': '2610 MHz',
      'Outputs': '3 x DisplayPort 1.4a, 1 x HDMI 2.1',
      'Length': '205 mm'
    },
    description: 'Next-generation architecture featuring modern ray-tracing, AI tensor cores, and quiet dual-axial cooling.'
  },
  {
    id: 'gpu-sapphire-rx7900xtx',
    name: 'Sapphire NITRO+ Radeon RX 7900 XTX Vapor-X 24GB',
    brand: 'Sapphire',
    category: 'gpu',
    platform: 'Both',
    price: 1699,
    image: '/images/parts/gpu-sapphire-rx7900xtx.svg',
    wattage: 420,
    gpuLengthMm: 320,
    specs: {
      'VRAM': '24GB GDDR6',
      'Compute Units': '96 RDNA 3 CUs',
      'Memory Bus': '384-bit',
      'Boost Clock': 'Up to 2680 MHz',
      'Power Connectors': '3 x 8-pin PCIe',
      'Length': '320 mm'
    },
    description: 'The pinnacle of AMD RDNA 3 architecture featuring a custom Vapor-X chamber and full ARGB light bar.'
  },
  {
    id: 'gpu-powercolor-rx7900gre',
    name: 'PowerColor Hellhound Radeon RX 7900 GRE 16GB',
    brand: 'PowerColor',
    category: 'gpu',
    platform: 'Both',
    price: 899,
    image: '/images/parts/gpu-powercolor-rx7900gre.svg',
    wattage: 260,
    gpuLengthMm: 322,
    specs: {
      'VRAM': '16GB GDDR6',
      'Compute Units': '80 RDNA 3 CUs',
      'Memory Bus': '256-bit',
      'Boost Clock': '2366 MHz',
      'Length': '322 mm'
    },
    description: 'Sweet-spot 1440p and 4K powerhouse card with 16GB high-bandwidth VRAM and dual-ball bearing fans.'
  },
  {
    id: 'gpu-sapphire-rx7800xt',
    name: 'Sapphire PULSE Radeon RX 7800 XT 16GB',
    brand: 'Sapphire',
    category: 'gpu',
    platform: 'Both',
    price: 779,
    image: '/images/parts/gpu-sapphire-rx7800xt.svg',
    wattage: 263,
    gpuLengthMm: 280,
    specs: {
      'VRAM': '16GB GDDR6',
      'Compute Units': '60 RDNA 3 CUs',
      'Boost Clock': '2430 MHz',
      'Length': '280 mm (Dual Slot)'
    },
    description: 'Premier 1440p gaming card with high 16GB VRAM buffer for heavy textures and future game headroom.'
  },
  {
    id: 'gpu-asus-rx7600',
    name: 'ASUS Dual Radeon RX 7600 EVO OC 8GB',
    brand: 'ASUS',
    category: 'gpu',
    platform: 'Both',
    price: 419,
    image: '/images/parts/gpu-asus-rx7600.svg',
    wattage: 165,
    gpuLengthMm: 227,
    specs: {
      'VRAM': '8GB GDDR6',
      'Compute Units': '32 RDNA 3 CUs',
      'Boost Clock': '2715 MHz',
      'Length': '227 mm'
    },
    description: 'Affordable high-fps 1080p esports graphics with modern DisplayPort 2.1 display engine.'
  },
  {
    id: 'gpu-palit-rtx3060',
    name: 'Palit GeForce RTX 3060 Infinity 2 OC 12GB',
    brand: 'Palit',
    category: 'gpu',
    platform: 'Both',
    price: 539,
    image: '/images/parts/gpu-palit-rtx3060.svg',
    wattage: 170,
    gpuLengthMm: 245,
    specs: {
      'VRAM': '12GB GDDR6',
      'Memory Interface': '192-bit',
      'Boost Clock': '1837 MHz',
      'Length': '245 mm'
    },
    description: 'High-VRAM 12GB memory card favoured for video rendering, AI diffusion generation, and gaming.'
  },

  // =========================================================================
  // 5. MEMORY (RAM)
  // =========================================================================
  {
    id: 'ram-gskill-32-d5-6000',
    name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000 CL30',
    brand: 'G.Skill',
    category: 'ram',
    platform: 'Both',
    price: 199,
    image: '/images/parts/ram-gskill-32-d5-6000.svg',
    wattage: 15,
    ramType: 'DDR5',
    specs: {
      'Capacity': '32GB (2 x 16GB)',
      'Speed': 'DDR5-6000 MT/s',
      'Timings': 'CL30-38-38-96',
      'Voltage': '1.35V',
      'Profile': 'AMD EXPO & Intel XMP 3.0'
    },
    description: 'The definitive sweet spot for modern AMD and Intel systems with ultra-tight CL30 latency and RGB lightbar.'
  },
  {
    id: 'ram-corsair-32-d5-6000',
    name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000 CL30',
    brand: 'Corsair',
    category: 'ram',
    platform: 'Both',
    price: 189,
    image: '/images/parts/ram-corsair-32-d5-6000.svg',
    wattage: 15,
    ramType: 'DDR5',
    specs: {
      'Capacity': '32GB (2 x 16GB)',
      'Speed': 'DDR5-6000 MT/s',
      'Timings': 'CL30-36-36-76',
      'Profile': 'Intel XMP 3.0 & AMD EXPO Compatible'
    },
    description: 'Low-latency DDR5 kit with ten individually addressable RGB LEDs and solid aluminum heat spreader.'
  },
  {
    id: 'ram-kingston-32-d5-5600',
    name: 'Kingston Fury Beast 32GB (2x16GB) DDR5-5600 CL36',
    brand: 'Kingston',
    category: 'ram',
    platform: 'Both',
    price: 159,
    image: '/images/parts/ram-kingston-32-d5-5600.svg',
    wattage: 15,
    ramType: 'DDR5',
    specs: {
      'Capacity': '32GB (2 x 16GB)',
      'Speed': 'DDR5-5600 MT/s',
      'Timings': 'CL36-38-38',
      'Profile': 'Plug N Play Automatic Overclocking'
    },
    description: 'Low-profile matte black heat spreader with automatic overclocking at standard 1.25V.'
  },
  {
    id: 'ram-patriot-16-d5',
    name: 'Patriot Viper Venom 16GB (1x16GB) DDR5-6000 CL30',
    brand: 'Patriot',
    category: 'ram',
    platform: 'Both',
    price: 379,
    image: '/images/parts/ram-patriot-16-d5.svg',
    wattage: 10,
    ramType: 'DDR5',
    specs: {
      'Capacity': '16GB (1 x 16GB Single Module)',
      'Speed': 'DDR5-6000 MT/s',
      'Timings': 'CL30-40-40-76',
      'Profile': 'AMD EXPO Ready'
    },
    description: 'High-frequency 6000MHz CL30 performance module engineered for AM5 systems with upgrade room.'
  },
  {
    id: 'ram-gskill-64-d5',
    name: 'G.Skill Ripjaws S5 64GB (2x32GB) DDR5-6000 CL32',
    brand: 'G.Skill',
    category: 'ram',
    platform: 'Both',
    price: 349,
    image: '/images/parts/ram-gskill-64-d5.svg',
    wattage: 20,
    ramType: 'DDR5',
    specs: {
      'Capacity': '64GB (2 x 32GB)',
      'Speed': 'DDR5-6000 MT/s',
      'Timings': 'CL32-38-38-96',
      'Height': '33 mm Low-Profile'
    },
    description: 'High-density 64GB kit with low-profile 33mm height for maximum clearance under large air coolers.'
  },
  {
    id: 'ram-corsair-16-d4',
    name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200 CL16',
    brand: 'Corsair',
    category: 'ram',
    platform: 'Both',
    price: 69,
    image: '/images/parts/ram-corsair-16-d4.svg',
    wattage: 10,
    ramType: 'DDR4',
    specs: {
      'Capacity': '16GB (2 x 8GB)',
      'Speed': 'DDR4-3200 MT/s',
      'Timings': 'CL16-20-20-38',
      'Height': '34 mm Low Profile'
    },
    description: 'Classic low-profile DDR4 memory for AM4 and budget LGA1700 builds.'
  },
  {
    id: 'ram-gskill-trident-16-d4',
    name: 'G.Skill Trident Z RGB 16GB (2x8GB) DDR4-3600 CL16',
    brand: 'G.Skill',
    category: 'ram',
    platform: 'Both',
    price: 199,
    image: '/images/parts/ram-gskill-trident-16-d4.svg',
    wattage: 12,
    ramType: 'DDR4',
    specs: {
      'Capacity': '16GB (2 x 8GB)',
      'Speed': 'DDR4-3600 MT/s',
      'Timings': 'CL16-16-16-36 B-Die Tight Latency',
      'Profile': 'Intel XMP 2.0'
    },
    description: 'Enthusiast Samsung B-Die DDR4 memory running at ultra-tight CL16 timings with vibrant RGB illumination.'
  },

  // =========================================================================
  // 6. STORAGE (NVME, SATA, HDD)
  // =========================================================================
  {
    id: 'ssd-samsung-990-pro-1tb',
    name: 'Samsung 990 Pro 1TB PCIe 4.0 NVMe M.2 SSD',
    brand: 'Samsung',
    category: 'storage',
    platform: 'Both',
    price: 189,
    image: '/images/parts/ssd-samsung-990-pro-1tb.svg',
    wattage: 8,
    storageType: 'M.2 NVMe',
    specs: {
      'Capacity': '1TB',
      'Interface': 'PCIe Gen 4.0 x4, NVMe 2.0',
      'Sequential Read': 'Up to 7,450 MB/s',
      'Sequential Write': 'Up to 6,900 MB/s',
      'Random Read': '1,200,000 IOPS',
      'Endurance': '600 TBW'
    },
    description: 'Benchmark-leading Gen 4 NVMe with Samsung in-house Pascal controller and thermal control.'
  },
  {
    id: 'ssd-samsung-990-pro-2tb',
    name: 'Samsung 990 Pro 2TB PCIe 4.0 NVMe M.2 SSD',
    brand: 'Samsung',
    category: 'storage',
    platform: 'Both',
    price: 289,
    image: '/images/parts/ssd-samsung-990-pro-2tb.svg',
    wattage: 9,
    storageType: 'M.2 NVMe',
    specs: {
      'Capacity': '2TB',
      'Interface': 'PCIe Gen 4.0 x4',
      'Sequential Read': 'Up to 7,450 MB/s',
      'Sequential Write': 'Up to 6,900 MB/s',
      'Endurance': '1,200 TBW'
    },
    description: 'High-capacity 2TB flagship NVMe drive delivering top-tier DirectStorage performance.'
  },
  {
    id: 'ssd-crucial-t705-1tb',
    name: 'Crucial T705 1TB PCIe Gen 5.0 NVMe M.2 SSD',
    brand: 'Crucial',
    category: 'storage',
    platform: 'Both',
    price: 269,
    image: '/images/parts/ssd-crucial-t705-1tb.svg',
    wattage: 12,
    storageType: 'M.2 NVMe',
    specs: {
      'Capacity': '1TB',
      'Interface': 'PCIe Gen 5.0 x4',
      'Sequential Read': 'Up to 13,600 MB/s',
      'Sequential Write': 'Up to 10,200 MB/s',
      'NAND Type': 'Micron 232-Layer 3D TLC'
    },
    description: 'Next-generation PCIe 5.0 speed record holder reaching up to 13,600 MB/s transfer rates on supported motherboards.'
  },
  {
    id: 'ssd-wd-black-sn850x-1tb',
    name: 'WD_BLACK SN850X 1TB PCIe 4.0 NVMe SSD',
    brand: 'Western Digital',
    category: 'storage',
    platform: 'Both',
    price: 159,
    image: '/images/parts/ssd-wd-black-sn850x-1tb.svg',
    wattage: 8,
    storageType: 'M.2 NVMe',
    specs: {
      'Capacity': '1TB',
      'Interface': 'PCIe Gen 4.0 x4',
      'Sequential Read': 'Up to 7,300 MB/s',
      'Sequential Write': 'Up to 6,300 MB/s',
      'Game Mode 2.0': 'DirectStorage Optimized'
    },
    description: 'Top-tier dedicated gaming drive with ultra-low latency and predictable sustained write performance.'
  },
  {
    id: 'ssd-biwin-512gb',
    name: 'Biwin Black Opal NV3500 512GB PCIe Gen 3 M.2',
    brand: 'Biwin',
    category: 'storage',
    platform: 'Both',
    price: 99,
    image: '/images/parts/ssd-biwin-512gb.svg',
    wattage: 5,
    storageType: 'M.2 NVMe',
    specs: {
      'Capacity': '512GB',
      'Interface': 'PCIe Gen 3.0 x4 M.2',
      'Sequential Read': 'Up to 3,500 MB/s',
      'Sequential Write': 'Up to 2,800 MB/s'
    },
    description: 'High-speed boot drive with responsive read speeds for quick Windows boot times and core applications.'
  },
  {
    id: 'ssd-crucial-mx500-1tb',
    name: 'Crucial MX500 1TB 2.5" SATA III SSD',
    brand: 'Crucial',
    category: 'storage',
    platform: 'Both',
    price: 119,
    image: '/images/parts/ssd-crucial-mx500-1tb.svg',
    wattage: 4,
    storageType: '2.5" SATA',
    specs: {
      'Capacity': '1TB',
      'Interface': 'SATA 6.0 Gb/s (2.5-inch)',
      'Sequential Read': '560 MB/s',
      'Sequential Write': '510 MB/s'
    },
    description: 'Proven secondary storage drive for massive game libraries, archive footage, and backups.'
  },
  {
    id: 'hdd-seagate-2tb',
    name: 'Seagate BarraCuda 2TB 3.5" 7200RPM HDD',
    brand: 'Seagate',
    category: 'storage',
    platform: 'Both',
    price: 89,
    image: '/images/parts/hdd-seagate-2tb.svg',
    wattage: 7,
    storageType: '3.5" HDD',
    specs: {
      'Capacity': '2TB',
      'Spindle Speed': '7200 RPM',
      'Cache': '256MB',
      'Form Factor': '3.5-inch Internal Drive'
    },
    description: 'Cost-effective high-capacity hard drive for bulk file storage, raw media, and long-term project backups.'
  },

  // =========================================================================
  // 7. CPU COOLERS
  // =========================================================================
  {
    id: 'cooler-arctic-lf3-360',
    name: 'Arctic Liquid Freezer III 360 A-RGB Black',
    brand: 'Arctic',
    category: 'cooler',
    platform: 'Both',
    price: 189,
    image: '/images/parts/cooler-arctic-lf3-360.svg',
    wattage: 15,
    coolerType: 'aio_360',
    specs: {
      'Cooler Type': '360mm All-In-One Liquid Cooler',
      'Radiator Thickness': '38 mm Extra-Thick Radiator',
      'Fans': '3 x 120mm P12 PWM A-RGB Fans',
      'VRM Fan': 'Dedicated 40mm VRM Cooling Fan on Pump Block',
      'Supported Sockets': 'AM4, AM5, LGA1700, LGA1851'
    },
    description: 'Award-winning liquid cooler with extra-thick 38mm radiator and dedicated VRM fan on the pump head.'
  },
  {
    id: 'cooler-corsair-titan-360',
    name: 'Corsair iCUE LINK TITAN 360 RX RGB',
    brand: 'Corsair',
    category: 'cooler',
    platform: 'Both',
    price: 299,
    image: '/images/parts/cooler-corsair-titan-360.svg',
    wattage: 18,
    coolerType: 'aio_360',
    specs: {
      'Cooler Type': '360mm AIO Liquid Cooler',
      'Fans': '3 x RX120 RGB Fans (Magnetic Dome Bearings)',
      'Cabling': 'iCUE LINK Single Cable Ecosystem',
      'Pump': 'High-Flow Three-Phase Motor'
    },
    description: 'Cable-free daisy-chained liquid cooling with ultra-dense copper cold plate and smart sensor integration.'
  },
  {
    id: 'cooler-thermalright-pa120',
    name: 'Thermalright Peerless Assassin 120 SE',
    brand: 'Thermalright',
    category: 'cooler',
    platform: 'Both',
    price: 59,
    image: '/images/parts/cooler-thermalright-pa120.svg',
    wattage: 5,
    coolerType: 'air',
    coolerHeightMm: 155,
    specs: {
      'Cooler Type': 'Dual-Tower Air Cooler',
      'Heatpipes': '6 x 6mm AGHP Anti-Gravity Heatpipes',
      'Fans': '2 x 120mm TL-C12C PWM Fans',
      'Height': '155 mm',
      'TDP Dissipation': 'Up to 245W'
    },
    description: 'Renowned value champion dual-tower cooler that easily cools high-wattage Ryzen 7 and Core i7 CPUs.'
  },
  {
    id: 'cooler-deepcool-ak620',
    name: 'DeepCool AK620 Digital Dual-Tower Cooler',
    brand: 'DeepCool',
    category: 'cooler',
    platform: 'Both',
    price: 99,
    image: '/images/parts/cooler-deepcool-ak620.svg',
    wattage: 8,
    coolerType: 'air',
    coolerHeightMm: 162,
    specs: {
      'Cooler Type': 'Dual-Tower Air Cooler with Real-Time Display',
      'Display': 'Real-Time CPU Temp & Usage Screen',
      'Heatpipes': '6 Copper Heatpipes',
      'Height': '162 mm',
      'TDP Rating': '260W'
    },
    description: 'High-performance dual tower cooler with integrated top digital display showing real-time CPU thermals.'
  },
  {
    id: 'cooler-montech-nx600',
    name: 'Montech NX600 ARGB Dual-Tower Cooler',
    brand: 'Montech',
    category: 'cooler',
    platform: 'Both',
    price: 55,
    image: '/images/parts/cooler-montech-nx600.svg',
    wattage: 6,
    coolerType: 'air',
    coolerHeightMm: 158,
    specs: {
      'Cooler Type': 'Dual-Tower Air Cooler',
      'Heatpipes': '6 Direct-Contact Heatpipes',
      'Fans': '2 x 120mm ARGB PWM Fans',
      'Height': '158 mm'
    },
    description: 'High-surface-area dual heatsink array with addressable RGB fans and quiet hydraulic bearings.'
  },

  // =========================================================================
  // 8. PC CASES
  // =========================================================================
  {
    id: 'case-lian-li-o11-evo',
    name: 'Lian Li O11 Dynamic EVO RGB Black',
    brand: 'Lian Li',
    category: 'case',
    platform: 'Both',
    price: 249,
    image: '/images/parts/case-lian-li-o11-evo.svg',
    wattage: 0,
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 455,
    maxCoolerHeightMm: 167,
    radiatorSupport: ['aio_240', 'aio_360'],
    specs: {
      'Type': 'Dual-Chamber ATX Mid-Tower',
      'Glass Panels': 'Dual Pillarless Seamless Tempered Glass',
      'GPU Clearance': 'Up to 455 mm',
      'Radiator Support': 'Up to 3 x 360mm Radiators',
      'Front I/O': 'USB 3.1 Type-C, 2 x USB 3.0, Audio'
    },
    description: 'Iconic dual-chamber chassis with customizable layout, dual ARGB light strips, and panoramic viewing.'
  },
  {
    id: 'case-fractal-north',
    name: 'Fractal Design North Charcoal Black Tempered Glass',
    brand: 'Fractal Design',
    category: 'case',
    platform: 'Both',
    price: 239,
    image: '/images/parts/case-fractal-north.svg',
    wattage: 0,
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 355,
    maxCoolerHeightMm: 170,
    radiatorSupport: ['aio_240', 'aio_360'],
    specs: {
      'Type': 'ATX Mid-Tower with Real Walnut Front',
      'Front Panel': 'Genuine FSC-Certified Solid Walnut Slats',
      'GPU Clearance': 'Up to 355 mm',
      'Included Fans': '2 x Aspect 140mm PWM Fans',
      'Max Cooler Height': '170 mm'
    },
    description: 'Modern architectural masterpiece combining natural walnut wood slats, sleek brass accents, and airflow.'
  },
  {
    id: 'case-corsair-4000d',
    name: 'Corsair 4000D Airflow Tempered Glass Black',
    brand: 'Corsair',
    category: 'case',
    platform: 'Both',
    price: 149,
    image: '/images/parts/case-corsair-4000d.svg',
    wattage: 0,
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 360,
    maxCoolerHeightMm: 170,
    radiatorSupport: ['aio_240', 'aio_360'],
    specs: {
      'Type': 'ATX Mid-Tower High-Airflow',
      'Front Panel': 'High-Airflow Steel Perforated Front',
      'GPU Clearance': 'Up to 360 mm',
      'Cable Management': 'RapidRoute Channel System',
      'Included Fans': '2 x 120mm AirGuide Fans'
    },
    description: 'The industry benchmark for thermal performance, effortless cable routing, and clean black aesthetics.'
  },
  {
    id: 'case-montech-903-max',
    name: 'Montech AIR 903 MAX Black',
    brand: 'Montech',
    category: 'case',
    platform: 'Both',
    price: 119,
    image: '/images/parts/case-montech-903-max.svg',
    wattage: 0,
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 400,
    maxCoolerHeightMm: 180,
    radiatorSupport: ['aio_240', 'aio_360'],
    specs: {
      'Type': 'E-ATX / ATX High-Airflow Mid-Tower',
      'Included Fans': '4 x 140mm High-Performance PWM Fans (3x ARGB)',
      'GPU Clearance': 'Up to 400 mm',
      'Front Panel': '51% Porosity Ultra-Fine Metal Mesh'
    },
    description: 'Loaded out of the box with 4x 140mm PWM fans, high-flow mesh, and vast 400mm GPU clearance.'
  },
  {
    id: 'case-okinos-aqua-uno',
    name: 'OKINOS AQUA UNO Zebra Micro-ATX',
    brand: 'OKINOS',
    category: 'case',
    platform: 'Both',
    price: 59,
    image: '/images/parts/case-okinos-aqua-uno.svg',
    wattage: 0,
    supportedFormFactors: ['Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 330,
    maxCoolerHeightMm: 160,
    radiatorSupport: ['aio_240'],
    specs: {
      'Type': 'Micro-ATX Panoramic Aquarium Chassis',
      'Panels': 'Curved Tempered Glass 270-degree View',
      'Included Fans': '3 x 120mm ARGB Reversed Blade Fans',
      'Front I/O': 'USB 3.0, Type-C, Audio'
    },
    description: 'Panoramic glass case with 3x included ARGB reversed-blade fans and dedicated cable management channel.'
  },
  {
    id: 'case-deepcool-matrexx30',
    name: 'Deepcool Matrexx 30 Tempered Glass Micro-ATX',
    brand: 'Deepcool',
    category: 'case',
    platform: 'Both',
    price: 45,
    image: '/images/parts/case-deepcool-matrexx30.svg',
    wattage: 0,
    supportedFormFactors: ['Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 250,
    maxCoolerHeightMm: 151,
    radiatorSupport: ['aio_240'],
    specs: {
      'Type': 'Budget Micro-ATX Case',
      'Side Panel': 'Full-size Tempered Glass',
      'GPU Clearance': 'Up to 250 mm',
      'Included Fans': '1 x 120mm Black Exhaust Fan'
    },
    description: 'Accessible compact case with full-sized tempered glass panel and honeycomb front ventilation.'
  },

  // =========================================================================
  // 9. POWER SUPPLIES (PSUS)
  // =========================================================================
  {
    id: 'psu-corsair-rm850x-shift',
    name: 'Corsair RM850x Shift 850W 80+ Gold Fully Modular ATX 3.1',
    brand: 'Corsair',
    category: 'psu',
    platform: 'Both',
    price: 229,
    image: '/images/parts/psu-corsair-rm850x-shift.svg',
    wattage: 850,
    specs: {
      'Wattage': '850 Watts Continuous',
      'Efficiency': '80 PLUS Gold Certified',
      'ATX Standard': 'ATX 3.1 & PCIe 5.1 Native',
      'Design': 'Side-Mounted Revolutionary Modular Interface',
      'Capacitors': '100% Japanese 105°C Electrolytic Capacitors',
      'Fan': '140mm Fluid Dynamic Bearing with Zero RPM Mode'
    },
    description: 'Innovative side-mounted cable layout for effortless access, featuring 100% Japanese caps and ATX 3.1 PCIe 5.1 12V-2x6.'
  },
  {
    id: 'psu-corsair-rm1000x-shift',
    name: 'Corsair RM1000x Shift 1000W 80+ Gold ATX 3.1 Modular',
    brand: 'Corsair',
    category: 'psu',
    platform: 'Both',
    price: 289,
    image: '/images/parts/psu-corsair-rm1000x-shift.svg',
    wattage: 1000,
    specs: {
      'Wattage': '1000 Watts Continuous',
      'Efficiency': '80 PLUS Gold',
      'ATX Standard': 'ATX 3.1 Certified',
      'Connectors': 'Native 12V-2x6 GPU Cable Included',
      'Warranty': '10-Year Comprehensive Warranty'
    },
    description: '1000W heavyweight supply built for high-transient RTX 4090 / RX 7900 XTX graphics and multi-rail stability.'
  },
  {
    id: 'psu-seasonic-focus-850',
    name: 'Seasonic Focus GX-850 850W 80+ Gold Fully Modular',
    brand: 'Seasonic',
    category: 'psu',
    platform: 'Both',
    price: 199,
    image: '/images/parts/psu-seasonic-focus-850.svg',
    wattage: 850,
    specs: {
      'Wattage': '850 Watts',
      'Efficiency': '80 PLUS Gold & Cybenetics ETA-A',
      'Modularity': 'Full Modular Micro-Fit Connectors',
      'Regulation': 'Tight Voltage Regulation < 0.5%',
      'Fan Control': 'Hybrid Silent Fan Control'
    },
    description: 'Legendary Seasonic build quality with micro-tolerance voltage regulation and quiet FDB fan.'
  },
  {
    id: 'psu-corsair-rm750e',
    name: 'Corsair RM750e 750W 80+ Gold ATX 3.0 Fully Modular',
    brand: 'Corsair',
    category: 'psu',
    platform: 'Both',
    price: 149,
    image: '/images/parts/psu-corsair-rm750e.svg',
    wattage: 750,
    specs: {
      'Wattage': '750 Watts Continuous',
      'Efficiency': '80 PLUS Gold',
      'ATX Standard': 'ATX 3.0 & PCIe 5.0 Ready',
      'Length': '140 mm Compact Housing',
      'Fan': '120mm Rifle Bearing Zero RPM'
    },
    description: 'Compact 140mm chassis easily fitting tight cases, providing quiet operation and native PCIe 5.0 12VHPWR support.'
  },
  {
    id: 'psu-antec-850w',
    name: 'Antec GSK850 V2 AU 850W 80+ Gold Fully Modular ATX 3.1',
    brand: 'Antec',
    category: 'psu',
    platform: 'Both',
    price: 129,
    image: '/images/parts/psu-antec-850w.svg',
    wattage: 850,
    specs: {
      'Wattage': '850 Watts Continuous Power',
      'Efficiency': '80 PLUS Gold Certified',
      'Standard': 'ATX 3.1 & PCIe 5.0 12V-2x6',
      'Modularity': '100% Fully Modular Flat Black Ribbons'
    },
    description: 'Gold-rated power delivery with native PCIe 5.0 connector, flat ribbon cables, and comprehensive circuit protections.'
  },
  {
    id: 'psu-asus-750w',
    name: 'ASUS Prime 750W 80+ Bronze Certified',
    brand: 'ASUS',
    category: 'psu',
    platform: 'Both',
    price: 79,
    image: '/images/parts/psu-asus-750w.svg',
    wattage: 750,
    specs: {
      'Wattage': '750 Watts',
      'Efficiency': '80 PLUS Bronze',
      'Cooling': 'Dual Ball Fan Bearings',
      'Cables': 'All Black Sleeved Cables'
    },
    description: 'Solid entry-level 750W power supply offering high reliability and dual-ball fan bearing longevity.'
  },

  // =========================================================================
  // 10. CASE FANS & ACCESSORIES
  // =========================================================================
  {
    id: 'fan-arctic-p12-5pack',
    name: 'Arctic P12 PWM PST 120mm Pressure-Optimised Fan (5-Pack)',
    brand: 'Arctic',
    category: 'fans',
    platform: 'Both',
    price: 49,
    image: '/images/parts/fan-arctic-p12-5pack.svg',
    wattage: 6,
    specs: {
      'Pack Size': '5 x 120mm PWM Fans',
      'Fan Speed': '200 - 1800 RPM (0dB Silent Mode below 5% PWM)',
      'Static Pressure': '2.20 mmH2O High Static Pressure',
      'Sharing Technology': 'PST Integrated PWM Daisy-Chaining'
    },
    description: 'The undisputed value king of PC chassis cooling, offering high static pressure and built-in PWM daisy chaining.'
  },
  {
    id: 'fan-corsair-qx120-rgb',
    name: 'Corsair iCUE LINK QX120 RGB 120mm PWM Triple Fan Starter Kit',
    brand: 'Corsair',
    category: 'fans',
    platform: 'Both',
    price: 179,
    image: '/images/parts/fan-corsair-qx120-rgb.svg',
    wattage: 15,
    specs: {
      'Pack Size': '3 x 120mm Fans + System Hub',
      'LEDs': '34 Addressable RGB LEDs per Fan (Dual Loops)',
      'Speed': '480 - 2400 RPM with Magnetic Dome Bearings',
      'Sensor': 'Integrated Thermal Temp Sensor on Each Fan'
    },
    description: 'State-of-the-art cable-free snap-together fans with individual thermal probe monitors on every fan.'
  },
  {
    id: 'acc-thermal-grizzly-paste',
    name: 'Thermal Grizzly Kryonaut High Performance Thermal Paste (1g)',
    brand: 'Thermal Grizzly',
    category: 'fans',
    platform: 'Both',
    price: 15,
    image: '/images/parts/acc-thermal-grizzly-paste.svg',
    wattage: 0,
    specs: {
      'Thermal Conductivity': '12.5 W/mK',
      'Viscosity': '130 - 170 Pas',
      'Electrical Conductivity': 'Non-Conductive'
    },
    description: 'Enthusiast-grade thermal interface material designed for extreme overclocking and optimal heat transfer.'
  },

  // =========================================================================
  // 11. OPERATING SYSTEMS
  // =========================================================================
  {
    id: 'os-win11-home',
    name: 'Microsoft Windows 11 Home OEM 64-bit',
    brand: 'Microsoft',
    category: 'os',
    platform: 'Both',
    price: 179,
    image: '/images/parts/os-win11-home.svg',
    wattage: 0,
    specs: {
      'License Type': 'Official OEM Digital License',
      'Architecture': '64-bit',
      'Gaming Features': 'DirectStorage, Auto HDR, DirectX 12 Ultimate',
      'Delivery': 'Pre-installed & Verified under Full Build'
    },
    description: 'Genuine Windows 11 Home operating system license, optimized for modern high-refresh gaming and HDR displays.'
  },
  {
    id: 'os-win11-pro',
    name: 'Microsoft Windows 11 Pro OEM 64-bit',
    brand: 'Microsoft',
    category: 'os',
    platform: 'Both',
    price: 239,
    image: '/images/parts/os-win11-pro.svg',
    wattage: 0,
    specs: {
      'License Type': 'Official OEM Pro Digital License',
      'Security': 'BitLocker Drive Encryption & Windows Sandbox',
      'Remote Tools': 'Remote Desktop Server Host & Hyper-V',
      'Architecture': '64-bit'
    },
    description: 'Professional Windows edition featuring hardware-backed BitLocker drive encryption and remote desktop host access.'
  },
  {
    id: 'os-none',
    name: 'No OS / Bring Your Own Operating System',
    brand: 'Custom',
    category: 'os',
    platform: 'Both',
    price: 0,
    image: '/images/parts/os-none.svg',
    wattage: 0,
    specs: {
      'License': 'No OS Included ($0.00)',
      'Testing': 'Hardware POST Verified & Stress Tested'
    },
    description: 'Hardware assembled and verified through UEFI POST stress tests. Install your own Windows, Linux, or custom OS.'
  }
];

// Helper to generate custom SVGs
import { generateAllImages } from './generate-part-assets.ts';

// 1. Generate all SVGs
generateAllImages(
  parts.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    badge: p.specs['Socket'] || p.specs['VRAM'] || p.specs['Capacity'] || p.specs['Form Factor'] || p.category.toUpperCase()
  }))
);

// 2. Write the new src/data/builderCatalog.ts
const code = `export interface BuilderPart {
  id: string;
  name: string;
  brand: string;
  category: 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'cooler' | 'case' | 'psu' | 'fans' | 'os';
  platform: 'AMD' | 'Intel' | 'Both';
  price: number;
  image: string;
  wattage: number;
  // Compatibility specifics
  socket?: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851';
  chipset?: string;
  ramType?: 'DDR4' | 'DDR5';
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
  supportedFormFactors?: ('ATX' | 'Micro-ATX' | 'Mini-ITX')[];
  gpuLengthMm?: number;
  maxGpuLengthMm?: number;
  coolerType?: 'air' | 'aio_240' | 'aio_360';
  coolerHeightMm?: number;
  maxCoolerHeightMm?: number;
  radiatorSupport?: string[];
  storageType?: 'M.2 NVMe' | '2.5" SATA' | '3.5" HDD';
  moboMapUrl?: string;
  has3dModel?: boolean;
  specs: Record<string, string>;
  description: string;
  inStock?: boolean;
}

export const BUILDER_PARTS: BuilderPart[] = ${JSON.stringify(parts, null, 2)};

// Helper to filter parts by category
export function getPartsByCategory(category: BuilderPart['category']): BuilderPart[] {
  return BUILDER_PARTS.filter((p) => p.category === category);
}

// Category display labels and icons
export const BUILDER_CATEGORIES: {
  category: BuilderPart['category'];
  label: string;
  required: boolean;
  iconName: string;
}[] = [
  { category: 'cpu', label: 'Processor (CPU)', required: true, iconName: 'Cpu' },
  { category: 'motherboard', label: 'Motherboard', required: true, iconName: 'Boxes' },
  { category: 'ram', label: 'Memory (RAM)', required: true, iconName: 'HardDrive' },
  { category: 'gpu', label: 'Graphics Card (GPU)', required: true, iconName: 'Zap' },
  { category: 'storage', label: 'Storage (SSD / Drive)', required: true, iconName: 'Database' },
  { category: 'cooler', label: 'CPU Cooler', required: true, iconName: 'Fan' },
  { category: 'case', label: 'PC Case', required: true, iconName: 'Server' },
  { category: 'psu', label: 'Power Supply (PSU)', required: true, iconName: 'BatteryCharging' },
  { category: 'fans', label: 'Case Fans & Cooling', required: false, iconName: 'Wind' },
  { category: 'os', label: 'Operating System', required: true, iconName: 'Layers' }
];
`;

fs.writeFileSync(path.resolve(process.cwd(), 'src/data/builderCatalog.ts'), code, 'utf-8');
console.log(`Updated src/data/builderCatalog.ts with ${parts.length} modern verified PC components!`);

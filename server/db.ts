import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  approved: boolean;
  serviceType?: string;
}

export interface RepairRequest {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  deviceType: string;
  manufacturerAndModel: string;
  operatingSystem: string;
  repairCategory: string;
  problemDescription: string;
  symptoms?: string;
  turnsOn: 'Yes' | 'No' | 'Intermittent';
  importantDataAffected: 'Yes' | 'No' | 'Not sure';
  serviceSpeed: 'Regular' | 'Express';
  expressFee: number;
  additionalNotes?: string;
  status: 'Received' | 'Under Review' | 'Assessment & Quote' | 'In Progress' | 'Ready for Pickup' | 'Completed';
  createdAt: string;
  updatedAt: string;
  technicianNotes?: string;
}

export interface UpgradeRequest {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  deviceType: string;
  manufacturerAndModel: string;
  currentSpecifications?: string;
  desiredUpgrades: string[];
  intendedUse: string;
  budget?: string;
  serviceSpeed: 'Regular' | 'Express';
  expressFee: number;
  additionalNotes?: string;
  status: 'Received' | 'Under Review' | 'Assessment & Quote' | 'In Progress' | 'Ready for Pickup' | 'Completed';
  createdAt: string;
  updatedAt: string;
  technicianNotes?: string;
}

export interface CustomPcQuote {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  buildType: 'custom_builder' | 'prebuilt_enquiry' | 'help_me_choose';
  prebuiltName?: string;
  components?: Record<string, any>;
  totalEstimatedPrice?: number;
  useCase?: string;
  budget?: string;
  notes?: string;
  status: 'Received' | 'Under Review' | 'Quote Sent' | 'Order Confirmed' | 'Building' | 'Completed';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  replied: boolean;
}

export interface ShippingConfig {
  normalPrice: number;
  normalTimeframe: string;
  expressPrice: number;
  expressTimeframe: string;
}

export interface PcOrder {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  pcId: string;
  pcName: string;
  pcBasePrice: number;
  components: { name: string; category: string; price: number; included?: boolean }[];
  buildService: {
    id: 'fast' | 'full';
    name: string;
    price: number;
    description: string;
  };
  subtotalBeforeDelivery: number;
  deliveryMethod: {
    id: 'pickup' | 'normal' | 'express';
    name: string;
    price: number;
    timeframe: string;
  };
  finalTotal: number;
  paymentMethod: 'card' | 'bank_transfer' | 'pickup_cash';
  status: 'Order Placed' | 'Parts Prepared' | 'Assembling' | 'Testing & Quality Check' | 'Ready for Dispatch' | 'Delivered';
  createdAt: string;
  updatedAt: string;
  technicianNotes?: string;
}

export interface CheaperPriceRequest {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  partId?: string;
  partName: string;
  category: string;
  centreComPrice: number;
  centreComUrl: string;
  competitorName: string;
  competitorUrl: string;
  competitorPrice: number;
  priceDelta: number; // centreComPrice - competitorPrice
  isBrandNew: boolean;
  isInStock: boolean;
  notes?: string;
  verificationOutcome: 'verified' | 'needs_review' | 'rejected';
  verificationReason: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info';
  approvedPriceAdjustment?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSuppliedMotherboardRecord {
  id: string;
  referenceNumber: string;
  buildId?: string;
  customerName?: string;
  email?: string;
  sourceType: 'catalogue_conversion' | 'custom_entry';
  cataloguePartId?: string;
  brand: string;
  model: string;
  productUrl?: string;
  imageUrl?: string;
  conditionNotes?: string;
  researchedSpecs: {
    socket?: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851' | string;
    chipset?: string;
    ramType?: 'DDR4' | 'DDR5' | string;
    formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | string;
    memorySlots?: number;
    maxMemoryGb?: number;
    m2Slots?: number;
    sataPorts?: number;
    pcieX16Slots?: number;
    biosRequirements?: string;
    supportedGenerations?: string[];
    officialSourceUrl?: string;
    sourcesUsed: string[];
  };
  researchStatus: 'pending' | 'researching' | 'verified' | 'needs_info' | 'manual_review';
  compatibilityStatus: 'compatible' | 'warning' | 'incompatible' | 'unable_to_verify';
  compatibilityNotes: string[];
  currentBuildSummary?: {
    cpu?: string;
    ram?: string;
    case?: string;
    gpu?: string;
  };
  adminStatus: 'pending' | 'approved' | 'rejected' | 'inspection_passed' | 'inspection_failed';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  reviews: Review[];
  repairRequests: RepairRequest[];
  upgradeRequests: UpgradeRequest[];
  customPcQuotes: CustomPcQuote[];
  contactMessages: ContactMessage[];
  pcOrders: PcOrder[];
  shippingConfig: ShippingConfig;
  cheaperPriceRequests: CheaperPriceRequest[];
  customerSuppliedMotherboards: CustomerSuppliedMotherboardRecord[];
}

const initialData: DatabaseSchema = {
  reviews: [
    {
      id: 'rev-damiano-2026',
      name: 'Damiano',
      date: '27 August 2026',
      rating: 5,
      text: 'QTR was able to diagnose the problem, recover lost data and do so when other companies engaged for the same service could not. His technical acumen and customer service were fantastic and very reassuring!',
      approved: true,
      serviceType: 'Computer Repairs & Data Recovery'
    }
  ],
  repairRequests: [
    {
      id: 'rep-sample-1',
      referenceNumber: 'QTR-REP-1024',
      customerName: 'Marcus Vance',
      email: 'm.vance@example.com',
      phone: '0412 345 678',
      deviceType: 'Laptop',
      manufacturerAndModel: 'Dell XPS 15 9520',
      operatingSystem: 'Windows 11',
      repairCategory: 'Performance Troubleshooting',
      problemDescription: 'Laptop thermal throttling heavily during Excel data modeling and occasionally shutting down with fan spinning at max speed.',
      symptoms: 'Overheating, blue screen error WHEA_UNCORRECTABLE_ERROR',
      turnsOn: 'Yes',
      importantDataAffected: 'No',
      serviceSpeed: 'Express',
      expressFee: 15,
      additionalNotes: 'Need it ready before Friday client presentation.',
      status: 'Assessment & Quote',
      createdAt: '2026-10-18T10:30:00.000Z',
      updatedAt: '2026-10-19T14:20:00.000Z',
      technicianNotes: 'Thermal paste dried out, heatsink dust blockage confirmed. Cleaning and Honeywell PTM7950 repaste approved.'
    }
  ],
  upgradeRequests: [
    {
      id: 'upg-sample-1',
      referenceNumber: 'QTR-UPG-2048',
      customerName: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      phone: '0488 234 567',
      deviceType: 'Desktop PC',
      manufacturerAndModel: 'Custom Intel i5-10400 Desktop',
      currentSpecifications: 'Intel i5-10400, 16GB DDR4 RAM, 500GB SATA SSD, GTX 1660 Super, 550W PSU',
      desiredUpgrades: ['RAM Upgrade', 'SSD / Storage Upgrade', 'Graphics Card'],
      intendedUse: 'Video Editing & 1440p Gaming',
      budget: '$500–$800',
      serviceSpeed: 'Regular',
      expressFee: 0,
      additionalNotes: 'Looking to edit 4K DaVinci Resolve footage smoothly.',
      status: 'Under Review',
      createdAt: '2026-10-19T09:15:00.000Z',
      updatedAt: '2026-10-19T09:15:00.000Z',
      technicianNotes: 'Recommended: 32GB 3200MHz RAM kit, 2TB Crucial T500 Gen4 NVMe, RTX 4060 8GB.'
    }
  ],
  customPcQuotes: [],
  contactMessages: [],
  pcOrders: [
    {
      id: 'ord-sample-1',
      referenceNumber: 'QTR-ORD-5120',
      customerName: 'Marcus Vance',
      email: 'm.vance@example.com',
      phone: '0412 345 678',
      shippingAddress: {
        addressLine1: '42 Glenhuntly Rd',
        suburb: 'Elsternwick',
        state: 'VIC',
        postcode: '3185'
      },
      pcId: 'project-eclipse',
      pcName: 'Project Eclipse',
      pcBasePrice: 1428.0,
      components: [
        { name: 'AMD Ryzen 5 5600X, 6 cores / 12 threads', category: 'CPU', price: 199.0 },
        { name: 'AMD Wraith Stealth, included with CPU', category: 'CPU Cooler', price: 0.0, included: true },
        { name: 'ASUS Prime B550M-A WiFi II AM4 Micro-ATX', category: 'Motherboard', price: 129.0 },
        { name: 'ASUS Dual GeForce RTX 5050 8GB OC GDDR6', category: 'GPU', price: 499.0 },
        { name: 'G.Skill Trident Z RGB 16GB (2 × 8GB) DDR4-3600 CL16', category: 'RAM', price: 199.0 },
        { name: 'Biwin Black Opal NV3500 512GB PCIe Gen 3 M.2', category: 'SSD', price: 99.0 },
        { name: 'Deepcool Matrexx 30 Tempered Glass Micro-ATX', category: 'Case', price: 45.0 },
        { name: 'ASUS Prime 750W 80+ Bronze', category: 'PSU', price: 79.0 },
        { name: 'Microsoft Windows 11 Home OEM 64-bit', category: 'Operating System', price: 179.0 }
      ],
      buildService: {
        id: 'fast',
        name: 'Fast Build',
        price: 100.0,
        description: 'PC is assembled and receives a basic POST test only.'
      },
      subtotalBeforeDelivery: 1528.0,
      deliveryMethod: {
        id: 'normal',
        name: 'Normal Delivery',
        price: 25.0,
        timeframe: '3–5 business days'
      },
      finalTotal: 1553.0,
      paymentMethod: 'card',
      status: 'Parts Prepared',
      createdAt: '2026-10-20T11:00:00.000Z',
      updatedAt: '2026-10-20T14:30:00.000Z',
      technicianNotes: 'All components checked from inventory. Ready for bench assembly.'
    }
  ],
  shippingConfig: {
    normalPrice: 25.0,
    normalTimeframe: '3–5 business days',
    expressPrice: 49.0,
    expressTimeframe: '1–2 business days'
  },
  cheaperPriceRequests: [
    {
      id: 'cpr-sample-1',
      referenceNumber: 'QTR-CPR-4091',
      customerName: 'Marcus Vance',
      email: 'm.vance@example.com',
      phone: '0412 345 678',
      partId: 'cpu-r7-7800x3d',
      partName: 'AMD Ryzen 7 7800X3D',
      category: 'cpu',
      centreComPrice: 599.0,
      centreComUrl: 'https://www.centrecom.com.au/amd-ryzen-7-7800x3d-8-core-16-threads-processor',
      competitorName: 'Scorptec',
      competitorUrl: 'https://www.scorptec.com.au/product/cpu/amd-socket-am5/102521-100-100000910wof',
      competitorPrice: 579.0,
      priceDelta: 20.0,
      isBrandNew: true,
      isInStock: true,
      notes: 'In stock at South Melbourne Scorptec branch.',
      verificationOutcome: 'verified',
      verificationReason: 'Cheaper price verified against authorized Australian retailer — eligible for review.',
      status: 'pending',
      createdAt: '2026-10-21T09:30:00.000Z',
      updatedAt: '2026-10-21T09:30:00.000Z'
    }
  ],
  customerSuppliedMotherboards: []
};

// Ensure data folder and file exist
export function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    // Ensure all keys exist
    const merged: DatabaseSchema = {
      reviews: parsed.reviews || initialData.reviews,
      repairRequests: parsed.repairRequests || initialData.repairRequests,
      upgradeRequests: parsed.upgradeRequests || initialData.upgradeRequests,
      customPcQuotes: parsed.customPcQuotes || [],
      contactMessages: parsed.contactMessages || [],
      pcOrders: parsed.pcOrders || initialData.pcOrders,
      shippingConfig: parsed.shippingConfig || initialData.shippingConfig,
      cheaperPriceRequests: parsed.cheaperPriceRequests || initialData.cheaperPriceRequests,
      customerSuppliedMotherboards: parsed.customerSuppliedMotherboards || []
    };
    return merged;
  } catch (err) {
    console.error('Failed to parse db.json, recreating with initial data', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export function readDatabase(): DatabaseSchema {
  return initDatabase();
}

export function writeDatabase(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

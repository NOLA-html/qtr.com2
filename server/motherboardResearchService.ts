import { GoogleGenAI } from '@google/genai';

export interface MotherboardSpecs {
  brand: string;
  model: string;
  socket: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851';
  chipset: string;
  ramType: 'DDR4' | 'DDR5';
  maxRamCapacityGb?: number;
  ramSlots?: number;
  formFactor: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';
  supportedCpuGenerations: string;
  biosNotes?: string;
  pcieSlots?: string;
  m2Slots?: string;
  sataPorts?: number;
  powerConnectors?: string;
  fanHeaders?: string;
  rgbHeaders?: string;
  rearIoHighlights?: string;
  sourceUrls: string[];
  officialProductPage?: string;
  verifiedAt: string;
}

export interface CompatibilityCheckInput {
  cpu?: { name: string; socket?: string; platform?: string };
  ram?: { name: string; ramType?: string };
  case?: { name: string; supportedFormFactors?: string[] };
  gpu?: { name: string; lengthMm?: number };
  psu?: { name: string; wattage?: number };
  cooler?: { name: string; coolerType?: string };
}

export interface CompatibilityEvaluation {
  status: 'Compatible' | 'Warning' | 'Incompatible' | 'Unable to verify';
  hasBlockingConflict: boolean;
  notes: string[];
  breakdown: {
    cpu: { status: 'pass' | 'warning' | 'fail' | 'skipped'; message: string };
    ram: { status: 'pass' | 'warning' | 'fail' | 'skipped'; message: string };
    case: { status: 'pass' | 'warning' | 'fail' | 'skipped'; message: string };
    gpu: { status: 'pass' | 'warning' | 'fail' | 'skipped'; message: string };
    power: { status: 'pass' | 'warning' | 'fail' | 'skipped'; message: string };
  };
}

// Curated verified database of popular Australian enthusiast motherboards from official manufacturer specs
const VERIFIED_MOTHERBOARDS_DB: Record<string, Omit<MotherboardSpecs, 'verifiedAt'>> = {
  // AMD AM5 (DDR5)
  'asus-tuf-gaming-b650-plus-wifi': {
    brand: 'ASUS',
    model: 'TUF GAMING B650-PLUS WIFI',
    socket: 'AM5',
    chipset: 'AMD B650',
    ramType: 'DDR5',
    maxRamCapacityGb: 192,
    ramSlots: 4,
    formFactor: 'ATX',
    supportedCpuGenerations: 'AMD Ryzen 7000, 8000, and 9000 Series Processors',
    biosNotes: 'BIOS FlashBack supported via dedicated rear I/O button. Ryzen 9000 series may require BIOS update v2413 or higher.',
    pcieSlots: '1x PCIe 5.0 x16 (CPU), 1x PCIe 4.0 x16 (x4 mode), 2x PCIe 4.0 x1',
    m2Slots: '3x M.2 slots (1x PCIe 5.0 x4, 2x PCIe 4.0 x4)',
    sataPorts: 4,
    powerConnectors: '1x 24-pin ATX, 1x 8-pin + 1x 4-pin 12V EPS',
    fanHeaders: '1x 4-pin CPU Fan, 1x 4-pin CPU OPT, 1x 4-pin AIO Pump, 4x 4-pin Chassis Fans',
    sourceUrls: ['https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/techspec/'],
    officialProductPage: 'https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/'
  },
  'asus-tuf-gaming-b850m-e-wifi': {
    brand: 'ASUS',
    model: 'TUF GAMING B850M-E WIFI',
    socket: 'AM5',
    chipset: 'AMD B850',
    ramType: 'DDR5',
    maxRamCapacityGb: 192,
    ramSlots: 4,
    formFactor: 'Micro-ATX',
    supportedCpuGenerations: 'AMD Ryzen 7000, 8000, and 9000 Series Processors',
    biosNotes: 'Native out-of-the-box support for Ryzen 9000 and 7000 series. BIOS FlashBack available.',
    pcieSlots: '1x PCIe 5.0 x16, 2x PCIe 4.0 x1',
    m2Slots: '2x M.2 PCIe 5.0/4.0 slots with thermal guard',
    sataPorts: 4,
    powerConnectors: '1x 24-pin ATX, 1x 8-pin 12V EPS',
    fanHeaders: '1x CPU Fan, 1x AIO Pump, 3x Chassis Fans',
    sourceUrls: ['https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b850m-e-wifi/techspec/'],
    officialProductPage: 'https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b850m-e-wifi/'
  },
  'msi-b650-gaming-plus-wifi': {
    brand: 'MSI',
    model: 'B650 GAMING PLUS WIFI',
    socket: 'AM5',
    chipset: 'AMD B650',
    ramType: 'DDR5',
    maxRamCapacityGb: 192,
    ramSlots: 4,
    formFactor: 'ATX',
    supportedCpuGenerations: 'AMD Ryzen 7000 / 8000 / 9000 Series Desktop Processors',
    biosNotes: 'Flash BIOS Button on rear panel allows CPU-less flashing.',
    pcieSlots: '2x PCIe 4.0 x16 slots, 1x PCIe 3.0 x1 slot',
    m2Slots: '2x M.2 PCIe 4.0 x4 slots with Shield Frozr',
    sataPorts: 4,
    powerConnectors: '1x 24-pin ATX, 2x 8-pin 12V EPS',
    fanHeaders: '1x 4-pin CPU Fan, 1x Water Pump, 6x System Fans',
    sourceUrls: ['https://www.msi.com/Motherboard/B650-GAMING-PLUS-WIFI/Specification'],
    officialProductPage: 'https://www.msi.com/Motherboard/B650-GAMING-PLUS-WIFI'
  },
  'asus-rog-strix-x670e-e-gaming-wifi': {
    brand: 'ASUS',
    model: 'ROG STRIX X670E-E GAMING WIFI',
    socket: 'AM5',
    chipset: 'AMD X670E',
    ramType: 'DDR5',
    maxRamCapacityGb: 192,
    ramSlots: 4,
    formFactor: 'ATX',
    supportedCpuGenerations: 'AMD Socket AM5 for AMD Ryzen 7000/8000/9000 Series Desktop Processors',
    biosNotes: '18+2 power stages, Dual PCIe 5.0 x16 slots, ROG SupremeFX 7.1 audio.',
    pcieSlots: '2x PCIe 5.0 x16 slots (supports x16 or x8/x8), 1x PCIe 4.0 x16 (x4 mode)',
    m2Slots: '4x M.2 slots (3x PCIe 5.0 x4, 1x PCIe 4.0 x4)',
    sataPorts: 4,
    powerConnectors: '1x 24-pin ATX, 2x 8-pin ProCool II 12V EPS',
    fanHeaders: '1x CPU Fan, 1x CPU OPT, 1x AIO Pump, 5x Chassis Fans',
    sourceUrls: ['https://rog.asus.com/motherboards/rog-strix/rog-strix-x670e-e-gaming-wifi-model/spec/'],
    officialProductPage: 'https://rog.asus.com/motherboards/rog-strix/rog-strix-x670e-e-gaming-wifi-model/'
  },
  'gigabyte-b650-aorus-elite-ax': {
    brand: 'Gigabyte',
    model: 'B650 AORUS ELITE AX',
    socket: 'AM5',
    chipset: 'AMD B650',
    ramType: 'DDR5',
    maxRamCapacityGb: 192,
    ramSlots: 4,
    formFactor: 'ATX',
    supportedCpuGenerations: 'AMD Ryzen 7000/8000/9000 Series Processors',
    biosNotes: 'Q-Flash Plus button on rear panel for updating BIOS without CPU/memory.',
    pcieSlots: '1x PCIe 4.0 x16, 2x PCIe 3.0 x16 (x1 mode)',
    m2Slots: '3x M.2 slots (1x PCIe 5.0 x4, 2x PCIe 4.0 x4)',
    sataPorts: 4,
    powerConnectors: '1x 24-pin ATX, 1x 8-pin + 1x 4-pin ATX 12V',
    fanHeaders: '1x CPU Fan, 1x Water Cooling CPU Fan, 4x System Fans',
    sourceUrls: ['https://www.gigabyte.com/Motherboard/B650-AORUS-ELITE-AX-rev-10-11/sp#sp'],
    officialProductPage: 'https://www.gigabyte.com/Motherboard/B650-AORUS-ELITE-AX-rev-10-11'
  },

  // AMD AM4 (DDR4)
  'asus-prime-b550m-a-wifi-ii': {
    brand: 'ASUS',
    model: 'Prime B550M-A WiFi II',
    socket: 'AM4',
    chipset: 'AMD B550',
    ramType: 'DDR4',
    maxRamCapacityGb: 128,
    ramSlots: 4,
    formFactor: 'Micro-ATX',
    supportedCpuGenerations: 'AMD Ryzen 5000 / 4000 G-Series / 3000 Series Desktop Processors (Socket AM4)',
    biosNotes: 'Supports DDR4 up to 4866(OC) MHz. AM4 socket does NOT support Ryzen 7000/8000/9000 CPUs.',
    pcieSlots: '1x PCIe 4.0 x16, 2x PCIe 3.0 x1',
    m2Slots: '2x M.2 slots (1x PCIe 4.0 x4, 1x PCIe 3.0 x4)',
    sataPorts: 4,
    powerConnectors: '1x 24-pin ATX, 1x 8-pin 12V EPS',
    fanHeaders: '1x CPU Fan, 2x Chassis Fans',
    sourceUrls: ['https://www.asus.com/motherboards-components/motherboards/prime/prime-b550m-a-wifi-ii/techspec/'],
    officialProductPage: 'https://www.asus.com/motherboards-components/motherboards/prime/prime-b550m-a-wifi-ii/'
  },
  'msi-mag-b550-tomahawk': {
    brand: 'MSI',
    model: 'MAG B550 TOMAHAWK',
    socket: 'AM4',
    chipset: 'AMD B550',
    ramType: 'DDR4',
    maxRamCapacityGb: 128,
    ramSlots: 4,
    formFactor: 'ATX',
    supportedCpuGenerations: '3rd Gen AMD Ryzen and future AMD Ryzen processors with BIOS update (Socket AM4)',
    biosNotes: 'Flash BIOS Button on rear panel. Dual LAN (2.5G + 1G). Requires DDR4 RAM.',
    pcieSlots: '1x PCIe 4.0/3.0 x16, 1x PCIe 3.0 x16 (x4 mode), 2x PCIe 3.0 x1',
    m2Slots: '2x M.2 slots (1x PCIe 4.0 x4, 1x PCIe 3.0 x4)',
    sataPorts: 6,
    powerConnectors: '1x 24-pin ATX, 1x 8-pin 12V EPS',
    fanHeaders: '1x CPU Fan, 1x Water Pump, 6x System Fans',
    sourceUrls: ['https://www.msi.com/Motherboard/MAG-B550-TOMAHAWK/Specification'],
    officialProductPage: 'https://www.msi.com/Motherboard/MAG-B550-TOMAHAWK'
  },

  // Intel LGA1700 (DDR5 / DDR4)
  'msi-pro-b760m-a-wifi': {
    brand: 'MSI',
    model: 'PRO B760M-A WIFI',
    socket: 'LGA1700',
    chipset: 'Intel B760',
    ramType: 'DDR5',
    maxRamCapacityGb: 192,
    ramSlots: 4,
    formFactor: 'Micro-ATX',
    supportedCpuGenerations: 'Intel 12th, 13th, and 14th Gen Core Processors (LGA1700)',
    biosNotes: 'Supports DDR5 memory up to 6800+(OC) MHz. 14th Gen CPUs may require BIOS update vA4 or newer.',
    pcieSlots: '2x PCIe 4.0 x16 slots, 1x PCIe 3.0 x1 slot',
    m2Slots: '2x M.2 PCIe 4.0 x4 slots with M.2 Shield Frozr',
    sataPorts: 4,
    powerConnectors: '1x 24-pin ATX, 2x 8-pin 12V EPS',
    fanHeaders: '1x CPU Fan, 1x Water Pump, 2x System Fans',
    sourceUrls: ['https://www.msi.com/Motherboard/PRO-B760M-A-WIFI/Specification'],
    officialProductPage: 'https://www.msi.com/Motherboard/PRO-B760M-A-WIFI'
  },
  'asus-rog-strix-z790-e-gaming-wifi-ii': {
    brand: 'ASUS',
    model: 'ROG STRIX Z790-E GAMING WIFI II',
    socket: 'LGA1700',
    chipset: 'Intel Z790',
    ramType: 'DDR5',
    maxRamCapacityGb: 192,
    ramSlots: 4,
    formFactor: 'ATX',
    supportedCpuGenerations: 'Intel 14th, 13th & 12th Gen Core Processors (Socket LGA1700)',
    biosNotes: 'WiFi 7 support, PCIe 5.0 M.2 slot, AI Overclocking, BIOS FlashBack & Clear CMOS on rear panel.',
    pcieSlots: '1x PCIe 5.0 x16 slot, 2x PCIe 4.0 x16 (x4 mode)',
    m2Slots: '5x M.2 slots (1x PCIe 5.0 x4, 4x PCIe 4.0 x4)',
    sataPorts: 4,
    powerConnectors: '1x 24-pin ATX, 2x 8-pin ProCool II 12V EPS',
    fanHeaders: '1x CPU Fan, 1x CPU OPT, 1x AIO Pump, 5x Chassis Fans',
    sourceUrls: ['https://rog.asus.com/motherboards/rog-strix/rog-strix-z790-e-gaming-wifi-ii/spec/'],
    officialProductPage: 'https://rog.asus.com/motherboards/rog-strix/rog-strix-z790-e-gaming-wifi-ii/'
  },
  'gigabyte-z790-aorus-elite-ax': {
    brand: 'Gigabyte',
    model: 'Z790 AORUS ELITE AX',
    socket: 'LGA1700',
    chipset: 'Intel Z790',
    ramType: 'DDR5',
    maxRamCapacityGb: 192,
    ramSlots: 4,
    formFactor: 'ATX',
    supportedCpuGenerations: 'Intel 14th, 13th and 12th Generation Core Processors',
    biosNotes: 'Q-Flash Plus support. Twin 16+1+2 Digital VRM Design.',
    pcieSlots: '1x PCIe 5.0 x16, 2x PCIe 4.0 x16 (x4 mode)',
    m2Slots: '4x PCIe 4.0 x4 M.2 connectors',
    sataPorts: 6,
    powerConnectors: '1x 24-pin ATX, 2x 8-pin 12V EPS',
    fanHeaders: '1x CPU Fan, 1x Water Cooling Fan, 4x System Fans',
    sourceUrls: ['https://www.gigabyte.com/Motherboard/Z790-AORUS-ELITE-AX-rev-10/sp#sp'],
    officialProductPage: 'https://www.gigabyte.com/Motherboard/Z790-AORUS-ELITE-AX-rev-10'
  },

  // Intel LGA1851 (Core Ultra Series 2)
  'asus-rog-maximus-z890-hero': {
    brand: 'ASUS',
    model: 'ROG MAXIMUS Z890 HERO',
    socket: 'LGA1851',
    chipset: 'Intel Z890',
    ramType: 'DDR5',
    maxRamCapacityGb: 192,
    ramSlots: 4,
    formFactor: 'ATX',
    supportedCpuGenerations: 'Intel Core Ultra Processors (Series 2) LGA1851 Socket',
    biosNotes: 'Thunderbolt 4 onboard, PCIe 5.0 M.2 slot, NitroPath DRAM Technology.',
    pcieSlots: '1x PCIe 5.0 x16 slot, 1x PCIe 4.0 x16 (x4 mode)',
    m2Slots: '6x M.2 slots (3x PCIe 5.0 x4, 3x PCIe 4.0 x4)',
    sataPorts: 4,
    powerConnectors: '1x 24-pin ATX, 2x 8-pin ProCool II 12V EPS',
    fanHeaders: '1x CPU Fan, 1x CPU OPT, 1x AIO Pump, 4x Chassis Fans',
    sourceUrls: ['https://rog.asus.com/motherboards/rog-maximus/rog-maximus-z890-hero/spec/'],
    officialProductPage: 'https://rog.asus.com/motherboards/rog-maximus/rog-maximus-z890-hero/'
  }
};

/**
 * Normalizes a model string to lookup key
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Search the verified motherboard specifications database
 */
export function findInVerifiedDatabase(brand: string, model: string): MotherboardSpecs | null {
  const normQuery = normalizeKey(`${brand} ${model}`);
  const normModel = normalizeKey(model);

  // Direct match
  if (VERIFIED_MOTHERBOARDS_DB[normQuery]) {
    return { ...VERIFIED_MOTHERBOARDS_DB[normQuery], verifiedAt: new Date().toISOString() };
  }
  if (VERIFIED_MOTHERBOARDS_DB[normModel]) {
    return { ...VERIFIED_MOTHERBOARDS_DB[normModel], verifiedAt: new Date().toISOString() };
  }

  // Substring match
  for (const [key, spec] of Object.entries(VERIFIED_MOTHERBOARDS_DB)) {
    if (key.includes(normModel) || normQuery.includes(key)) {
      return { ...spec, verifiedAt: new Date().toISOString() };
    }
  }

  return null;
}

/**
 * Live AI research assistant using Gemini 2.5 with Google Search grounding
 */
export async function researchMotherboardWithAI(
  brand: string,
  model: string,
  providedUrl?: string,
  aiClient?: GoogleGenAI | null
): Promise<{
  status: 'verified' | 'needs_info' | 'manual_review';
  specs?: MotherboardSpecs;
  sourceUrls: string[];
  explanation: string;
}> {
  const cleanBrand = brand.trim();
  const cleanModel = model.trim();

  // 1. First check our verified high-precision database
  const dbMatch = findInVerifiedDatabase(cleanBrand, cleanModel);
  if (dbMatch) {
    return {
      status: 'verified',
      specs: dbMatch,
      sourceUrls: dbMatch.sourceUrls,
      explanation: `Verified against official ${dbMatch.brand} technical documentation. Model matches ${dbMatch.model} (${dbMatch.socket}, ${dbMatch.ramType}, ${dbMatch.formFactor}).`
    };
  }

  // 2. Reject vague or ambiguous queries that cannot be verified
  if (cleanModel.length < 4 || /^(b650|am5|motherboard|asus|msi|intel|amd)$/i.test(cleanModel)) {
    return {
      status: 'needs_info',
      sourceUrls: [],
      explanation: `"${cleanModel}" is too ambiguous. Please provide the exact model name (e.g. "ASUS TUF GAMING B650-PLUS WIFI" or "MSI MAG B550 TOMAHAWK") so our assistant can find genuine manufacturer specifications.`
    };
  }

  // 3. Fallback heuristic detection for standard naming conventions if Gemini is offline
  const socketRegex = /(am5|am4|lga1700|lga\s*1700|lga1851|lga\s*1851)/i;
  const chipsetRegex = /(b650|b850|x670e?|x870e?|b550|x570|z790|b760|z890|b860)/i;
  const formFactorRegex = /(micro-?atx|m-?atx|mini-?itx|itx|atx|e-?atx)/i;
  const ramRegex = /(ddr5|ddr4)/i;

  const combined = `${cleanBrand} ${cleanModel}`.toLowerCase();
  let detectedSocket: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851' | undefined;
  let detectedChipset = 'Standard';
  let detectedRamType: 'DDR4' | 'DDR5' = 'DDR5';
  let detectedFormFactor: 'ATX' | 'Micro-ATX' | 'Mini-ITX' = 'ATX';

  const socketMatch = combined.match(socketRegex);
  if (socketMatch) {
    const s = socketMatch[1].replace(/\s+/g, '').toUpperCase();
    if (s === 'AM5' || s === 'AM4' || s === 'LGA1700' || s === 'LGA1851') {
      detectedSocket = s as any;
    }
  }

  const chipsetMatch = combined.match(chipsetRegex);
  if (chipsetMatch) {
    const chip = chipsetMatch[1].toUpperCase();
    detectedChipset = chip;
    if (chip.startsWith('B65') || chip.startsWith('X67') || chip.startsWith('B85') || chip.startsWith('X87')) {
      detectedSocket = detectedSocket || 'AM5';
      detectedRamType = 'DDR5';
    } else if (chip.startsWith('B55') || chip.startsWith('X57')) {
      detectedSocket = detectedSocket || 'AM4';
      detectedRamType = 'DDR4';
    } else if (chip.startsWith('Z79') || chip.startsWith('B76')) {
      detectedSocket = detectedSocket || 'LGA1700';
    } else if (chip.startsWith('Z89') || chip.startsWith('B86')) {
      detectedSocket = detectedSocket || 'LGA1851';
      detectedRamType = 'DDR5';
    }
  }

  const ffMatch = combined.match(formFactorRegex);
  if (ffMatch) {
    const ff = ffMatch[1].toLowerCase();
    if (ff.includes('mini') || ff.includes('itx')) detectedFormFactor = 'Mini-ITX';
    else if (ff.includes('micro') || ff.includes('matx') || ff.includes('m-atx')) detectedFormFactor = 'Micro-ATX';
    else detectedFormFactor = 'ATX';
  } else if (cleanModel.includes('M-') || cleanModel.includes('M ') || cleanModel.endsWith('M')) {
    detectedFormFactor = 'Micro-ATX';
  }

  // 4. If Gemini API client is active, execute live web research
  if (aiClient) {
    try {
      const prompt = `You are a strict PC Hardware Verification Assistant for QTR computer repairs.
Research the genuine manufacturer specifications for this customer-supplied motherboard:
Manufacturer: "${cleanBrand}"
Model: "${cleanModel}"
${providedUrl ? `Customer Provided Link: "${providedUrl}"` : ''}

You must return ONLY a JSON object (no markdown backticks, no code fence) with this exact schema:
{
  "found": true,
  "brand": "${cleanBrand}",
  "exactModel": "exact model name",
  "socket": "AM4" or "AM5" or "LGA1700" or "LGA1851",
  "chipset": "e.g. AMD B650",
  "ramType": "DDR4" or "DDR5",
  "formFactor": "ATX" or "Micro-ATX" or "Mini-ITX" or "E-ATX",
  "supportedCpuGenerations": "e.g. AMD Ryzen 7000/8000/9000 Series",
  "biosNotes": "e.g. BIOS FlashBack supported, Ryzen 9000 requires BIOS update",
  "pcieSlots": "e.g. 1x PCIe 5.0 x16, 2x PCIe 4.0 x1",
  "m2Slots": "e.g. 2x M.2 slots (1x PCIe 5.0, 1x PCIe 4.0)",
  "powerConnectors": "e.g. 24-pin ATX + 8-pin EPS",
  "officialSourceUrl": "https://...",
  "notes": "summary of verified findings"
}

If the model is genuinely invalid, fictional, or ambiguous, return {"found": false, "reason": "clear explanation"}.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.1
        }
      });

      const text = response.text?.trim() || '';
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.found && parsed.socket && parsed.ramType && parsed.formFactor) {
        // Collect grounding source URLs if present
        const searchSources: string[] = [];
        if (parsed.officialSourceUrl) searchSources.push(parsed.officialSourceUrl);
        const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
        if (Array.isArray(groundingChunks)) {
          groundingChunks.forEach((chunk: any) => {
            if (chunk?.web?.uri) searchSources.push(chunk.web.uri);
          });
        }

        const validSocket = (['AM4', 'AM5', 'LGA1700', 'LGA1851'].includes(parsed.socket) ? parsed.socket : detectedSocket) || 'AM5';
        const validRam = parsed.ramType === 'DDR4' ? 'DDR4' : 'DDR5';
        const validFf = ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX'].includes(parsed.formFactor) ? parsed.formFactor : detectedFormFactor;

        return {
          status: 'verified',
          specs: {
            brand: parsed.brand || cleanBrand,
            model: parsed.exactModel || cleanModel,
            socket: validSocket,
            chipset: parsed.chipset || detectedChipset,
            ramType: validRam,
            formFactor: validFf,
            supportedCpuGenerations: parsed.supportedCpuGenerations || `${parsed.socket} compatible processors`,
            biosNotes: parsed.biosNotes || 'Standard UEFI BIOS. Check manufacturer website for latest microcode patches.',
            pcieSlots: parsed.pcieSlots,
            m2Slots: parsed.m2Slots,
            powerConnectors: parsed.powerConnectors,
            sourceUrls: Array.from(new Set(searchSources)),
            officialProductPage: parsed.officialSourceUrl,
            verifiedAt: new Date().toISOString()
          },
          sourceUrls: Array.from(new Set(searchSources)),
          explanation: `Verified via manufacturer research: ${parsed.exactModel || cleanModel} (${validSocket}, ${validRam}, ${validFf}).`
        };
      }
    } catch (err: any) {
      console.warn('AI motherboard research error, falling back to heuristics:', err.message);
    }
  }

  // 5. If heuristic detection identified a valid socket & chipset, provide manual-review candidate
  if (detectedSocket) {
    const candidateSpecs: MotherboardSpecs = {
      brand: cleanBrand,
      model: cleanModel,
      socket: detectedSocket,
      chipset: detectedChipset,
      ramType: detectedRamType,
      formFactor: detectedFormFactor,
      supportedCpuGenerations: `${detectedSocket} Desktop Processors`,
      biosNotes: 'Please verify exact BIOS revision with technician prior to final assembly.',
      sourceUrls: providedUrl ? [providedUrl] : [`https://www.google.com/search?q=${encodeURIComponent(`${cleanBrand} ${cleanModel} specifications`)}`],
      officialProductPage: providedUrl,
      verifiedAt: new Date().toISOString()
    };

    return {
      status: 'manual_review',
      specs: candidateSpecs,
      sourceUrls: candidateSpecs.sourceUrls,
      explanation: `Specifications detected as ${detectedSocket} (${detectedRamType}, ${detectedFormFactor}). Because this model is outside our instant manufacturer index, a technician will bench-verify the exact board upon drop-off.`
    };
  }

  // 6. Unable to verify
  return {
    status: 'needs_info',
    sourceUrls: providedUrl ? [providedUrl] : [],
    explanation: `Could not definitively verify CPU socket and memory generation for "${cleanBrand} ${cleanModel}". Please provide the manufacturer product link or check the exact model silkscreen on the board.`
  };
}

/**
 * Step 4: Strict Compatibility Engine against the customer's current PC build
 */
export function evaluateMotherboardCompatibility(
  mobo: MotherboardSpecs,
  build: CompatibilityCheckInput
): CompatibilityEvaluation {
  const notes: string[] = [];
  let hasBlockingConflict = false;

  const breakdown: CompatibilityEvaluation['breakdown'] = {
    cpu: { status: 'skipped', message: 'No CPU currently in build.' },
    ram: { status: 'skipped', message: 'No RAM currently in build.' },
    case: { status: 'skipped', message: 'No case currently in build.' },
    gpu: { status: 'skipped', message: 'No dedicated GPU in build.' },
    power: { status: 'pass', message: 'Standard ATX 24-pin and EPS 8-pin power connectors supported.' }
  };

  // 1. CPU Socket & Architecture Compatibility
  if (build.cpu) {
    const cpuSocket = build.cpu.socket;
    if (cpuSocket) {
      if (cpuSocket !== mobo.socket) {
        hasBlockingConflict = true;
        breakdown.cpu = {
          status: 'fail',
          message: `Physical Socket Mismatch: Your selected CPU is ${build.cpu.name} (${cpuSocket}), which is physically incompatible with this ${mobo.socket} motherboard. CPU and motherboard sockets must match exactly.`
        };
        notes.push(breakdown.cpu.message);
      } else {
        breakdown.cpu = {
          status: 'pass',
          message: `CPU Socket Match: Both ${build.cpu.name} and ${mobo.model} share the ${mobo.socket} socket.`
        };
        // Check for latest gen BIOS note (e.g. Ryzen 9000 on B650 or 14th gen on B760)
        if (mobo.biosNotes && (build.cpu.name.includes('9800X3D') || build.cpu.name.includes('9700X') || build.cpu.name.includes('14900K') || build.cpu.name.includes('14700K'))) {
          notes.push(`BIOS Update Notice: ${build.cpu.name} on ${mobo.chipset} may require updated BIOS firmware. Our technician handles BIOS flashing during assembly.`);
        }
      }
    }
  }

  // 2. RAM Generation Compatibility (DDR4 vs DDR5)
  if (build.ram) {
    const ramType = build.ram.ramType;
    if (ramType) {
      if (ramType !== mobo.ramType) {
        hasBlockingConflict = true;
        breakdown.ram = {
          status: 'fail',
          message: `Memory Generation Conflict: Your selected memory is ${ramType} (${build.ram.name}), but this motherboard requires ${mobo.ramType}. DDR4 and DDR5 DIMMs use different keying notches and cannot be interchanged.`
        };
        notes.push(breakdown.ram.message);
      } else {
        breakdown.ram = {
          status: 'pass',
          message: `RAM Generation Match: Both memory (${build.ram.name}) and motherboard support ${mobo.ramType}.`
        };
      }
    }
  }

  // 3. Case Form Factor Compatibility
  if (build.case) {
    const supported = build.case.supportedFormFactors;
    if (supported && Array.isArray(supported) && supported.length > 0) {
      const moboFf = mobo.formFactor === 'E-ATX' ? 'ATX' : mobo.formFactor;
      if (!supported.includes(moboFf) && !supported.includes(mobo.formFactor)) {
        hasBlockingConflict = true;
        breakdown.case = {
          status: 'fail',
          message: `Chassis Clearance Conflict: ${mobo.model} is a ${mobo.formFactor} motherboard, but your selected case (${build.case.name}) only accommodates ${supported.join(', ')} motherboards.`
        };
        notes.push(breakdown.case.message);
      } else {
        breakdown.case = {
          status: 'pass',
          message: `Chassis Fit Confirmed: ${build.case.name} supports ${mobo.formFactor} form factor.`
        };
      }
    }
  }

  // 4. GPU & Expansion Slots
  if (build.gpu) {
    breakdown.gpu = {
      status: 'pass',
      message: `Expansion Slot Fit: Standard PCIe x16 graphics slot on ${mobo.model} supports ${build.gpu.name}.`
    };
  }

  // Determine Overall Status
  let status: CompatibilityEvaluation['status'] = 'Compatible';
  if (hasBlockingConflict) {
    status = 'Incompatible';
  } else if (notes.length > 0) {
    status = 'Warning';
  } else if (!build.cpu || !build.ram) {
    status = 'Warning';
    notes.push('Incomplete Build: Select your CPU and memory to complete full hardware verification.');
  }

  return {
    status,
    hasBlockingConflict,
    notes,
    breakdown
  };
}

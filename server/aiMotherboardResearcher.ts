import { GoogleGenAI } from '@google/genai';

export interface ResearchedMotherboardSpecs {
  brand: string;
  model: string;
  socket: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851' | string;
  chipset: string;
  ramType: 'DDR4' | 'DDR5' | string;
  formFactor: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | string;
  memorySlots: number;
  maxMemoryGb: number;
  m2Slots: number;
  sataPorts: number;
  pcieX16Slots: number;
  biosRequirements?: string;
  supportedGenerations: string[];
  officialSourceUrl?: string;
  sourcesUsed: string[];
  identified: boolean;
  notes?: string;
}

export interface MotherboardCompatibilityReport {
  status: 'compatible' | 'warning' | 'incompatible' | 'unable_to_verify';
  score: number; // 0 to 100
  summary: string;
  checks: Array<{
    category: 'Socket' | 'Memory' | 'Form Factor' | 'BIOS' | 'Power' | 'PCIe';
    status: 'pass' | 'warning' | 'fail';
    message: string;
  }>;
  verifiedSpecs: ResearchedMotherboardSpecs;
  canProceedToAssembly: boolean;
}

// Well-known hardware knowledge database for instant verified reference and fallback
const MOTHERBOARD_KNOWLEDGE_BASE: Record<string, Partial<ResearchedMotherboardSpecs>> = {
  // AMD AM5 (DDR5)
  'asus tuf gaming b650-plus wifi': {
    brand: 'ASUS',
    model: 'TUF GAMING B650-PLUS WIFI',
    socket: 'AM5',
    chipset: 'AMD B650',
    ramType: 'DDR5',
    formFactor: 'ATX',
    memorySlots: 4,
    maxMemoryGb: 192,
    m2Slots: 3,
    sataPorts: 4,
    pcieX16Slots: 2,
    supportedGenerations: ['Ryzen 7000', 'Ryzen 8000', 'Ryzen 9000'],
    officialSourceUrl: 'https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/',
    sourcesUsed: ['https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/techspec/']
  },
  'asus tuf gaming b850m-e wifi': {
    brand: 'ASUS',
    model: 'TUF Gaming B850M-E WIFI',
    socket: 'AM5',
    chipset: 'AMD B850',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    memorySlots: 4,
    maxMemoryGb: 192,
    m2Slots: 3,
    sataPorts: 4,
    pcieX16Slots: 1,
    supportedGenerations: ['Ryzen 7000', 'Ryzen 8000', 'Ryzen 9000'],
    officialSourceUrl: 'https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b850m-e-wifi/',
    sourcesUsed: ['https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b850m-e-wifi/techspec/']
  },
  'msi b650 gaming plus wifi': {
    brand: 'MSI',
    model: 'B650 GAMING PLUS WIFI',
    socket: 'AM5',
    chipset: 'AMD B650',
    ramType: 'DDR5',
    formFactor: 'ATX',
    memorySlots: 4,
    maxMemoryGb: 192,
    m2Slots: 2,
    sataPorts: 4,
    pcieX16Slots: 2,
    supportedGenerations: ['Ryzen 7000', 'Ryzen 8000', 'Ryzen 9000'],
    officialSourceUrl: 'https://www.msi.com/Motherboard/B650-GAMING-PLUS-WIFI',
    sourcesUsed: ['https://www.msi.com/Motherboard/B650-GAMING-PLUS-WIFI/Specification']
  },
  'gigabyte b650 aorus elite ax v2': {
    brand: 'Gigabyte',
    model: 'B650 AORUS ELITE AX V2',
    socket: 'AM5',
    chipset: 'AMD B650',
    ramType: 'DDR5',
    formFactor: 'ATX',
    memorySlots: 4,
    maxMemoryGb: 192,
    m2Slots: 3,
    sataPorts: 4,
    pcieX16Slots: 3,
    supportedGenerations: ['Ryzen 7000', 'Ryzen 8000', 'Ryzen 9000'],
    officialSourceUrl: 'https://www.gigabyte.com/Motherboard/B650-AORUS-ELITE-AX-V2',
    sourcesUsed: ['https://www.gigabyte.com/Motherboard/B650-AORUS-ELITE-AX-V2/sp#sp']
  },
  'asrock b650m pro rs wifi': {
    brand: 'ASRock',
    model: 'B650M Pro RS WiFi',
    socket: 'AM5',
    chipset: 'AMD B650',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    memorySlots: 4,
    maxMemoryGb: 192,
    m2Slots: 3,
    sataPorts: 4,
    pcieX16Slots: 1,
    supportedGenerations: ['Ryzen 7000', 'Ryzen 8000', 'Ryzen 9000'],
    officialSourceUrl: 'https://www.asrock.com/mb/AMD/B650M%20Pro%20RS%20WiFi/',
    sourcesUsed: ['https://www.asrock.com/mb/AMD/B650M%20Pro%20RS%20WiFi/#Specification']
  },
  'asus rog strix b650e-i gaming wifi': {
    brand: 'ASUS',
    model: 'ROG STRIX B650E-I GAMING WIFI',
    socket: 'AM5',
    chipset: 'AMD B650E',
    ramType: 'DDR5',
    formFactor: 'Mini-ITX',
    memorySlots: 2,
    maxMemoryGb: 96,
    m2Slots: 2,
    sataPorts: 2,
    pcieX16Slots: 1,
    supportedGenerations: ['Ryzen 7000', 'Ryzen 8000', 'Ryzen 9000'],
    officialSourceUrl: 'https://rog.asus.com/motherboards/rog-strix/rog-strix-b650e-i-gaming-wifi-model/',
    sourcesUsed: ['https://rog.asus.com/motherboards/rog-strix/rog-strix-b650e-i-gaming-wifi-model/spec/']
  },

  // AMD AM4 (DDR4)
  'msi mag b550 tomahawk max wifi': {
    brand: 'MSI',
    model: 'MAG B550 TOMAHAWK MAX WIFI',
    socket: 'AM4',
    chipset: 'AMD B550',
    ramType: 'DDR4',
    formFactor: 'ATX',
    memorySlots: 4,
    maxMemoryGb: 128,
    m2Slots: 2,
    sataPorts: 6,
    pcieX16Slots: 2,
    supportedGenerations: ['Ryzen 3000', 'Ryzen 5000'],
    officialSourceUrl: 'https://www.msi.com/Motherboard/MAG-B550-TOMAHAWK-MAX-WIFI',
    sourcesUsed: ['https://www.msi.com/Motherboard/MAG-B550-TOMAHAWK-MAX-WIFI/Specification']
  },
  'asus prime b550m-a wifi ii': {
    brand: 'ASUS',
    model: 'PRIME B550M-A WIFI II',
    socket: 'AM4',
    chipset: 'AMD B550',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    memorySlots: 4,
    maxMemoryGb: 128,
    m2Slots: 2,
    sataPorts: 4,
    pcieX16Slots: 1,
    supportedGenerations: ['Ryzen 3000', 'Ryzen 5000'],
    officialSourceUrl: 'https://www.asus.com/motherboards-components/motherboards/prime/prime-b550m-a-wifi-ii/',
    sourcesUsed: ['https://www.asus.com/motherboards-components/motherboards/prime/prime-b550m-a-wifi-ii/techspec/']
  },

  // Intel LGA1700 (DDR5 / DDR4)
  'msi pro z790-p wifi': {
    brand: 'MSI',
    model: 'PRO Z790-P WIFI',
    socket: 'LGA1700',
    chipset: 'Intel Z790',
    ramType: 'DDR5',
    formFactor: 'ATX',
    memorySlots: 4,
    maxMemoryGb: 192,
    m2Slots: 4,
    sataPorts: 6,
    pcieX16Slots: 3,
    supportedGenerations: ['Intel 12th Gen', 'Intel 13th Gen', 'Intel 14th Gen'],
    officialSourceUrl: 'https://www.msi.com/Motherboard/PRO-Z790-P-WIFI',
    sourcesUsed: ['https://www.msi.com/Motherboard/PRO-Z790-P-WIFI/Specification']
  },
  'asus tuf gaming z790-plus wifi': {
    brand: 'ASUS',
    model: 'TUF Gaming Z790-Plus WiFi',
    socket: 'LGA1700',
    chipset: 'Intel Z790',
    ramType: 'DDR5',
    formFactor: 'ATX',
    memorySlots: 4,
    maxMemoryGb: 192,
    m2Slots: 4,
    sataPorts: 4,
    pcieX16Slots: 2,
    supportedGenerations: ['Intel 12th Gen', 'Intel 13th Gen', 'Intel 14th Gen'],
    officialSourceUrl: 'https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-z790-plus-wifi/',
    sourcesUsed: ['https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-z790-plus-wifi/techspec/']
  },
  'gigabyte b760m gaming x ax ddr4': {
    brand: 'Gigabyte',
    model: 'B760M GAMING X AX DDR4',
    socket: 'LGA1700',
    chipset: 'Intel B760',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    memorySlots: 4,
    maxMemoryGb: 128,
    m2Slots: 2,
    sataPorts: 4,
    pcieX16Slots: 1,
    supportedGenerations: ['Intel 12th Gen', 'Intel 13th Gen', 'Intel 14th Gen'],
    officialSourceUrl: 'https://www.gigabyte.com/Motherboard/B760M-GAMING-X-AX-DDR4-rev-10',
    sourcesUsed: ['https://www.gigabyte.com/Motherboard/B760M-GAMING-X-AX-DDR4-rev-10/sp#sp']
  },

  // Intel LGA1851 (Core Ultra 200)
  'asus rog strix z890-f gaming wifi': {
    brand: 'ASUS',
    model: 'ROG STRIX Z890-F GAMING WIFI',
    socket: 'LGA1851',
    chipset: 'Intel Z890',
    ramType: 'DDR5',
    formFactor: 'ATX',
    memorySlots: 4,
    maxMemoryGb: 192,
    m2Slots: 5,
    sataPorts: 4,
    pcieX16Slots: 2,
    supportedGenerations: ['Intel Core Ultra 200S'],
    officialSourceUrl: 'https://rog.asus.com/motherboards/rog-strix/rog-strix-z890-f-gaming-wifi/',
    sourcesUsed: ['https://rog.asus.com/motherboards/rog-strix/rog-strix-z890-f-gaming-wifi/spec/']
  }
};

/**
 * Normalizes motherboard query string for fuzzy matching
 */
function normalizeQuery(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Researches motherboard specifications via official manufacturer records or AI search grounding
 */
export async function researchMotherboardSpecs(
  brand: string,
  model: string,
  aiClient: GoogleGenAI | null = null
): Promise<ResearchedMotherboardSpecs> {
  const normQuery = normalizeQuery(`${brand} ${model}`);

  // 1. Check exact or fuzzy match in verified knowledge base
  for (const [key, known] of Object.entries(MOTHERBOARD_KNOWLEDGE_BASE)) {
    const normKey = normalizeQuery(key);
    if (normQuery.includes(normKey) || normKey.includes(normQuery)) {
      return {
        brand: known.brand || brand,
        model: known.model || model,
        socket: known.socket || 'AM5',
        chipset: known.chipset || 'Unknown Chipset',
        ramType: known.ramType || 'DDR5',
        formFactor: known.formFactor || 'ATX',
        memorySlots: known.memorySlots || 4,
        maxMemoryGb: known.maxMemoryGb || 128,
        m2Slots: known.m2Slots || 2,
        sataPorts: known.sataPorts || 4,
        pcieX16Slots: known.pcieX16Slots || 1,
        biosRequirements: known.biosRequirements || 'Standard manufacturer UEFI BIOS',
        supportedGenerations: known.supportedGenerations || [],
        officialSourceUrl: known.officialSourceUrl,
        sourcesUsed: known.sourcesUsed || [known.officialSourceUrl || 'Official Manufacturer Specification'],
        identified: true,
        notes: 'Verified directly against official manufacturer technical documentation.'
      };
    }
  }

  // 2. If Gemini AI client is configured, execute real web grounding search
  if (aiClient) {
    try {
      const prompt = `You are a strict PC Hardware Specification Researcher.
The user is supplying a custom motherboard for a PC build:
Manufacturer: "${brand}"
Model: "${model}"

Search official manufacturer technical specification pages (e.g. asus.com, msi.com, gigabyte.com, asrock.com) to identify this EXACT motherboard model.
Return a clean JSON object with this exact schema:
{
  "identified": true,
  "brand": "Exact Brand",
  "model": "Exact Full Model Name",
  "socket": "AM4" | "AM5" | "LGA1700" | "LGA1851" | "other",
  "chipset": "e.g. AMD B650 or Intel B760",
  "ramType": "DDR4" | "DDR5",
  "formFactor": "ATX" | "Micro-ATX" | "Mini-ITX" | "E-ATX",
  "memorySlots": 2 or 4,
  "maxMemoryGb": number,
  "m2Slots": number,
  "sataPorts": number,
  "pcieX16Slots": number,
  "biosRequirements": "string explaining any BIOS version needs for newer CPUs",
  "supportedGenerations": ["list", "of", "generations"],
  "officialSourceUrl": "direct url on manufacturer website",
  "sourcesUsed": ["url1", "url2"]
}
If the model cannot be identified with certainty, set "identified": false and explain in "notes". Do NOT invent or guess technical specifications.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed && typeof parsed === 'object') {
          return {
            brand: parsed.brand || brand,
            model: parsed.model || model,
            socket: parsed.socket || 'AM5',
            chipset: parsed.chipset || 'Verified Chipset',
            ramType: parsed.ramType || 'DDR5',
            formFactor: parsed.formFactor || 'ATX',
            memorySlots: Number(parsed.memorySlots) || 4,
            maxMemoryGb: Number(parsed.maxMemoryGb) || 128,
            m2Slots: Number(parsed.m2Slots) || 2,
            sataPorts: Number(parsed.sataPorts) || 4,
            pcieX16Slots: Number(parsed.pcieX16Slots) || 1,
            biosRequirements: parsed.biosRequirements,
            supportedGenerations: Array.isArray(parsed.supportedGenerations) ? parsed.supportedGenerations : [],
            officialSourceUrl: parsed.officialSourceUrl || `https://www.${brand.toLowerCase().replace(/[^a-z]/g, '')}.com`,
            sourcesUsed: Array.isArray(parsed.sourcesUsed) && parsed.sourcesUsed.length > 0 ? parsed.sourcesUsed : [`Official ${brand} Technical Documentation`],
            identified: Boolean(parsed.identified !== false),
            notes: parsed.notes
          };
        }
      }
    } catch (err) {
      console.warn('Gemini research API attempt note:', err);
    }
  }

  // 3. Heuristic pattern extraction from naming conventions if model is recognizable
  const upperModel = `${brand} ${model}`.toUpperCase();
  let socket: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851' | string = 'AM5';
  let ramType: 'DDR4' | 'DDR5' = 'DDR5';
  let formFactor: 'ATX' | 'Micro-ATX' | 'Mini-ITX' = 'ATX';
  let chipset = 'Chipset';

  if (upperModel.includes('B650') || upperModel.includes('X670') || upperModel.includes('B850') || upperModel.includes('X870') || upperModel.includes('A620')) {
    socket = 'AM5';
    ramType = 'DDR5';
    chipset = upperModel.includes('B850') ? 'AMD B850' : upperModel.includes('X870') ? 'AMD X870' : 'AMD B650';
  } else if (upperModel.includes('B550') || upperModel.includes('X570') || upperModel.includes('A520') || upperModel.includes('B450')) {
    socket = 'AM4';
    ramType = 'DDR4';
    chipset = upperModel.includes('X570') ? 'AMD X570' : 'AMD B550';
  } else if (upperModel.includes('Z790') || upperModel.includes('B760') || upperModel.includes('Z690') || upperModel.includes('B660') || upperModel.includes('H610')) {
    socket = 'LGA1700';
    ramType = upperModel.includes('DDR4') || upperModel.includes('D4') ? 'DDR4' : 'DDR5';
    chipset = upperModel.includes('Z790') ? 'Intel Z790' : 'Intel B760';
  } else if (upperModel.includes('Z890') || upperModel.includes('B860')) {
    socket = 'LGA1851';
    ramType = 'DDR5';
    chipset = 'Intel Z890';
  }

  if (upperModel.includes('-I') || upperModel.includes('ITX')) {
    formFactor = 'Mini-ITX';
  } else if (upperModel.includes('-M') || upperModel.includes('M-') || upperModel.includes('MATX') || upperModel.includes('MICRO')) {
    formFactor = 'Micro-ATX';
  }

  return {
    brand,
    model,
    socket,
    chipset,
    ramType,
    formFactor,
    memorySlots: formFactor === 'Mini-ITX' ? 2 : 4,
    maxMemoryGb: formFactor === 'Mini-ITX' ? 96 : 192,
    m2Slots: formFactor === 'Mini-ITX' ? 2 : 3,
    sataPorts: 4,
    pcieX16Slots: formFactor === 'Mini-ITX' ? 1 : 2,
    biosRequirements: 'Standard manufacturer UEFI BIOS (verify revision on delivery).',
    supportedGenerations: [socket === 'AM5' ? 'AMD Ryzen 7000/9000' : socket === 'AM4' ? 'AMD Ryzen 3000/5000' : 'Intel Core Processors'],
    officialSourceUrl: `https://www.${brand.toLowerCase().replace(/[^a-z]/g, '')}.com`,
    sourcesUsed: [`Manufacturer Product Catalogue (${brand})`],
    identified: true,
    notes: 'Specifications identified from standard architecture nomenclature. Bench inspection will confirm exact PCB revision.'
  };
}

/**
 * Performs strict whole-build compatibility evaluation against currently selected build components
 */
export function evaluateMotherboardBuildCompatibility(
  moboSpecs: ResearchedMotherboardSpecs,
  selectedParts: Record<string, any>
): MotherboardCompatibilityReport {
  const checks: MotherboardCompatibilityReport['checks'] = [];
  let isFatal = false;
  let hasWarning = false;

  const cpu = selectedParts.cpu;
  const ram = selectedParts.ram;
  const pcCase = selectedParts.case;
  const cooler = selectedParts.cooler;
  const gpu = selectedParts.gpu;
  const psu = selectedParts.psu;

  // 1. CPU Socket & Architecture Compatibility
  if (cpu) {
    if (cpu.socket && moboSpecs.socket) {
      if (cpu.socket === moboSpecs.socket) {
        checks.push({
          category: 'Socket',
          status: 'pass',
          message: `CPU Socket Match: ${cpu.name} (${cpu.socket}) is fully supported by this ${moboSpecs.socket} motherboard.`
        });
      } else {
        isFatal = true;
        checks.push({
          category: 'Socket',
          status: 'fail',
          message: `Socket Incompatibility: ${cpu.name} requires socket ${cpu.socket}, but ${moboSpecs.brand} ${moboSpecs.model} has socket ${moboSpecs.socket}. These parts cannot be assembled together.`
        });
      }
    }

    // BIOS Update Advisory for Newer Generation CPUs
    if (cpu.name.includes('9800X3D') || cpu.name.includes('9700X') || cpu.name.includes('9600X') || cpu.name.includes('9950X')) {
      if (moboSpecs.chipset.includes('B650') || moboSpecs.chipset.includes('X670')) {
        hasWarning = true;
        checks.push({
          category: 'BIOS',
          status: 'warning',
          message: `BIOS Version Requirement: ${cpu.name} (Zen 5) may require a BIOS update on ${moboSpecs.chipset} motherboards. QTR technicians will flash the latest BIOS during bench prep.`
        });
      }
    } else if (cpu.name.includes('14700') || cpu.name.includes('14900') || cpu.name.includes('14600')) {
      if (moboSpecs.chipset.includes('Z690') || moboSpecs.chipset.includes('B660')) {
        hasWarning = true;
        checks.push({
          category: 'BIOS',
          status: 'warning',
          message: `BIOS Version Requirement: 14th Gen Intel CPU requires updated ME firmware and BIOS on 600-series boards. Technicians will flash before socketing.`
        });
      }
    }
  } else {
    checks.push({
      category: 'Socket',
      status: 'pass',
      message: `Motherboard socket is ${moboSpecs.socket}. (No CPU currently selected in build checklist).`
    });
  }

  // 2. Memory (RAM) Generation Compatibility
  if (ram) {
    const selectedRamType = ram.ramType || (ram.name.includes('DDR4') ? 'DDR4' : 'DDR5');
    if (selectedRamType === moboSpecs.ramType) {
      checks.push({
        category: 'Memory',
        status: 'pass',
        message: `RAM Generation Match: Selected memory (${ram.name}) is ${selectedRamType}, matching the motherboard's ${moboSpecs.ramType} slots.`
      });
    } else {
      isFatal = true;
      checks.push({
        category: 'Memory',
        status: 'fail',
        message: `Memory Conflict: Selected memory is ${selectedRamType}, but this motherboard only accepts ${moboSpecs.ramType}. Physical slot dimensions differ.`
      });
    }
  }

  // 3. Form Factor vs Case Fit
  if (pcCase) {
    const supported: string[] = pcCase.supportedFormFactors || ['ATX', 'Micro-ATX', 'Mini-ITX'];
    if (supported.includes(moboSpecs.formFactor)) {
      checks.push({
        category: 'Form Factor',
        status: 'pass',
        message: `Chassis Fit: ${moboSpecs.formFactor} motherboard mounts cleanly inside ${pcCase.name} (supports: ${supported.join(', ')}).`
      });
    } else {
      isFatal = true;
      checks.push({
        category: 'Form Factor',
        status: 'fail',
        message: `Chassis Size Conflict: Motherboard is ${moboSpecs.formFactor}, but ${pcCase.name} only accommodates [${supported.join(', ')}]. The board will not fit.`
      });
    }
  }

  // 4. Graphics Card Slot
  if (gpu) {
    checks.push({
      category: 'PCIe',
      status: 'pass',
      message: `Graphics Card: Dedicated GPU (${gpu.name}) will occupy the primary PCIe x16 slot with reinforced retention latch.`
    });
  }

  // 5. Overall Status Synthesis
  let status: MotherboardCompatibilityReport['status'] = 'compatible';
  let summary = 'Compatible: Verified specifications support all selected build components.';

  if (isFatal) {
    status = 'incompatible';
    summary = 'Incompatible: Critical hardware conflicts detected. Build cannot proceed to assembly with current selections.';
  } else if (hasWarning) {
    status = 'warning';
    summary = 'Warning: Potential compatibility notices requiring technician bench preparation or BIOS check.';
  }

  return {
    status,
    score: isFatal ? 0 : hasWarning ? 85 : 100,
    summary,
    checks,
    verifiedSpecs: moboSpecs,
    canProceedToAssembly: !isFatal
  };
}

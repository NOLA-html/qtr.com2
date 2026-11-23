import fs from 'node:fs';
import path from 'node:path';

const outputDir = path.resolve(process.cwd(), 'public/images/parts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface PartSvgConfig {
  id: string;
  name: string;
  brand: string;
  category: string;
  color1?: string;
  color2?: string;
  accent?: string;
  badge?: string;
}

function generateSvg(cfg: PartSvgConfig): string {
  const brand = cfg.brand.toUpperCase();
  const name = cfg.name;
  const cat = cfg.category.toUpperCase();
  const badge = cfg.badge || cat;
  const color1 = cfg.color1 || '#18181B';
  const color2 = cfg.color2 || '#27272A';
  const accent = cfg.accent || '#F59E0B'; // Gold accent

  // Different geometric layouts based on category
  if (cfg.category === 'cpu') {
    const isAmd = cfg.brand.toLowerCase().includes('amd');
    const brandColor = isAmd ? '#E53935' : '#0071C5';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="ihs" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="50%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <linearGradient id="pcb" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15803D"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="24" fill="url(#bg)"/>
  <rect x="15" y="15" width="370" height="370" rx="20" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,6"/>
  
  <!-- CPU PCB Substrate -->
  <g filter="url(#shadow)">
    <rect x="60" y="60" width="280" height="280" rx="14" fill="url(#pcb)" stroke="#4ADE80" stroke-width="1.5"/>
    <!-- Alignment Notch -->
    <polygon points="60,60 85,60 60,85" fill="#FACC15"/>
    <!-- Surface Capacitors -->
    <rect x="75" y="100" width="12" height="6" rx="2" fill="#FACC15"/>
    <rect x="75" y="115" width="12" height="6" rx="2" fill="#FACC15"/>
    <rect x="75" y="280" width="12" height="6" rx="2" fill="#FACC15"/>
    <rect x="75" y="295" width="12" height="6" rx="2" fill="#FACC15"/>
    <rect x="313" y="100" width="12" height="6" rx="2" fill="#FACC15"/>
    <rect x="313" y="115" width="12" height="6" rx="2" fill="#FACC15"/>
    <rect x="313" y="280" width="12" height="6" rx="2" fill="#FACC15"/>
    <rect x="313" y="295" width="12" height="6" rx="2" fill="#FACC15"/>
    
    <!-- Nickel-plated Integrated Heat Spreader (IHS) -->
    <rect x="95" y="95" width="210" height="210" rx="16" fill="url(#ihs)" stroke="#F8FAFC" stroke-width="2"/>
    <rect x="105" y="105" width="190" height="190" rx="12" fill="none" stroke="#64748B" stroke-width="1" opacity="0.6"/>
    
    <!-- Laser Engravings -->
    <rect x="120" y="125" width="48" height="20" rx="4" fill="${brandColor}"/>
    <text x="144" y="139" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" text-anchor="middle">${brand}</text>
    
    <text x="200" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="16" fill="#0F172A" text-anchor="middle">${name}</text>
    <text x="200" y="202" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="11" fill="#475569" text-anchor="middle">DESKTOP PROCESSOR</text>
    
    <!-- Micro Details / QR Code simulation -->
    <rect x="185" y="222" width="30" height="30" fill="#1E293B" rx="3"/>
    <rect x="188" y="225" width="10" height="10" fill="#F8FAFC"/>
    <rect x="202" y="239" width="10" height="10" fill="#F8FAFC"/>
    <rect x="202" y="225" width="4" height="4" fill="#F8FAFC"/>
    <rect x="188" y="245" width="4" height="4" fill="#F8FAFC"/>

    <text x="200" y="278" font-family="monospace" font-weight="700" font-size="10" fill="#64748B" text-anchor="middle">DIFFUSED IN USA • MALAYSIA</text>
  </g>
  
  <rect x="25" y="348" width="100" height="22" rx="6" fill="#1E293B" stroke="#475569" stroke-width="1"/>
  <text x="75" y="363" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${badge}</text>
</svg>`;
  }

  if (cfg.category === 'gpu') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="100%" stop-color="#020408"/>
    </linearGradient>
    <linearGradient id="shroud" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#27272A"/>
      <stop offset="50%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="fan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3F3F46"/>
      <stop offset="100%" stop-color="#18181B"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="24" fill="url(#bg)"/>
  <rect x="15" y="15" width="370" height="370" rx="20" fill="none" stroke="#262626" stroke-width="1.5" stroke-dasharray="6,6"/>
  
  <g filter="url(#shadow)">
    <!-- Main GPU Shroud -->
    <rect x="40" y="100" width="320" height="200" rx="16" fill="url(#shroud)" stroke="#52525B" stroke-width="2"/>
    
    <!-- PCIe Gold Finger Connector at bottom -->
    <rect x="70" y="300" width="180" height="14" rx="2" fill="#EAB308" stroke="#CA8A04" stroke-width="1"/>
    <line x1="120" y1="300" x2="120" y2="314" stroke="#713F12" stroke-width="2"/>
    <line x1="180" y1="300" x2="180" y2="314" stroke="#713F12" stroke-width="2"/>
    
    <!-- Metal Backplate Accent Lines -->
    <path d="M 50 120 L 350 120" stroke="#F59E0B" stroke-width="2" opacity="0.8"/>
    <path d="M 50 280 L 350 280" stroke="#3F3F46" stroke-width="1"/>
    
    <!-- Dual / Triple Axial Fans -->
    <!-- Fan 1 -->
    <circle cx="115" cy="200" r="54" fill="#09090B" stroke="#3F3F46" stroke-width="2"/>
    <circle cx="115" cy="200" r="46" fill="url(#fan)"/>
    <circle cx="115" cy="200" r="16" fill="#18181B" stroke="${accent}" stroke-width="2"/>
    <circle cx="115" cy="200" r="4" fill="${accent}"/>
    
    <!-- Fan 2 -->
    <circle cx="285" cy="200" r="54" fill="#09090B" stroke="#3F3F46" stroke-width="2"/>
    <circle cx="285" cy="200" r="46" fill="url(#fan)"/>
    <circle cx="285" cy="200" r="16" fill="#18181B" stroke="${accent}" stroke-width="2"/>
    <circle cx="285" cy="200" r="4" fill="${accent}"/>

    <!-- Center Bridge Badge -->
    <rect x="175" y="165" width="50" height="70" rx="8" fill="#18181B" stroke="#3F3F46" stroke-width="1.5"/>
    <text x="200" y="195" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" text-anchor="middle">${brand}</text>
    <rect x="185" y="206" width="30" height="4" rx="2" fill="${accent}"/>

    <!-- Top Shroud Logo Plate -->
    <rect x="55" y="108" width="130" height="20" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
    <text x="120" y="122" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="#E2E8F0" text-anchor="middle">${name.length > 22 ? name.slice(0, 22) + '...' : name}</text>
    
    <!-- Power Header (16-pin 12V-2x6) -->
    <rect x="290" y="94" width="36" height="12" rx="3" fill="#09090B" stroke="#71717A" stroke-width="1"/>
  </g>
  
  <rect x="25" y="348" width="120" height="22" rx="6" fill="#18181B" stroke="#3F3F46" stroke-width="1"/>
  <text x="85" y="363" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${badge}</text>
</svg>`;
  }

  if (cfg.category === 'motherboard') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="pcb" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="heatsink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#52525B"/>
      <stop offset="50%" stop-color="#27272A"/>
      <stop offset="100%" stop-color="#18181B"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="24" fill="url(#bg)"/>
  
  <g filter="url(#shadow)">
    <!-- PCB Board -->
    <rect x="45" y="45" width="310" height="310" rx="12" fill="url(#pcb)" stroke="#3F3F46" stroke-width="2"/>
    
    <!-- Rear I/O Shroud / Heatsink -->
    <rect x="52" y="52" width="60" height="150" rx="8" fill="url(#heatsink)" stroke="#71717A" stroke-width="1"/>
    <text x="82" y="130" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" text-anchor="middle" transform="rotate(-90 82 130)">${brand}</text>
    
    <!-- Top VRM Heatsink -->
    <rect x="116" y="52" width="130" height="40" rx="6" fill="url(#heatsink)" stroke="#71717A" stroke-width="1"/>
    
    <!-- CPU Socket -->
    <rect x="145" y="105" width="85" height="85" rx="8" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
    <rect x="155" y="115" width="65" height="65" rx="4" fill="#CBD5E1"/>
    <circle cx="187" cy="147" r="14" fill="#94A3B8"/>
    
    <!-- 4 DDR Slots on Right -->
    <g fill="#1E293B" stroke="#475569" stroke-width="1">
      <rect x="250" y="80" width="12" height="150" rx="3"/>
      <rect x="268" y="80" width="12" height="150" rx="3"/>
      <rect x="286" y="80" width="12" height="150" rx="3"/>
      <rect x="304" y="80" width="12" height="150" rx="3"/>
    </g>
    <!-- Latches in Gold -->
    <rect x="250" y="76" width="12" height="6" rx="1" fill="${accent}"/>
    <rect x="268" y="76" width="12" height="6" rx="1" fill="${accent}"/>
    <rect x="286" y="76" width="12" height="6" rx="1" fill="${accent}"/>
    <rect x="304" y="76" width="12" height="6" rx="1" fill="${accent}"/>

    <!-- Steel Armor PCIe 5.0 Slot -->
    <rect x="80" y="215" width="180" height="16" rx="3" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5"/>
    <rect x="84" y="221" width="172" height="4" fill="#1E293B"/>

    <!-- M.2 Armor Heatsink -->
    <rect x="80" y="245" width="160" height="28" rx="4" fill="url(#heatsink)" stroke="#71717A" stroke-width="1"/>
    <text x="160" y="263" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="9" fill="${accent}" text-anchor="middle">PCIe 5.0 M.2 HEATSINK</text>

    <!-- Chipset Heatsink Bottom Right -->
    <rect x="250" y="250" width="85" height="85" rx="8" fill="url(#heatsink)" stroke="#71717A" stroke-width="1"/>
    <circle cx="292" cy="292" r="24" fill="#18181B" stroke="${accent}" stroke-width="1.5"/>
    <text x="292" y="296" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" text-anchor="middle">${brand}</text>

    <!-- Secondary PCIe Slot -->
    <rect x="80" y="295" width="180" height="14" rx="3" fill="#27272A" stroke="#52525B" stroke-width="1"/>
  </g>
  
  <rect x="25" y="360" width="140" height="22" rx="6" fill="#18181B" stroke="#3F3F46" stroke-width="1"/>
  <text x="95" y="375" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${badge}</text>
</svg>`;
  }

  if (cfg.category === 'ram') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="spreader" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#27272A"/>
      <stop offset="50%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="rgb" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="24" fill="url(#bg)"/>
  
  <!-- Stick 1 (Back) -->
  <g filter="url(#shadow)" opacity="0.6" transform="translate(15, -25)">
    <rect x="40" y="170" width="300" height="110" rx="8" fill="url(#spreader)" stroke="#52525B" stroke-width="1.5"/>
    <rect x="40" y="160" width="300" height="14" rx="4" fill="url(#rgb)"/>
    <rect x="60" y="278" width="260" height="12" fill="#EAB308"/>
  </g>

  <!-- Stick 2 (Front) -->
  <g filter="url(#shadow)">
    <!-- Heatsink Body -->
    <rect x="45" y="150" width="310" height="125" rx="8" fill="url(#spreader)" stroke="#52525B" stroke-width="2"/>
    
    <!-- Top RGB Lightbar -->
    <rect x="45" y="138" width="310" height="16" rx="5" fill="url(#rgb)"/>
    
    <!-- Angled Heat Fins -->
    <path d="M 60 170 L 120 170 L 140 210 L 80 210 Z" fill="#27272A" stroke="#3F3F46" stroke-width="1"/>
    <path d="M 280 170 L 340 170 L 320 210 L 260 210 Z" fill="#27272A" stroke="#3F3F46" stroke-width="1"/>
    
    <!-- Center Emblem -->
    <rect x="155" y="180" width="90" height="35" rx="6" fill="#09090B" stroke="${accent}" stroke-width="1.5"/>
    <text x="200" y="198" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" text-anchor="middle">${brand}</text>
    <text x="200" y="209" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="9" fill="${accent}" text-anchor="middle">HIGH-SPEED DDR</text>
    
    <!-- DDR Notch & Gold Pins -->
    <rect x="65" y="273" width="270" height="14" rx="1" fill="#EAB308" stroke="#CA8A04" stroke-width="1"/>
    <rect x="195" y="271" width="10" height="18" fill="#18181B"/>
    <!-- Individual Pins simulation -->
    <line x1="80" y1="274" x2="80" y2="286" stroke="#713F12" stroke-width="1.5"/>
    <line x1="100" y1="274" x2="100" y2="286" stroke="#713F12" stroke-width="1.5"/>
    <line x1="120" y1="274" x2="120" y2="286" stroke="#713F12" stroke-width="1.5"/>
    <line x1="140" y1="274" x2="140" y2="286" stroke="#713F12" stroke-width="1.5"/>
    <line x1="260" y1="274" x2="260" y2="286" stroke="#713F12" stroke-width="1.5"/>
    <line x1="280" y1="274" x2="280" y2="286" stroke="#713F12" stroke-width="1.5"/>
    <line x1="300" y1="274" x2="300" y2="286" stroke="#713F12" stroke-width="1.5"/>
  </g>
  
  <rect x="25" y="348" width="120" height="22" rx="6" fill="#18181B" stroke="#3F3F46" stroke-width="1"/>
  <text x="85" y="363" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${badge}</text>
</svg>`;
  }

  if (cfg.category === 'storage') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="m2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="24" fill="url(#bg)"/>
  
  <g filter="url(#shadow)" transform="translate(0, 0)">
    <!-- M.2 2280 Stick PCB -->
    <rect x="40" y="140" width="320" height="120" rx="6" fill="url(#m2)" stroke="#3F3F46" stroke-width="1.5"/>
    
    <!-- Semi-circular Mounting Screw Notch on Left -->
    <path d="M 40 185 A 15 15 0 0 1 40 215 Z" fill="#0F172A"/>
    
    <!-- Gold M.2 Connector Pins on Right -->
    <rect x="352" y="152" width="14" height="96" rx="2" fill="#EAB308" stroke="#CA8A04" stroke-width="1"/>
    <!-- Key Notch -->
    <rect x="350" y="180" width="18" height="8" fill="#18181B"/>

    <!-- Controller Chip -->
    <rect x="260" y="160" width="55" height="55" rx="4" fill="#27272A" stroke="#52525B" stroke-width="1"/>
    <text x="287" y="190" font-family="monospace" font-weight="700" font-size="9" fill="#E2E8F0" text-anchor="middle">PCIe NVMe</text>

    <!-- DRAM Cache Chip -->
    <rect x="220" y="170" width="28" height="45" rx="3" fill="#18181B" stroke="#3F3F46" stroke-width="1"/>

    <!-- 2x 3D NAND Flash Chips -->
    <rect x="80" y="155" width="55" height="75" rx="4" fill="#27272A" stroke="#52525B" stroke-width="1"/>
    <text x="107" y="196" font-family="monospace" font-weight="700" font-size="8" fill="#94A3B8" text-anchor="middle">V-NAND</text>
    
    <rect x="145" y="155" width="55" height="75" rx="4" fill="#27272A" stroke="#52525B" stroke-width="1"/>
    <text x="172" y="196" font-family="monospace" font-weight="700" font-size="8" fill="#94A3B8" text-anchor="middle">V-NAND</text>

    <!-- Metallic Brand Sticker -->
    <rect x="75" y="235" width="245" height="18" rx="3" fill="#111827" stroke="${accent}" stroke-width="1"/>
    <text x="197" y="248" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="9" fill="#FFFFFF" text-anchor="middle">${brand} • SOLID STATE DRIVE</text>
  </g>
  
  <rect x="25" y="348" width="140" height="22" rx="6" fill="#18181B" stroke="#3F3F46" stroke-width="1"/>
  <text x="95" y="363" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${badge}</text>
</svg>`;
  }

  if (cfg.category === 'cooler') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="radiator" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3F3F46"/>
      <stop offset="100%" stop-color="#18181B"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="24" fill="url(#bg)"/>
  
  <g filter="url(#shadow)">
    <!-- Liquid Cooler Pump Block -->
    <circle cx="120" cy="240" r="48" fill="#18181B" stroke="#52525B" stroke-width="3"/>
    <circle cx="120" cy="240" r="40" fill="#09090B" stroke="${accent}" stroke-width="2"/>
    <circle cx="120" cy="240" r="24" fill="#000000"/>
    <text x="120" y="244" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" text-anchor="middle">${brand}</text>
    
    <!-- Braided Sleeved Tubes -->
    <path d="M 155 215 C 200 180, 220 150, 260 120" fill="none" stroke="#27272A" stroke-width="12" stroke-linecap="round"/>
    <path d="M 155 215 C 200 180, 220 150, 260 120" fill="none" stroke="#52525B" stroke-width="2" stroke-dasharray="3,3"/>

    <path d="M 145 255 C 220 220, 240 180, 280 130" fill="none" stroke="#18181B" stroke-width="12" stroke-linecap="round"/>
    <path d="M 145 255 C 220 220, 240 180, 280 130" fill="none" stroke="#3F3F46" stroke-width="2" stroke-dasharray="3,3"/>

    <!-- High-Density Radiator Stack with Dual Fans -->
    <rect x="230" y="60" width="130" height="260" rx="12" fill="url(#radiator)" stroke="#52525B" stroke-width="2"/>
    
    <!-- Radiator Fan 1 -->
    <circle cx="295" cy="130" r="48" fill="#09090B" stroke="#3F3F46" stroke-width="2"/>
    <circle cx="295" cy="130" r="14" fill="#18181B" stroke="${accent}" stroke-width="2"/>
    
    <!-- Radiator Fan 2 -->
    <circle cx="295" cy="250" r="48" fill="#09090B" stroke="#3F3F46" stroke-width="2"/>
    <circle cx="295" cy="250" r="14" fill="#18181B" stroke="${accent}" stroke-width="2"/>
  </g>
  
  <rect x="25" y="348" width="140" height="22" rx="6" fill="#18181B" stroke="#3F3F46" stroke-width="1"/>
  <text x="95" y="363" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${badge}</text>
</svg>`;
  }

  if (cfg.category === 'case') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#1E293B" stop-opacity="0.4"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="24" fill="url(#bg)"/>
  
  <g filter="url(#shadow)">
    <!-- Chassis Body -->
    <rect x="90" y="55" width="220" height="280" rx="16" fill="#18181B" stroke="#52525B" stroke-width="2"/>
    
    <!-- Top Mesh I/O -->
    <rect x="110" y="65" width="180" height="15" rx="4" fill="#09090B"/>
    <circle cx="270" cy="72" r="3" fill="${accent}"/>
    <circle cx="255" cy="72" r="2.5" fill="#E2E8F0"/>
    <rect x="235" y="70" width="10" height="4" rx="1" fill="#E2E8F0"/>
    
    <!-- Tempered Glass Side Window -->
    <rect x="105" y="90" width="190" height="200" rx="8" fill="url(#glass)" stroke="#38BDF8" stroke-width="1" stroke-opacity="0.4"/>
    
    <!-- Internal Components silhouette -->
    <!-- GPU Support -->
    <rect x="120" y="195" width="140" height="35" rx="4" fill="#09090B" stroke="${accent}" stroke-width="1"/>
    <!-- CPU Cooler -->
    <circle cx="165" cy="145" r="25" fill="#27272A" stroke="#52525B" stroke-width="1.5"/>
    <!-- PSU Shroud -->
    <rect x="105" y="245" width="190" height="45" rx="4" fill="#09090B" stroke="#27272A" stroke-width="1"/>
    <text x="200" y="272" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="11" fill="#71717A" text-anchor="middle">${brand}</text>
    
    <!-- Glass Reflection Diagonal -->
    <line x1="120" y1="95" x2="270" y2="280" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.15"/>
    <line x1="140" y1="95" x2="290" y2="280" stroke="#FFFFFF" stroke-width="0.5" stroke-opacity="0.1"/>

    <!-- Bottom Case Feet -->
    <rect x="110" y="335" width="35" height="10" rx="3" fill="#09090B" stroke="#3F3F46" stroke-width="1"/>
    <rect x="255" y="335" width="35" height="10" rx="3" fill="#09090B" stroke="#3F3F46" stroke-width="1"/>
  </g>
  
  <rect x="25" y="352" width="130" height="22" rx="6" fill="#18181B" stroke="#3F3F46" stroke-width="1"/>
  <text x="90" y="367" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${badge}</text>
</svg>`;
  }

  if (cfg.category === 'psu') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="24" fill="url(#bg)"/>
  
  <g filter="url(#shadow)">
    <!-- PSU Steel Enclosure -->
    <rect x="55" y="80" width="290" height="230" rx="12" fill="#18181B" stroke="#3F3F46" stroke-width="2"/>
    
    <!-- Intake Fan Grill -->
    <circle cx="160" cy="195" r="75" fill="#09090B" stroke="#52525B" stroke-width="2"/>
    <circle cx="160" cy="195" r="60" fill="none" stroke="#27272A" stroke-width="4" stroke-dasharray="6,6"/>
    <circle cx="160" cy="195" r="45" fill="none" stroke="#27272A" stroke-width="4" stroke-dasharray="6,6"/>
    <circle cx="160" cy="195" r="20" fill="#18181B" stroke="${accent}" stroke-width="2"/>
    <circle cx="160" cy="195" r="5" fill="${accent}"/>
    
    <!-- 80 Plus Gold Badge Side Plate -->
    <rect x="255" y="100" width="75" height="100" rx="8" fill="#09090B" stroke="${accent}" stroke-width="1.5"/>
    <polygon points="292,112 302,132 322,135 308,149 311,169 292,159 274,169 277,149 263,135 283,132" fill="#EAB308"/>
    <text x="292" y="185" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="9" fill="#E2E8F0" text-anchor="middle">80 PLUS</text>
    <text x="292" y="195" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="9" fill="${accent}" text-anchor="middle">GOLD</text>

    <!-- Modular Cable Sockets -->
    <g fill="#27272A" stroke="#3F3F46" stroke-width="1">
      <rect x="260" y="215" width="28" height="18" rx="2"/>
      <rect x="295" y="215" width="28" height="18" rx="2"/>
      <rect x="260" y="240" width="28" height="18" rx="2"/>
      <rect x="295" y="240" width="28" height="18" rx="2"/>
      <rect x="260" y="265" width="63" height="18" rx="2"/>
    </g>
    <text x="292" y="278" font-family="monospace" font-weight="700" font-size="8" fill="${accent}" text-anchor="middle">24-PIN ATX</text>

    <text x="160" y="110" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">${brand}</text>
  </g>
  
  <rect x="25" y="348" width="130" height="22" rx="6" fill="#18181B" stroke="#3F3F46" stroke-width="1"/>
  <text x="90" y="363" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${badge}</text>
</svg>`;
  }

  // Generic Fallback SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" rx="24" fill="#0F172A"/>
  <rect x="50" y="50" width="300" height="300" rx="16" fill="#1E293B" stroke="#334155" stroke-width="2"/>
  <text x="200" y="190" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" text-anchor="middle">${brand}</text>
  <text x="200" y="220" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="14" fill="${accent}" text-anchor="middle">${name}</text>
  <rect x="25" y="348" width="120" height="22" rx="6" fill="#18181B" stroke="#3F3F46" stroke-width="1"/>
  <text x="85" y="363" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="10" fill="${accent}" text-anchor="middle">${badge}</text>
</svg>`;
}

export function generateAllImages(parts: PartSvgConfig[]) {
  let count = 0;
  for (const part of parts) {
    const svg = generateSvg(part);
    const filePath = path.join(outputDir, `${part.id}.svg`);
    fs.writeFileSync(filePath, svg, 'utf-8');
    count++;
  }
  console.log(`Successfully generated ${count} genuine SVG assets in public/images/parts`);
}

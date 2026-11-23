import fs from 'node:fs';
import path from 'node:path';

const SUGGEST_CACHE_FILE = path.resolve(process.cwd(), 'data/mwave_suggest_cache.json');
const PRODUCT_CACHE_FILE = path.resolve(process.cwd(), 'data/mwave_product_cache.json');
const suggestCache: Record<string, any> = JSON.parse(fs.readFileSync(SUGGEST_CACHE_FILE, 'utf-8'));
const productCache: Record<string, any> = JSON.parse(fs.readFileSync(PRODUCT_CACHE_FILE, 'utf-8'));

// Collect handles from cached suggests for accessories/peripherals/new items
const targetHandles = new Set<string>([
  'amd-ryzen-7-7800x3d-8-core-16-thread-up-to-50ghz-am5-unlocked-cpu-processor',
  'amd-ryzen-5-7600-6-core-12-threads-up-to-51-ghz-am5-unlocked-cpu-processor-wraith-stealth-cooler',
  'amd-ryzen-9-7900x-12-core-24-thread-up-to-56ghz-am5-unlocked-cpu-processor',
  'intel-core-i5-14600kf-14-core-20-thread-up-to-53ghz-lga-1700-unlocked-processor',
  'msi-pro-b760ma-wifi-ddr4-intel-lga-1700-microatx-motherboard',
  'gskill-trident-z-rgb-16gb-2x-8gb-ddr4-3600mhz-desktop-gaming-memory',
  'klevv-fit-v-32gb-2x-16gb-ddr5-6000mhz-cl28-desktop-memory-white',
  'corsair-vengeance-lpx-16gb-2x-8gb-ddr4-3200mhz-desktop-memory-black',
  'asus-prime-750w-80-bronze-atx-nonmodular-power-supply-black',
  'antec-gsk850-v2-850w-80-gold-pcie-51-atx-31-fully-modular-power-supply-black',
  'corsair-rmx-series-rm1000x-1000w-80-gold-atx-31-fully-modular-atx-power-supply',
]);

// Add peripheral/accessory/storage handles from suggestCache
const extractQs = [
  'Samsung 870 EVO',
  'Seagate BarraCuda 2TB',
  'Corsair iCUE LINK',
  'MSI G244F 23.8',
  'Logitech G Pro X Superlight',
  'Keychron K2',
  'HyperX Cloud III',
  'Blue Yeti USB',
  'SteelSeries QcK',
  'Logitech Z407',
  'Xbox Wireless Controller Carbon Black',
  'RGB Fan Controller',
  'GPU Support Bracket',
  'AMD Ryzen 3',
  'Intel Core i3-14100F'
];

for (const q of extractQs) {
  const prods = suggestCache[q]?.products || [];
  for (const p of prods.slice(0, 2)) {
    if (p.handle) targetHandles.add(p.handle);
  }
}

let blocked = false;
for (const handle of targetHandles) {
  if (productCache[handle] || blocked) continue;
  const url = `https://www.mwave.com.au/products/${encodeURIComponent(handle)}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 QTR-Verifier/1.0' } });
  if (res.status === 429) {
    console.warn('429 hit on', handle, '- stopping additional requests safely.');
    blocked = true;
    break;
  }
  if (res.ok) {
    const data = await res.json();
    if (data?.product) {
      productCache[handle] = {
        id: data.product.id,
        title: data.product.title,
        handle: data.product.handle,
        vendor: data.product.vendor,
        images: (data.product.images || []).map((im: any) => ({ src: im.src, position: im.position, alt: im.alt }))
      };
      fs.writeFileSync(PRODUCT_CACHE_FILE, JSON.stringify(productCache, null, 2));
    }
  }
  await new Promise((r) => setTimeout(r, 1100));
}

// Print summary of all handles with multiple images (helps detect box vs component!)
console.log('Total product handles in cache:', Object.keys(productCache).length);
for (const [h, det] of Object.entries(productCache) as [string, any][]) {
  if ((det.images || []).length > 0) {
    const firstImg = det.images[0].src.split('/').pop()?.split('?')[0];
    const secondImg = det.images[1]?.src?.split('/').pop()?.split('?')[0] || '';
    console.log(`${det.title} (${det.images.length} imgs) -> [0] ${firstImg}${secondImg ? ' | [1] ' + secondImg : ''}`);
  }
}

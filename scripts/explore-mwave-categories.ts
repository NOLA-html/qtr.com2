import fs from 'node:fs';
import path from 'node:path';

interface CachedQuery {
  query: string;
  fetchedAt: string;
  products: any[];
}

const CACHE_FILE = path.resolve(process.cwd(), 'data/mwave_suggest_cache.json');
let cache: Record<string, CachedQuery> = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch {}
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function fetchWithBackoff(url: string, attempt = 0): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QTR-Catalog-Verifier/1.0)',
        'Accept': 'application/json'
      }
    });
    if (res.status === 429 || res.status === 503) {
      if (attempt >= 3) {
        console.warn(`[RateLimit] Blocked after ${attempt} retries for ${url}`);
        return null;
      }
      const retryAfter = res.headers.get('Retry-After');
      let waitMs = Math.pow(2, attempt + 1) * 1000;
      if (retryAfter) {
        const secs = Number(retryAfter);
        if (!isNaN(secs) && secs > 0) waitMs = Math.max(waitMs, secs * 1000);
      }
      console.warn(`[RateLimit] HTTP ${res.status}, backing off ${waitMs}ms...`);
      await new Promise((r) => setTimeout(r, waitMs));
      return fetchWithBackoff(url, attempt + 1);
    }
    return res;
  } catch (err) {
    console.warn(`[FetchError] ${url}:`, (err as Error).message);
    return null;
  }
}

async function queryMwave(q: string): Promise<any[]> {
  if (cache[q]) return cache[q].products;
  const url = `https://www.mwave.com.au/search/suggest.json?q=${encodeURIComponent(q)}&resources%5Btype%5D=product&resources%5Blimit%5D=6`;
  const res = await fetchWithBackoff(url);
  if (!res || !res.ok) return [];
  const data = await res.json();
  const prods = data?.resources?.results?.products || [];
  cache[q] = { query: q, fetchedAt: new Date().toISOString(), products: prods.map((p: any) => ({
    title: p.title,
    handle: p.handle,
    url: p.url,
    price: p.price,
    available: p.available,
    vendor: p.vendor,
    type: p.type,
    image: p.image,
    featured_image: p.featured_image
  })) };
  saveCache();
  await new Promise((r) => setTimeout(r, 1100));
  return cache[q].products;
}

const queries = [
  'AMD Ryzen 3 4100',
  'Intel Core i3-12100F',
  'Intel Core i9-14900K',
  'Sapphire Pulse Radeon RX 7600',
  'Samsung 870 EVO 1TB',
  'Seagate BarraCuda 2TB',
  'Thermal Grizzly Kryonaut',
  'Corsair iCUE LINK',
  'MSI G244F 23.8',
  'Logitech G Pro X Superlight',
  'Keychron K2',
  'HyperX Cloud III',
  'Blue Yeti USB',
  'SteelSeries QcK',
  'Logitech Z407',
  'Xbox Wireless Controller Carbon Black'
];

for (const q of queries) {
  const prods = await queryMwave(q);
  console.log(`\n=== ${q} (${prods.length}) ===`);
  for (const p of prods.slice(0, 3)) {
    console.log(` - ${p.title} | $${p.price} | avail=${p.available} | img=${p.featured_image?.url || p.image}`);
  }
}

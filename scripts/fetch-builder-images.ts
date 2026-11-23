import fs from 'node:fs';
import path from 'node:path';
import { BUILDER_PARTS, BuilderPart } from '../src/data/builderCatalog.ts';

const PROGRESS_FILE = path.resolve(process.cwd(), 'data/image_sourcing_progress.json');
const SUGGEST_CACHE_FILE = path.resolve(process.cwd(), 'data/mwave_suggest_cache.json');
const PRODUCT_CACHE_FILE = path.resolve(process.cwd(), 'data/mwave_product_cache.json');

interface ProgressRecord {
  partId: string;
  name: string;
  brand: string;
  category: string;
  status: 'verified' | 'needs_review' | 'no_match' | 'rate_limited';
  selectedImageUrl: string;
  candidateImages: string[];
  matchedMwaveTitle?: string;
  matchedMwaveHandle?: string;
  reason: string;
  checkedAt: string;
}

interface ProgressState {
  updatedAt: string;
  completedPreviouslyCount: number;
  records: Record<string, ProgressRecord>;
}

function loadJson<T>(file: string, fallback: T): T {
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {}
  }
  return fallback;
}

const progress: ProgressState = loadJson<ProgressState>(PROGRESS_FILE, {
  updatedAt: new Date().toISOString(),
  completedPreviouslyCount: BUILDER_PARTS.filter((p) => p.image && !p.image.endsWith('.svg')).length,
  records: {}
});

const suggestCache: Record<string, any> = loadJson(SUGGEST_CACHE_FILE, {});
const productCache: Record<string, any> = loadJson(PRODUCT_CACHE_FILE, {});

let feedBlocked = false;

function saveAll() {
  progress.updatedAt = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  fs.writeFileSync(SUGGEST_CACHE_FILE, JSON.stringify(suggestCache, null, 2));
  fs.writeFileSync(PRODUCT_CACHE_FILE, JSON.stringify(productCache, null, 2));
}

async function politeFetch(url: string, attempt = 0): Promise<Response | null> {
  if (feedBlocked) return null;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) QTR-Catalog-Verifier/1.0',
        'Accept': 'application/json'
      }
    });
    if (res.status === 429 || res.status === 503) {
      if (attempt >= 3) {
        console.error(`[RATE LIMIT STOP] Persistent HTTP ${res.status} on ${url}. Halting feed requests.`);
        feedBlocked = true;
        return null;
      }
      const retryAfter = res.headers.get('Retry-After');
      let waitMs = Math.pow(2, attempt + 1) * 1500;
      if (retryAfter) {
        const secs = Number(retryAfter);
        if (!isNaN(secs) && secs > 0) waitMs = Math.max(waitMs, secs * 1000);
      }
      console.warn(`[RateLimit] HTTP ${res.status} on ${url}, waiting ${waitMs}ms...`);
      await new Promise((r) => setTimeout(r, waitMs));
      return politeFetch(url, attempt + 1);
    }
    return res;
  } catch (err) {
    console.warn(`[NetError] ${url}:`, (err as Error).message);
    return null;
  }
}

async function verifyImageLoads(imgUrl: string): Promise<boolean> {
  try {
    const res = await fetch(imgUrl, { method: 'HEAD' });
    const ct = res.headers.get('content-type') || '';
    return res.ok && ct.startsWith('image/');
  } catch {
    return false;
  }
}

async function suggestProducts(q: string): Promise<any[]> {
  if (suggestCache[q]?.products) return suggestCache[q].products;
  if (feedBlocked) return [];
  const url = `https://www.mwave.com.au/search/suggest.json?q=${encodeURIComponent(q)}&resources%5Btype%5D=product&resources%5Blimit%5D=6`;
  const res = await politeFetch(url);
  if (!res || !res.ok) return [];
  const data = await res.json();
  const prods = data?.resources?.results?.products || [];
  suggestCache[q] = {
    query: q,
    fetchedAt: new Date().toISOString(),
    products: prods.map((p: any) => ({
      title: p.title,
      handle: p.handle,
      url: p.url,
      price: p.price,
      available: p.available,
      vendor: p.vendor,
      image: p.image,
      featured_image: p.featured_image
    }))
  };
  saveAll();
  await new Promise((r) => setTimeout(r, 1100));
  return suggestCache[q].products;
}

async function getProductDetails(handle: string): Promise<any | null> {
  if (productCache[handle]) return productCache[handle];
  if (feedBlocked) return null;
  const url = `https://www.mwave.com.au/products/${encodeURIComponent(handle)}.json`;
  const res = await politeFetch(url);
  if (!res || !res.ok) return null;
  const data = await res.json();
  if (data?.product) {
    productCache[handle] = {
      id: data.product.id,
      title: data.product.title,
      handle: data.product.handle,
      vendor: data.product.vendor,
      images: (data.product.images || []).map((im: any) => ({
        src: im.src,
        position: im.position,
        alt: im.alt
      }))
    };
    saveAll();
    await new Promise((r) => setTimeout(r, 1100));
    return productCache[handle];
  }
  return null;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findBestCandidate(part: BuilderPart, candidates: any[]): any | null {
  const brandLower = part.brand.toLowerCase();
  const cleanName = part.name
    .replace(/\([^)]*\)/g, '')
    .replace(/,/g, ' ')
    .trim();
  const tokens = normalize(cleanName)
    .split(' ')
    .filter((t) => t.length >= 2 && !['wi', 'fi', 'wifi', 'oc', 'gddr6', 'gddr6x', 'oem', 'atx', 'micro', 'modular', 'fully', 'with', 'included', 'fan', 'fans', 'rgb', 'argb', 'edition', 'black', 'white', 'pro', 'plus', 'v2', 'au'].includes(t));

  // Build strict model key tokens (numbers / model codes like 7800x3d, 14600kf, b850m, z890, 4060, 4070, rm1000x)
  const modelTokens = normalize(cleanName)
    .split(' ')
    .filter((t) => /[0-9]/.test(t) || ['tomahawk', 'strix', 'trident', 'vengeance', 'viper', 'reaper', 'infinity', 'windforce', 'matrexx', 'aqua', 'pirate', 'stealth', 'freezer', 'kryonaut'].includes(t));

  let best: { cand: any; score: number } | null = null;
  for (const cand of candidates) {
    const titleNorm = normalize(cand.title || '');
    const titleWords = titleNorm.split(' ');
    if (!titleNorm.includes(brandLower) && brandLower !== 'custom' && brandLower !== 'okinos' && brandLower !== 'biwin') {
      continue;
    }

    // Check critical model tokens exact word match
    let missingCritical = false;
    for (const mt of modelTokens) {
      if (!titleWords.includes(mt) && !titleNorm.includes(mt)) {
        missingCritical = true;
        break;
      }
    }
    if (missingCritical) continue;

    // Prevent false suffix/tier mismatches (e.g. 4060 vs 4060 ti, 7600 vs 7600x, 4070 super vs 4070 ti)
    if (part.name.includes('4060') && !part.name.toLowerCase().includes('ti') && titleWords.includes('ti')) continue;
    if (part.name.includes('4070 SUPER') && !titleWords.includes('super')) continue;
    if (part.name.includes('4070 SUPER') && titleWords.includes('ti')) continue;
    if (part.name.includes('4080 SUPER') && !titleWords.includes('super')) continue;
    if (part.name.includes('7600') && !part.name.includes('7600X') && titleWords.includes('7600x')) continue;
    if (part.name.includes('14600KF') && !titleWords.includes('14600kf')) continue;
    if (part.name.includes('14700K') && !titleWords.includes('14700k')) continue;
    if (part.name.includes('12400F') && !titleWords.includes('12400f')) continue;
    if (part.name.includes('5600X') && !titleWords.includes('5600x')) continue;
    if (part.name.includes('265K') && !titleWords.includes('265k')) continue;
    if (part.name.includes('285K') && !titleWords.includes('285k')) continue;
    if (part.name.includes('7800X3D') && !titleWords.includes('7800x3d')) continue;
    if (part.name.includes('7900X') && !titleWords.includes('7900x')) continue;
    if (part.name.includes('9070 XT') && (!titleWords.includes('9070') || !titleWords.includes('xt'))) continue;
    if (part.name.includes('DDR4') && !titleWords.includes('ddr4') && part.category === 'ram') continue;
    if (part.name.includes('DDR5') && !titleWords.includes('ddr5') && part.category === 'ram') continue;

    let score = 0;
    for (const t of tokens) {
      if (titleNorm.includes(t)) score += 1;
    }
    if (!best || score > best.score) {
      best = { cand, score };
    }
  }
  return best ? best.cand : null;
}

const batchArg = process.argv[2] || 'all';
const limitCount = Number(process.argv[3] || 999);

const targets = BUILDER_PARTS.filter((p) => {
  if (p.image && !p.image.endsWith('.svg')) {
    // Already has verified external image; record as previously completed if missing
    if (!progress.records[p.id]) {
      progress.records[p.id] = {
        partId: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        status: 'verified',
        selectedImageUrl: p.image,
        candidateImages: [p.image],
        reason: 'Previously verified external component image',
        checkedAt: new Date().toISOString()
      };
    }
    return false;
  }
  if (batchArg !== 'all' && !batchArg.split(',').includes(p.category)) return false;
  if (progress.records[p.id] && progress.records[p.id].status !== 'rate_limited') return false;
  return true;
}).slice(0, limitCount);

console.log(`Processing ${targets.length} un-imaged parts (batch=${batchArg})...`);

for (const part of targets) {
  if (feedBlocked) {
    progress.records[part.id] = {
      partId: part.id,
      name: part.name,
      brand: part.brand,
      category: part.category,
      status: 'rate_limited',
      selectedImageUrl: '',
      candidateImages: [],
      reason: 'Stopped due to upstream 429 rate limiting',
      checkedAt: new Date().toISOString()
    };
    saveAll();
    continue;
  }

  const cleanQuery = part.name.replace(/\([^)]*\)/g, '').replace(/,/g, ' ').trim();
  const candidates = await suggestProducts(cleanQuery);
  const match = findBestCandidate(part, candidates);

  if (!match) {
    console.log(`[NO MATCH] ${part.id}: ${part.name}`);
    progress.records[part.id] = {
      partId: part.id,
      name: part.name,
      brand: part.brand,
      category: part.category,
      status: 'no_match',
      selectedImageUrl: '',
      candidateImages: [],
      reason: `No exact manufacturer/model match on Mwave Shopify feed (${candidates.length} candidates evaluated)`,
      checkedAt: new Date().toISOString()
    };
    saveAll();
    continue;
  }

  const details = await getProductDetails(match.handle);
  const allImgs: string[] = details?.images?.map((i: any) => i.src) || (match.featured_image?.url ? [match.featured_image.url] : []);

  // Pick best non-box image when multiple exist (for CPUs/RAM/OS where _3 or _2 is often the component/chip, verify load)
  let chosen = '';
  // Heuristic: look for filenames avoiding "box", "packaging", "pack" if alternatives exist
  const preferredOrder = [...allImgs].sort((a, b) => {
    const aBox = /box|pack|package/i.test(a) ? 1 : 0;
    const bBox = /box|pack|package/i.test(b) ? 1 : 0;
    return aBox - bBox;
  });

  for (const url of preferredOrder) {
    if (await verifyImageLoads(url)) {
      chosen = url;
      break;
    }
  }

  console.log(`[MATCH] ${part.id} -> ${match.title} | imgs=${allImgs.length} | chosen=${chosen ? 'OK' : 'FAIL'}`);
  progress.records[part.id] = {
    partId: part.id,
    name: part.name,
    brand: part.brand,
    category: part.category,
    status: chosen ? 'needs_review' : 'no_match',
    selectedImageUrl: chosen,
    candidateImages: allImgs,
    matchedMwaveTitle: match.title,
    matchedMwaveHandle: match.handle,
    reason: chosen
      ? `Matched exact Mwave listing "${match.title}" (${allImgs.length} image(s)); needs component vs box inspection`
      : 'Image URL failed HTTP 200 verification',
    checkedAt: new Date().toISOString()
  };
  saveAll();
}

saveAll();
console.log('Done! Progress saved to data/image_sourcing_progress.json');

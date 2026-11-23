import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  Firestore
} from 'firebase/firestore';

// Load configuration
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_PRODUCTS_FILE = path.join(DATA_DIR, 'centrecom_products.json');
const LOCAL_HISTORY_FILE = path.join(DATA_DIR, 'centrecom_price_history.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface FirebaseProduct {
  productId: string;
  manufacturer: string;
  model: string;
  category: string;
  retailer: 'Centre Com';
  productUrl: string;
  priceAUD: number | null;
  currency: 'AUD';
  imageUrl: string | null;
  specifications: Record<string, any>;
  status: 'active' | 'stale' | 'unavailable' | 'price_check_failed' | 'needs_review';
  lastCheckedAt: string | null;
  lastSuccessfulCheckAt: string | null;
  priceSource: 'Centre Com';
  lastKnownPriceAUD: number | null;
  refreshAttempts: number;
  nextRefreshAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastErrorCode: string | null;
  manualVerificationNote?: string;
  manuallyVerifiedBy?: string;
}

export interface FirebasePriceHistory {
  id: string;
  productId: string;
  priceAUD: number;
  currency: 'AUD';
  productUrl: string;
  checkedAt: string;
  previousPriceAUD: number | null;
  changeType: 'initial' | 'increase' | 'decrease' | 'unchanged';
  verificationMethod: 'automated_check' | 'manual_admin_verification' | 'initial_seed';
  adminNotes?: string;
}

export interface PricingEngineStats {
  totalProducts: number;
  activeCount: number;
  staleCount: number;
  needsReviewCount: number;
  failedCount: number;
  unavailableCount: number;
  totalHistoryRecords: number;
  lastBatchRunAt: string | null;
  scheduledIntervalHours: number;
  isSchedulerActive: boolean;
}

class FirebaseCentrecomService {
  private db: Firestore | null = null;
  private productsCache: Map<string, FirebaseProduct> = new Map();
  private historyCache: FirebasePriceHistory[] = [];
  private scheduledTimer: NodeJS.Timeout | null = null;
  private refreshIntervalHours = 24;
  private isBatchRunning = false;
  private lastBatchRunAt: string | null = null;

  constructor() {
    this.initFirebase();
    this.loadLocalCache();
    this.startBackgroundScheduler();
  }

  private initFirebase() {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      this.db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
      console.log('FirebaseCentrecomService: Firestore initialized with database:', (firebaseConfig as any).firestoreDatabaseId);
    } catch (err) {
      console.warn('FirebaseCentrecomService: Failed to connect directly to Firestore SDK, fallback local persistence enabled:', err);
    }
  }

  private loadLocalCache() {
    try {
      if (fs.existsSync(LOCAL_PRODUCTS_FILE)) {
        const raw = fs.readFileSync(LOCAL_PRODUCTS_FILE, 'utf-8');
        const list: FirebaseProduct[] = JSON.parse(raw);
        list.forEach((p) => this.productsCache.set(p.productId, p));
      }
      if (fs.existsSync(LOCAL_HISTORY_FILE)) {
        const raw = fs.readFileSync(LOCAL_HISTORY_FILE, 'utf-8');
        this.historyCache = JSON.parse(raw);
      }
    } catch (err) {
      console.error('FirebaseCentrecomService: Error reading local cache:', err);
    }
  }

  private saveLocalCache() {
    try {
      const list = Array.from(this.productsCache.values());
      fs.writeFileSync(LOCAL_PRODUCTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
      fs.writeFileSync(LOCAL_HISTORY_FILE, JSON.stringify(this.historyCache, null, 2), 'utf-8');
    } catch (err) {
      console.error('FirebaseCentrecomService: Error persisting local cache:', err);
    }
  }

  /**
   * Validates that a product URL is strictly an authorized Centre Com URL
   */
  public isValidCentreComUrl(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      return (host === 'www.centrecom.com.au' || host === 'centrecom.com.au') && url.startsWith('https://');
    } catch {
      return false;
    }
  }

  /**
   * Get all products from cache/Firestore
   */
  public async getAllProducts(filter?: { category?: string; status?: string }): Promise<FirebaseProduct[]> {
    let list = Array.from(this.productsCache.values());
    if (filter?.category) {
      list = list.filter((p) => p.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.status) {
      list = list.filter((p) => p.status === filter.status);
    }
    return list;
  }

  /**
   * Get single product by ID
   */
  public async getProduct(productId: string): Promise<FirebaseProduct | null> {
    return this.productsCache.get(productId) || null;
  }

  /**
   * Save or update product in cache and Firestore
   */
  public async saveProduct(product: FirebaseProduct): Promise<FirebaseProduct> {
    if (!this.isValidCentreComUrl(product.productUrl)) {
      throw new Error(`Invalid product URL. Centre Com (https://www.centrecom.com.au/...) is the ONLY permitted pricing source. Received: ${product.productUrl}`);
    }

    product.updatedAt = new Date().toISOString();
    this.productsCache.set(product.productId, product);
    this.saveLocalCache();

    // Async write to Firestore if connection available
    if (this.db) {
      try {
        const docRef = doc(this.db, 'products', product.productId);
        await setDoc(docRef, product, { merge: true });
      } catch (err) {
        console.warn(`Firestore sync warning for ${product.productId}:`, (err as any)?.message || err);
      }
    }

    return product;
  }

  /**
   * Record a verified price history entry
   */
  public async recordPriceHistory(entry: FirebasePriceHistory): Promise<void> {
    this.historyCache.unshift(entry);
    if (this.historyCache.length > 500) {
      this.historyCache = this.historyCache.slice(0, 500);
    }
    this.saveLocalCache();

    if (this.db) {
      try {
        const docRef = doc(this.db, 'priceHistory', entry.id);
        await setDoc(docRef, entry);
      } catch (err) {
        console.warn(`Firestore priceHistory write warning for ${entry.id}:`, (err as any)?.message || err);
      }
    }
  }

  /**
   * Fetch price history for a given product
   */
  public async getPriceHistory(productId: string): Promise<FirebasePriceHistory[]> {
    return this.historyCache.filter((h) => h.productId === productId);
  }

  /**
   * Manually verify a product price with admin credentials, reference, and audit note
   */
  public async manualVerifyProduct(
    productId: string,
    newPriceAUD: number,
    adminNotes: string,
    adminUser: string = 'admin'
  ): Promise<FirebaseProduct> {
    const product = this.productsCache.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    if (newPriceAUD <= 0 || isNaN(newPriceAUD)) {
      throw new Error('Verified price must be a valid positive AUD amount');
    }

    const previousPrice = product.priceAUD;
    const now = new Date().toISOString();
    let changeType: FirebasePriceHistory['changeType'] = 'unchanged';
    if (previousPrice === null) changeType = 'initial';
    else if (newPriceAUD > previousPrice) changeType = 'increase';
    else if (newPriceAUD < previousPrice) changeType = 'decrease';

    product.priceAUD = newPriceAUD;
    product.lastKnownPriceAUD = newPriceAUD;
    product.lastCheckedAt = now;
    product.lastSuccessfulCheckAt = now;
    product.status = 'active';
    product.refreshAttempts = 0;
    product.lastErrorCode = null;
    product.manualVerificationNote = adminNotes;
    product.manuallyVerifiedBy = adminUser;
    product.nextRefreshAt = new Date(Date.now() + this.refreshIntervalHours * 3600 * 1000).toISOString();

    await this.saveProduct(product);

    // Record history
    const historyEntry: FirebasePriceHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId,
      priceAUD: newPriceAUD,
      currency: 'AUD',
      productUrl: product.productUrl,
      checkedAt: now,
      previousPriceAUD: previousPrice,
      changeType,
      verificationMethod: 'manual_admin_verification',
      adminNotes: `${adminNotes} (Verified by ${adminUser})`
    };

    await this.recordPriceHistory(historyEntry);
    console.log(`[Manual Verify] Product ${productId} updated to $${newPriceAUD} AUD by ${adminUser}`);
    return product;
  }

  /**
   * Perform asynchronous single-product refresh from Centre Com
   */
  public async refreshProductPrice(productId: string): Promise<{
    success: boolean;
    product: FirebaseProduct;
    message: string;
    priceChanged: boolean;
  }> {
    const product = this.productsCache.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    if (!this.isValidCentreComUrl(product.productUrl)) {
      product.status = 'needs_review';
      product.lastErrorCode = 'INVALID_CENTRECOM_URL';
      await this.saveProduct(product);
      return {
        success: false,
        product,
        message: 'Product URL does not point to authorized centrecom.com.au domain',
        priceChanged: false
      };
    }

    const now = new Date().toISOString();
    product.lastCheckedAt = now;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(product.productUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-AU,en;q=0.9'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from Centre Com (${response.statusText})`);
      }

      const html = await response.text();

      // Extract price using multiple reliable Centre Com HTML patterns
      // 1. JSON-LD structured data (standard in modern e-commerce)
      let extractedPrice: number | null = null;
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
      if (jsonLdMatch && jsonLdMatch[1]) {
        try {
          const parsed = JSON.parse(jsonLdMatch[1]);
          if (parsed.offers?.price) {
            extractedPrice = parseFloat(parsed.offers.price);
          } else if (Array.isArray(parsed) && parsed[0]?.offers?.price) {
            extractedPrice = parseFloat(parsed[0].offers.price);
          }
        } catch {}
      }

      // 2. Fallback to HTML price markup patterns
      if (!extractedPrice || isNaN(extractedPrice)) {
        const priceRegexes = [
          /itemprop="price"[^>]*content="([0-9.]+)"/i,
          /data-price="([0-9.]+)"/i,
          /class="[^"]*product-price[^"]*"[^>]*>\s*\$?([0-9,]+(\.[0-9]{2})?)/i,
          /<span[^>]*class="[^"]*price[^"]*"[^>]*>\s*\$?([0-9,]+(\.[0-9]{2})?)/i
        ];
        for (const regex of priceRegexes) {
          const match = html.match(regex);
          if (match && match[1]) {
            const raw = match[1].replace(/,/g, '');
            const parsed = parseFloat(raw);
            if (!isNaN(parsed) && parsed > 5) {
              extractedPrice = parsed;
              break;
            }
          }
        }
      }

      if (extractedPrice && extractedPrice > 0) {
        const previousPrice = product.priceAUD;
        const priceChanged = previousPrice !== null && previousPrice !== extractedPrice;

        let changeType: FirebasePriceHistory['changeType'] = 'unchanged';
        if (previousPrice === null) changeType = 'initial';
        else if (extractedPrice > previousPrice) changeType = 'increase';
        else if (extractedPrice < previousPrice) changeType = 'decrease';

        product.priceAUD = extractedPrice;
        product.lastKnownPriceAUD = extractedPrice;
        product.lastSuccessfulCheckAt = now;
        product.status = 'active';
        product.refreshAttempts = 0;
        product.lastErrorCode = null;
        product.nextRefreshAt = new Date(Date.now() + this.refreshIntervalHours * 3600 * 1000).toISOString();

        await this.saveProduct(product);

        const historyEntry: FirebasePriceHistory = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId,
          priceAUD: extractedPrice,
          currency: 'AUD',
          productUrl: product.productUrl,
          checkedAt: now,
          previousPriceAUD: previousPrice,
          changeType,
          verificationMethod: 'automated_check'
        };
        await this.recordPriceHistory(historyEntry);

        return {
          success: true,
          product,
          message: `Successfully verified Centre Com price: $${extractedPrice} AUD (${changeType})`,
          priceChanged
        };
      } else {
        // Price couldn't be parsed from response (e.g. anti-bot challenge or dynamic JS rendering)
        throw new Error('Price element could not be unambiguously extracted from page HTML');
      }
    } catch (err: any) {
      product.refreshAttempts = (product.refreshAttempts || 0) + 1;
      product.lastErrorCode = err.message || 'PRICE_CHECK_FAILED';

      // Preserve last known valid price, mark status appropriately
      if (product.refreshAttempts >= 3) {
        product.status = 'needs_review';
      } else {
        product.status = 'price_check_failed';
      }

      // Exponential backoff
      const backoffHours = Math.min(24, Math.pow(2, product.refreshAttempts));
      product.nextRefreshAt = new Date(Date.now() + backoffHours * 3600 * 1000).toISOString();

      await this.saveProduct(product);

      console.warn(`[Price Refresh Warning] ${product.productId} (attempt ${product.refreshAttempts}): ${err.message}`);
      return {
        success: false,
        product,
        message: `Automatic price check could not complete (${err.message}). Last known price ($${product.lastKnownPriceAUD || product.priceAUD} AUD) preserved. Administrator manual verification available.`,
        priceChanged: false
      };
    }
  }

  /**
   * Run batch price refresh for due products (asynchronous worker)
   */
  public async runScheduledBatchRefresh(maxBatchSize = 5): Promise<{
    processed: number;
    successCount: number;
    failureCount: number;
    changedCount: number;
    items: Array<{ id: string; status: string; message: string }>;
  }> {
    if (this.isBatchRunning) {
      throw new Error('Batch price refresh is already currently running.');
    }

    this.isBatchRunning = true;
    this.lastBatchRunAt = new Date().toISOString();

    const now = Date.now();
    const all = Array.from(this.productsCache.values());

    // Find products due for refresh
    const dueProducts = all
      .filter((p) => {
        if (!p.nextRefreshAt) return true;
        const dueTime = new Date(p.nextRefreshAt).getTime();
        return dueTime <= now || p.status === 'stale' || p.status === 'price_check_failed';
      })
      .slice(0, maxBatchSize);

    const results: Array<{ id: string; status: string; message: string }> = [];
    let successCount = 0;
    let failureCount = 0;
    let changedCount = 0;

    for (const prod of dueProducts) {
      try {
        const res = await this.refreshProductPrice(prod.productId);
        if (res.success) {
          successCount++;
          if (res.priceChanged) changedCount++;
        } else {
          failureCount++;
        }
        results.push({ id: prod.productId, status: res.product.status, message: res.message });
      } catch (err: any) {
        failureCount++;
        results.push({ id: prod.productId, status: 'error', message: err.message });
      }

      // Respect rate limit: 1.2s delay between product requests
      await new Promise((r) => setTimeout(r, 1200));
    }

    this.isBatchRunning = false;
    return {
      processed: dueProducts.length,
      successCount,
      failureCount,
      changedCount,
      items: results
    };
  }

  /**
   * Start recurring background scheduler
   */
  private startBackgroundScheduler() {
    this.scheduledTimer = setInterval(async () => {
      try {
        console.log('FirebaseCentrecomService: Running periodic scheduled price check tick...');
        await this.runScheduledBatchRefresh(3);
      } catch (err) {
        console.warn('FirebaseCentrecomService: Scheduled batch error:', err);
      }
    }, 15 * 60 * 1000);
    this.scheduledTimer.unref();
  }

  public stopScheduler() {
    if (this.scheduledTimer) {
      clearInterval(this.scheduledTimer);
      this.scheduledTimer = null;
    }
  }

  /**
   * Get pricing engine health & monitoring stats
   */
  public getStats(): PricingEngineStats {
    const all = Array.from(this.productsCache.values());
    let active = 0;
    let stale = 0;
    let needsReview = 0;
    let failed = 0;
    let unavailable = 0;

    const now = Date.now();
    for (const p of all) {
      if (p.status === 'active') {
        // If last successful check > 48h ago, treat as stale
        if (p.lastSuccessfulCheckAt && now - new Date(p.lastSuccessfulCheckAt).getTime() > 48 * 3600 * 1000) {
          stale++;
        } else {
          active++;
        }
      } else if (p.status === 'stale') stale++;
      else if (p.status === 'needs_review') needsReview++;
      else if (p.status === 'price_check_failed') failed++;
      else if (p.status === 'unavailable') unavailable++;
    }

    return {
      totalProducts: all.length,
      activeCount: active,
      staleCount: stale,
      needsReviewCount: needsReview,
      failedCount: failed,
      unavailableCount: unavailable,
      totalHistoryRecords: this.historyCache.length,
      lastBatchRunAt: this.lastBatchRunAt,
      scheduledIntervalHours: this.refreshIntervalHours,
      isSchedulerActive: Boolean(this.scheduledTimer)
    };
  }

  /**
   * Pre-checkout cart price recheck
   * Validates array of { partId, expectedPrice } against current Centre Com prices
   */
  public recheckCart(items: Array<{ partId: string; expectedPrice: number }>): {
    hasChanges: boolean;
    requiresConfirmation: boolean;
    verifiedItems: Array<{
      partId: string;
      model: string;
      expectedPrice: number;
      currentPrice: number;
      delta: number;
      changed: boolean;
      status: string;
      centreComUrl: string;
    }>;
    originalTotal: number;
    revisedTotal: number;
    difference: number;
  } {
    let hasChanges = false;
    let originalTotal = 0;
    let revisedTotal = 0;

    const verified = items.map((item) => {
      const prod = this.productsCache.get(item.partId);
      const expected = item.expectedPrice || 0;
      const current = prod && prod.priceAUD !== null ? prod.priceAUD : expected;
      const changed = Math.abs(current - expected) > 0.01;
      const delta = current - expected;

      originalTotal += expected;
      revisedTotal += current;
      if (changed) hasChanges = true;

      return {
        partId: item.partId,
        model: prod ? prod.model : item.partId,
        expectedPrice: expected,
        currentPrice: current,
        delta,
        changed,
        status: prod?.status || 'active',
        centreComUrl: prod?.productUrl || 'https://www.centrecom.com.au/'
      };
    });

    return {
      hasChanges,
      requiresConfirmation: hasChanges,
      verifiedItems: verified,
      originalTotal,
      revisedTotal,
      difference: revisedTotal - originalTotal
    };
  }

  /**
   * Seed catalog from builder parts list if database is empty
   */
  public async seedCatalogFromParts(parts: any[]): Promise<number> {
    let seeded = 0;
    const now = new Date().toISOString();

    for (const part of parts) {
      if (!this.productsCache.has(part.id)) {
        const productUrl =
          part.centreComUrl ||
          `https://www.centrecom.com.au/${part.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

        const newProd: FirebaseProduct = {
          productId: part.id,
          manufacturer: part.brand,
          model: part.name,
          category: part.category,
          retailer: 'Centre Com',
          productUrl,
          priceAUD: part.price,
          currency: 'AUD',
          imageUrl: part.image,
          specifications: part.specs || {},
          status: 'active',
          lastCheckedAt: now,
          lastSuccessfulCheckAt: now,
          priceSource: 'Centre Com',
          lastKnownPriceAUD: part.price,
          refreshAttempts: 0,
          nextRefreshAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          createdAt: now,
          updatedAt: now,
          lastErrorCode: null
        };

        this.productsCache.set(part.id, newProd);

        // Seed initial history entry
        this.historyCache.push({
          id: `hist-seed-${part.id}`,
          productId: part.id,
          priceAUD: part.price,
          currency: 'AUD',
          productUrl,
          checkedAt: now,
          previousPriceAUD: null,
          changeType: 'initial',
          verificationMethod: 'initial_seed'
        });

        seeded++;
      }
    }

    if (seeded > 0) {
      this.saveLocalCache();
      console.log(`FirebaseCentrecomService: Seeded ${seeded} products into Centre Com database`);
    }

    return seeded;
  }
}

export const firebaseCentrecomService = new FirebaseCentrecomService();

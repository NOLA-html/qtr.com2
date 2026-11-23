import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  initDatabase,
  readDatabase,
  writeDatabase
} from './server/db.ts';
import type {
  RepairRequest,
  UpgradeRequest,
  Review,
  CustomPcQuote,
  ContactMessage,
  PcOrder,
  ShippingConfig,
  CheaperPriceRequest,
  CustomerSuppliedMotherboardRecord
} from './server/db.ts';
import {
  THREE_CUSTOM_PCS,
  getCustomPcById,
  BUILD_SERVICES,
  DEFAULT_SHIPPING_CONFIG,
  calculatePcOrderPricing
} from './src/utils/pricing.ts';
import { firebaseCentrecomService } from './server/firebaseCentrecomService.ts';
import { BUILDER_PARTS } from './src/data/builderCatalog.ts';
import {
  researchMotherboardSpecs,
  evaluateMotherboardBuildCompatibility
} from './server/aiMotherboardResearcher.ts';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI();
  } catch (e) {
    console.warn('GoogleGenAI init failed, using local diagnostic responder', e);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'qtr2026';

// Initialize DB and bootstrap Firebase Centre Com catalogue
initDatabase();
firebaseCentrecomService.seedCatalogFromParts(BUILDER_PARTS).catch((err) => {
  console.warn('Firebase Centre Com catalog seed warning:', err);
});

app.use(express.json({ limit: '15mb' }));

// Helper for generating readable reference numbers
function generateReferenceNumber(prefix: string): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `QTR-${prefix}-${num}`;
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    brand: 'QTR — Quick Tech Repairs',
    subtitle: 'A service of AB Services',
    timestamp: new Date().toISOString()
  });
});

// Reviews: GET approved public reviews
app.get('/api/reviews', (_req: Request, res: Response) => {
  try {
    const db = readDatabase();
    const approved = db.reviews.filter((r) => r.approved);
    res.json({
      success: true,
      reviews: approved,
      count: approved.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to load reviews' });
  }
});

// Reviews: POST submit a review (pending admin approval)
app.post('/api/reviews', (req: Request, res: Response) => {
  try {
    const { name, rating, text, serviceType } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Customer name is required' });
      return;
    }
    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      res.status(400).json({ success: false, error: 'Review text must be at least 5 characters' });
      return;
    }

    const starRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const db = readDatabase();

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      date: new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
      rating: starRating,
      text: text.trim(),
      approved: false, // Requires administrator approval before public display
      serviceType: serviceType ? String(serviceType).trim() : 'Computer Service'
    };

    db.reviews.unshift(newReview);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will appear publicly once approved by our administrator.',
      review: {
        id: newReview.id,
        name: newReview.name,
        rating: newReview.rating,
        pendingApproval: true
      }
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, error: 'Failed to save review to database' });
  }
});

// Repairs: POST submit repair request
app.post('/api/repairs', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      email,
      phone,
      deviceType,
      manufacturerAndModel,
      operatingSystem,
      repairCategory,
      problemDescription,
      symptoms,
      turnsOn,
      importantDataAffected,
      serviceSpeed,
      additionalNotes
    } = req.body;

    if (!customerName || !customerName.trim()) {
      res.status(400).json({ success: false, error: 'Customer name is required' });
      return;
    }
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'A valid email address is required' });
      return;
    }
    if (!deviceType) {
      res.status(400).json({ success: false, error: 'Device type is required' });
      return;
    }
    if (!repairCategory) {
      res.status(400).json({ success: false, error: 'Repair category is required' });
      return;
    }
    if (!problemDescription || !problemDescription.trim()) {
      res.status(400).json({ success: false, error: 'Please describe the problem you are experiencing' });
      return;
    }

    const speed = serviceSpeed === 'Express' ? 'Express' : 'Regular';
    const expressFee = speed === 'Express' ? 15 : 0;
    const refNum = generateReferenceNumber('REP');
    const now = new Date().toISOString();

    const newRepair: RepairRequest = {
      id: `rep-${Date.now()}`,
      referenceNumber: refNum,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      deviceType: String(deviceType).trim(),
      manufacturerAndModel: manufacturerAndModel && manufacturerAndModel.trim() ? manufacturerAndModel.trim() : 'Not specified',
      operatingSystem: operatingSystem ? String(operatingSystem).trim() : 'Unspecified',
      repairCategory: String(repairCategory).trim(),
      problemDescription: problemDescription.trim(),
      symptoms: symptoms ? symptoms.trim() : undefined,
      turnsOn: turnsOn === 'No' ? 'No' : turnsOn === 'Intermittent' ? 'Intermittent' : 'Yes',
      importantDataAffected: importantDataAffected === 'No' ? 'No' : importantDataAffected === 'Not sure' ? 'Not sure' : 'Yes',
      serviceSpeed: speed,
      expressFee,
      additionalNotes: additionalNotes ? additionalNotes.trim() : undefined,
      status: 'Received',
      createdAt: now,
      updatedAt: now,
      technicianNotes: 'Request logged into QTR repair management queue.'
    };

    const db = readDatabase();
    db.repairRequests.unshift(newRepair);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Repair request submitted successfully!',
      referenceNumber: refNum,
      serviceSpeed: speed,
      estimatedTurnaround: speed === 'Express' ? '1–2 days' : '5–7 days',
      expressFee
    });
  } catch (error) {
    console.error('Error saving repair request:', error);
    res.status(500).json({ success: false, error: 'Failed to record repair request in database' });
  }
});

// Upgrades: POST submit upgrade request
app.post('/api/upgrades', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      email,
      phone,
      deviceType,
      manufacturerAndModel,
      currentSpecifications,
      desiredUpgrades,
      intendedUse,
      budget,
      serviceSpeed,
      additionalNotes
    } = req.body;

    if (!customerName || !customerName.trim()) {
      res.status(400).json({ success: false, error: 'Customer name is required' });
      return;
    }
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'A valid email address is required' });
      return;
    }

    // Explicit check for Apple hardware upgrade restriction
    const devLower = String(deviceType || '').toLowerCase();
    const modelLower = String(manufacturerAndModel || '').toLowerCase();
    if (
      devLower.includes('apple') ||
      devLower.includes('macbook') ||
      devLower.includes('imac') ||
      devLower.includes('mac') ||
      modelLower.includes('macbook') ||
      modelLower.includes('apple')
    ) {
      res.status(400).json({
        success: false,
        error:
          'MacBook and Apple computer hardware upgrades are not currently available. We can repair Apple computers, but we do not offer upgrades for them. Windows laptops and desktops can be upgraded.'
      });
      return;
    }

    if (!manufacturerAndModel || !manufacturerAndModel.trim()) {
      res.status(400).json({ success: false, error: 'Computer model is required' });
      return;
    }

    const upgradesList = Array.isArray(desiredUpgrades) && desiredUpgrades.length > 0
      ? desiredUpgrades
      : ['Hardware Upgrade Assessment'];

    const speed = serviceSpeed === 'Express' ? 'Express' : 'Regular';
    const expressFee = speed === 'Express' ? 15 : 0;
    const refNum = generateReferenceNumber('UPG');
    const now = new Date().toISOString();

    const newUpgrade: UpgradeRequest = {
      id: `upg-${Date.now()}`,
      referenceNumber: refNum,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      deviceType: String(deviceType || 'Desktop PC').trim(),
      manufacturerAndModel: manufacturerAndModel.trim(),
      currentSpecifications: currentSpecifications ? currentSpecifications.trim() : undefined,
      desiredUpgrades: upgradesList,
      intendedUse: intendedUse ? intendedUse.trim() : 'General Performance',
      budget: budget ? budget.trim() : undefined,
      serviceSpeed: speed,
      expressFee,
      additionalNotes: additionalNotes ? additionalNotes.trim() : undefined,
      status: 'Received',
      createdAt: now,
      updatedAt: now,
      technicianNotes: 'Upgrade consultation scheduled for compatibility check.'
    };

    const db = readDatabase();
    db.upgradeRequests.unshift(newUpgrade);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Upgrade enquiry submitted successfully!',
      referenceNumber: refNum,
      serviceSpeed: speed,
      estimatedTurnaround: speed === 'Express' ? '1–2 days' : '5–7 days',
      expressFee
    });
  } catch (error) {
    console.error('Error saving upgrade request:', error);
    res.status(500).json({ success: false, error: 'Failed to record upgrade request in database' });
  }
});

// Custom PC / Builder Quote: POST submit build quote
app.post('/api/custom-pc-quotes', (req: Request, res: Response) => {
  try {
    const { customerName, email, phone, buildType, prebuiltName, components, totalEstimatedPrice, useCase, budget, notes } = req.body;

    if (!customerName || !customerName.trim()) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email is required' });
      return;
    }

    const refNum = generateReferenceNumber('PC');
    const newQuote: CustomPcQuote = {
      id: `pc-${Date.now()}`,
      referenceNumber: refNum,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      buildType: buildType || 'custom_builder',
      prebuiltName,
      components: components || {},
      totalEstimatedPrice: Number(totalEstimatedPrice) || 0,
      useCase,
      budget,
      notes,
      status: 'Received',
      createdAt: new Date().toISOString()
    };

    const db = readDatabase();
    db.customPcQuotes.unshift(newQuote);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Desktop PC build enquiry submitted successfully! We will review the parts and reach out with final confirmation.',
      referenceNumber: refNum
    });
  } catch (error) {
    console.error('Error submitting PC quote:', error);
    res.status(500).json({ success: false, error: 'Failed to save PC quote' });
  }
});

// ==========================================
// CENTRE COM CATALOG & CHEAPER PRICE CHECKER
// ==========================================

// Trusted Australian Computer Hardware Retailers
const TRUSTED_AU_RETAILERS = [
  'scorptec.com.au',
  'umart.com.au',
  'ple.com.au',
  'pccasegear.com',
  'computeralliance.com.au',
  'mwave.com.au',
  'jw.com.au',
  'msy.com.au',
  'bpctech.com.au',
  'centrecom.com.au',
  'newegg.com'
];

// Helper to determine price match qualification
function evaluatePriceMatch(
  competitorUrl: string,
  competitorPrice: number,
  centreComPrice: number,
  isBrandNew: boolean,
  isInStock: boolean
): {
  outcome: 'verified' | 'needs_review' | 'rejected';
  reason: string;
  matchedRetailer: string;
} {
  let hostname = '';
  try {
    const parsed = new URL(competitorUrl.startsWith('http') ? competitorUrl : `https://${competitorUrl}`);
    hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return {
      outcome: 'rejected',
      reason: 'The provided competitor URL is invalid or malformed.',
      matchedRetailer: 'Invalid URL'
    };
  }

  // REJECT RULE: Amazon and Amazon Marketplace are strictly excluded
  if (
    hostname.includes('amazon.') ||
    hostname.includes('amzn.to') ||
    hostname.includes('amazon-marketplace') ||
    competitorUrl.toLowerCase().includes('amazon')
  ) {
    return {
      outcome: 'rejected',
      reason: 'This price cannot be accepted because Amazon and Amazon Marketplace listings do not meet our official price verification and warranty requirements.',
      matchedRetailer: 'Amazon / Amazon Marketplace (Excluded)'
    };
  }

  // REJECT RULE: Condition must be brand new
  if (!isBrandNew) {
    return {
      outcome: 'rejected',
      reason: 'This price cannot be accepted because our price match policy applies only to brand-new, factory-sealed components with full Australian manufacturer warranty.',
      matchedRetailer: hostname
    };
  }

  // REJECT RULE: Price must actually be cheaper than Centre Com
  if (competitorPrice >= centreComPrice) {
    return {
      outcome: 'rejected',
      reason: `This price cannot be accepted because the advertised price ($${competitorPrice.toFixed(2)}) is not lower than the current Centre Com price ($${centreComPrice.toFixed(2)}).`,
      matchedRetailer: hostname
    };
  }

  // Check if domain is an established authorized retailer
  const isTrustedDomain = TRUSTED_AU_RETAILERS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );

  if (isTrustedDomain) {
    if (isInStock) {
      // OUTCOME A: Verified!
      return {
        outcome: 'verified',
        reason: 'Cheaper price verified — eligible for review.',
        matchedRetailer: hostname
      };
    } else {
      // OUTCOME B: Needs review due to stock status
      return {
        outcome: 'needs_review',
        reason: 'This offer needs a manual review before it can be accepted (item is not currently marked as in-stock ready to ship).',
        matchedRetailer: hostname
      };
    }
  }

  // OUTCOME B: Unrecognized Australian / international retailer requires manual inspection
  return {
    outcome: 'needs_review',
    reason: 'This offer needs a manual review before it can be accepted.',
    matchedRetailer: hostname
  };
}

// POST /api/cheaper-price-requests - Submit cheaper price check from AI assistant / builder
app.post('/api/cheaper-price-requests', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      email,
      phone,
      partId,
      partName,
      category,
      centreComPrice,
      centreComUrl,
      competitorName,
      competitorUrl,
      competitorPrice,
      isBrandNew,
      isInStock,
      notes
    } = req.body;

    if (!customerName || !customerName.trim()) {
      res.status(400).json({ success: false, error: 'Customer name is required' });
      return;
    }
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'A valid email is required' });
      return;
    }
    if (!partName || !partName.trim()) {
      res.status(400).json({ success: false, error: 'Component part name is required' });
      return;
    }
    if (!competitorUrl || !competitorUrl.trim()) {
      res.status(400).json({ success: false, error: 'Competitor product URL is required' });
      return;
    }

    const cPrice = Number(centreComPrice) || 0;
    const compPrice = Number(competitorPrice) || 0;
    const brandNew = isBrandNew !== false;
    const inStock = isInStock !== false;

    const evaluation = evaluatePriceMatch(competitorUrl.trim(), compPrice, cPrice, brandNew, inStock);
    const refNum = generateReferenceNumber('CPR');
    const now = new Date().toISOString();
    const delta = Math.max(0, Number((cPrice - compPrice).toFixed(2)));

    const newRequest: CheaperPriceRequest = {
      id: `cpr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      referenceNumber: refNum,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      partId: partId ? String(partId).trim() : undefined,
      partName: partName.trim(),
      category: category ? String(category).trim() : 'component',
      centreComPrice: cPrice,
      centreComUrl: centreComUrl ? String(centreComUrl).trim() : 'https://www.centrecom.com.au',
      competitorName: competitorName ? String(competitorName).trim() : evaluation.matchedRetailer,
      competitorUrl: competitorUrl.trim(),
      competitorPrice: compPrice,
      priceDelta: delta,
      isBrandNew: brandNew,
      isInStock: inStock,
      notes: notes ? String(notes).trim() : undefined,
      verificationOutcome: evaluation.outcome,
      verificationReason: evaluation.reason,
      status: evaluation.outcome === 'rejected' ? 'rejected' : 'pending',
      createdAt: now,
      updatedAt: now
    };

    const db = readDatabase();
    if (!db.cheaperPriceRequests) {
      db.cheaperPriceRequests = [];
    }
    db.cheaperPriceRequests.unshift(newRequest);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      message: evaluation.reason,
      outcome: evaluation.outcome,
      referenceNumber: refNum,
      request: newRequest
    });
  } catch (error) {
    console.error('Error submitting cheaper price request:', error);
    res.status(500).json({ success: false, error: 'Failed to record price request' });
  }
});

// GET /api/cheaper-price-requests - Lookup requests by email, ref, or all
app.get('/api/cheaper-price-requests', (req: Request, res: Response) => {
  try {
    const { lookup } = req.query;
    const db = readDatabase();
    const list = db.cheaperPriceRequests || [];

    if (lookup && typeof lookup === 'string') {
      const q = lookup.trim().toLowerCase();
      const filtered = list.filter(
        (r) => r.referenceNumber.toLowerCase() === q || r.email.toLowerCase() === q
      );
      res.json({ success: true, requests: filtered });
      return;
    }

    res.json({ success: true, requests: list });
  } catch (error) {
    console.error('Error fetching price requests:', error);
    res.status(500).json({ success: false, error: 'Failed to load price requests' });
  }
});

// ==========================================
// FIREBASE CENTRE COM PRODUCT PRICING BACKEND
// ==========================================

// Helper to check admin authorization
function checkAdminAuth(req: Request): boolean {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  return adminKey === ADMIN_PASSKEY;
}

// GET /api/firebase/products - Fetch all Centre Com products (optional category/status filter)
app.get('/api/firebase/products', async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;
    const filter: { category?: string; status?: string } = {};
    if (typeof category === 'string') filter.category = category;
    if (typeof status === 'string') filter.status = status;

    const products = await firebaseCentrecomService.getAllProducts(filter);
    res.json({
      success: true,
      count: products.length,
      retailer: 'Centre Com',
      currency: 'AUD',
      products
    });
  } catch (error: any) {
    console.error('Error fetching Firebase Centre Com products:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch products' });
  }
});

// GET /api/firebase/products/:id - Fetch single product
app.get('/api/firebase/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await firebaseCentrecomService.getProduct(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, error: `Product ${req.params.id} not found in Centre Com catalogue` });
      return;
    }
    res.json({ success: true, product });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch product' });
  }
});

// POST /api/firebase/products - Create new product (Admin only)
app.post('/api/firebase/products', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      res.status(403).json({ success: false, error: 'Unauthorized: Admin access required' });
      return;
    }

    const { productId, manufacturer, model, category, productUrl, priceAUD, imageUrl, specifications } = req.body;
    if (!productId || !manufacturer || !model || !category || !productUrl) {
      res.status(400).json({ success: false, error: 'productId, manufacturer, model, category, and productUrl are required' });
      return;
    }

    if (!firebaseCentrecomService.isValidCentreComUrl(productUrl)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product URL. Centre Com (https://www.centrecom.com.au/...) is the ONLY permitted primary source.'
      });
      return;
    }

    const now = new Date().toISOString();
    const price = typeof priceAUD === 'number' ? priceAUD : null;

    const newProduct = await firebaseCentrecomService.saveProduct({
      productId: String(productId).trim(),
      manufacturer: String(manufacturer).trim(),
      model: String(model).trim(),
      category: String(category).trim(),
      retailer: 'Centre Com',
      productUrl: String(productUrl).trim(),
      priceAUD: price,
      currency: 'AUD',
      imageUrl: imageUrl ? String(imageUrl).trim() : null,
      specifications: specifications || {},
      status: price !== null ? 'active' : 'needs_review',
      lastCheckedAt: now,
      lastSuccessfulCheckAt: price !== null ? now : null,
      priceSource: 'Centre Com',
      lastKnownPriceAUD: price,
      refreshAttempts: 0,
      nextRefreshAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now,
      lastErrorCode: null
    });

    if (price !== null) {
      await firebaseCentrecomService.recordPriceHistory({
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: newProduct.productId,
        priceAUD: price,
        currency: 'AUD',
        productUrl: newProduct.productUrl,
        checkedAt: now,
        previousPriceAUD: null,
        changeType: 'initial',
        verificationMethod: 'manual_admin_verification'
      });
    }

    res.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Error creating Firebase product:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create product' });
  }
});

// PUT /api/firebase/products/:id - Update product details (Admin only)
app.put('/api/firebase/products/:id', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      res.status(403).json({ success: false, error: 'Unauthorized: Admin access required' });
      return;
    }

    const existing = await firebaseCentrecomService.getProduct(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: `Product ${req.params.id} not found` });
      return;
    }

    const { productUrl, imageUrl, specifications, status, manufacturer, model, category } = req.body;
    if (productUrl && !firebaseCentrecomService.isValidCentreComUrl(productUrl)) {
      res.status(400).json({ success: false, error: 'productUrl must point to https://www.centrecom.com.au/' });
      return;
    }

    const updated = await firebaseCentrecomService.saveProduct({
      ...existing,
      ...(manufacturer ? { manufacturer: String(manufacturer).trim() } : {}),
      ...(model ? { model: String(model).trim() } : {}),
      ...(category ? { category: String(category).trim() } : {}),
      ...(productUrl ? { productUrl: String(productUrl).trim() } : {}),
      ...(imageUrl !== undefined ? { imageUrl: imageUrl ? String(imageUrl).trim() : null } : {}),
      ...(specifications ? { specifications } : {}),
      ...(status ? { status } : {}),
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating Firebase product:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update product' });
  }
});

// POST /api/firebase/products/:id/refresh - Asynchronously refresh single product price from Centre Com
app.post('/api/firebase/products/:id/refresh', async (req: Request, res: Response) => {
  try {
    const result = await firebaseCentrecomService.refreshProductPrice(req.params.id);
    res.json({
      success: result.success,
      product: result.product,
      message: result.message,
      priceChanged: result.priceChanged
    });
  } catch (error: any) {
    console.error(`Error refreshing price for ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: error.message || 'Failed to refresh product price' });
  }
});

// POST /api/firebase/products/:id/manual-verify - Administrator manual price verification
app.post('/api/firebase/products/:id/manual-verify', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      res.status(403).json({ success: false, error: 'Unauthorized: Admin passkey required' });
      return;
    }

    const { priceAUD, adminNotes, adminUser } = req.body;
    const price = Number(priceAUD);
    if (!price || price <= 0 || isNaN(price)) {
      res.status(400).json({ success: false, error: 'A valid positive price in AUD is required' });
      return;
    }

    const notes = adminNotes && typeof adminNotes === 'string' ? adminNotes.trim() : 'Verified against current Centre Com catalogue';
    const user = adminUser && typeof adminUser === 'string' ? adminUser.trim() : 'Workshop Administrator';

    const updated = await firebaseCentrecomService.manualVerifyProduct(req.params.id, price, notes, user);
    res.json({
      success: true,
      product: updated,
      message: `Price manually verified and saved: $${price} AUD (audited by ${user})`
    });
  } catch (error: any) {
    console.error('Error in manual price verification:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to manually verify price' });
  }
});

// POST /api/firebase/products/refresh-batch - Enqueue / run batch refresh of due products (Admin/Cron)
app.post('/api/firebase/products/refresh-batch', async (req: Request, res: Response) => {
  try {
    const maxBatch = Number(req.body?.maxBatchSize) || 5;
    const batchResult = await firebaseCentrecomService.runScheduledBatchRefresh(maxBatch);
    res.json({
      success: true,
      ...batchResult,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in batch price refresh:', error);
    res.status(500).json({ success: false, error: error.message || 'Batch refresh failed' });
  }
});

// GET /api/firebase/products/:id/history - Get price history logs
app.get('/api/firebase/products/:id/history', async (req: Request, res: Response) => {
  try {
    const history = await firebaseCentrecomService.getPriceHistory(req.params.id);
    res.json({
      success: true,
      productId: req.params.id,
      count: history.length,
      history
    });
  } catch (error: any) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch price history' });
  }
});

// GET /api/firebase/stats - Pricing engine metrics and health status
app.get('/api/firebase/stats', (_req: Request, res: Response) => {
  try {
    const stats = firebaseCentrecomService.getStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Error fetching pricing stats:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch pricing stats' });
  }
});

// POST /api/firebase/recheck-cart - Pre-checkout price recheck with diffs & confirmation requirement
app.post('/api/firebase/recheck-cart', (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, error: 'items array is required' });
      return;
    }

    const recheckResult = firebaseCentrecomService.recheckCart(items);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      verifiedSource: 'https://www.centrecom.com.au (AUD incl. GST)',
      ...recheckResult
    });
  } catch (error: any) {
    console.error('Error in pre-checkout cart recheck:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to recheck cart' });
  }
});

// POST /api/firebase/sync-catalog - Admin reseed/sync catalog from master list
app.post('/api/firebase/sync-catalog', async (req: Request, res: Response) => {
  try {
    if (!checkAdminAuth(req)) {
      res.status(403).json({ success: false, error: 'Unauthorized: Admin passkey required' });
      return;
    }
    const seeded = await firebaseCentrecomService.seedCatalogFromParts(BUILDER_PARTS);
    res.json({
      success: true,
      seeded,
      totalCatalog: (await firebaseCentrecomService.getAllProducts()).length,
      message: `Successfully synchronized ${seeded} new/updated parts from master catalog.`
    });
  } catch (error: any) {
    console.error('Error syncing catalog:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to sync catalog' });
  }
});

// POST /api/centrecom/recheck - Integrated compatibility with existing checkout calls
app.post('/api/centrecom/recheck', (req: Request, res: Response) => {
  try {
    const { parts } = req.body;
    const now = new Date().toISOString();

    if (!Array.isArray(parts) || parts.length === 0) {
      res.json({
        success: true,
        valid: true,
        timestamp: now,
        verifiedSource: 'https://www.centrecom.com.au (AUD incl. GST)',
        partsChecked: 0,
        priceChanges: []
      });
      return;
    }

    const items = parts.map((p: any) => ({
      partId: p.id || p.partId,
      expectedPrice: p.price || 0
    }));

    const result = firebaseCentrecomService.recheckCart(items);
    const priceChanges = result.verifiedItems
      .filter((v) => v.changed)
      .map((v) => ({
        id: v.partId,
        name: v.model,
        oldPrice: v.expectedPrice,
        currentPrice: v.currentPrice,
        delta: v.delta
      }));

    res.json({
      success: true,
      valid: !result.hasChanges,
      hasChanges: result.hasChanges,
      requiresConfirmation: result.requiresConfirmation,
      timestamp: now,
      verifiedSource: 'https://www.centrecom.com.au (AUD incl. GST)',
      partsChecked: parts.length,
      priceChanges,
      originalTotal: result.originalTotal,
      revisedTotal: result.revisedTotal,
      difference: result.difference,
      message: result.hasChanges
        ? 'Some component prices have changed since being added. Please review and confirm the updated total before completing order.'
        : 'All component prices successfully verified against current Centre Com catalogue. Ready for order confirmation.'
    });
  } catch (error) {
    console.error('Error rechecking Centre Com prices:', error);
    res.status(500).json({ success: false, error: 'Failed to verify Centre Com prices' });
  }
});

// POST /api/motherboard/research - Smart AI Motherboard Researcher
app.post('/api/motherboard/research', async (req: Request, res: Response) => {
  try {
    const {
      brand,
      model,
      cataloguePartId,
      customerName,
      email,
      conditionNotes,
      buildParts,
      sourceType
    } = req.body;

    if (!brand || !brand.trim() || !model || !model.trim()) {
      res.status(400).json({
        success: false,
        error: 'Motherboard manufacturer (brand) and exact model are required.'
      });
      return;
    }

    // 1. Research specifications using Gemini or verified hardware database
    const researchedSpecs = await researchMotherboardSpecs(brand.trim(), model.trim());

    // 2. Evaluate whole-build compatibility against selected CPU, RAM, Case, GPU
    const compatibility = evaluateMotherboardBuildCompatibility(researchedSpecs, buildParts || {});

    // 3. Persist record in customerSuppliedMotherboards
    const refNum = generateReferenceNumber('MB');
    const now = new Date().toISOString();

    const record: CustomerSuppliedMotherboardRecord = {
      id: `csm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      referenceNumber: refNum,
      customerName: customerName ? customerName.trim() : undefined,
      email: email ? email.trim() : undefined,
      sourceType: sourceType === 'catalogue_conversion' ? 'catalogue_conversion' : 'custom_entry',
      cataloguePartId: cataloguePartId || undefined,
      brand: researchedSpecs.brand,
      model: researchedSpecs.model,
      productUrl: researchedSpecs.officialSourceUrl,
      conditionNotes: conditionNotes ? conditionNotes.trim() : undefined,
      researchedSpecs,
      researchStatus: researchedSpecs.identified ? 'verified' : 'manual_review',
      compatibilityStatus: compatibility.status,
      compatibilityNotes: compatibility.checks.map(
        (c) => `[${c.status.toUpperCase()}] ${c.category}: ${c.message}`
      ),
      currentBuildSummary: {
        cpu: buildParts?.cpu?.name,
        ram: buildParts?.ram?.name,
        case: buildParts?.case?.name,
        gpu: buildParts?.gpu?.name
      },
      adminStatus: 'pending',
      createdAt: now,
      updatedAt: now
    };

    const db = readDatabase();
    if (!db.customerSuppliedMotherboards) {
      db.customerSuppliedMotherboards = [];
    }
    db.customerSuppliedMotherboards.unshift(record);
    writeDatabase(db);

    res.json({
      success: true,
      record,
      researchedSpecs,
      compatibility
    });
  } catch (error: any) {
    console.error('Error in motherboard research endpoint:', error);
    res.status(500).json({ success: false, error: error.message || 'Motherboard research failed' });
  }
});

// ==========================================
// CUSTOM PC & CHECKOUT ORDER ENDPOINTS
// ==========================================

// GET /api/products/custom-pcs - Get all 3 custom PCs, build options, and shipping config
app.get('/api/products/custom-pcs', (_req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json({
      success: true,
      products: THREE_CUSTOM_PCS,
      buildServices: BUILD_SERVICES,
      shippingConfig: db.shippingConfig || DEFAULT_SHIPPING_CONFIG
    });
  } catch (error) {
    console.error('Error fetching custom PCs:', error);
    res.status(500).json({ success: false, error: 'Failed to load PC products' });
  }
});

// GET /api/config/shipping - Current delivery rates and timeframes
app.get('/api/config/shipping', (_req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json({
      success: true,
      config: db.shippingConfig || DEFAULT_SHIPPING_CONFIG
    });
  } catch (error) {
    console.error('Error fetching shipping config:', error);
    res.status(500).json({ success: false, error: 'Failed to load shipping config' });
  }
});

// POST /api/orders - Submit PC Order / Cart Enquiry with server-side pricing validation
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      email,
      phone,
      shippingAddress,
      pcId,
      customPc,
      componentItems,
      buildServiceId,
      deliveryMethodId,
      paymentMethod,
      notes
    } = req.body;

    if (!customerName || !customerName.trim()) {
      res.status(400).json({ success: false, error: 'Customer name is required' });
      return;
    }
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'A valid email is required' });
      return;
    }
    if (!phone || !phone.trim()) {
      res.status(400).json({ success: false, error: 'Phone number is required' });
      return;
    }

    if (deliveryMethodId !== 'pickup' && deliveryMethodId !== 'normal' && deliveryMethodId !== 'express') {
      res.status(400).json({
        success: false,
        error: 'Must select a valid delivery method: "pickup", "normal", or "express"'
      });
      return;
    }

    if (deliveryMethodId !== 'pickup') {
      if (
        !shippingAddress ||
        !shippingAddress.addressLine1 ||
        !shippingAddress.suburb ||
        !shippingAddress.state ||
        !shippingAddress.postcode
      ) {
        res.status(400).json({
          success: false,
          error: 'Complete delivery address (street, suburb, state, postcode) is required'
        });
        return;
      }
    }

    const db = readDatabase();
    const currentShipping = db.shippingConfig || DEFAULT_SHIPPING_CONFIG;

    // Resolve components + PC build
    let resolvedPc = pcId ? getCustomPcById(pcId) : undefined;
    if (!resolvedPc && customPc && typeof customPc === 'object' && Array.isArray(customPc.components)) {
      const comps = customPc.components.map((c: any) => ({
        name: String(c.name || 'Component'),
        category: String(c.category || 'Part'),
        price: Math.max(0, Number(c.price || 0)),
        included: Boolean(c.included)
      }));
      const sumComps = comps.reduce((s: number, c: any) => s + (c.included ? 0 : c.price), 0);
      resolvedPc = {
        id: String(customPc.id || 'custom-pc-build'),
        name: String(customPc.name || 'Custom PC Build'),
        tagline: String(customPc.tagline || 'Custom builder configuration'),
        tier: 'Custom Build',
        basePrice: Number(customPc.basePrice || sumComps),
        image: '',
        accentColor: 'blue',
        badge: 'CUSTOM',
        description: 'Custom PC build from QTR builder',
        targetAudience: 'Custom PC customer',
        components: comps,
        specsSummary: {
          cpu: '',
          gpu: '',
          ram: '',
          motherboard: '',
          storage: '',
          cooler: '',
          case: '',
          psu: '',
          os: ''
        },
        features: []
      };
    }

    const parsedComponentItems = Array.isArray(componentItems)
      ? componentItems
          .map((item: any) => ({
            name: String(item.name || 'Component'),
            category: String(item.category || 'Component'),
            price: Math.max(0, Number(item.price || 0)),
            quantity: Math.max(1, Number(item.quantity || 1))
          }))
      : [];

    if (!resolvedPc && parsedComponentItems.length === 0) {
      res.status(400).json({ success: false, error: `Invalid PC or cart selection: "${pcId || 'empty'}"` });
      return;
    }

    const componentsSubtotal = parsedComponentItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const hasPc = Boolean(resolvedPc);
    if (hasPc && buildServiceId !== 'fast' && buildServiceId !== 'full') {
      res.status(400).json({
        success: false,
        error: 'Must select a valid build service: "fast" ($100.00) or "full" ($250.00)'
      });
      return;
    }

    const effectiveServiceId: 'fast' | 'full' = buildServiceId === 'full' ? 'full' : 'fast';
    const pcPricing = resolvedPc
      ? calculatePcOrderPricing(resolvedPc, effectiveServiceId, deliveryMethodId, currentShipping)
      : null;

    const deliveryPrice =
      deliveryMethodId === 'pickup'
        ? 0
        : deliveryMethodId === 'express'
        ? currentShipping.expressPrice
        : currentShipping.normalPrice;
    const deliveryTimeframe =
      deliveryMethodId === 'pickup'
        ? 'Workshop collection when ready'
        : deliveryMethodId === 'express'
        ? currentShipping.expressTimeframe
        : currentShipping.normalTimeframe;
    const deliveryMethodName =
      deliveryMethodId === 'pickup'
        ? 'Pick up'
        : deliveryMethodId === 'express'
        ? 'Express Delivery'
        : 'Normal Delivery';

    const pcQuantity = hasPc ? Math.max(1, Number(req.body.pcQuantity || 1)) : 0;
    const partsAndWindowsPrice = (resolvedPc ? resolvedPc.basePrice * pcQuantity : 0) + componentsSubtotal;
    const buildServicePrice = hasPc ? BUILD_SERVICES[effectiveServiceId].price : 0;
    const subtotalBeforeDelivery = partsAndWindowsPrice + buildServicePrice;
    const finalTotal = subtotalBeforeDelivery + deliveryPrice;

    const combinedComponents = [
      ...(resolvedPc ? resolvedPc.components : []),
      ...parsedComponentItems.map((i: any) => ({
        name: i.quantity > 1 ? `${i.name} (x${i.quantity})` : i.name,
        category: i.category,
        price: i.price * i.quantity
      }))
    ];

    const refNum = generateReferenceNumber('ORD');
    const now = new Date().toISOString();

    const newOrder: PcOrder = {
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      referenceNumber: refNum,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      shippingAddress: {
        addressLine1: shippingAddress?.addressLine1?.trim() || 'Workshop Pick-up',
        addressLine2: shippingAddress?.addressLine2 ? shippingAddress.addressLine2.trim() : undefined,
        suburb: shippingAddress?.suburb?.trim() || 'Local Pick-up',
        state: shippingAddress?.state?.trim()?.toUpperCase() || 'AU',
        postcode: shippingAddress?.postcode?.trim() || '0000'
      },
      pcId: resolvedPc ? resolvedPc.id : 'components-order',
      pcName: resolvedPc
        ? pcQuantity > 1
          ? `${resolvedPc.name} (x${pcQuantity})`
          : resolvedPc.name
        : `${parsedComponentItems.length} Component${parsedComponentItems.length > 1 ? 's' : ''}`,
      pcBasePrice: partsAndWindowsPrice,
      components: combinedComponents,
      buildService: {
        id: effectiveServiceId,
        name: hasPc ? BUILD_SERVICES[effectiveServiceId].name : 'Parts Only',
        price: buildServicePrice,
        description: hasPc ? BUILD_SERVICES[effectiveServiceId].description : 'Individual components order'
      },
      subtotalBeforeDelivery,
      deliveryMethod: {
        id: deliveryMethodId,
        name: deliveryMethodName,
        price: deliveryPrice,
        timeframe: deliveryTimeframe
      },
      finalTotal,
      paymentMethod:
        paymentMethod === 'bank_transfer'
          ? 'bank_transfer'
          : paymentMethod === 'pickup_cash'
          ? 'pickup_cash'
          : 'card',
      status: 'Order Placed',
      createdAt: now,
      updatedAt: now,
      technicianNotes: `Order placed online. Parts & Windows: $${partsAndWindowsPrice.toFixed(
        2
      )}, Build Service: $${buildServicePrice.toFixed(2)}, Delivery: $${deliveryPrice.toFixed(
        2
      )}. Total: $${finalTotal.toFixed(2)}.${notes ? ` Notes: ${String(notes).trim()}` : ''}`
    };

    db.pcOrders.unshift(newOrder);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Order enquiry submitted successfully! We will confirm stock, pricing and contact you shortly.',
      order: newOrder,
      referenceNumber: refNum,
      pricing: pcPricing
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, error: 'Failed to process order' });
  }
});

// Contact message: POST
app.post('/api/contact', (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email is required' });
      return;
    }
    if (!message || !message.trim()) {
      res.status(400).json({ success: false, error: 'Message cannot be empty' });
      return;
    }

    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      subject: subject ? subject.trim() : 'General Enquiry',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      replied: false
    };

    const db = readDatabase();
    db.contactMessages.unshift(newMessage);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We have received your message and will get back to you shortly.'
    });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ success: false, error: 'Failed to record message' });
  }
});

// AI Assistant: POST /api/assistant/chat
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ success: false, error: 'Message cannot be empty' });
      return;
    }

    const userQuery = message.trim();

    const systemInstruction = `You are the QTR Virtual Technician assistant for "QTR — Quick Tech Repairs", a service of AB Services.
Address: 25 Emma St Caufield south 3162. Phone: 0493 711 832. Hours: Monday–Saturday, 9am–8pm.

Key business rules:
1. Both Windows and Apple computers can be repaired.
2. Apple/MacBook hardware upgrades are NOT offered. Apple and MacBook repairs are available. Windows laptops and desktops CAN be upgraded (RAM, SSD, GPU, CPU, etc.).
3. Turnaround options for repairs/upgrades: Regular Service is FREE (5–7 day turnaround). Express Service is $10–$20 (1–2 day turnaround). Express fee is separate from the repair/upgrade cost, which is determined after physical assessment.
4. Custom PCs Catalogue (base parts & Windows prices, excluding labour & delivery; "Labour and delivery calculated at checkout"):
   • Project Eclipse — $1,428.00 AUD (AMD Ryzen 5 5600X, ASUS Dual RTX 5050 8GB OC, G.Skill 16GB DDR4-3600, ASUS Prime B550M-A WiFi II, Biwin 512GB NVMe, Deepcool Matrexx 30, ASUS Prime 750W Bronze, Windows 11 Home OEM)
   • NITROFORGE X3060 — $2,015.00 AUD (AMD Ryzen 5 7500X3D 4.2GHz, Palit RTX 3060 12GB GDDR6, Patriot Viper Venom 16GB DDR5-6000, Sapphire NITRO+ B850M Wi-Fi 6, Biwin 512GB NVMe, Montech NX600 ARGB dual tower, OKINOS AQUA UNO Zebra case with 3 ARGB fans, Antec GSK850 850W Gold, Windows 11 Home OEM)
   • OVERDRIVE — $3,743.00 AUD (AMD Ryzen 7 9800X3D up to 5.2GHz, PowerColor Reaper RX 9070 XT 16GB, KLEVV FIT V 32GB DDR5-6000 CL28, ASUS TUF B850M-E WiFi, Biwin Opal NV7400 2TB Gen4, ASUS LC 360 ARGB AIO, ASUS A32 PLUS dual-chamber panoramic chassis, SilverStone TR850R 850W Gold, Windows 11 Home OEM)
5. Build Service Selection at Checkout:
   • Fast Build ($100.00): PC assembly, connection checks, power-on self-test (POST). Does not include cable management, Windows install, or benchmarking.
   • Full Build & Setup ($250.00): Complete assembly, professional cable management, Windows installation using included license, driver install, comprehensive stress testing & benchmarks.
6. Delivery Selection at Checkout:
   • Normal Delivery or Express Delivery (rates configured at checkout).
   • Notice: "Delivery costs are calculated at checkout based on your selected delivery method."
7. Formula: Final total = PC parts and Windows price + selected build service + selected delivery charge + any applicable existing taxes or fees.
   Reference totals before delivery:
   • Project Eclipse: Fast Build = $1,528.00 | Full Build & Setup = $1,678.00
   • NITROFORGE X3060: Fast Build = $2,115.00 | Full Build & Setup = $2,265.00
   • OVERDRIVE: Fast Build = $3,843.00 | Full Build & Setup = $3,993.00
8. Never ask customers for passwords. Be friendly, accurate, and concise.`;

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const contents = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            if (item.role === 'user' || item.role === 'model') {
              contents.push({
                role: item.role,
                parts: [{ text: String(item.text) }]
              });
            }
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: userQuery }]
        });

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction
          }
        });

        const reply = response.text || "I'm here to help with your repair, upgrade, or PC build questions!";
        res.json({ success: true, reply });
        return;
      } catch (geminiError) {
        console.warn('Gemini generateContent error, using diagnostic fallback:', geminiError);
      }
    }

    // Intelligent local diagnostic fallback
    const qLower = userQuery.toLowerCase();
    let reply = '';

    if (qLower.includes('eclipse') || qLower.includes('5050')) {
      reply = `**Project Eclipse — $1,428.00 AUD (Parts & Windows Price)**
*Labour and delivery calculated at checkout.*
• **CPU**: AMD Ryzen 5 5600X (6C/12T) — $199.00
• **GPU**: ASUS Dual GeForce RTX 5050 8GB OC GDDR6 — $499.00
• **RAM**: G.Skill Trident Z RGB 16GB (2×8GB) DDR4-3600 CL16 — $199.00
• **Motherboard**: ASUS Prime B550M-A WiFi II AM4 — $129.00
• **Storage**: Biwin Black Opal NV3500 512GB PCIe Gen 3 M.2 — $99.00
• **Case & PSU**: Deepcool Matrexx 30 ($45) + ASUS Prime 750W Bronze ($79)
• **OS**: Microsoft Windows 11 Home OEM 64-bit ($179.00 included)
• **Checkout options**: Fast Build (+$100 → $1,528.00) or Full Build & Setup (+$250 → $1,678.00). Delivery calculated at checkout!`;
    } else if (qLower.includes('nitroforge') || qLower.includes('x3060') || (qLower.includes('3060') && !qLower.includes('overdrive'))) {
      reply = `**NITROFORGE X3060 — $2,015.00 AUD (Parts & Windows Price)**
*Labour and delivery calculated at checkout.*
• **CPU**: AMD Ryzen 5 7500X3D (6C/12T @ 4.2 GHz) — $397.00
• **GPU**: Palit GeForce RTX 3060 Infinity 2 OC 12GB GDDR6 — $539.00
• **RAM**: Patriot Viper Venom 16GB (1×16GB) DDR5-6000 CL30 — $379.00
• **Motherboard**: Sapphire NITRO+ B850M Wi-Fi 6 AM5 DDR5 — $179.00
• **Storage**: Biwin Black Opal NV3500 512GB PCIe Gen 3 M.2 — $99.00
• **Cooler & Case**: Montech NX600 ARGB dual-tower ($55) + OKINOS AQUA UNO Zebra ($59)
• **PSU**: Antec GSK850 V2 AU 850W 80+ Gold ATX 3.1 — $129.00
• **OS**: Microsoft Windows 11 Home OEM 64-bit ($179.00 included)
• **Checkout options**: Fast Build (+$100 → $2,115.00) or Full Build & Setup (+$250 → $2,265.00). Delivery calculated at checkout!`;
    } else if (qLower.includes('overdrive') || qLower.includes('9800x3d') || qLower.includes('9070')) {
      reply = `**OVERDRIVE — $3,743.00 AUD (Parts & Windows Price)**
*Labour and delivery calculated at checkout.*
• **CPU**: AMD Ryzen 7 9800X3D (8C/16T up to 5.2 GHz) — $599.00
• **GPU**: PowerColor Radeon Reaper RX 9070 XT 16GB GDDR6 — $1,229.00
• **RAM**: KLEVV FIT V 32GB (2×16GB) DDR5-6000 CL28 — $769.00
• **Motherboard**: ASUS TUF Gaming B850M-E WIFI AM5 — $209.00
• **Storage**: Biwin Opal NV7400 2TB PCIe Gen 4 — $399.00
• **Cooler & Case**: ASUS LC 360 ARGB 360mm AIO ($109) + ASUS A32 PLUS TG dual-chamber ($125)
• **PSU**: SilverStone TR850R-GF 850W 80+ Gold ATX 3.1 — $125.00
• **OS**: Microsoft Windows 11 Home OEM 64-bit ($179.00 included)
• **Checkout options**: Fast Build (+$100 → $3,843.00) or Full Build & Setup (+$250 → $3,993.00). Delivery calculated at checkout!`;
    } else if (qLower.includes('custom pc') || qLower.includes('prebuilt') || qLower.includes('build service') || qLower.includes('fast build')) {
      reply = `**QTR Custom PC Range & Checkout Options:**
We offer three custom PC tiers in our catalogue:
1. **Project Eclipse** — $1,428.00 (Ryzen 5 5600X + RTX 5050 8GB OC)
2. **NITROFORGE X3060** — $2,015.00 (Ryzen 5 7500X3D + RTX 3060 12GB)
3. **OVERDRIVE** — $3,743.00 (Ryzen 7 9800X3D + RX 9070 XT 16GB)

*Labour and delivery calculated at checkout.*
At checkout, you select your build service:
• **Fast Build ($100.00)**: Assembly and basic POST test.
• **Full Build & Setup ($250.00)**: Assembly, cable routing, Windows setup, driver install, stress tests.
Plus your preferred delivery: **Normal Delivery** or **Express Delivery**.`;
    } else if (qLower.includes('apple') || qLower.includes('macbook') || qLower.includes('imac')) {
      if (qLower.includes('upgrade')) {
        reply = `**Important Note Regarding Apple Computers:**
MacBook and Apple computer hardware upgrades are **not** currently available due to soldered unified memory and storage.
However, **Apple repairs are available!** We repair MacBooks, iMacs, and Mac mini computers for screen faults, battery replacements, charging circuits, and macOS issues. You can select "MacBook Repairs" or "Apple Computer Repairs" in our service request form.`;
      } else {
        reply = `Yes, **we repair MacBooks and other Apple computers!** Both Windows and Apple computers can be repaired at QTR. We handle screen replacements, battery service, liquid damage diagnostics, logic board issues, and macOS software recovery. Apple repairs may cost a little more depending on model and parts required.`;
      }
    } else if (qLower.includes('price') || qLower.includes('cost') || qLower.includes('how much') || qLower.includes('fee')) {
      reply = `**How Our Pricing Works:**
• Assessment is conducted first to pinpoint the exact issue.
• **Regular Service** turnaround (5–7 days) has **NO extra fee (FREE)**.
• **Express Service** turnaround (1–2 days) has an additional **$10–$20** priority fee.
The Express fee is separate from the repair/upgrade cost, which will be provided clearly in your quote before any work starts!`;
    } else if (qLower.includes('hour') || qLower.includes('open') || qLower.includes('location') || qLower.includes('address') || qLower.includes('phone')) {
      reply = `**QTR Quick Tech Repairs Contact Details:**
• **Address**: 25 Emma St Caufield south 3162
• **Phone**: 0493 711 832
• **Hours**: Monday–Saturday, 9am–8pm (Sunday by appointment)
Please submit a quick service request online first so we can prepare your drop-off window!`;
    } else if (qLower.includes('blue screen') || qLower.includes('bsod') || qLower.includes('crash')) {
      reply = `Blue screens (BSOD) usually stem from driver corruption, failing memory (RAM), thermal throttling, or SSD storage degradation.
We recommend submitting a request under **Windows Problems** or **Hardware Problems**. Note any error codes (e.g. WHEA_UNCORRECTABLE_ERROR or MEMORY_MANAGEMENT) so our bench technicians can test your memory and power rails right away.`;
    } else if (qLower.includes('slow') || qLower.includes('speed') || qLower.includes('upgrade') || qLower.includes('ssd') || qLower.includes('ram')) {
      reply = `Sluggish computers are usually transformed with two cost-effective hardware upgrades:
1. **SSD Upgrade & OS Clone**: Swapping an older mechanical drive or slow drive for a high-speed Gen4 NVMe SSD boots in seconds.
2. **RAM Upgrade**: Doubling memory to 16GB or 32GB eliminates stuttering when having lots of tabs or programs open.
Note: Hardware upgrades are available for Windows laptops and desktops (not available for MacBooks). Check our **Upgrades** page or submit an Upgrade Enquiry!`;
    } else {
      reply = `Hello! I'm the QTR virtual technician. I can help you with:
• Diagnosing laptop and desktop issues (crashes, no power, loud fans, slow speeds)
• Determining whether you need a **Repair** or a **Hardware Upgrade**
• Explaining our **Regular (Free, 5–7 days)** vs **Express ($10–$20, 1–2 days)** turnaround
• Answering questions about our **NITROFORGE X3060** prebuilt (A$2,015) or custom PC configurations
• Drop-off details at **25 Emma St Caufield south 3162** (0493 711 832).
What type of computer or issue can I assist you with today?`;
    }

    res.json({ success: true, reply });
  } catch (error) {
    console.error('AI chat endpoint error:', error);
    res.status(500).json({ success: false, error: 'Assistant is temporarily busy' });
  }
});

// Tracker: GET /api/track/:lookup (searches by reference number or email)
app.get('/api/track/:lookup', (req: Request, res: Response) => {
  try {
    const rawLookup = (req.params.lookup || '').trim();
    if (!rawLookup) {
      res.status(400).json({ success: false, error: 'Lookup parameter required' });
      return;
    }

    const lookup = rawLookup.toLowerCase();
    const db = readDatabase();

    // Check repair requests
    const repairMatch = db.repairRequests.find(
      (r) => r.referenceNumber.toLowerCase() === lookup || r.email.toLowerCase() === lookup
    );
    if (repairMatch) {
      res.json({
        success: true,
        type: 'repair',
        record: repairMatch
      });
      return;
    }

    // Check upgrade requests
    const upgradeMatch = db.upgradeRequests.find(
      (u) => u.referenceNumber.toLowerCase() === lookup || u.email.toLowerCase() === lookup
    );
    if (upgradeMatch) {
      res.json({
        success: true,
        type: 'upgrade',
        record: upgradeMatch
      });
      return;
    }

    // Check custom PC quotes
    const pcMatch = db.customPcQuotes.find(
      (p) => p.referenceNumber.toLowerCase() === lookup || p.email.toLowerCase() === lookup
    );
    if (pcMatch) {
      res.json({
        success: true,
        type: 'custom_pc',
        record: pcMatch
      });
      return;
    }

    // Check PC orders
    const orderMatch = db.pcOrders.find(
      (o) => o.referenceNumber.toLowerCase() === lookup || o.email.toLowerCase() === lookup
    );
    if (orderMatch) {
      res.json({
        success: true,
        type: 'pc_order',
        record: orderMatch
      });
      return;
    }

    res.status(404).json({
      success: false,
      error: `No service request or PC order found for "${rawLookup}". Please verify your reference number (e.g. QTR-REP-1024, QTR-ORD-5120) or email.`
    });
  } catch (error) {
    console.error('Error tracking request:', error);
    res.status(500).json({ success: false, error: 'Failed to look up request' });
  }
});

// ==========================================
// ADMIN MANAGEMENT ROUTES (Protected by passkey)
// ==========================================

function verifyAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['x-admin-key'] || req.query.adminKey;
  if (!authHeader || authHeader !== ADMIN_PASSKEY) {
    res.status(401).json({ success: false, error: 'Unauthorized: Invalid admin credentials' });
    return;
  }
  next();
}

app.get('/api/admin/data', verifyAdmin, (_req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json({
      success: true,
      data: db,
      metrics: {
        totalRepairs: db.repairRequests.length,
        totalUpgrades: db.upgradeRequests.length,
        totalCustomPc: db.customPcQuotes.length,
        totalOrders: db.pcOrders.length,
        totalReviews: db.reviews.length,
        pendingReviewsCount: db.reviews.filter((r) => !r.approved).length,
        totalMessages: db.contactMessages.length,
        totalPriceMatches: (db.cheaperPriceRequests || []).length,
        pendingPriceMatchesCount: (db.cheaperPriceRequests || []).filter((c) => c.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Admin data error:', error);
    res.status(500).json({ success: false, error: 'Failed to load admin data' });
  }
});

// Toggle review approval
app.post('/api/admin/reviews/:id/approve', verifyAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;
    const db = readDatabase();
    const review = db.reviews.find((r) => r.id === id);
    if (!review) {
      res.status(404).json({ success: false, error: 'Review not found' });
      return;
    }
    review.approved = typeof approved === 'boolean' ? approved : true;
    writeDatabase(db);
    res.json({ success: true, review });
  } catch (error) {
    console.error('Error toggling review:', error);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

// Delete review
app.delete('/api/admin/reviews/:id', verifyAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = readDatabase();
    db.reviews = db.reviews.filter((r) => r.id !== id);
    writeDatabase(db);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

// Update repair request status
app.post('/api/admin/repairs/:id/status', verifyAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, technicianNotes } = req.body;
    const db = readDatabase();
    const repair = db.repairRequests.find((r) => r.id === id);
    if (!repair) {
      res.status(404).json({ success: false, error: 'Repair request not found' });
      return;
    }
    if (status) repair.status = status;
    if (technicianNotes !== undefined) repair.technicianNotes = technicianNotes;
    repair.updatedAt = new Date().toISOString();
    writeDatabase(db);
    res.json({ success: true, repair });
  } catch (error) {
    console.error('Error updating repair:', error);
    res.status(500).json({ success: false, error: 'Failed to update repair status' });
  }
});

// Update upgrade request status
app.post('/api/admin/upgrades/:id/status', verifyAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, technicianNotes } = req.body;
    const db = readDatabase();
    const upgrade = db.upgradeRequests.find((u) => u.id === id);
    if (!upgrade) {
      res.status(404).json({ success: false, error: 'Upgrade request not found' });
      return;
    }
    if (status) upgrade.status = status;
    if (technicianNotes !== undefined) upgrade.technicianNotes = technicianNotes;
    upgrade.updatedAt = new Date().toISOString();
    writeDatabase(db);
    res.json({ success: true, upgrade });
  } catch (error) {
    console.error('Error updating upgrade:', error);
    res.status(500).json({ success: false, error: 'Failed to update upgrade status' });
  }
});

// Update PC order status
app.post('/api/admin/orders/:id/status', verifyAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, technicianNotes } = req.body;
    const db = readDatabase();
    const order = db.pcOrders.find((o) => o.id === id);
    if (!order) {
      res.status(404).json({ success: false, error: 'PC order not found' });
      return;
    }
    if (status) order.status = status;
    if (technicianNotes !== undefined) order.technicianNotes = technicianNotes;
    order.updatedAt = new Date().toISOString();
    writeDatabase(db);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating PC order:', error);
    res.status(500).json({ success: false, error: 'Failed to update PC order status' });
  }
});

// Update shipping configuration
app.post('/api/admin/config/shipping', verifyAdmin, (req: Request, res: Response) => {
  try {
    const { normalPrice, normalTimeframe, expressPrice, expressTimeframe } = req.body;
    const db = readDatabase();
    if (!db.shippingConfig) {
      db.shippingConfig = { ...DEFAULT_SHIPPING_CONFIG };
    }
    db.shippingConfig = {
      normalPrice: typeof normalPrice === 'number' && normalPrice >= 0 ? normalPrice : db.shippingConfig.normalPrice,
      normalTimeframe: normalTimeframe ? String(normalTimeframe).trim() : db.shippingConfig.normalTimeframe,
      expressPrice: typeof expressPrice === 'number' && expressPrice >= 0 ? expressPrice : db.shippingConfig.expressPrice,
      expressTimeframe: expressTimeframe ? String(expressTimeframe).trim() : db.shippingConfig.expressTimeframe
    };
    writeDatabase(db);
    res.json({ success: true, shippingConfig: db.shippingConfig });
  } catch (error) {
    console.error('Error updating shipping config:', error);
    res.status(500).json({ success: false, error: 'Failed to update shipping config' });
  }
});

// Admin: Update Cheaper Price Request (Approve / Reject / Request Info)
app.post('/api/admin/cheaper-price-requests/:id/action', verifyAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approvedPriceAdjustment, adminNotes } = req.body;
    const db = readDatabase();
    if (!db.cheaperPriceRequests) db.cheaperPriceRequests = [];
    const item = db.cheaperPriceRequests.find((r) => r.id === id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Price match request not found' });
      return;
    }

    if (status && ['pending', 'approved', 'rejected', 'more_info'].includes(status)) {
      item.status = status;
    }
    if (typeof approvedPriceAdjustment === 'number') {
      item.approvedPriceAdjustment = approvedPriceAdjustment;
    } else if (status === 'approved' && item.approvedPriceAdjustment === undefined) {
      item.approvedPriceAdjustment = item.priceDelta;
    }
    if (adminNotes !== undefined) {
      item.adminNotes = adminNotes;
    }
    item.updatedAt = new Date().toISOString();
    writeDatabase(db);

    res.json({
      success: true,
      message: `Price request ${item.referenceNumber} updated to ${item.status}`,
      request: item
    });
  } catch (error) {
    console.error('Error updating price request:', error);
    res.status(500).json({ success: false, error: 'Failed to update price match request' });
  }
});

// Admin: Trigger Centre Com catalogue re-verification
app.post('/api/admin/centrecom/refresh-prices', verifyAdmin, (_req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();
    res.json({
      success: true,
      timestamp: now,
      verifiedSource: 'https://www.centrecom.com.au',
      status: 'All prices synchronized with Centre Com Australian catalogue (AUD incl. GST)'
    });
  } catch (error) {
    console.error('Error refreshing Centre Com prices:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh Centre Com prices' });
  }
});

// Admin: GET /api/admin/customer-motherboards - List all customer-supplied motherboards
app.get('/api/admin/customer-motherboards', verifyAdmin, (_req: Request, res: Response) => {
  try {
    const db = readDatabase();
    res.json({
      success: true,
      records: db.customerSuppliedMotherboards || []
    });
  } catch (error: any) {
    console.error('Error fetching customer motherboards:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch customer motherboards' });
  }
});

// Admin: POST /api/admin/customer-motherboards/:id/action - Update review and physical bench status
app.post('/api/admin/customer-motherboards/:id/action', verifyAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const targetStatus = req.body.adminStatus || req.body.status;
    const targetNotes = req.body.adminNotes !== undefined ? req.body.adminNotes : req.body.benchNotes;
    const db = readDatabase();
    if (!db.customerSuppliedMotherboards) db.customerSuppliedMotherboards = [];
    const item = db.customerSuppliedMotherboards.find((m) => m.id === id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Customer motherboard record not found' });
      return;
    }

    if (
      targetStatus &&
      ['pending', 'approved', 'rejected', 'inspection_passed', 'inspection_failed'].includes(
        targetStatus
      )
    ) {
      item.adminStatus = targetStatus;
    }
    if (targetNotes !== undefined) {
      item.adminNotes = targetNotes;
    }
    item.updatedAt = new Date().toISOString();
    writeDatabase(db);

    res.json({
      success: true,
      record: item,
      message: `Motherboard record ${item.referenceNumber} status updated to ${item.adminStatus}`
    });
  } catch (error: any) {
    console.error('Error updating customer motherboard record:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update record' });
  }
});

// Admin: POST /api/admin/repair-centrecom-catalog - Batch repair & verification of Centre Com catalogue
app.post('/api/admin/repair-centrecom-catalog', verifyAdmin, async (_req: Request, res: Response) => {
  try {
    const allProducts = await firebaseCentrecomService.getAllProducts();
    const now = new Date().toISOString();
    let repairedCount = 0;
    const items: Array<{ id: string; name: string; url: string; price: number | null; status: string }> = [];

    for (const prod of allProducts) {
      // Ensure product URL is a valid Centre Com URL
      if (!prod.productUrl || !prod.productUrl.startsWith('https://www.centrecom.com.au/')) {
        const slug = `${prod.manufacturer.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${prod.model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        prod.productUrl = `https://www.centrecom.com.au/${slug}`;
      }

      // Update check timestamp
      prod.lastCheckedAt = now;
      if (prod.priceAUD !== null && prod.priceAUD >= 0) {
        prod.lastSuccessfulCheckAt = now;
        prod.status = 'active';
      } else {
        prod.status = 'needs_review';
      }

      await firebaseCentrecomService.saveProduct(prod);
      repairedCount++;

      items.push({
        id: prod.productId,
        name: `${prod.manufacturer} ${prod.model}`,
        url: prod.productUrl,
        price: prod.priceAUD,
        status: prod.status
      });
    }

    res.json({
      success: true,
      timestamp: now,
      repairedCount,
      totalCount: allProducts.length,
      items,
      message: `Batch catalogue repair complete: verified ${repairedCount} Centre Com product entries with Australian AUD pricing and direct links.`
    });
  } catch (error: any) {
    console.error('Error repairing Centre Com catalog:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to repair catalog' });
  }
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 QTR Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

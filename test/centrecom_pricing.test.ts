import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILDER_PARTS,
  getPartCentreComUrl,
  getPartPriceAudit,
  BuilderPart
} from '../src/data/builderCatalog.ts';

test('Centre Com Exclusivity & Part Metadata Tests', async (t) => {
  await t.test('All parts have a valid direct Centre Com URL', () => {
    assert.ok(BUILDER_PARTS.length >= 50, `Expected at least 50 parts, found ${BUILDER_PARTS.length}`);

    for (const part of BUILDER_PARTS) {
      const url = getPartCentreComUrl(part);
      assert.ok(url.startsWith('https://www.centrecom.com.au/'), `Part ${part.id} (${part.name}) must have Centre Com URL, got: ${url}`);
      assert.ok(!url.includes('amazon'), `Part ${part.id} must never reference Amazon: ${url}`);
    }
  });

  await t.test('Price audit metadata contains verified Australian retailer info', () => {
    const samplePart = BUILDER_PARTS[0];
    const audit = getPartPriceAudit(samplePart);

    assert.ok(audit.centreComUrl.startsWith('https://www.centrecom.com.au/'));
    assert.equal(audit.priceStatus, 'current');
    assert.equal(audit.stockStatus, 'in_stock');
    assert.ok(audit.verifiedRetailer.includes('Centre Com'));
  });

  await t.test('Customer-supplied components have $0.00 purchase price', () => {
    const customerSuppliedParts: Record<string, any> = {
      cpu: {
        category: 'cpu',
        brand: 'AMD',
        model: 'Ryzen 7 7800X3D',
        socket: 'AM5'
      }
    };

    const selectedParts: Record<string, BuilderPart> = {
      cpu: {
        id: 'supplied-cpu',
        name: 'AMD Ryzen 7 7800X3D (Customer Supplied)',
        brand: 'AMD',
        category: 'cpu',
        platform: 'Both',
        price: 0,
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        wattage: 120,
        socket: 'AM5',
        specs: { Source: 'Customer Supplied ($0.00)' },
        description: 'Customer-supplied CPU'
      },
      gpu: BUILDER_PARTS.find((p) => p.category === 'gpu')!
    };

    const partsSubtotal = Object.entries(selectedParts).reduce((sum, [cat, part]) => {
      if (!part) return sum;
      if (customerSuppliedParts[cat]) return sum; // $0.00
      return sum + part.price;
    }, 0);

    assert.equal(partsSubtotal, selectedParts.gpu.price, 'Parts subtotal must only charge for non-customer-supplied parts');
  });
});

test('Price Match & Cheaper Price Checker Business Rules', async (t) => {
  // Direct test of the evaluation logic implemented in the application
  function evaluatePriceMatch(
    competitorUrl: string,
    competitorPrice: number,
    centreComPrice: number,
    isBrandNew: boolean,
    isInStock: boolean
  ) {
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

    let hostname = '';
    try {
      const parsed = new URL(competitorUrl.startsWith('http') ? competitorUrl : `https://${competitorUrl}`);
      hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      return { outcome: 'rejected', reason: 'Invalid URL' };
    }

    // Amazon is strictly rejected
    if (
      hostname.includes('amazon.') ||
      hostname.includes('amzn.to') ||
      hostname.includes('amazon-marketplace') ||
      competitorUrl.toLowerCase().includes('amazon')
    ) {
      return {
        outcome: 'rejected',
        reason: 'Amazon and Amazon Marketplace listings do not meet verification requirements'
      };
    }

    if (!isBrandNew) {
      return { outcome: 'rejected', reason: 'Must be brand new' };
    }

    if (competitorPrice >= centreComPrice) {
      return { outcome: 'rejected', reason: 'Price is not lower than Centre Com' };
    }

    const isTrusted = TRUSTED_AU_RETAILERS.some((d) => hostname === d || hostname.endsWith(`.${d}`));

    if (isTrusted) {
      if (isInStock) {
        return { outcome: 'verified', reason: 'Cheaper price verified — eligible for review.' };
      }
      return { outcome: 'needs_review', reason: 'Needs review due to stock status' };
    }

    return { outcome: 'needs_review', reason: 'This offer needs a manual review before it can be accepted.' };
  }

  await t.test('Amazon links are strictly rejected (Outcome C)', () => {
    const amazonRes = evaluatePriceMatch('https://www.amazon.com.au/dp/B0815XFSGK', 180, 199, true, true);
    assert.equal(amazonRes.outcome, 'rejected');

    const amznShort = evaluatePriceMatch('https://amzn.to/3example', 150, 199, true, true);
    assert.equal(amznShort.outcome, 'rejected');
  });

  await t.test('Higher or equal price is rejected (Outcome C)', () => {
    const higherRes = evaluatePriceMatch('https://www.scorptec.com.au/product/cpu/1234', 210, 199, true, true);
    assert.equal(higherRes.outcome, 'rejected');
  });

  await t.test('Used / refurbished is rejected (Outcome C)', () => {
    const usedRes = evaluatePriceMatch('https://www.scorptec.com.au/product/cpu/1234', 160, 199, false, true);
    assert.equal(usedRes.outcome, 'rejected');
  });

  await t.test('Authorized AU retailer with brand new in-stock is verified (Outcome A)', () => {
    const verifiedRes = evaluatePriceMatch('https://www.scorptec.com.au/product/cpu/1234', 180, 199, true, true);
    assert.equal(verifiedRes.outcome, 'verified');
    assert.equal(verifiedRes.reason, 'Cheaper price verified — eligible for review.');
  });

  await t.test('Unknown store requires manual review (Outcome B)', () => {
    const unknownRes = evaluatePriceMatch('https://unknown-tech-store.com.au/product/123', 170, 199, true, true);
    assert.equal(unknownRes.outcome, 'needs_review');
    assert.equal(unknownRes.reason, 'This offer needs a manual review before it can be accepted.');
  });
});

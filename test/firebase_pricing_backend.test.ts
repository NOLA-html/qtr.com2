import test from 'node:test';
import assert from 'node:assert/strict';
import { firebaseCentrecomService } from '../server/firebaseCentrecomService.ts';
import { BUILDER_PARTS } from '../src/data/builderCatalog.ts';

test('Firebase Centre Com Product Pricing Backend Tests', async (t) => {
  await t.test('1. Centre Com URL validation accepts only valid Centre Com URLs', () => {
    assert.equal(
      firebaseCentrecomService.isValidCentreComUrl('https://www.centrecom.com.au/amd-ryzen-7-7800x3d-processor'),
      true
    );
    assert.equal(
      firebaseCentrecomService.isValidCentreComUrl('https://centrecom.com.au/asus-tuf-gaming-b850m-e-wifi-motherboard'),
      true
    );
    // Amazon listings must be strictly rejected as primary source
    assert.equal(
      firebaseCentrecomService.isValidCentreComUrl('https://www.amazon.com.au/dp/B0BTZB7F88'),
      false
    );
    // Insecure HTTP or arbitrary competitor URLs must be rejected
    assert.equal(
      firebaseCentrecomService.isValidCentreComUrl('http://www.centrecom.com.au/item'),
      false
    );
    assert.equal(
      firebaseCentrecomService.isValidCentreComUrl('https://www.scorptec.com.au/product/123'),
      false
    );
  });

  await t.test('2. Catalog seed populates persistent Centre Com products with AUD currency', async () => {
    await firebaseCentrecomService.seedCatalogFromParts(BUILDER_PARTS);
    const all = await firebaseCentrecomService.getAllProducts();

    assert.ok(all.length >= 50, `Expected at least 50 products, got ${all.length}`);

    for (const prod of all) {
      assert.equal(prod.retailer, 'Centre Com');
      assert.equal(prod.priceSource, 'Centre Com');
      assert.equal(prod.currency, 'AUD');
      assert.ok(prod.priceAUD !== null && prod.priceAUD >= 0, `Product ${prod.productId} must have valid AUD price`);
      assert.ok(prod.lastKnownPriceAUD !== null && prod.lastKnownPriceAUD >= 0);
    }
  });

  await t.test('3. Manual administrator verification records audit notes and price history', async () => {
    const sample = (await firebaseCentrecomService.getAllProducts())[0];
    const originalPrice = sample.priceAUD || 100;
    const testPrice = originalPrice + 10;

    const updated = await firebaseCentrecomService.manualVerifyProduct(
      sample.productId,
      testPrice,
      'Unit test manual verification audit',
      'TestAdmin'
    );

    assert.equal(updated.priceAUD, testPrice);
    assert.equal(updated.lastKnownPriceAUD, testPrice);
    assert.equal(updated.status, 'active');
    assert.equal(updated.manuallyVerifiedBy, 'TestAdmin');
    assert.equal(updated.manualVerificationNote, 'Unit test manual verification audit');

    // Verify Price History record
    const history = await firebaseCentrecomService.getPriceHistory(sample.productId);
    assert.ok(history.length >= 1, 'Expected at least 1 history log');
    const latest = history[0];
    assert.equal(latest.priceAUD, testPrice);
    assert.equal(latest.verificationMethod, 'manual_admin_verification');
    assert.equal(latest.changeType, 'increase');

    // Reset price back to original
    await firebaseCentrecomService.manualVerifyProduct(
      sample.productId,
      originalPrice,
      'Reverting test price change',
      'TestAdmin'
    );
  });

  await t.test('4. Pre-checkout cart recheck accurately detects price updates and triggers confirmation', async () => {
    const sample = (await firebaseCentrecomService.getAllProducts())[0];
    const currentPrice = sample.priceAUD || 200;

    // Test case A: Prices unchanged
    const unchangedCheck = firebaseCentrecomService.recheckCart([
      { partId: sample.productId, expectedPrice: currentPrice }
    ]);
    assert.equal(unchangedCheck.hasChanges, false);
    assert.equal(unchangedCheck.requiresConfirmation, false);
    assert.equal(unchangedCheck.difference, 0);

    // Test case B: Price changed since added
    const changedCheck = firebaseCentrecomService.recheckCart([
      { partId: sample.productId, expectedPrice: currentPrice - 20 }
    ]);
    assert.equal(changedCheck.hasChanges, true);
    assert.equal(changedCheck.requiresConfirmation, true);
    assert.equal(changedCheck.difference, 20);
    assert.equal(changedCheck.verifiedItems[0].changed, true);
  });

  await t.test('5. Pricing engine stats report active metrics and scheduler status', () => {
    const stats = firebaseCentrecomService.getStats();
    assert.ok(stats.totalProducts >= 50);
    assert.ok(stats.activeCount >= 0);
    assert.ok(stats.totalHistoryRecords >= 1);
    assert.equal(stats.isSchedulerActive, true);
    assert.equal(stats.scheduledIntervalHours, 24);
  });
});

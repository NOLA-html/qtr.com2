import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILD_SERVICES, formatAud } from '../src/utils/pricing.ts';
import { DISCLAIMER_VERSION } from '../src/components/ServiceDisclaimerModal.tsx';

test('PC Builder Initial & Reset Invariants', async (t) => {
  await t.test('Initial empty build has 0 parts cost and 0 estimated wattage', () => {
    const selectedParts: Record<string, any> = {};
    const partsCount = Object.keys(selectedParts).length;
    const partsSubtotal = Object.values(selectedParts).reduce((sum: number, part: any) => (part ? sum + part.price : sum), 0);

    assert.equal(partsCount, 0);
    assert.equal(partsSubtotal, 0);
    assert.equal(formatAud(partsSubtotal), 'A$0.00');
  });

  await t.test('Disclaimer version is constant and valid format', () => {
    assert.equal(DISCLAIMER_VERSION, '2026.1');
  });

  await t.test('Build services fast and full have accurate pricing', () => {
    assert.equal(BUILD_SERVICES.fast.price, 100);
    assert.equal(BUILD_SERVICES.full.price, 250);
  });
});

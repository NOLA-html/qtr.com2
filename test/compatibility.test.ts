import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { THREE_CUSTOM_PCS, formatAud, calculatePcOrderPricing, DEFAULT_SHIPPING_CONFIG, BUILD_SERVICES } from '../src/utils/pricing.ts';
import { BUILDER_PARTS, getPartsByCategory } from '../src/data/builderCatalog.ts';

describe('Custom PC Pricing and Invariants', () => {
  test('Exact base prices of the three custom PCs must be preserved', () => {
    const eclipse = THREE_CUSTOM_PCS.find((p) => p.id === 'project-eclipse');
    const nitro = THREE_CUSTOM_PCS.find((p) => p.id === 'nitroforge-x3060');
    const overdrive = THREE_CUSTOM_PCS.find((p) => p.id === 'overdrive');

    assert.ok(eclipse, 'Project Eclipse must exist');
    assert.ok(nitro, 'NITROFORGE X3060 must exist');
    assert.ok(overdrive, 'OVERDRIVE must exist');

    assert.equal(eclipse.basePrice, 1428.0, 'Project Eclipse must be exactly $1,428.00 AUD');
    assert.equal(nitro.basePrice, 2015.0, 'NITROFORGE X3060 must be exactly $2,015.00 AUD');
    assert.equal(overdrive.basePrice, 3743.0, 'OVERDRIVE must be exactly $3,743.00 AUD');
  });

  test('Pricing calculation correctly applies build services and delivery', () => {
    const overdrive = THREE_CUSTOM_PCS.find((p) => p.id === 'overdrive')!;

    // Test Fast Build ($100) + Normal Delivery ($25)
    const fastNormal = calculatePcOrderPricing(overdrive, 'fast', 'normal', DEFAULT_SHIPPING_CONFIG);
    assert.equal(fastNormal.partsAndWindowsPrice, 3743.0);
    assert.equal(fastNormal.buildServicePrice, 100.0);
    assert.equal(fastNormal.deliveryPrice, 25.0);
    assert.equal(fastNormal.finalTotal, 3743.0 + 100.0 + 25.0);

    // Test Full Build ($250) + Express Delivery ($49)
    const fullExpress = calculatePcOrderPricing(overdrive, 'full', 'express', DEFAULT_SHIPPING_CONFIG);
    assert.equal(fullExpress.partsAndWindowsPrice, 3743.0);
    assert.equal(fullExpress.buildServicePrice, 250.0);
    assert.equal(fullExpress.deliveryPrice, 49.0);
    assert.equal(fullExpress.finalTotal, 3743.0 + 250.0 + 49.0);
  });
});

describe('Builder Catalog & Hardware Compatibility Rules', () => {
  test('Catalog has AMD and Intel processors and motherboards', () => {
    const cpus = getPartsByCategory('cpu');
    const mobos = getPartsByCategory('motherboard');

    assert.ok(cpus.length >= 6, 'Must have at least 6 CPUs');
    assert.ok(mobos.length >= 6, 'Must have at least 6 motherboards');

    const amdCpus = cpus.filter((c) => c.platform === 'AMD');
    const intelCpus = cpus.filter((c) => c.platform === 'Intel');
    assert.ok(amdCpus.length >= 3, 'Must have AMD CPUs');
    assert.ok(intelCpus.length >= 3, 'Must have Intel CPUs');

    const am5Mobos = mobos.filter((m) => m.socket === 'AM5');
    const lga1700Mobos = mobos.filter((m) => m.socket === 'LGA1700');
    assert.ok(am5Mobos.length >= 2, 'Must have AM5 motherboards');
    assert.ok(lga1700Mobos.length >= 2, 'Must have LGA1700 motherboards');
  });

  test('Motherboard moboMapUrl and 3D preview metadata are populated', () => {
    const mobos = getPartsByCategory('motherboard');
    for (const mobo of mobos) {
      assert.ok(mobo.moboMapUrl, `Mobo ${mobo.name} must have a verified MoboMaps URL`);
      assert.ok(mobo.socket, `Mobo ${mobo.name} must have a socket defined`);
      assert.ok(mobo.ramType, `Mobo ${mobo.name} must specify RAM generation`);
    }
  });

  test('Socket compatibility check validates matching sockets', () => {
    const r5_7600 = BUILDER_PARTS.find((p) => p.id === 'cpu-r5-7600')!;
    const b850m = BUILDER_PARTS.find((p) => p.id === 'mb-asus-b850m-e')!;
    const z790 = BUILDER_PARTS.find((p) => p.id === 'mb-asus-z790-plus' || p.id === 'mb-msi-z790-tomahawk')!;

    assert.ok(r5_7600, 'CPU r5-7600 should exist');
    assert.ok(b850m, 'Mobo b850m should exist');
    assert.ok(z790, 'Mobo z790 should exist');

    assert.equal(r5_7600.socket, 'AM5');
    assert.equal(b850m.socket, 'AM5');
    assert.equal(z790.socket, 'LGA1700');

    // Matching socket
    assert.equal(r5_7600.socket === b850m.socket, true);
    // Incompatible socket
    assert.equal((r5_7600.socket as string) === (z790.socket as string), false);
  });

  test('Memory DDR generation compatibility validates matching DDR types', () => {
    const b850m = BUILDER_PARTS.find((p) => p.id === 'mb-asus-b850m-e')!; // DDR5
    const b760m_d4 = BUILDER_PARTS.find((p) => p.id === 'mb-msi-b760m-d4')!; // DDR4

    const ddr4Ram = BUILDER_PARTS.find((p) => p.id === 'ram-corsair-16-d4' || p.id === 'ram-gskill-trident-16-d4' || p.id === 'ram-gskill-16-d4')!;
    const ddr5Ram = BUILDER_PARTS.find((p) => p.id === 'ram-patriot-16-d5' || p.id === 'ram-gskill-32-d5-6000')!;

    assert.ok(b850m);
    assert.ok(b760m_d4);
    assert.ok(ddr4Ram);
    assert.ok(ddr5Ram);

    assert.equal(b850m.ramType, 'DDR5');
    assert.equal(ddr5Ram.ramType, 'DDR5');
    assert.equal(b760m_d4.ramType, 'DDR4');
    assert.equal(ddr4Ram.ramType, 'DDR4');

    assert.equal(b850m.ramType === ddr5Ram.ramType, true);
    assert.equal((b850m.ramType as string) === (ddr4Ram.ramType as string), false);
  });
});

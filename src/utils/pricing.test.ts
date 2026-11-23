import test from 'node:test';
import assert from 'node:assert/strict';
import {
  THREE_CUSTOM_PCS,
  getCustomPcById,
  calculatePcOrderPricing,
  BUILD_SERVICES,
  DEFAULT_SHIPPING_CONFIG
} from './pricing';

test('PC 1: Project Eclipse specifications and exact base parts + Windows price sum', () => {
  const eclipse = getCustomPcById('project-eclipse');
  assert.ok(eclipse, 'Project Eclipse must exist in catalogue');
  assert.equal(eclipse.name, 'Project Eclipse');
  assert.equal(eclipse.basePrice, 1428.0);

  // Sum all individual component prices
  const sum = eclipse.components.reduce((acc, c) => acc + c.price, 0);
  assert.equal(sum, 1428.0, 'Sum of parts and Windows 11 Home must equal $1,428.00 AUD');

  // Verify Windows 11 Home is included in the parts
  const osComp = eclipse.components.find((c) => c.category === 'Operating System');
  assert.ok(osComp, 'Operating system component must be present');
  assert.equal(osComp.price, 179.0, 'Windows 11 Home OEM license must be $179.00');
});

test('PC 2: NITROFORGE X3060 specifications and exact base parts + Windows price sum', () => {
  const nitro = getCustomPcById('nitroforge-x3060');
  assert.ok(nitro, 'NITROFORGE X3060 must exist in catalogue');
  assert.equal(nitro.name, 'NITROFORGE X3060');
  assert.equal(nitro.basePrice, 2015.0);

  // Sum all individual component prices
  const sum = nitro.components.reduce((acc, c) => acc + c.price, 0);
  assert.equal(sum, 2015.0, 'Sum of parts and Windows 11 Home must equal $2,015.00 AUD');

  // Verify Antec GSK850 V2 AU 850W PSU and exact component prices
  const psuComp = nitro.components.find((c) => c.category === 'PSU');
  assert.ok(psuComp, 'PSU must be present');
  assert.equal(psuComp.price, 129.0);
  assert.match(psuComp.name, /Antec GSK850 V2/);
});

test('PC 3: OVERDRIVE specifications and exact base parts + Windows price sum', () => {
  const overdrive = getCustomPcById('overdrive');
  assert.ok(overdrive, 'OVERDRIVE must exist in catalogue');
  assert.equal(overdrive.name, 'OVERDRIVE');
  assert.equal(overdrive.basePrice, 3743.0);

  // Sum all individual component prices
  const sum = overdrive.components.reduce((acc, c) => acc + c.price, 0);
  assert.equal(sum, 3743.0, 'Sum of parts and Windows 11 Home must equal $3,743.00 AUD');

  // Verify 9800X3D and 9070 XT components
  const cpuComp = overdrive.components.find((c) => c.category === 'CPU');
  assert.equal(cpuComp?.price, 599.0);
  const gpuComp = overdrive.components.find((c) => c.category === 'GPU');
  assert.equal(gpuComp?.price, 1229.0);
});

test('Build Service reference totals before delivery strictly match requirements table', () => {
  const eclipse = getCustomPcById('project-eclipse')!;
  const nitro = getCustomPcById('nitroforge-x3060')!;
  const overdrive = getCustomPcById('overdrive')!;

  // 1. Fast Build ($100.00)
  const eclipseFast = calculatePcOrderPricing(eclipse, 'fast', 'normal');
  assert.equal(eclipseFast.subtotalBeforeDelivery, 1528.0, 'Project Eclipse + Fast Build must be $1,528.00');

  const nitroFast = calculatePcOrderPricing(nitro, 'fast', 'normal');
  assert.equal(nitroFast.subtotalBeforeDelivery, 2115.0, 'NITROFORGE X3060 + Fast Build must be $2,115.00');

  const overdriveFast = calculatePcOrderPricing(overdrive, 'fast', 'normal');
  assert.equal(overdriveFast.subtotalBeforeDelivery, 3843.0, 'OVERDRIVE + Fast Build must be $3,843.00');

  // 2. Full Build & Setup ($250.00)
  const eclipseFull = calculatePcOrderPricing(eclipse, 'full', 'normal');
  assert.equal(eclipseFull.subtotalBeforeDelivery, 1678.0, 'Project Eclipse + Full Build & Setup must be $1,678.00');

  const nitroFull = calculatePcOrderPricing(nitro, 'full', 'normal');
  assert.equal(nitroFull.subtotalBeforeDelivery, 2265.0, 'NITROFORGE X3060 + Full Build & Setup must be $2,265.00');

  const overdriveFull = calculatePcOrderPricing(overdrive, 'full', 'normal');
  assert.equal(overdriveFull.subtotalBeforeDelivery, 3993.0, 'OVERDRIVE + Full Build & Setup must be $3,993.00');
});

test('Delivery charges are added dynamically and separately to final total', () => {
  const nitro = getCustomPcById('nitroforge-x3060')!;

  // Fast build + normal delivery ($25.00)
  const nitroFastNormal = calculatePcOrderPricing(nitro, 'fast', 'normal', DEFAULT_SHIPPING_CONFIG);
  assert.equal(nitroFastNormal.partsAndWindowsPrice, 2015.0);
  assert.equal(nitroFastNormal.buildServicePrice, 100.0);
  assert.equal(nitroFastNormal.deliveryPrice, 25.0);
  assert.equal(nitroFastNormal.finalTotal, 2015.0 + 100.0 + 25.0); // 2140.0

  // Full build + express delivery ($49.00)
  const nitroFullExpress = calculatePcOrderPricing(nitro, 'full', 'express', DEFAULT_SHIPPING_CONFIG);
  assert.equal(nitroFullExpress.partsAndWindowsPrice, 2015.0);
  assert.equal(nitroFullExpress.buildServicePrice, 250.0);
  assert.equal(nitroFullExpress.deliveryPrice, 49.0);
  assert.equal(nitroFullExpress.finalTotal, 2015.0 + 250.0 + 49.0); // 2314.0
});

test('Build services and delivery rates definitions are correctly structured', () => {
  assert.equal(BUILD_SERVICES.fast.price, 100.0);
  assert.equal(BUILD_SERVICES.full.price, 250.0);
  assert.ok(BUILD_SERVICES.fast.includes.length > 0);
  assert.ok(BUILD_SERVICES.fast.doesNotInclude.length > 0);
  assert.ok(BUILD_SERVICES.full.includes.length > 0);
});

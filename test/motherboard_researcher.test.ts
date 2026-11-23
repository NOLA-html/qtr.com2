import test from 'node:test';
import assert from 'node:assert/strict';
import {
  researchMotherboardSpecs,
  evaluateMotherboardBuildCompatibility
} from '../server/aiMotherboardResearcher.ts';

test('AI Motherboard Researcher & Compatibility Engine Tests', async (t) => {
  await t.test('1. Researches and extracts AM5 motherboard specs accurately', async () => {
    const specs = await researchMotherboardSpecs('ASUS', 'TUF GAMING B650-PLUS WIFI');
    assert.equal(specs.socket, 'AM5');
    assert.equal(specs.ramType, 'DDR5');
    assert.equal(specs.formFactor, 'ATX');
    assert.equal(specs.identified, true);
    assert.ok(specs.sourcesUsed.length > 0);
  });

  await t.test('2. Researches and extracts Intel LGA1700 motherboard specs accurately', async () => {
    const specs = await researchMotherboardSpecs('MSI', 'PRO Z790-P WIFI');
    assert.equal(specs.socket, 'LGA1700');
    assert.equal(specs.ramType, 'DDR5');
    assert.equal(specs.formFactor, 'ATX');
    assert.equal(specs.identified, true);
  });

  await t.test('3. Compatible configuration evaluates to compatible status', async () => {
    const specs = await researchMotherboardSpecs('ASUS', 'TUF GAMING B650-PLUS WIFI');
    const buildParts = {
      cpu: { name: 'AMD Ryzen 7 7800X3D', socket: 'AM5' },
      ram: { name: 'Corsair Vengeance 32GB (2x16GB) DDR5-6000', ramType: 'DDR5' },
      case: { name: 'NZXT H5 Flow RGB ATX Mid Tower Case', supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'] },
      gpu: { name: 'Gigabyte GeForce RTX 4070 SUPER WINDFORCE OC 12GB' }
    };

    const report = evaluateMotherboardBuildCompatibility(specs, buildParts as any);
    assert.equal(report.status, 'compatible');
    assert.equal(report.canProceedToAssembly, true);
    assert.ok(report.score >= 90);
  });

  await t.test('4. Socket mismatch (AM5 board + AM4 CPU) is strictly flagged as incompatible and blocks assembly', async () => {
    const specs = await researchMotherboardSpecs('ASUS', 'TUF GAMING B650-PLUS WIFI');
    const buildParts = {
      cpu: { name: 'AMD Ryzen 5 5600X', socket: 'AM4' },
      ram: { name: 'Corsair Vengeance 32GB DDR5-6000', ramType: 'DDR5' }
    };

    const report = evaluateMotherboardBuildCompatibility(specs, buildParts as any);
    assert.equal(report.status, 'incompatible');
    assert.equal(report.canProceedToAssembly, false);
    const socketCheck = report.checks.find((c) => c.category === 'Socket');
    assert.ok(socketCheck);
    assert.equal(socketCheck.status, 'fail');
  });

  await t.test('5. RAM generation mismatch (DDR5 board + DDR4 RAM) is strictly flagged as incompatible and blocks assembly', async () => {
    const specs = await researchMotherboardSpecs('ASUS', 'TUF GAMING B650-PLUS WIFI');
    const buildParts = {
      cpu: { name: 'AMD Ryzen 7 7800X3D', socket: 'AM5' },
      ram: { name: 'Corsair Vengeance LPX 32GB DDR4-3200', ramType: 'DDR4' }
    };

    const report = evaluateMotherboardBuildCompatibility(specs, buildParts as any);
    assert.equal(report.status, 'incompatible');
    assert.equal(report.canProceedToAssembly, false);
    const ramCheck = report.checks.find((c) => c.category === 'Memory');
    assert.ok(ramCheck);
    assert.equal(ramCheck.status, 'fail');
  });

  await t.test('6. Form factor clearance mismatch (ATX board in Mini-ITX chassis) is strictly flagged as incompatible and blocks assembly', async () => {
    const specs = await researchMotherboardSpecs('ASUS', 'TUF GAMING B650-PLUS WIFI'); // ATX
    const buildParts = {
      cpu: { name: 'AMD Ryzen 7 7800X3D', socket: 'AM5' },
      case: { name: 'Fractal Terra Mini-ITX Case', supportedFormFactors: ['Mini-ITX'] }
    };

    const report = evaluateMotherboardBuildCompatibility(specs, buildParts as any);
    assert.equal(report.status, 'incompatible');
    assert.equal(report.canProceedToAssembly, false);
    const caseCheck = report.checks.find((c) => c.category === 'Form Factor');
    assert.ok(caseCheck);
    assert.equal(caseCheck.status, 'fail');
  });
});

import fs from 'fs';
jest.mock('chalk', () => ({
  __esModule: true,
  default: {
    gray: (s: string) => s,
    green: (s: string) => s,
    bold: { cyan: (s: string) => s },
  },
}));
import path from 'path';
import os from 'os';
import { buildVersionedContextMap } from '../../../scripts/phase2/core/contextMapBuilder';
import { NodeFileSystem } from '../../../scripts/phase2/infra/nodeFileSystem';
import { ChalkConsoleLogger } from '../../../scripts/phase2/infra/chalkConsoleLogger';

/**
 * Integration-style unit tests for buildVersionedContextMap.
 * They operate against a temporary directory to avoid touching the repo.
 */

describe('buildVersionedContextMap', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ctxmaptest-'));
  const diagramsDir = path.join(tmpRoot, 'DDD_Artefacts', 'docs', 'diagrams');
  const stormOutDir = path.join(tmpRoot, 'out');

  beforeAll(() => {
    fs.mkdirSync(diagramsDir, { recursive: true });
    fs.mkdirSync(stormOutDir, { recursive: true });

    // minimal canonical template with auto-generated markers
    const template = [
      '@startuml',
      "package Order {",
      '  rectangle "Order" as Order',
      '}',
      "' ==== AUTO-GENERATED START ====" ,
      "' ==== AUTO-GENERATED END ====" ,
      '@enduml',
      ''
    ].join('\n');
    fs.writeFileSync(path.join(diagramsDir, 'context_map.puml'), template, 'utf8');
  });

  afterAll(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  test('writes v1 when new arrows exist', () => {
    // arrange storm file with a new arrow
    const stormLines = [
      'Order --> Payment : PlaceOrder',
    ].join('\n');
    fs.writeFileSync(path.join(stormOutDir, 'order-storm.puml'), stormLines, 'utf8');

    // act
    buildVersionedContextMap(tmpRoot, stormOutDir, NodeFileSystem, ChalkConsoleLogger);

    // assert
    const v1Path = path.join(diagramsDir, 'context_mapv1.puml');
    expect(fs.existsSync(v1Path)).toBe(true);
    const contents = fs.readFileSync(v1Path, 'utf8');
    expect(contents).toContain('Order --> Payment');
  });

  test('does not create a new version when nothing changed', () => {
    // act again with same input
    buildVersionedContextMap(tmpRoot, stormOutDir, NodeFileSystem, ChalkConsoleLogger);

    const files = fs.readdirSync(diagramsDir).filter(f => /context_mapv\d+\.puml$/.test(f));
    expect(files.length).toBe(1); // still only v1
  });

  test('creates v2 when a new arrow is introduced', () => {
    const stormLines = [
      'Order --> Payment : PlaceOrder',
      'Payment --> Shipping : CapturePayment',
    ].join('\n');
    fs.writeFileSync(path.join(stormOutDir, 'order-storm.puml'), stormLines, 'utf8');

    buildVersionedContextMap(tmpRoot, stormOutDir, NodeFileSystem, ChalkConsoleLogger);

    const v2Path = path.join(diagramsDir, 'context_mapv2.puml');
    expect(fs.existsSync(v2Path)).toBe(true);
    const contents = fs.readFileSync(v2Path, 'utf8');
    expect(contents).toContain('Payment --> Shipping');
  });
});

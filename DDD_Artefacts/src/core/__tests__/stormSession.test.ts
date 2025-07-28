import { runVirtualStormSession } from '../../../scripts/phase2/core/stormSession';
import { InMemoryFileSystem, NullLogger, LLMPort } from '../../../scripts/phase2/core/ports';

class StubLLM implements LLMPort {
  async chatCompletion(_model: string, messages: any[]): Promise<string> {
    const last = messages[messages.length - 1].content as string;
    if (last.includes('Propose ONE bounded context')) {
      return JSON.stringify({ point: 'Accounting', note: 'Financial integration.' });
    }
    return JSON.stringify({ event: 'PaymentReceived', command: 'RegisterPayment', note: 'Capture incoming payments.' });
  }
}

describe('stormSession.runVirtualStormSession', () => {
  const fsPort = new InMemoryFileSystem();
  const root = '/proj';

  beforeAll(() => {
    // roster
    fsPort.writeUtf8(`${root}/DDD_Artefacts/automation/roster.yaml`, `- name: Alice\n- name: Bob\n`);
    // prep markdown with a single context
    const prep = [
      '# Event Storming Prep',
      '## Order - initial',
      '- OrderPlaced Event',
      '- PlaceOrder Command',
      '',
    ].join('\n');
    fsPort.writeUtf8(`${root}/DDD_Artefacts/event-storming-session-prep.md`, prep);

    // diagrams template required by context map builder
    const template = ['@startuml', 'package Order {', '  rectangle "Order" as Order', '}', '@enduml', ''].join('\n');
    fsPort.writeUtf8(`${root}/DDD_Artefacts/docs/diagrams/context_map.puml`, template);
  });

  test('writes storm outputs and context map', async () => {
    await runVirtualStormSession(root, { fs: fsPort, logger: NullLogger, llm: new StubLLM() });

    // storm output exists
    const stormJsonPath = `${root}/DDD_Artefacts/virtual-storm/order-storm.json`;
    expect(fsPort.exists(stormJsonPath)).toBe(true);
    const stormOut = JSON.parse(fsPort.readUtf8(stormJsonPath));
    expect(stormOut.events).toContain('PaymentReceived');
    expect(stormOut.commands).toContain('RegisterPayment');

    // context map version created
    const mapV1 = `${root}/DDD_Artefacts/docs/diagrams/context_mapv1.puml`;
    expect(fsPort.exists(mapV1)).toBe(true);
  });
});

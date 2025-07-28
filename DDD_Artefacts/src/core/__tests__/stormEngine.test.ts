import { brainstormContext, BrainstormInput } from '../../../scripts/phase2/core/stormEngine';
import { LLMPort, NullLogger } from '../../../scripts/phase2/core/ports';

class StubLLM implements LLMPort {
  async chatCompletion(_model: string, messages: any[]): Promise<string> {
    const lastUser = messages[messages.length - 1].content as string;
    if (lastUser.includes('Propose ONE bounded context')) {
      return JSON.stringify({ point: 'Accounting', note: 'Because financial reconciliation is required.' });
    }
    if (lastUser.includes('Propose ONE new business domain event')) {
      return JSON.stringify({ event: 'PaymentReceived', command: 'RegisterPayment', note: 'Captures payment events.' });
    }
    return '{}';
  }
}

describe('stormEngine.brainstormContext', () => {
  const input: BrainstormInput = {
    contextName: 'Order',
    knownEvents: [],
    knownCommands: [],
    knownIntegrationPoints: [],
    panelAgents: [
      { name: 'Alice', category: 'Domain Expert' },
      { name: 'Bob', category: 'Architect' },
    ],
    rounds: 1,
  };

  test('aggregates new artefacts from LLM', async () => {
    const out = await brainstormContext(input, { llm: new StubLLM(), logger: NullLogger });

    expect(out.events).toContain('PaymentReceived');
    expect(out.commands).toContain('RegisterPayment');
    expect(out.integrationPoints).toContain('Accounting');
    expect(out.notes.length).toBeGreaterThan(0);
  });
});

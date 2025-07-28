export interface RawAgent {
  name: string;
  category: string;
  expertise?: string[];
  contexts?: string[];
}

export interface StormOutput {
  panel?: string[];
  context: string;
  events: string[];
  commands: string[];
  notes: string[];
  integrationPoints: string[];
  nextSteps: string[];
}

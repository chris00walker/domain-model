import { z } from "zod";

export const scanGapsInputSchema = z.object({}).strict();
export const scanGapsOutputSchema = z.object({
  content: z.string().describe("Markdown list of gaps")
}).strict();

export const buildMatrixInputSchema = z.object({}).strict();
export const buildMatrixOutputSchema = z.object({
  content: z.string().describe("Context dependency matrix markdown")
}).strict();

export const planImplementationInputSchema = z.object({}).strict();
export const planImplementationOutputSchema = z.object({
  content: z.string().describe("Implementation plan markdown")
}).strict();

export const prepareSessionInputSchema = z.object({
  contextFilter: z.string().optional().describe("Optional context filter for session prep")
}).strict();
export const prepareSessionOutputSchema = z.object({
  content: z.string().describe("Session preparation markdown")
}).strict();

export const generateBriefInputSchema = z.object({}).strict();
export const generateBriefOutputSchema = z.object({
  content: z.string().describe("Event storming brief markdown")
}).strict();

export const orchestrateDomainInputSchema = z.object({
  contextFilter: z.string().optional().describe("Optional context filter for full discovery")
}).strict();
export const orchestrateDomainOutputSchema = z.object({
  orchestrationPlan: z.string().describe("Full discovery orchestration plan markdown")
}).strict();

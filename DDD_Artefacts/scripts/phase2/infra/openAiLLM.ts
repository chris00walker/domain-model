import OpenAI from "openai";
import { ChatMessage, LLMPort } from "../core/ports";

const client = process.env.OPENAI_API_KEY ? new OpenAI() : null;

export const OpenAiLLM: LLMPort = {
  async chatCompletion(model: string, messages: ChatMessage[], temperature: number): Promise<string> {
    if (!client) return "{}";
    const resp = await client.chat.completions.create({
      model,
      temperature,
      messages,
    });
    return resp.choices[0].message.content || "";
  },
};

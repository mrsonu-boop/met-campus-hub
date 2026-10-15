import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter('qwen/qwen-2.5-72b-instruct'),
    system: 'You are the official SPPU AI Study Vault assistant for MET BKC IOE Nashik students. Answer academic, engineering syllabus, and exam preparation queries clearly based on SPPU unit guidelines.',
    messages,
  });

  return result.toTextStreamResponse();
}
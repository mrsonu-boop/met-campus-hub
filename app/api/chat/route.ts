import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fastest flash tier — kept intentionally small for first-token latency.
// Passed bare (no `models/` prefix); the SDK adds it when calling the API.
const MODEL_CANDIDATES = ['gemini-2.5-flash'] as const;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing from .env.local');
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

function isServiceUnavailable(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { status, message } = error as { status?: unknown; message?: unknown };
  return status === 503 || (typeof message === 'string' && message.includes('503'));
}

function isModelNotFound(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { status, message } = error as { status?: unknown; message?: unknown };
  const text = typeof message === 'string' ? message : '';
  return status === 404 || text.includes('NOT_FOUND') || text.includes('not found for API version');
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

const encoder = new TextEncoder();

type GeminiContents = Parameters<GoogleGenAI['models']['generateContentStream']>[0]['contents'];

/**
 * Opens a streaming generator, walking the candidate model list. A 503 is
 * retried once after a short pause; a 404 / NOT_FOUND moves to the next model.
 */
async function openGenerator(client: GoogleGenAI, contents: GeminiContents) {
  let lastError: unknown = null;

  for (const model of MODEL_CANDIDATES) {
    const generate = () => client.models.generateContentStream({ model, contents });

    try {
      return await generate();
    } catch (apiError: unknown) {
      if (isModelNotFound(apiError) && model !== MODEL_CANDIDATES[MODEL_CANDIDATES.length - 1]) {
        console.warn(`Gemini model "${model}" unavailable, falling back to next candidate...`);
        lastError = apiError;
        continue;
      }
      if (isServiceUnavailable(apiError)) {
        console.warn(`Gemini model "${model}" returned 503, retrying in 1 second...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          return await generate();
        } catch /* retry also failed */ {
          /* fall through to rethrow below */
        }
      }
      throw apiError;
    }
  }

  throw lastError ?? new Error('No Gemini model candidate could be started');
}

export async function POST(req: Request) {
  let contents: GeminiContents;

  try {
    const body = await req.json();
    contents = body.contents as GeminiContents;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  if (!contents) {
    return NextResponse.json({ error: 'Message contents required' }, { status: 400 });
  }

  // Stream the model output token-by-token so the drawer can render it live.
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (text: string) => controller.enqueue(encoder.encode(text));

      let generator: Awaited<ReturnType<GoogleGenAI['models']['generateContentStream']>>;
      try {
        generator = await openGenerator(getClient(), contents);
      } catch (error: unknown) {
        console.error('Gemini stream start error:', error);
        enqueue(`\n[AI_ERROR]: ${errorMessage(error, 'Failed to start the study assistant')}`);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
        return;
      }

      try {
        let sawText = false;
        for await (const chunk of generator) {
          if (chunk.text) {
            sawText = true;
            enqueue(chunk.text);
          }
        }
        if (!sawText) {
          enqueue('\n[AI_ERROR]: The model returned an empty response. Try rephrasing.');
        }
      } catch (error: unknown) {
        console.error('Gemini stream interrupted:', error);
        enqueue(`\n[AI_ERROR]: ${errorMessage(error, 'The stream was interrupted')}`);
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
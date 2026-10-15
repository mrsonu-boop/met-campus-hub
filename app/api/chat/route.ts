import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Models are attempted in order. Each string is the raw model name (no
// `models/` prefix — the SDK adds it when calling the API). Ordering favors the
// flash tiers that are consistently healthy; newer tiers can be quota- or
// capacity-limited (429/503) but still act as fallbacks, and the deprecated
// 2.5 tier is a last resort. 503 capacity spikes are retried a couple times
// with backoff before moving on; 429/404 fail over immediately.
const MODEL_CANDIDATES = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
  'gemini-omni-1.1-flash',
] as const;

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

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function errorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const { status } = error as { status?: unknown };
  return typeof status === 'number' ? status : undefined;
}

const encoder = new TextEncoder();

type GeminiContents = Parameters<GoogleGenAI['models']['generateContentStream']>[0]['contents'];

type GeminiStream = Awaited<ReturnType<GoogleGenAI['models']['generateContentStream']>>;

interface CandidateFailure {
  model: string;
  message: string;
  status?: number;
  retried?: boolean;
}

/**
 * Tries each model candidate in sequence and returns the first stream that
 * opens, along with every failure observed along the way. A 503 is retried once
 * after a short pause before moving on; other errors move to the next model.
 */
async function openFirstGenerator(
  api: GoogleGenAI,
  contents: GeminiContents,
): Promise<{ generator: GeminiStream | null; failures: CandidateFailure[] }> {
  const failures: CandidateFailure[] = [];

  for (const model of MODEL_CANDIDATES) {
    const generate = () => api.models.generateContentStream({ model, contents });

    try {
      return { generator: await generate(), failures };
    } catch (firstError: unknown) {
      const failure: CandidateFailure = {
        model,
        message: errorMessage(firstError, 'unknown error'),
        status: errorStatus(firstError),
      };

      if (isServiceUnavailable(firstError)) {
        console.warn(`Gemini model "${model}" returned 503, one quick retry...`);
        const delaysMs = [500];
        let lastError: unknown = firstError;
        for (const delayMs of delaysMs) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          try {
            return { generator: await generate(), failures };
          } catch (retryError: unknown) {
            lastError = retryError;
          }
        }
        failure.message = errorMessage(lastError, 'unknown error');
        failure.status = errorStatus(lastError);
        failure.retried = true;
      } else {
        console.warn(`Gemini model "${model}" failed: ${failure.message}`);
      }

      failures.push(failure);
    }
  }

  return { generator: null, failures };
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

  // Open the generator before replying so a total failure can be reported as a
  // structured JSON error instead of a truncated stream.
  const { generator, failures } = await openFirstGenerator(getClient(), contents);

  if (!generator) {
    console.error('All Gemini model candidates failed:', failures);
    return NextResponse.json(
      {
        error:
          'The study assistant could not reach Gemini right now. Try again in a moment.',
        candidates: failures,
      },
      { status: 502 },
    );
  }

  // Stream the model output token-by-token so the drawer can render it live.
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (text: string) => controller.enqueue(encoder.encode(text));

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
        enqueue('\n[AI_ERROR]: The connection dropped before the answer finished. Please try again.');
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
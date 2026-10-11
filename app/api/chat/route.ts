import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'gemini-3.8-flash';

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

const encoder = new TextEncoder();

type GeminiContents = Parameters<GoogleGenAI['models']['generateContentStream']>[0]['contents'];

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
    const generate = () =>
      getClient().models.generateContentStream({ model: MODEL, contents });

        try {
          generator = await generate();
        } catch (apiError: unknown) {
          // If 503 temporary high-demand occurs, retry once after 1 second.
          if (isServiceUnavailable(apiError)) {
            console.warn('Gemini 503 detected, retrying request in 1 second...');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            generator = await generate();
          } else {
            throw apiError;
          }
        }
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
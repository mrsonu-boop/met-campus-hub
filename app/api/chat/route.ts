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

export async function POST(req: Request) {
  try {
    const { contents } = await req.json();

    if (!contents) {
      return NextResponse.json({ error: 'Message contents required' }, { status: 400 });
    }

    const generate = () => getClient().models.generateContent({ model: MODEL, contents });

    let response: Awaited<ReturnType<typeof generate>>;
    try {
      // Primary API call
      response = await generate();
    } catch (apiError: unknown) {
      // If 503 temporary high-demand occurs, retry once after 1 second
      if (isServiceUnavailable(apiError)) {
        console.warn('Gemini 503 detected, retrying request in 1 second...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        response = await generate();
      } else {
        throw apiError;
      }
    }

    return NextResponse.json({ text: response.text });
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: errorMessage(error, 'Failed to process study request') },
      { status: 500 }
    );
  }
}
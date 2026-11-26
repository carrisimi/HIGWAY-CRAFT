import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AddressInfo } from 'node:net';

test('serverless API health and missing-key responses are safe', async () => {
  const previousVercel = process.env.VERCEL;
  const previousGemini = process.env.GEMINI_API_KEY;
  const previousMaps = process.env.VITE_GOOGLE_MAPS_API_KEY;
  process.env.VERCEL = '1';
  delete process.env.GEMINI_API_KEY;
  delete process.env.VITE_GOOGLE_MAPS_API_KEY;

  const { createHighwayCraftServer } = await import('../../server.ts');
  const server = await createHighwayCraftServer({ serveFrontend: false });

  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const health = await fetch(`${baseUrl}/api/health`);
    assert.equal(health.status, 200);
    const status = (await health.json()) as {
      ok: boolean;
      geminiConfigured: boolean;
      mapsConfigured: boolean;
    };
    assert.equal(status.ok, true);
    assert.equal(status.geminiConfigured, false);
    assert.equal(status.mapsConfigured, false);

    const ai = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Explain the UK zebra crossing rule.' }),
    });
    assert.equal(ai.status, 503);
    const error = (await ai.json()) as { error?: string };
    assert.match(error.error ?? '', /Gemini API key is not configured/);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
    if (previousGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousGemini;
    if (previousMaps === undefined) delete process.env.VITE_GOOGLE_MAPS_API_KEY;
    else process.env.VITE_GOOGLE_MAPS_API_KEY = previousMaps;
  }
});

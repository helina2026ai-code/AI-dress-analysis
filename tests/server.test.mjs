import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const allowedOrigin = 'https://helina2026ai-code.github.io';

async function startTestServer(t, apiKey) {
  const portReservation = createServer();
  await new Promise((resolve) => portReservation.listen(0, '127.0.0.1', resolve));
  const port = portReservation.address().port;
  await new Promise((resolve) => portReservation.close(resolve));
  const child = spawn(process.execPath, [
    '--import', 'tsx', '--import', './tests/mock-gemini.mjs', './scripts/start.mjs',
  ], {
    cwd: projectRoot,
    env: {
      ...process.env, GEMINI_API_KEY: apiKey, HOST: '127.0.0.1',
      PORT: String(port), ALLOWED_ORIGINS: allowedOrigin,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill());
  await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('Test server startup timed out')), 15000);
    child.stdout.on('data', (chunk) => {
      output += chunk;
      if (output.includes('mode: production')) { clearTimeout(timeout); resolve(); }
    });
    child.on('error', (error) => { clearTimeout(timeout); reject(error); });
    child.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Test server exited with ${code}`));
    });
    child.stderr.on('data', (chunk) => { output += chunk; });
  });
  return `http://127.0.0.1:${port}`;
}

test('production starts without a key and reports unavailable AI services', async (t) => {
  const url = await startTestServer(t, '');
  assert.equal((await fetch(url)).status, 200);
  assert.deepEqual(await (await fetch(`${url}/api/health`)).json(), {
    status: 'ok', aiConfigured: false,
  });
  const response = await fetch(`${url}/api/stylist/analyze`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /尚未完成設定/);
});

test('Pages CORS, image analysis, WAV speech and API errors work through HTTP', async (t) => {
  const url = await startTestServer(t, 'test-key');
  const preflight = await fetch(`${url}/api/stylist/analyze`, {
    method: 'OPTIONS', headers: { Origin: allowedOrigin },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), allowedOrigin);
  const unknownOrigin = await fetch(`${url}/api/health`, {
    headers: { Origin: 'https://unrelated.example' },
  });
  assert.equal(unknownOrigin.headers.get('access-control-allow-origin'), null);
  const post = (pathname, body) => fetch(`${url}${pathname}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: allowedOrigin },
    body: JSON.stringify(body),
  });
  const image = 'data:image/jpeg;base64,dGVzdA==';
  const analysis = await post('/api/stylist/analyze', { imageBase64: image, occasion: '測試場合' });
  const diagnosis = await analysis.json();
  assert.equal(analysis.status, 200, JSON.stringify(diagnosis));
  assert.equal(analysis.headers.get('access-control-allow-origin'), allowedOrigin);
  assert.equal(diagnosis.overallScore, 88);
  assert.equal(diagnosis.processedImage, image);
  const speech = await post('/api/stylist/tts', { text: diagnosis.spokenCritique });
  assert.equal(speech.status, 200);
  const audio = await speech.json();
  assert.equal(audio.format, 'audio/wav');
  assert.equal(Buffer.from(audio.audioData.split(',')[1], 'base64').toString(), 'RIFF-test-WAVE');
  assert.equal((await post('/api/stylist/analyze', { imageBase64: 42 })).status, 400);
  assert.equal((await post('/api/stylist/tts', { text: 42 })).status, 400);
  const unknownApi = await fetch(`${url}/api/does-not-exist`);
  assert.equal(unknownApi.status, 404);
  assert.match(unknownApi.headers.get('content-type'), /application\/json/);
});

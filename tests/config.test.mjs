import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { transform } from 'esbuild';

const source = await readFile(new URL('../src/config.ts', import.meta.url), 'utf8');
async function loadBuildConfig(staticDemo, apiBaseUrl) {
  const result = await transform(source, {
    loader: 'ts', format: 'esm',
    define: {
      'import.meta.env.VITE_STATIC_DEMO': JSON.stringify(staticDemo),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
    },
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`);
}

test('Pages remains a demo until an external backend is configured', async () => {
  assert.equal((await loadBuildConfig('true', '')).IS_STATIC_DEMO, true);
  const connected = await loadBuildConfig('true', ' https://backend.example.invalid/// ');
  assert.equal(connected.IS_STATIC_DEMO, false);
  assert.equal(connected.getApiUrl('/api/stylist/analyze'),
    'https://backend.example.invalid/api/stylist/analyze');
});

test('Docker and local full AI builds use their own server by default', async () => {
  const config = await loadBuildConfig('false', '');
  assert.equal(config.IS_STATIC_DEMO, false);
  assert.equal(config.getApiUrl('/api/stylist/tts'), '/api/stylist/tts');
});

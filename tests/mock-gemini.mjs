import { registerHooks } from 'node:module';

// Redirect the server's SDK import in test processes so no Gemini traffic is sent.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@google/genai' && context.parentURL?.endsWith('/server.ts')) {
      return { url: new URL('./fake-gemini.mjs', import.meta.url).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

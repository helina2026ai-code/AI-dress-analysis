import assert from 'node:assert/strict';
export { Type } from '@google/genai';

export class GoogleGenAI {
  models = {
    generateContent: async (request) => {
      assert.equal(request.contents.parts[0].inlineData.data, 'dGVzdA==');
      assert.match(request.contents.parts[1].text, /測試場合/);
      return { text: JSON.stringify({ overallScore: 88, spokenCritique: '測試講評' }) };
    },
  };
  interactions = {
    create: async (request) => {
      assert.equal(request.input[0].content[0].text, '測試講評');
      assert.equal(request.generation_config.speech_config[0].voice, 'Kore');
      assert.equal(request.response_format.mime_type, 'audio/wav');
      assert.equal(request.store, false);
      return { output_audio: { data: Buffer.from('RIFF-test-WAVE').toString('base64') } };
    },
  };
}

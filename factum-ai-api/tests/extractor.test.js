import test from 'node:test';
import assert from 'node:assert/strict';
import { makeCacheKey } from '../services/cache.js';
import { prepareModelInput } from '../services/extractor.js';

test('makeCacheKey is deterministic', () => {
  const a = makeCacheKey('https://example.com', 'hola');
  const b = makeCacheKey('https://example.com', 'hola');
  assert.equal(a, b);
});

test('prepareModelInput limits secondary claims and passages', () => {
  const result = prepareModelInput({
    postText: 'Afirmación principal. Segunda. Tercera. Cuarta.',
    extraction: {
      metadata: { title: 'Titulo', description: 'Desc' },
      keyPassages: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6']
    }
  });

  assert.equal(result.secondary_claims.length, 2);
  assert.equal(result.key_passages.length, 5);
});

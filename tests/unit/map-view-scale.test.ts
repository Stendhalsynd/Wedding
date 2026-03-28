import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-8 fits the map view into the remaining viewport height instead of using fixed map height', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'Map.tsx'),
    'utf8',
  );

  assert.match(source, /min-h-full/);
  assert.match(source, /flex-1 min-h-0 flex-col/);
  assert.match(source, /flex-1 min-h-\[18rem\]/);
  assert.doesNotMatch(source, /h-\[min\(58vh,34rem\)\]/);
});

test('S3-8 keeps selected hall details visible below the map without overlaying it', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'Map.tsx'),
    'utf8',
  );

  assert.match(source, /shrink-0 border border-white\/70/);
  assert.doesNotMatch(source, /absolute bottom-4 left-4 right-4/);
});

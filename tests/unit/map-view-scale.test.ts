import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-6 gives the map view a large dedicated map area', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'Map.tsx'),
    'utf8',
  );

  assert.match(source, /h-\[min\(58vh,34rem\)\]/);
  assert.match(source, /min-h-\[24rem\]/);
});

test('S3-6 moves selected hall details below the map instead of overlaying it', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'Map.tsx'),
    'utf8',
  );

  assert.match(source, /space-y-4/);
  assert.doesNotMatch(source, /absolute bottom-4 left-4 right-4/);
});

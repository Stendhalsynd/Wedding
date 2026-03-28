import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-11 stretches the map iframe to fill the remaining viewport area', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'Map.tsx'),
    'utf8',
  );

  assert.match(source, /flex-1 min-h-0 flex-col/);
  assert.match(source, /absolute inset-0/);
  assert.match(source, /className="absolute inset-0 h-full w-full"/);
});

test('S3-11 docks selected hall details above the bottom tab bar', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'Map.tsx'),
    'utf8',
  );

  assert.match(source, /absolute inset-x-0 bottom-0/);
  assert.match(source, /pointer-events-none absolute inset-0/);
  assert.match(source, /pointer-events-auto absolute left-4 top-4/);
});

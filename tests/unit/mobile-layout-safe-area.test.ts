import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-2 uses viewport-safe layout utilities and fixes bottom navigation to the screen edge', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'components', 'layout', 'MobileLayout.tsx'),
    'utf8',
  );

  assert.match(source, /min-h-app-screen/);
  assert.match(source, /fixed inset-x-0 bottom-0/);
  assert.match(source, /pb-safe-nav/);
  assert.match(source, /bg-slate-50\/90/);
  assert.doesNotMatch(source, /absolute bottom-0/);
  assert.doesNotMatch(source, /pb-safe-bottom/);
});

test('S3-2 defines viewport and safe-area utilities in index.css', () => {
  const source = readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');

  assert.match(source, /\.min-h-app-screen/);
  assert.match(source, /100svh/);
  assert.match(source, /100dvh/);
  assert.match(source, /\.pb-safe-nav/);
  assert.match(source, /\.pt-fixed-page-header/);
  assert.match(source, /safe-area-inset-bottom/);
});

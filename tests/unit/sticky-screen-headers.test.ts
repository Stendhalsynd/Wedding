import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

const files = [
  path.join(rootDir, 'src', 'pages', 'Dashboard.tsx'),
  path.join(rootDir, 'src', 'pages', 'Map.tsx'),
  path.join(rootDir, 'src', 'pages', 'Compare.tsx'),
  path.join(rootDir, 'src', 'pages', 'Settings.tsx'),
];

test('S3-7 keeps top-level tab screens on sticky safe-top headers', () => {
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    assert.match(source, /sticky top-0/);
    assert.match(source, /pt-safe-top/);
    assert.match(source, /backdrop-blur-md/);
  }
});

test('S3-7 gives HallDetail safe-top space for the back button header', () => {
  const source = readFileSync(path.join(rootDir, 'src', 'pages', 'HallDetail.tsx'), 'utf8');

  assert.match(source, /sticky top-0/);
  assert.match(source, /pt-safe-top/);
  assert.match(source, /ArrowLeft/);
});

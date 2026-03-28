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
];

test('S3-10 keeps core tab screen titles in fixed safe-top headers', () => {
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    assert.match(source, /fixed inset-x-0 top-0/);
    assert.match(source, /pt-safe-top/);
    assert.match(source, /backdrop-blur-md/);
    assert.match(source, /pt-fixed-page-header/);
  }
});

test('S3-10 keeps HallDetail back button header below the Android top inset', () => {
  const source = readFileSync(path.join(rootDir, 'src', 'pages', 'HallDetail.tsx'), 'utf8');

  assert.match(source, /sticky top-0/);
  assert.match(source, /pt-safe-top/);
  assert.match(source, /ArrowLeft/);
});

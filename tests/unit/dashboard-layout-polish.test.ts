import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-5 keeps the dashboard title sticky and moves the add button above the nav', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'Dashboard.tsx'),
    'utf8',
  );

  assert.match(source, /sticky top-0/);
  assert.match(source, /backdrop-blur-md/);
  assert.match(source, /bottom-safe-fab/);
});

test('S3-5 reduces bottom nav height and defines a FAB safe offset utility', () => {
  const layoutSource = readFileSync(
    path.join(rootDir, 'src', 'components', 'layout', 'MobileLayout.tsx'),
    'utf8',
  );
  const cssSource = readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');

  assert.match(layoutSource, /py-3/);
  assert.doesNotMatch(layoutSource, /py-4/);
  assert.match(cssSource, /\.bottom-safe-fab/);
  assert.match(cssSource, /\.pb-safe-nav/);
  assert.match(cssSource, /5\.25rem/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-5 keeps the dashboard title fixed and moves the add button above the nav', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'Dashboard.tsx'),
    'utf8',
  );

  assert.match(source, /fixed inset-x-0 top-0/);
  assert.match(source, /backdrop-blur-md/);
  assert.match(source, /bottom-safe-fab/);
  assert.match(source, /pt-fixed-page-header/);
});

test('S3-5 anchors the bottom nav to the screen edge and keeps the FAB above it', () => {
  const layoutSource = readFileSync(
    path.join(rootDir, 'src', 'components', 'layout', 'MobileLayout.tsx'),
    'utf8',
  );
  const cssSource = readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');

  assert.match(layoutSource, /fixed inset-x-0 bottom-0 z-50/);
  assert.match(layoutSource, /bg-slate-50\/90/);
  assert.match(layoutSource, /pb-\[calc\(env\(safe-area-inset-bottom,\s*0px\)\+0\.75rem\)\]/);
  assert.match(cssSource, /\.bottom-safe-fab/);
  assert.match(cssSource, /\.pb-safe-nav/);
  assert.match(cssSource, /5\.25rem/);
});

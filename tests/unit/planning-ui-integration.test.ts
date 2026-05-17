import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S4-2 adds a protected planning route to the Wedding app', () => {
  const appSource = readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8');

  assert.match(appSource, /PlanningDashboard/);
  assert.match(appSource, /path="\/planning"/);
  assert.match(appSource, /coupleId=\{coupleId \|\| user\.uid\}/);
});

test('S4-2 exposes planning through the bottom navigation', () => {
  const layoutSource = readFileSync(path.join(rootDir, 'src', 'components', 'layout', 'MobileLayout.tsx'), 'utf8');

  assert.match(layoutSource, /\/planning/);
  assert.match(layoutSource, /관리/);
});

test('S4-2 migrates planning documents when couples connect', () => {
  const connectSource = readFileSync(path.join(rootDir, 'src', 'pages', 'ConnectCouple.tsx'), 'utf8');

  assert.match(connectSource, /migratePlanningDocuments/);
  assert.match(connectSource, /partnerData\.uid/);
});

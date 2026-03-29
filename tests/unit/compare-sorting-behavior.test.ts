import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-14 makes the status row non-sortable in CompareView', () => {
  const source = readFileSync(path.join(rootDir, 'src', 'pages', 'Compare.tsx'), 'utf8');

  assert.match(source, /key: 'status', label: '상태', sortable: false/);
  assert.doesNotMatch(source, /handleSort\('status'\)/);
});

test('S3-14 sorts rentalFee and mealFee using the currently selected hall values', () => {
  const source = readFileSync(path.join(rootDir, 'src', 'pages', 'Compare.tsx'), 'utf8');

  assert.match(source, /function getSelectedHallData/);
  assert.match(source, /if \(key === 'rentalFee' \|\| key === 'mealFee'\)/);
  assert.match(source, /return selectedHall\[key\] \?\? 0;/);
});

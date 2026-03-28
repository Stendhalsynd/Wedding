import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-12 expands HallDetail rental and meal fee ranges while keeping explicit budget thresholds', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'HallDetail.tsx'),
    'utf8',
  );

  assert.match(source, /const RENTAL_FEE_MAX = 1000;/);
  assert.match(source, /const MEAL_FEE_MAX = 10;/);
  assert.match(source, /const RENTAL_FEE_BUDGET_LIMIT = 750;/);
  assert.match(source, /const MEAL_FEE_BUDGET_LIMIT = 7\.5;/);
  assert.match(source, /max=\{RENTAL_FEE_MAX\}/);
  assert.match(source, /max=\{MEAL_FEE_MAX\}/);
});

test('S3-12 marks over-budget rental and meal fees inside HallDetail only', () => {
  const source = readFileSync(
    path.join(rootDir, 'src', 'pages', 'HallDetail.tsx'),
    'utf8',
  );

  assert.match(source, /예산 초과/);
  assert.match(source, /accent-amber-500/);
  assert.match(source, /예산 기준/);
});

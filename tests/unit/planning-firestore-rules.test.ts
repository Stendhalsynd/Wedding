import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S4-2 protects all planning collections with couple membership rules', () => {
  const rulesSource = readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');

  for (const collectionName of [
    'planningBudgetRows',
    'planningVendors',
    'planningApartments',
    'planningPolicies',
    'planningTimeline',
    'planningMetadata',
  ]) {
    assert.match(rulesSource, new RegExp(`match /${collectionName}/`));
  }

  assert.match(rulesSource, /function isValidPlanningRecord/);
  assert.match(rulesSource, /isPartOfCouple\(request\.resource\.data\.coupleId\)/);
  assert.match(rulesSource, /isPartOfCouple\(resource\.data\.coupleId\)/);
});

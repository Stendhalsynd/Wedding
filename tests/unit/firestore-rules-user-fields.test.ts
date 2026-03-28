import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-4 allows roleSetupDismissedAt in user document rules', () => {
  const rulesSource = readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');

  assert.match(rulesSource, /roleSetupDismissedAt/);
  assert.match(rulesSource, /roleSetupDismissedAt'\]/);
  assert.match(rulesSource, /roleSetupDismissedAt[^\\n]*timestamp/);
});

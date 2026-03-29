import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-13 allows solo-owned halls to migrate into a newly connected couple inside a batch write', () => {
  const rulesSource = readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');

  assert.match(rulesSource, /existsAfter/);
  assert.match(rulesSource, /getAfter/);
  assert.match(rulesSource, /resource\.data\.coupleId == request\.auth\.uid/);
  assert.match(rulesSource, /documents\/couples\/\$\(newCoupleId\)/);
});

test('S3-13 surfaces permission-denied more explicitly on connect errors', () => {
  const source = readFileSync(path.join(rootDir, 'src', 'pages', 'ConnectCouple.tsx'), 'utf8');

  assert.match(source, /permission-denied/);
  assert.match(source, /연결 권한이 거부되었습니다/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-9 adds a Vercel SPA rewrite fallback', () => {
  const vercelConfigPath = path.join(rootDir, 'vercel.json');

  assert.equal(existsSync(vercelConfigPath), true);

  const source = readFileSync(vercelConfigPath, 'utf8');
  assert.match(source, /rewrites/);
  assert.match(source, /"source":\s*"\/\(.\*\)"/);
  assert.match(source, /"destination":\s*"\/index\.html"/);
});

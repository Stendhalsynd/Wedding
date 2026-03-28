import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-1 loads Firebase config from VITE environment variables instead of tracked JSON', () => {
  const firebaseSource = readFileSync(path.join(rootDir, 'src', 'firebase.ts'), 'utf8');

  assert.doesNotMatch(firebaseSource, /firebase-applet-config\.json/);
  assert.match(firebaseSource, /VITE_FIREBASE_API_KEY/);
  assert.match(firebaseSource, /VITE_FIREBASE_AUTH_DOMAIN/);
  assert.match(firebaseSource, /VITE_FIREBASE_PROJECT_ID/);
});

test('S3-1 removes tracked firebase config json and adds a pre-push secret scan hook', () => {
  assert.equal(existsSync(path.join(rootDir, 'firebase-applet-config.json')), false);

  const hookSource = readFileSync(path.join(rootDir, '.githooks', 'pre-push'), 'utf8');
  assert.match(hookSource, /npm run secrets:check/);
});

test('S3-1 secret scan passes on the current repository state', () => {
  execFileSync('node', ['scripts/check-no-public-secrets.mjs'], {
    cwd: rootDir,
    stdio: 'pipe',
  });

  assert.ok(true);
});

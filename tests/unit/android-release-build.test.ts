import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

test('android version metadata uses package.json version and enforces minimum versionCode 1', async () => {
  const module = await import('../../scripts/android-version.mjs');

  assert.equal(module.toAndroidVersionCode('0.0.0'), 1);
  assert.equal(module.toAndroidVersionCode('1.2.3'), 10203);
  assert.equal(module.toAndroidVersionCode('12.34.56'), 123456);
});

test('release-android-build dry-run rejects missing signing variables', () => {
  let error: unknown;

  try {
    execFileSync('bash', ['scripts/release-android-build.sh'], {
      cwd: path.resolve(currentDir, '..', '..'),
      env: {
        ...process.env,
        ANDROID_BUILD_DRY_RUN: '1',
      },
      encoding: 'utf8',
      stdio: 'pipe',
    });
  } catch (caughtError) {
    error = caughtError;
  }

  assert.ok(error instanceof Error);
  const output = [
    'stdout' in error && typeof error.stdout === 'string' ? error.stdout : '',
    'stderr' in error && typeof error.stderr === 'string' ? error.stderr : '',
    error.message,
  ].join('\n');
  assert.match(output, /ANDROID_KEYSTORE_PATH|ANDROID_KEYSTORE_PASSWORD|ANDROID_KEY_ALIAS|ANDROID_KEY_PASSWORD/);
});

test('release-android-build dry-run accepts complete signing configuration', () => {
  const rootDir = path.resolve(currentDir, '..', '..');
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'wedding-keystore-'));
  const fakeKeystorePath = path.join(tempDir, 'release.keystore');
  const keystorePropertiesPath = path.join(rootDir, 'android', 'keystore.properties');
  const originalProperties = existsSync(keystorePropertiesPath)
    ? readFileSync(keystorePropertiesPath, 'utf8')
    : null;
  writeFileSync(fakeKeystorePath, 'not-a-real-keystore');

  const output = execFileSync('bash', ['scripts/release-android-build.sh'], {
    cwd: rootDir,
    env: {
      ...process.env,
      ANDROID_BUILD_DRY_RUN: '1',
      ANDROID_KEYSTORE_PATH: fakeKeystorePath,
      ANDROID_KEYSTORE_PASSWORD: 'password',
      ANDROID_KEY_ALIAS: 'wedding',
      ANDROID_KEY_PASSWORD: 'password',
    },
    encoding: 'utf8',
    stdio: 'pipe',
  });

  assert.match(output, /\[PASS\] android-build dry-run/i);

  if (originalProperties === null) {
    assert.equal(existsSync(keystorePropertiesPath), false);
  } else {
    assert.equal(readFileSync(keystorePropertiesPath, 'utf8'), originalProperties);
  }

  rmSync(tempDir, { recursive: true, force: true });
});

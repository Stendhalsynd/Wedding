import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFilePath), '..', '..');
const releaseScript = path.join(repoRoot, 'scripts', 'release-apk.sh');

function runReleaseScript(tag: string, apkPath: string, dryRun = false) {
  return spawnSync('bash', [releaseScript, tag, apkPath, 'Wedding Android APK'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      RELEASE_APK_DRY_RUN: dryRun ? '1' : '0',
    },
  });
}

test('release-apk rejects preview and debug apk names', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'wedding-release-guard-'));

  try {
    const previewApk = path.join(tempDir, 'wedding-preview-20260329.apk');
    writeFileSync(previewApk, 'preview');

    const result = runReleaseScript('v-test-preview', previewApk, true);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, /Preview\/debug APK cannot be uploaded/i);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('release-apk accepts release apk names in dry-run mode', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'wedding-release-guard-'));

  try {
    const releaseApk = path.join(tempDir, 'wedding-release-20260329.apk');
    writeFileSync(releaseApk, 'release');

    const result = runReleaseScript('v-test-release', releaseApk, true);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /dry-run/i);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

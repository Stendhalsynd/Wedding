import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const capacitorConfigPath = path.join(rootDir, 'capacitor.config.ts');
const androidDir = path.join(rootDir, 'android');

test('S2-1 adds a Capacitor config with Wedding Android defaults', async () => {
  assert.equal(existsSync(capacitorConfigPath), true, 'capacitor.config.ts must exist');

  const configModule = await import(capacitorConfigPath);
  const config = configModule.default;

  assert.equal(config.appId, 'com.jwjh.wedding');
  assert.equal(config.appName, 'Wedding Tour');
  assert.equal(config.webDir, 'dist');
  assert.equal(config.bundledWebRuntime, false);
});

test('S2-1 exposes Android npm scripts', () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  assert.equal(typeof packageJson.scripts['android:sync'], 'string');
  assert.equal(typeof packageJson.scripts['android:open'], 'string');
  assert.equal(typeof packageJson.scripts['android:run'], 'string');
  assert.equal(packageJson.scripts['android:build:web'], 'vite build');
  assert.equal(packageJson.scripts['android:prepare'], 'npm run build && npx cap sync android');
});

test('S2-1 creates an Android project directory', () => {
  assert.equal(existsSync(androidDir), true, 'android directory must exist');
});

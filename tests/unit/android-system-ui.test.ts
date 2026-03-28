import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S3-7 adds the Capacitor status-bar dependency and config', () => {
  const packageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const capacitorConfig = readFileSync(path.join(rootDir, 'capacitor.config.ts'), 'utf8');

  assert.equal(packageJson.dependencies['@capacitor/status-bar'] !== undefined, true);
  assert.match(capacitorConfig, /StatusBar/);
  assert.match(capacitorConfig, /overlaysWebView:\s*false/);
  assert.match(capacitorConfig, /backgroundColor/);
});

test('S3-7 initializes Android system UI from the app shell', () => {
  const appSource = readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8');
  const systemUiSource = readFileSync(path.join(rootDir, 'src', 'services', 'systemUi.ts'), 'utf8');

  assert.match(appSource, /configureSystemUi/);
  assert.match(systemUiSource, /setOverlaysWebView/);
  assert.match(systemUiSource, /setStyle/);
  assert.match(systemUiSource, /setBackgroundColor/);
  assert.match(systemUiSource, /Capacitor\.getPlatform\(\).*'android'/);
});

test('S3-7 configures Android theme for readable status bar content', () => {
  const stylesXml = readFileSync(
    path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'values', 'styles.xml'),
    'utf8',
  );

  assert.match(stylesXml, /windowLightStatusBar/);
  assert.match(stylesXml, /statusBarColor/);
  assert.match(stylesXml, /windowOptOutEdgeToEdgeEnforcement/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..', '..');

test('S2-4 adds web favicon assets and links them from index.html', () => {
  const indexHtml = readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.equal(existsSync(path.join(rootDir, 'public', 'favicon.ico')), true);
  assert.equal(existsSync(path.join(rootDir, 'public', 'favicon-32x32.png')), true);
  assert.equal(existsSync(path.join(rootDir, 'public', 'apple-touch-icon.png')), true);
  assert.match(indexHtml, /rel="icon"/i);
  assert.match(indexHtml, /favicon\.ico/i);
  assert.match(indexHtml, /apple-touch-icon/i);
});

test('S2-4 replaces Android launcher icons across mipmap densities', () => {
  const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];

  for (const density of densities) {
    assert.equal(
      existsSync(path.join(rootDir, 'android', 'app', 'src', 'main', 'res', `mipmap-${density}`, 'ic_launcher.png')),
      true,
    );
    assert.equal(
      existsSync(path.join(rootDir, 'android', 'app', 'src', 'main', 'res', `mipmap-${density}`, 'ic_launcher_round.png')),
      true,
    );
    assert.equal(
      existsSync(path.join(rootDir, 'android', 'app', 'src', 'main', 'res', `mipmap-${density}`, 'ic_launcher_foreground.png')),
      true,
    );
  }
});

test('S2-4 customizes Android adaptive icon background color', () => {
  const backgroundXml = readFileSync(
    path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'values', 'ic_launcher_background.xml'),
    'utf8',
  );

  assert.match(backgroundXml, /FFF8EE|FFF7ED|FDF6EC/i);
});

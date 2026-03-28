#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const rootDir = path.resolve(currentDir, '..');

export function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function toAndroidVersionCode(version) {
  const { major, minor, patch } = parseSemver(version);
  return Math.max(1, major * 10000 + minor * 100 + patch);
}

export function readPackageVersion(packageJsonPath = path.join(rootDir, 'package.json')) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  if (!packageJson.version) {
    throw new Error('package.json version is missing');
  }
  return packageJson.version;
}

if (process.argv[1] === currentFilePath) {
  const mode = process.argv[2] ?? 'json';
  const version = readPackageVersion();
  const versionCode = toAndroidVersionCode(version);
  const payload = { version, versionCode };

  if (mode === 'version') {
    process.stdout.write(`${version}\n`);
  } else if (mode === 'code') {
    process.stdout.write(`${versionCode}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  }
}

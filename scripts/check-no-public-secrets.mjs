import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const trackedFiles = execFileSync('git', ['ls-files', '-z'], {
  cwd: rootDir,
  encoding: 'utf8',
}).split('\0').filter(Boolean);

const blockedPaths = new Set([
  'firebase-applet-config.json',
]);

const blockedPathRegexes = [
  /(^|\/)\.env($|\.)/,
];

const secretPatterns = [
  {
    label: 'Google API key',
    regex: /AIza[0-9A-Za-z_-]{35}/g,
  },
  {
    label: 'GitHub fine-grained token',
    regex: /github_pat_[0-9A-Za-z_]{20,}/g,
  },
  {
    label: 'GitHub personal access token',
    regex: /\bghp_[0-9A-Za-z]{36}\b/g,
  },
];

const isBinary = (content) => content.includes('\u0000');

const failures = [];

for (const relativePath of trackedFiles) {
  const absolutePath = path.join(rootDir, relativePath);

  if (blockedPaths.has(relativePath)) {
    if (existsSync(absolutePath)) {
      failures.push(`${relativePath}: tracked secret config file is blocked`);
    }
    continue;
  }

  if (blockedPathRegexes.some((regex) => regex.test(relativePath)) && relativePath !== '.env.example') {
    failures.push(`${relativePath}: tracked .env files are blocked`);
    continue;
  }

  let source = '';

  try {
    source = readFileSync(absolutePath, 'utf8');
  } catch {
    continue;
  }

  if (isBinary(source)) {
    continue;
  }

  for (const pattern of secretPatterns) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(source)) {
      failures.push(`${relativePath}: detected ${pattern.label}`);
      break;
    }
  }
}

if (failures.length > 0) {
  console.error('Secret scan failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Secret scan passed.');

#!/usr/bin/env node
/**
 * Package the extension into dist/ and a zip for sharing / Chrome Web Store upload.
 * Usage: npm run package
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = packageJson.version || '1.0.0';
const zipName = `link-dashboard-v${version}.zip`;
const zipPath = path.join(rootDir, zipName);

const INCLUDE = [
  'manifest.json',
  'background.js',
  'icons',
  'lib',
  'newtab',
];

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (entry === '.' || entry === '..') continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

rmrf(distDir);
fs.mkdirSync(distDir, { recursive: true });

for (const item of INCLUDE) {
  const src = path.join(rootDir, item);
  if (!fs.existsSync(src)) {
    console.warn(`Skip missing: ${item}`);
    continue;
  }
  copyRecursive(src, path.join(distDir, item));
}

if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

try {
  execFileSync('zip', ['-r', zipPath, '.'], { cwd: distDir, stdio: 'inherit' });
} catch {
  // fallback without zip binary
  console.warn('zip CLI not found — dist/ folder only (no .zip created)');
}

console.log('');
console.log('Package ready');
console.log('─────────────');
console.log(`Folder: ${distDir}`);
if (fs.existsSync(zipPath)) {
  console.log(`Zip:    ${zipPath}`);
}
console.log('');
console.log('Load unpacked from dist/ or the project root in chrome://extensions');
console.log('');

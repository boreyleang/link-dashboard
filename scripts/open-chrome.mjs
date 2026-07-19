#!/usr/bin/env node
/**
 * Launch Chrome/Chromium with this extension loaded for real local testing.
 * Usage: npm run chrome
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('manifest.json not found. Run this from the project root.');
  process.exit(1);
}

const candidates = [
  process.env.CHROME_PATH,
  process.env.GOOGLE_CHROME_BIN,
  // Linux
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  // Windows (WSL / common paths)
  '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
  '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'chrome.exe',
].filter(Boolean);

function resolveBrowser() {
  for (const candidate of candidates) {
    if (candidate.includes('/') || candidate.includes('\\')) {
      if (fs.existsSync(candidate)) return candidate;
      continue;
    }
    // bare command name — try which-like lookup later via spawn
    return candidate;
  }
  return null;
}

const browser = resolveBrowser();
if (!browser) {
  printManualInstructions();
  process.exit(1);
}

const userDataDir = path.join(rootDir, '.chrome-dev-profile');
fs.mkdirSync(userDataDir, { recursive: true });

const args = [
  `--user-data-dir=${userDataDir}`,
  `--disable-extensions-except=${rootDir}`,
  `--load-extension=${rootDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  'chrome://newtab',
];

console.log('');
console.log('Link Dashboard — Chrome extension dev');
console.log('─────────────────────────────────────');
console.log(`Extension: ${rootDir}`);
console.log(`Browser:   ${browser}`);
console.log(`Profile:   ${userDataDir}`);
console.log('');
console.log('A new Chrome window will open with the extension loaded.');
console.log('Edit files, then click Reload on chrome://extensions and open a new tab.');
console.log('');

const child = spawn(browser, args, {
  stdio: 'ignore',
  detached: true,
  shell: process.platform === 'win32' || browser.endsWith('.exe'),
});

child.on('error', (error) => {
  console.error(`Failed to start browser: ${error.message}`);
  printManualInstructions();
  process.exit(1);
});

child.unref();

function printManualInstructions() {
  console.error('');
  console.error('Could not find Chrome/Chromium automatically.');
  console.error('');
  console.error('Manual load (recommended):');
  console.error('  1. Open Chrome → chrome://extensions');
  console.error('  2. Enable Developer mode');
  console.error('  3. Load unpacked → select this folder:');
  console.error(`     ${rootDir}`);
  console.error('  4. Open a new tab');
  console.error('');
  console.error('Or set CHROME_PATH to your browser executable:');
  console.error('  CHROME_PATH="/path/to/chrome" npm run chrome');
  console.error('');
  console.error('For UI-only preview without extension APIs:');
  console.error('  npm run dev');
  console.error('');
}

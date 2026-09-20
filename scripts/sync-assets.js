/**
 * @file sync-assets.js
 * @description Automatically synchronizes the centralized root assets/brand directory into web and preview apps
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'assets', 'brand');

const TARGET_DIRS = [
  path.join(ROOT_DIR, 'preview', 'assets', 'brand'),
  path.join(ROOT_DIR, 'apps', 'paylink-web', 'public', 'brand'),
  path.join(ROOT_DIR, 'apps', 'mobile', 'assets', 'brand'),
];

if (!fs.existsSync(SOURCE_DIR)) {
  console.log('[Sync Assets] Creating centralized assets/brand directory...');
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
}

console.log(`[Sync Assets] Synchronizing assets from: ${SOURCE_DIR}`);

const files = fs.readdirSync(SOURCE_DIR);

TARGET_DIRS.forEach((targetDir) => {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  files.forEach((file) => {
    const srcFile = path.join(SOURCE_DIR, file);
    const destFile = path.join(targetDir, file);

    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
    }
  });

  console.log(`  ✓ Synced ${files.length} asset(s) to ${path.relative(ROOT_DIR, targetDir)}`);
});

console.log('[Sync Assets] Done! All workspaces are in sync with SSOT assets/brand.');

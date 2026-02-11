/**
 * post-build.mjs — Copy static assets into .next/standalone for production.
 *
 * Next.js standalone output does NOT include .next/static or public/.
 * Without these, the app serves HTML but all JS/CSS/images 404 → "application error".
 *
 * See: https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-traced-files
 */

import { cpSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const copies = [
  { src: join(root, '.next', 'static'), dest: join(root, '.next', 'standalone', '.next', 'static') },
  { src: join(root, 'public'),          dest: join(root, '.next', 'standalone', 'public') },
];

for (const { src, dest } of copies) {
  if (existsSync(src)) {
    cpSync(src, dest, { recursive: true });
    console.log(`✓ Copied ${src.replace(root, '.')} → ${dest.replace(root, '.')}`);
  } else {
    console.log(`⚠ Skipped (not found): ${src.replace(root, '.')}`);
  }
}

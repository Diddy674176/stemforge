import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const manPath = join(root, 'scripts/srcparts/manifest.json');
if (!existsSync(manPath)) {
  console.log('No srcparts manifest — skipping join');
  process.exit(0);
}
const man = JSON.parse(readFileSync(manPath, 'utf8'));
for (const item of man) {
  const missing = item.parts.some((p) => !existsSync(join(root, 'scripts/srcparts', p)));
  if (missing) {
    console.log('skip (incomplete parts)', item.path);
    continue;
  }
  const body = item.parts.map((p) => readFileSync(join(root, 'scripts/srcparts', p), 'utf8')).join('');
  const out = join(root, item.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, body);
  console.log('joined', item.path, body.length);
}

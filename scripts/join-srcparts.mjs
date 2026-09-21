
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const man = JSON.parse(readFileSync(join(root, 'scripts/srcparts/manifest.json'), 'utf8'));
for (const item of man) {
  const body = item.parts.map((p) => readFileSync(join(root, 'scripts/srcparts', p), 'utf8')).join('');
  const out = join(root, item.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, body);
  console.log('joined', item.path, body.length);
}

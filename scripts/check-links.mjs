import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve('dist');
if (!existsSync(root)) throw new Error('dist/ not found. Run npm run build first.');

const walk = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));
const failures = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const links = [...html.matchAll(/\bhref=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const href of links) {
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const clean = href.split(/[?#]/)[0];
    if (!clean) continue;
    const candidate = clean.startsWith('/')
      ? join(root, clean)
      : resolve(dirname(file), clean);
    const targets = [candidate, `${candidate}.html`, join(candidate, 'index.html')];
    if (!targets.some(existsSync)) {
      failures.push(`${relative(root, file)} -> ${href}`);
    }
  }
}

if (failures.length) {
  console.error(`Broken internal links:\n${failures.join('\n')}`);
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files: no broken internal links.`);

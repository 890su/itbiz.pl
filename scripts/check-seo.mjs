import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

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
  const name = relative(root, file);
  const checks = [
    ['one title', (html.match(/<title>/g) || []).length === 1],
    ['one H1', (html.match(/<h1[\s>]/g) || []).length === 1],
    ['meta description', /<meta name="description" content="[^"]+"/.test(html)],
    ['canonical', /<link rel="canonical" href="https:\/\/itbiz\.pl\//.test(html)],
    ['lang=pl', /<html lang="pl"/.test(html)],
  ];
  for (const [label, success] of checks)
    if (!success) failures.push(`${name}: ${label}`);

  if (
    name.includes('uslugi') &&
    name !== 'uslugi\\index.html' &&
    name !== 'uslugi/index.html'
  ) {
    if (!/<meta name="robots" content="noindex, follow"/.test(html)) {
      failures.push(`${name}: draft service must be noindex`);
    }
  }
}

if (failures.length) {
  console.error(`SEO checks failed:\n${failures.join('\n')}`);
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files: required SEO fields are present.`);

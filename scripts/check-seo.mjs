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
const languageByPrefix = { ru: 'ru-RU', en: 'en-GB', uk: 'uk-UA' };
const hreflangByLanguage = {
  'pl-PL': 'pl',
  'ru-RU': 'ru',
  'en-GB': 'en',
  'uk-UA': 'uk',
};
const htmlByCanonical = new Map();

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical) htmlByCanonical.set(canonical, html);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const name = relative(root, file).replaceAll('\\', '/');
  const prefix = name.split('/')[0];
  const expectedLanguage = languageByPrefix[prefix] ?? 'pl-PL';
  const is404 = name === '404.html';
  const checks = [
    ['one title', (html.match(/<title>/g) || []).length === 1],
    ['one H1', (html.match(/<h1[\s>]/g) || []).length === 1],
    ['meta description', /<meta name="description" content="[^"]+"/.test(html)],
    ['canonical', /<link rel="canonical" href="https:\/\/itbiz\.pl\//.test(html)],
    [`lang=${expectedLanguage}`, html.includes(`<html lang="${expectedLanguage}"`)],
    [
      is404 ? '404 noindex' : 'indexable',
      html.includes(
        `<meta name="robots" content="${is404 ? 'noindex, follow' : 'index, follow'}"`,
      ),
    ],
  ];

  if (!is404) {
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const alternates = [
      ...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g),
    ].map((match) => ({ locale: match[1], href: match[2] }));
    const ownHreflang = hreflangByLanguage[expectedLanguage];
    checks.push([
      `self hreflang ${ownHreflang}`,
      alternates.some(
        (alternate) => alternate.locale === ownHreflang && alternate.href === canonical,
      ),
    ]);
    checks.push([
      'hreflang x-default',
      alternates.some((alternate) => alternate.locale === 'x-default'),
    ]);

    for (const alternate of alternates.filter(({ locale }) => locale !== 'x-default')) {
      const targetHtml = htmlByCanonical.get(alternate.href);
      checks.push([`hreflang target ${alternate.locale}`, Boolean(targetHtml)]);
      if (targetHtml && canonical) {
        checks.push([
          `reciprocal hreflang ${alternate.locale}`,
          targetHtml.includes(
            `rel="alternate" hreflang="${ownHreflang}" href="${canonical}"`,
          ),
        ]);
      }
    }
  }

  for (const [label, success] of checks)
    if (!success) failures.push(`${name}: ${label}`);
}

if (failures.length) {
  console.error(`SEO checks failed:\n${failures.join('\n')}`);
  process.exit(1);
}

console.log(
  `Checked ${htmlFiles.length} HTML files: locale, indexability, canonical and hreflang fields are valid.`,
);

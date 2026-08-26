import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://itbiz.pl',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/privacy/') &&
        !page.includes('/cookies/') &&
        !page.includes('/rozwiazania/') &&
        !page.match(/\/uslugi\/[^/]+\/$/),
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});

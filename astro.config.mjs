import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://itbiz.pl',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: {
    inlineStylesheets: 'auto',
  },
});

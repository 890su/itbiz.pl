import type { APIRoute } from 'astro';

const indexable = import.meta.env.PUBLIC_SITE_INDEXABLE === 'true';

export const GET: APIRoute = () => {
  const body = indexable
    ? 'User-agent: *\nAllow: /\n\nSitemap: https://itbiz.pl/sitemap-index.xml\n'
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

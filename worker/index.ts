import { handleContact, purgeExpiredLeads, type ContactEnv } from './contact';

interface Env extends ContactEnv {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (
      url.hostname === 'www.itbiz.pl' &&
      (request.method === 'GET' || request.method === 'HEAD')
    ) {
      url.hostname = 'itbiz.pl';
      return Response.redirect(url, 308);
    }
    if (url.pathname === '/api/contact') return handleContact(request, env);
    if (url.pathname.startsWith('/api/')) {
      return Response.json(
        { message: 'Not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    await purgeExpiredLeads(env);
  },
} satisfies ExportedHandler<Env>;

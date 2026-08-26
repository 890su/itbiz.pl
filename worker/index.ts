import { handleContact, type ContactEnv } from './contact';

interface Env extends ContactEnv {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return handleContact(request, env);
    if (url.pathname.startsWith('/api/')) {
      return Response.json(
        { message: 'Not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

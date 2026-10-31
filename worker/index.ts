import { handleContact, purgeExpiredLeads, type ContactEnv } from './contact';
import { handleNetwork, handleNetworkProbe, handleWeather } from './network-tools';
import { retryTelegramNotifications } from './telegram';
import { retryJournal, purgeJournal } from './journal';

interface Env extends ContactEnv {
  ASSETS: Fetcher;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    if (
      (url.hostname === 'itbiz.pl' || url.hostname === 'www.itbiz.pl') &&
      (url.protocol === 'http:' || url.hostname === 'www.itbiz.pl')
    ) {
      url.protocol = 'https:';
      url.hostname = 'itbiz.pl';
      return Response.redirect(url, 308);
    }
    if (url.pathname === '/api/contact') {
      const response = await handleContact(request, env);
      if (response.status === 201)
        context.waitUntil(
          Promise.all([retryTelegramNotifications(env), retryJournal(env)]),
        );
      return response;
    }
    if (request.method === 'GET' && url.pathname === '/api/weather')
      return handleWeather();
    if (request.method === 'GET' && url.pathname === '/api/network')
      return handleNetwork(request);
    if (request.method === 'GET' && url.pathname === '/api/network-probe')
      return handleNetworkProbe(request);
    if (url.pathname.startsWith('/api/')) {
      return Response.json(
        { message: 'Not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const response = await env.ASSETS.fetch(request);
    const mediaType = response.headers.get('Content-Type')?.split(';')[0]?.trim();
    if (mediaType?.toLowerCase() === 'text/html') {
      const htmlResponse = new Response(response.body, response);
      htmlResponse.headers.set('Content-Type', 'text/html; charset=utf-8');
      return htmlResponse;
    }
    return response;
  },
  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    await retryTelegramNotifications(env);
    await retryJournal(env);
    if (controller.cron === '17 2 * * *') await purgeExpiredLeads(env);
    if (controller.cron === '17 2 * * *') await purgeJournal(env);
  },
} satisfies ExportedHandler<Env>;

export interface ContactEnv {
  ENVIRONMENT?: string;
  ALLOWED_ORIGINS?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_WEBHOOK_URL?: string;
  CONTACT_WEBHOOK_TOKEN?: string;
  CONTACT_RATE_LIMITER?: {
    limit(input: { key: string }): Promise<{ success: boolean }>;
  };
}

export interface ContactPayload {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceId: string;
  message: string;
  actingForBusiness: boolean;
  locale: string;
  pagePath: string;
  website: string;
  turnstileToken: string;
}

type ValidationResult =
  { success: true; data: ContactPayload } | { success: false; message: string };

const serviceIds = new Set([
  'managed-it',
  'lan-installation',
  'office-wifi',
  'network-repair',
  'other',
]);

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().replace(/\r\n?/g, '\n').slice(0, max) : '';

const toObject = (
  input: FormData | Record<string, unknown>,
): Record<string, unknown> => {
  if (input instanceof FormData) return Object.fromEntries(input.entries());
  return input;
};

export function validateContactPayload(
  input: FormData | Record<string, unknown>,
): ValidationResult {
  const value = toObject(input);
  const data: ContactPayload = {
    companyName: clean(value.companyName, 120),
    contactName: clean(value.contactName, 100),
    email: clean(value.email, 160).toLowerCase(),
    phone: clean(value.phone, 40),
    serviceId: clean(value.serviceId, 64),
    message: clean(value.message, 3000),
    actingForBusiness:
      value.actingForBusiness === true || value.actingForBusiness === 'true',
    locale: clean(value.locale, 8) || 'pl',
    pagePath: clean(value.pagePath, 500),
    website: clean(value.website, 200),
    turnstileToken: clean(value['cf-turnstile-response'], 2048),
  };

  if (!data.companyName || !data.contactName) {
    return { success: false, message: 'Podaj nazwę organizacji i osobę kontaktową.' };
  }
  if (!data.email && !data.phone) {
    return { success: false, message: 'Podaj e-mail służbowy lub numer telefonu.' };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, message: 'Sprawdź format adresu e-mail.' };
  }
  if (data.phone && data.phone.replace(/\D/g, '').length < 7) {
    return { success: false, message: 'Sprawdź format numeru telefonu.' };
  }
  if (!serviceIds.has(data.serviceId)) {
    return { success: false, message: 'Wybierz prawidłowy temat zapytania.' };
  }
  if (data.message.length < 20) {
    return { success: false, message: 'Opisz zadanie w co najmniej 20 znakach.' };
  }
  if (!data.actingForBusiness) {
    return { success: false, message: 'Potwierdź kontakt w imieniu organizacji.' };
  }
  if (data.locale !== 'pl') {
    return { success: false, message: 'Nieobsługiwana wersja językowa formularza.' };
  }

  return { success: true, data };
}

function json(body: object, status: number, requestId?: string): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      ...(requestId ? { 'X-Request-ID': requestId } : {}),
    },
  });
}

async function parseBody(
  request: Request,
): Promise<FormData | Record<string, unknown>> {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 32_000) throw new Error('payload-too-large');

  const contentType = request.headers.get('content-type') || '';
  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    return request.formData();
  }
  if (contentType.includes('application/json')) return request.json();
  throw new Error('unsupported-content-type');
}

function isAllowedOrigin(request: Request, env: ContactEnv): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const requestOrigin = new URL(request.url).origin;
  const configured = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return origin === requestOrigin || configured.includes(origin);
}

async function verifyTurnstile(
  token: string,
  request: Request,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const idempotencyKey = crypto.randomUUID();
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || undefined,
        idempotency_key: idempotencyKey,
      }),
    },
  );
  if (!response.ok) return false;
  const result = (await response.json()) as {
    success?: boolean;
    action?: string;
    hostname?: string;
  };
  const expectedHost = new URL(request.url).hostname;
  return (
    result.success === true &&
    result.action === 'contact' &&
    result.hostname === expectedHost
  );
}

export async function handleContact(
  request: Request,
  env: ContactEnv,
): Promise<Response> {
  const requestId = crypto.randomUUID();

  if (request.method !== 'POST') {
    return json({ message: 'Method not allowed', requestId }, 405, requestId);
  }
  if (!isAllowedOrigin(request, env)) {
    return json(
      { message: 'Nieprawidłowe źródło żądania.', requestId },
      403,
      requestId,
    );
  }

  const rateKey = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.CONTACT_RATE_LIMITER) {
    const rate = await env.CONTACT_RATE_LIMITER.limit({ key: rateKey });
    if (!rate.success) {
      return json(
        { message: 'Zbyt wiele prób. Odczekaj minutę i spróbuj ponownie.', requestId },
        429,
        requestId,
      );
    }
  }

  let raw: FormData | Record<string, unknown>;
  try {
    raw = await parseBody(request);
  } catch (error) {
    const status =
      error instanceof Error && error.message === 'payload-too-large' ? 413 : 415;
    return json(
      { message: 'Nie można odczytać danych formularza.', requestId },
      status,
      requestId,
    );
  }

  const validation = validateContactPayload(raw);
  if (!validation.success) {
    return json({ message: validation.message, requestId }, 400, requestId);
  }
  const data = validation.data;

  // Honeypot submissions receive a generic accepted response and are never delivered.
  if (data.website) return json({ requestId }, 202, requestId);

  if (env.TURNSTILE_SECRET_KEY) {
    const validToken = await verifyTurnstile(
      data.turnstileToken,
      request,
      env.TURNSTILE_SECRET_KEY,
    );
    if (!validToken) {
      return json(
        {
          message: 'Weryfikacja formularza wygasła. Odśwież ją i spróbuj ponownie.',
          requestId,
        },
        400,
        requestId,
      );
    }
  } else if (env.ENVIRONMENT === 'production') {
    return json(
      { message: 'Formularz jest chwilowo niedostępny.', requestId },
      503,
      requestId,
    );
  }

  if (!env.CONTACT_WEBHOOK_URL) {
    if (env.ENVIRONMENT === 'production') {
      return json(
        { message: 'Formularz jest chwilowo niedostępny.', requestId },
        503,
        requestId,
      );
    }
    return json({ requestId, preview: true }, 202, requestId);
  }

  const delivery = await fetch(env.CONTACT_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(env.CONTACT_WEBHOOK_TOKEN
        ? { Authorization: `Bearer ${env.CONTACT_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      requestId,
      submittedAt: new Date().toISOString(),
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email || null,
      phone: data.phone || null,
      serviceId: data.serviceId,
      message: data.message,
      locale: data.locale,
      pagePath: data.pagePath,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!delivery.ok) {
    return json(
      { message: 'Nie udało się dostarczyć zapytania. Spróbuj ponownie.', requestId },
      502,
      requestId,
    );
  }

  return json({ requestId }, 201, requestId);
}

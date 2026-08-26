export interface ContactEnv {
  ENVIRONMENT?: string;
  ALLOWED_ORIGINS?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_WEBHOOK_URL?: string;
  CONTACT_WEBHOOK_TOKEN?: string;
  LEADS_DB?: D1Database;
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
type SupportedLocale = 'pl' | 'ru' | 'en' | 'uk';
type MessageSet = {
  identity: string;
  contact: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  business: string;
  locale: string;
  rate: string;
  turnstile: string;
  unavailable: string;
  delivery: string;
};

const supportedLocales = new Set<SupportedLocale>(['pl', 'ru', 'en', 'uk']);

const messages: Record<SupportedLocale, MessageSet> = {
  pl: {
    identity: 'Podaj nazwę organizacji i osobę kontaktową.',
    contact: 'Podaj e-mail służbowy lub numer telefonu.',
    email: 'Sprawdź format adresu e-mail.',
    phone: 'Sprawdź format numeru telefonu.',
    topic: 'Wybierz prawidłowy temat zapytania.',
    message: 'Opisz zadanie w co najmniej 20 znakach.',
    business: 'Potwierdź kontakt w imieniu organizacji.',
    locale: 'Nieobsługiwana wersja językowa formularza.',
    rate: 'Zbyt wiele prób. Odczekaj minutę i spróbuj ponownie.',
    turnstile: 'Weryfikacja formularza wygasła. Odśwież ją i spróbuj ponownie.',
    unavailable: 'Formularz jest chwilowo niedostępny.',
    delivery: 'Nie udało się zapisać zapytania. Spróbuj ponownie.',
  },
  ru: {
    identity: 'Укажите организацию и контактное лицо.',
    contact: 'Укажите рабочий e-mail или номер телефона.',
    email: 'Проверьте формат e-mail.',
    phone: 'Проверьте формат номера телефона.',
    topic: 'Выберите корректную тему обращения.',
    message: 'Опишите задачу не менее чем 20 символами.',
    business: 'Подтвердите обращение от имени организации.',
    locale: 'Эта языковая версия формы не поддерживается.',
    rate: 'Слишком много попыток. Подождите минуту и попробуйте снова.',
    turnstile: 'Проверка формы истекла. Обновите её и попробуйте снова.',
    unavailable: 'Форма временно недоступна.',
    delivery: 'Не удалось сохранить запрос. Попробуйте снова.',
  },
  en: {
    identity: 'Provide the organisation and contact person.',
    contact: 'Provide a business email or phone number.',
    email: 'Check the email address format.',
    phone: 'Check the phone number format.',
    topic: 'Choose a valid enquiry topic.',
    message: 'Describe the task in at least 20 characters.',
    business: 'Confirm that you are contacting us for an organisation.',
    locale: 'This form language is not supported.',
    rate: 'Too many attempts. Wait one minute and try again.',
    turnstile: 'The form verification expired. Refresh it and try again.',
    unavailable: 'The form is temporarily unavailable.',
    delivery: 'The enquiry could not be stored. Try again.',
  },
  uk: {
    identity: 'Вкажіть організацію та контактну особу.',
    contact: 'Вкажіть робочий e-mail або номер телефону.',
    email: 'Перевірте формат e-mail.',
    phone: 'Перевірте формат номера телефону.',
    topic: 'Оберіть правильну тему звернення.',
    message: 'Опишіть завдання щонайменше 20 символами.',
    business: 'Підтвердьте звернення від імені організації.',
    locale: 'Ця мовна версія форми не підтримується.',
    rate: 'Забагато спроб. Зачекайте хвилину й спробуйте ще раз.',
    turnstile: 'Перевірка форми закінчилася. Оновіть її та спробуйте ще раз.',
    unavailable: 'Форма тимчасово недоступна.',
    delivery: 'Не вдалося зберегти запит. Спробуйте ще раз.',
  },
};

const getMessages = (locale: string): MessageSet =>
  supportedLocales.has(locale as SupportedLocale)
    ? messages[locale as SupportedLocale]
    : messages.pl;
const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().replace(/\r\n?/g, '\n').slice(0, max) : '';

const toObject = (
  input: FormData | Record<string, unknown>,
): Record<string, unknown> =>
  input instanceof FormData ? Object.fromEntries(input.entries()) : input;

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
  const text = getMessages(data.locale);

  if (!data.companyName || !data.contactName)
    return { success: false, message: text.identity };
  if (!data.email && !data.phone) return { success: false, message: text.contact };
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return { success: false, message: text.email };
  if (data.phone && data.phone.replace(/\D/g, '').length < 7)
    return { success: false, message: text.phone };
  if (!serviceIds.has(data.serviceId)) return { success: false, message: text.topic };
  if (data.message.length < 20) return { success: false, message: text.message };
  if (!data.actingForBusiness) return { success: false, message: text.business };
  if (!supportedLocales.has(data.locale as SupportedLocale))
    return { success: false, message: text.locale };

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
  )
    return request.formData();
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
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || undefined,
        idempotency_key: crypto.randomUUID(),
      }),
    },
  );
  if (!response.ok) return false;
  const result = (await response.json()) as {
    success?: boolean;
    action?: string;
    hostname?: string;
  };
  return (
    result.success === true &&
    result.action === 'contact' &&
    result.hostname === new URL(request.url).hostname
  );
}

async function storeLead(
  env: ContactEnv,
  data: ContactPayload,
  requestId: string,
  submittedAt: Date,
): Promise<boolean> {
  if (!env.LEADS_DB) return false;
  try {
    await env.LEADS_DB.prepare(
      `INSERT INTO contact_leads (
        request_id, submitted_at, purge_after, company_name, contact_name,
        email, phone, service_id, message, locale, page_path, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
    )
      .bind(
        requestId,
        submittedAt.toISOString(),
        new Date(submittedAt.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        data.companyName,
        data.contactName,
        data.email || null,
        data.phone || null,
        data.serviceId,
        data.message,
        data.locale,
        data.pagePath,
      )
      .run();
    return true;
  } catch {
    return false;
  }
}

async function forwardLead(
  env: ContactEnv,
  data: ContactPayload,
  requestId: string,
  submittedAt: Date,
): Promise<boolean> {
  if (!env.CONTACT_WEBHOOK_URL) return false;
  try {
    const response = await fetch(env.CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.CONTACT_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${env.CONTACT_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        requestId,
        submittedAt: submittedAt.toISOString(),
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
    return response.ok;
  } catch {
    return false;
  }
}

export async function handleContact(
  request: Request,
  env: ContactEnv,
): Promise<Response> {
  const requestId = crypto.randomUUID();
  if (request.method !== 'POST')
    return json({ message: 'Method not allowed', requestId }, 405, requestId);
  if (!isAllowedOrigin(request, env))
    return json({ message: 'Invalid request origin.', requestId }, 403, requestId);

  if (env.CONTACT_RATE_LIMITER) {
    const rate = await env.CONTACT_RATE_LIMITER.limit({
      key: request.headers.get('CF-Connecting-IP') || 'unknown',
    });
    if (!rate.success)
      return json({ message: messages.pl.rate, requestId }, 429, requestId);
  }

  let raw: FormData | Record<string, unknown>;
  try {
    raw = await parseBody(request);
  } catch (error) {
    const status =
      error instanceof Error && error.message === 'payload-too-large' ? 413 : 415;
    return json({ message: 'Unable to read form data.', requestId }, status, requestId);
  }

  const validation = validateContactPayload(raw);
  if (!validation.success)
    return json({ message: validation.message, requestId }, 400, requestId);
  const data = validation.data;
  const text = getMessages(data.locale);

  if (data.website) return json({ requestId }, 202, requestId);
  if (env.TURNSTILE_SECRET_KEY) {
    if (
      !(await verifyTurnstile(data.turnstileToken, request, env.TURNSTILE_SECRET_KEY))
    )
      return json({ message: text.turnstile, requestId }, 400, requestId);
  } else if (env.ENVIRONMENT === 'production') {
    return json({ message: text.unavailable, requestId }, 503, requestId);
  }

  if (env.ENVIRONMENT !== 'production')
    return json({ requestId, preview: true }, 202, requestId);

  const submittedAt = new Date();
  const [stored, forwarded] = await Promise.all([
    storeLead(env, data, requestId, submittedAt),
    forwardLead(env, data, requestId, submittedAt),
  ]);
  if (!stored && !forwarded)
    return json({ message: text.delivery, requestId }, 502, requestId);
  return json({ requestId }, 201, requestId);
}

export async function purgeExpiredLeads(env: ContactEnv): Promise<void> {
  if (!env.LEADS_DB) return;
  await env.LEADS_DB.prepare('DELETE FROM contact_leads WHERE purge_after <= ?')
    .bind(new Date().toISOString())
    .run();
}

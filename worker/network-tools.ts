const WARSAW_FORECAST =
  'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=52.2297&lon=21.0122';
const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

function point(entry: Record<string, any>) {
  const instant = entry.data?.instant?.details ?? {};
  const nextHour = entry.data?.next_1_hours ?? {};
  return {
    time: entry.time,
    temperature: instant.air_temperature ?? null,
    feelsLike: instant.feels_like_temperature ?? null,
    humidity: instant.relative_humidity ?? null,
    pressure: instant.air_pressure_at_sea_level ?? null,
    windSpeed: instant.wind_speed ?? null,
    windDirection: instant.wind_from_direction ?? null,
    precipitation: nextHour.details?.precipitation_amount ?? 0,
    symbol: nextHour.summary?.symbol_code ?? 'unknown',
  };
}

export async function handleWeather(): Promise<Response> {
  try {
    const response = await fetch(WARSAW_FORECAST, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ITBIZ.PL weather tool https://itbiz.pl/',
      },
      cf: { cacheEverything: true, cacheTtl: 900 },
    });
    if (!response.ok) throw new Error(`MET Norway returned ${response.status}`);
    const payload = (await response.json()) as Record<string, any>;
    const series = payload.properties?.timeseries ?? [];
    if (!series.length) throw new Error('Forecast is empty');
    const samples = [0, 3, 6, 9, 12, 18, 24]
      .map((index) => series[index])
      .filter(Boolean)
      .map(point);
    return Response.json(
      {
        place: 'Warszawa',
        coordinates: { latitude: 52.2297, longitude: 21.0122 },
        updatedAt: payload.properties?.meta?.updated_at ?? null,
        current: point(series[0]),
        forecast: samples,
        attribution: {
          name: 'MET Norway',
          url: 'https://api.met.no/',
          license: 'CC BY 4.0',
          licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        },
      },
      {
        headers: {
          ...jsonHeaders,
          'Cache-Control': 'public, max-age=300, s-maxage=900',
        },
      },
    );
  } catch {
    return Response.json(
      { message: 'Weather data is temporarily unavailable.' },
      { status: 502, headers: { ...jsonHeaders, 'Cache-Control': 'no-store' } },
    );
  }
}

export function handleNetwork(request: Request): Response {
  const cf = (request.cf ?? {}) as IncomingRequestCfProperties;
  const ip = request.headers.get('CF-Connecting-IP');
  return Response.json(
    {
      ip,
      ipVersion: ip ? (ip.includes(':') ? 'IPv6' : 'IPv4') : null,
      provider: cf.asOrganization ?? null,
      asn: cf.asn ?? null,
      city: cf.city ?? null,
      region: cf.region ?? null,
      country: cf.country ?? null,
      edge: cf.colo ?? null,
      tls: cf.tlsVersion ?? null,
    },
    {
      headers: {
        ...jsonHeaders,
        'Cache-Control': 'no-store, max-age=0',
        Pragma: 'no-cache',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
}

export function handleNetworkProbe(request: Request): Response {
  const requested = Number.parseInt(
    new URL(request.url).searchParams.get('bytes') ?? '1',
    10,
  );
  const size = Number.isFinite(requested)
    ? Math.max(1, Math.min(requested, 262_144))
    : 1;
  return new Response('0'.repeat(size), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size),
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

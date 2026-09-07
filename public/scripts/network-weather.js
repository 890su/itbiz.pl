(() => {
  const root = document.querySelector('[data-network-weather]');
  if (!root) return;
  const settings = JSON.parse(root.dataset.settings || '{}');
  const set = (selector, value) => {
    const node = root.querySelector(selector);
    if (node) node.textContent = value ?? settings.unknown;
  };
  const number = (value, digits = 0) =>
    Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : '—';
  const symbols = {
    clearsky: ['Bezchmurnie', 'Ясно', 'Clear sky', 'Ясно'],
    fair: ['Pogodnie', 'Малооблачно', 'Fair', 'Малохмарно'],
    partlycloudy: [
      'Częściowe zachmurzenie',
      'Переменная облачность',
      'Partly cloudy',
      'Мінлива хмарність',
    ],
    cloudy: ['Pochmurno', 'Облачно', 'Cloudy', 'Хмарно'],
    fog: ['Mgła', 'Туман', 'Fog', 'Туман'],
    rain: ['Deszcz', 'Дождь', 'Rain', 'Дощ'],
    lightrain: ['Lekki deszcz', 'Небольшой дождь', 'Light rain', 'Невеликий дощ'],
    heavyrain: ['Silny deszcz', 'Сильный дождь', 'Heavy rain', 'Сильний дощ'],
    snow: ['Śnieg', 'Снег', 'Snow', 'Сніг'],
    sleet: ['Deszcz ze śniegiem', 'Мокрый снег', 'Sleet', 'Мокрий сніг'],
    thunderstorm: ['Burza', 'Гроза', 'Thunderstorm', 'Гроза'],
  };
  const languageIndex =
    { pl: 0, ru: 1, en: 2, uk: 3 }[document.documentElement.lang.slice(0, 2)] ?? 2;
  const symbolText = (code = '') => {
    const key = Object.keys(symbols).find((name) => code.startsWith(name));
    return key ? symbols[key][languageIndex] : settings.unknown;
  };

  async function loadWeather() {
    const status = root.querySelector('[data-weather-status]');
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) throw new Error();
      const data = await response.json();
      const now = data.current;
      set('[data-weather-temperature]', number(now.temperature));
      set('[data-weather-symbol]', symbolText(now.symbol));
      set('[data-weather-feels]', `${number(now.feelsLike)} °C`);
      set('[data-weather-humidity]', `${number(now.humidity)}%`);
      set('[data-weather-wind]', `${number(now.windSpeed, 1)} ${settings.unitWind}`);
      set('[data-weather-pressure]', `${number(now.pressure)} hPa`);
      set('[data-weather-rain]', `${number(now.precipitation, 1)} mm`);
      root.querySelector('[data-weather-forecast]').innerHTML = data.forecast
        .map((point) => {
          const date = new Date(point.time);
          const day = new Intl.DateTimeFormat(settings.dateLocale, {
            weekday: 'short',
          }).format(date);
          const time = new Intl.DateTimeFormat(settings.dateLocale, {
            hour: '2-digit',
            minute: '2-digit',
          }).format(date);
          return `<article class="nw-forecast-node"><time datetime="${point.time}">${day} / ${time}</time><strong>${number(point.temperature)}°</strong><span>${symbolText(point.symbol)}</span><small>${number(point.precipitation, 1)} mm · ${number(point.windSpeed, 1)} ${settings.unitWind}</small></article>`;
        })
        .join('');
      status.textContent = '';
    } catch {
      status.textContent = settings.unavailable;
    }
  }
  async function loadNetwork() {
    const status = root.querySelector('[data-network-status]');
    try {
      const response = await fetch('/api/network', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const data = await response.json();
      set('[data-network-ip]', [data.ip, data.ipVersion].filter(Boolean).join(' / '));
      set(
        '[data-network-provider]',
        [data.provider, data.asn ? `AS${data.asn}` : ''].filter(Boolean).join(' / '),
      );
      set(
        '[data-network-location]',
        [data.city, data.region, data.country].filter(Boolean).join(', '),
      );
      set('[data-network-edge]', [data.edge, data.tls].filter(Boolean).join(' / '));
      status.textContent = '';
    } catch {
      status.textContent = settings.unavailable;
    }
  }
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;
  };
  async function timedFetch(bytes) {
    const start = performance.now();
    const response = await fetch(
      `/api/network-probe?bytes=${bytes}&t=${Date.now()}-${Math.random()}`,
      { cache: 'no-store' },
    );
    if (!response.ok) throw new Error();
    await response.arrayBuffer();
    return performance.now() - start;
  }
  async function runTest(button) {
    button.disabled = true;
    button.textContent = settings.testing;
    const status = root.querySelector('[data-network-status]');
    try {
      await timedFetch(1);
      const samples = [];
      for (let i = 0; i < 6; i += 1) samples.push(await timedFetch(1));
      const latency = median(samples);
      const deltas = samples
        .slice(1)
        .map((value, index) => Math.abs(value - samples[index]));
      const jitter = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
      const elapsed = await timedFetch(262144);
      const mbps = (262144 * 8) / (elapsed / 1000) / 1_000_000;
      set('[data-test-latency]', `${number(latency)} ms`);
      set('[data-test-jitter]', `${number(jitter)} ms`);
      set('[data-test-speed]', `${number(mbps, 1)} Mb/s`);
      root.querySelector('[data-test-results]').hidden = false;
      status.textContent = '';
    } catch {
      status.textContent = settings.unavailable;
    } finally {
      button.disabled = false;
      button.textContent = settings.test;
    }
  }
  root
    .querySelector('[data-network-test]')
    ?.addEventListener('click', (event) => runTest(event.currentTarget));
  loadWeather();
  loadNetwork();
})();

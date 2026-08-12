import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CURRENCY,
  DEFAULT_LANG,
  LANGS,
  LOCALIZED_PATHS,
  decideLangRouting,
  isCurrency,
  isLang,
  localizedPath,
  resolveMarket,
  splitLocalizedPath,
  type Currency,
  type Lang,
} from './markets';
import { PINNED_USD_RATES, formatMoney } from './currency';

/**
 * The market registry decides what language a visitor reads and what currency
 * they are quoted, from nothing but an IP-derived country code and a cookie.
 * Both are per-visitor and invisible in review, so the rules are pinned here.
 *
 * Paths are the real ones: `/pricing` is currently the only entry in
 * LOCALIZED_PATHS (the only page with a full translation set), and `/about` is
 * a real marketing page that has none. If that stops being true, this first
 * test fails loudly instead of the redirect tests failing mysteriously.
 */
const TRANSLATED = '/pricing';
const UNTRANSLATED = '/about';

describe('test fixtures match the real route configuration', () => {
  it('uses a path that is in LOCALIZED_PATHS and one that is not', () => {
    expect(LOCALIZED_PATHS).toContain(TRANSLATED);
    expect(LOCALIZED_PATHS).not.toContain(UNTRANSLATED);
  });
});

describe('resolveMarket', () => {
  it('treats null, undefined, empty and garbage input as the en/USD base market', () => {
    for (const input of [null, undefined, '', '   ', 'XX', 'not-a-country', '??']) {
      expect(resolveMarket(input)).toEqual({ lang: DEFAULT_LANG, currency: DEFAULT_CURRENCY });
    }
  });

  it('is case- and whitespace-insensitive (headers are not guaranteed uppercase)', () => {
    expect(resolveMarket('mx')).toEqual({ lang: 'es', currency: 'MXN' });
    expect(resolveMarket('Mx')).toEqual({ lang: 'es', currency: 'MXN' });
    expect(resolveMarket(' mx ')).toEqual({ lang: 'es', currency: 'MXN' });
  });

  it('reads Spain as Spanish AND euro — it is in both sets', () => {
    expect(resolveMarket('ES')).toEqual({ lang: 'es', currency: 'EUR' });
  });

  it('maps Latin American countries to Spanish and their own currency', () => {
    expect(resolveMarket('MX')).toEqual({ lang: 'es', currency: 'MXN' });
    expect(resolveMarket('AR')).toEqual({ lang: 'es', currency: 'ARS' });
    expect(resolveMarket('CL')).toEqual({ lang: 'es', currency: 'CLP' });
    expect(resolveMarket('CO')).toEqual({ lang: 'es', currency: 'COP' });
    expect(resolveMarket('PE')).toEqual({ lang: 'es', currency: 'PEN' });
    expect(resolveMarket('UY')).toEqual({ lang: 'es', currency: 'UYU' });
    expect(resolveMarket('BO')).toEqual({ lang: 'es', currency: 'BOB' });
    expect(resolveMarket('PY')).toEqual({ lang: 'es', currency: 'PYG' });
  });

  it('gives Russian-language countries ru copy but USD prices — RUB is unsupported', () => {
    expect(resolveMarket('RU')).toEqual({ lang: 'ru', currency: 'USD' });
    expect(resolveMarket('BY')).toEqual({ lang: 'ru', currency: 'USD' });
    expect(resolveMarket('KZ')).toEqual({ lang: 'ru', currency: 'USD' });
    expect(resolveMarket('KG')).toEqual({ lang: 'ru', currency: 'USD' });
    // Checkout cannot take roubles, so RUB must not exist anywhere in the
    // system — a rouble price beside a dollar-only checkout is worse than
    // showing dollars throughout.
    expect(isCurrency('RUB')).toBe(false);
    expect(Object.keys(PINNED_USD_RATES)).not.toContain('RUB');
  });

  it('separates language from currency: the Eurozone reads English outside Spain', () => {
    expect(resolveMarket('DE')).toEqual({ lang: 'en', currency: 'EUR' });
    expect(resolveMarket('FR')).toEqual({ lang: 'en', currency: 'EUR' });
    expect(resolveMarket('IT')).toEqual({ lang: 'en', currency: 'EUR' });
    expect(resolveMarket('AE')).toEqual({ lang: 'en', currency: 'AED' });
  });

  it('keeps dollarized and hyper-inflationary economies on USD despite Spanish copy', () => {
    // EC, SV and PA use the US dollar as their actual currency; VE's own is
    // not quotable. Showing a converted "local" price would be wrong or absurd.
    for (const country of ['EC', 'SV', 'PA', 'VE']) {
      expect(resolveMarket(country)).toEqual({ lang: 'es', currency: 'USD' });
    }
  });

  it('falls back to USD for countries with no currency mapping', () => {
    expect(resolveMarket('GB')).toEqual({ lang: 'en', currency: 'USD' });
    expect(resolveMarket('JP')).toEqual({ lang: 'en', currency: 'USD' });
    expect(resolveMarket('BR')).toEqual({ lang: 'en', currency: 'USD' });
  });

  it('never returns a language or currency the rest of the app would reject', () => {
    const countries = [
      'US', 'ES', 'MX', 'AR', 'CL', 'CO', 'PE', 'UY', 'BO', 'PY', 'EC', 'SV',
      'PA', 'VE', 'RU', 'BY', 'KZ', 'KG', 'DE', 'FR', 'AE', 'GB', 'JP', 'ZZ',
    ];
    for (const country of countries) {
      const market = resolveMarket(country);
      expect(isLang(market.lang)).toBe(true);
      expect(isCurrency(market.currency)).toBe(true);
    }
  });
});

/**
 * markets.ts claims "every entry MUST have a rate in lib/i18n/currency.ts (a
 * test enforces this)". This is that test.
 *
 * The list below is maintained by hand on purpose: the union has no runtime
 * form, so the only way to check every member at runtime is to restate them,
 * and the type assertion under it makes an incomplete restatement a COMPILE
 * error rather than a silently narrower test.
 */
const ALL_CURRENCIES = [
  'USD', 'EUR', 'AED', 'ARS', 'BOB', 'CLP', 'COP', 'MXN', 'PEN', 'PYG', 'UYU',
] as const satisfies readonly Currency[];

type MissingFromList = Exclude<Currency, (typeof ALL_CURRENCIES)[number]>;
const _everyCurrencyIsListed: MissingFromList extends never ? true : never = true;
void _everyCurrencyIsListed;

describe('the Currency union and the pinned rate table cannot drift apart', () => {
  it('has a usable rate for every currency', () => {
    for (const currency of ALL_CURRENCIES) {
      const rate = PINNED_USD_RATES[currency];
      expect(rate, `no pinned rate for ${currency}`).toBeTypeOf('number');
      expect(Number.isFinite(rate), `${currency} rate is not finite`).toBe(true);
      expect(rate).toBeGreaterThan(0);
    }
  });

  it('has no rate for anything that is not a currency', () => {
    for (const key of Object.keys(PINNED_USD_RATES)) {
      expect(isCurrency(key), `${key} has a rate but is not a Currency`).toBe(true);
    }
    expect(Object.keys(PINNED_USD_RATES).sort()).toEqual([...ALL_CURRENCIES].sort());
  });

  it('accepts every currency through isCurrency — the cookie validator', () => {
    // Kept as a library invariant. Nothing mounts these today — the public
    // site publishes no price — but a currency that exists in the union and
    // not in the rate table is a latent crash, so the agreement is asserted with
    // isCurrency. A currency in the union but missing from that check would be
    // written and then silently discarded on every read.
    for (const currency of ALL_CURRENCIES) {
      expect(isCurrency(currency), `isCurrency rejects ${currency}`).toBe(true);
    }
    expect(isCurrency('usd')).toBe(false);
    expect(isCurrency('')).toBe(false);
    expect(isCurrency(null)).toBe(false);
    expect(isCurrency(42)).toBe(false);
  });

  it('formats every currency — each code must be a real ISO-4217 code to Intl', () => {
    for (const currency of ALL_CURRENCIES) {
      for (const lang of LANGS) {
        expect(() => formatMoney(1000, currency, lang)).not.toThrow();
      }
    }
  });
});

describe('splitLocalizedPath / localizedPath', () => {
  it('round-trips every language for the home page and a content page', () => {
    for (const lang of LANGS) {
      for (const basePath of ['/', '/pricing', '/services/websites']) {
        const url = localizedPath(basePath, lang);
        expect(splitLocalizedPath(url)).toEqual({ lang, basePath });
      }
    }
  });

  it('leaves English unprefixed — the base version has no /en tree', () => {
    expect(localizedPath('/', 'en')).toBe('/');
    expect(localizedPath('/pricing', 'en')).toBe('/pricing');
    expect(splitLocalizedPath('/pricing')).toEqual({ lang: 'en', basePath: '/pricing' });
  });

  it('produces bare /es and /ru for the localized home pages', () => {
    expect(localizedPath('/', 'es')).toBe('/es');
    expect(localizedPath('/', 'ru')).toBe('/ru');
    expect(splitLocalizedPath('/es')).toEqual({ lang: 'es', basePath: '/' });
    expect(splitLocalizedPath('/ru')).toEqual({ lang: 'ru', basePath: '/' });
  });

  it('only splits on a whole segment, not a prefix of one', () => {
    // `/estimates` and `/rules` start with "es"/"ru" and are English pages.
    expect(splitLocalizedPath('/estimates')).toEqual({ lang: 'en', basePath: '/estimates' });
    expect(splitLocalizedPath('/rules')).toEqual({ lang: 'en', basePath: '/rules' });
    expect(splitLocalizedPath('/espanol/x')).toEqual({ lang: 'en', basePath: '/espanol/x' });
  });
});

/** decideLangRouting with everything defaulted to "an anonymous US visitor". */
function decide(overrides: {
  pathname: string;
  country?: string | null;
  cookieLang?: string | null;
  hlParam?: string | null;
}) {
  return decideLangRouting({
    country: 'US',
    cookieLang: null,
    hlParam: null,
    ...overrides,
  });
}

describe('decideLangRouting', () => {
  it('rule: ?hl= wins over cookie and geo, and re-pins the cookie', () => {
    expect(decide({ pathname: TRANSLATED, country: 'MX', cookieLang: 'en', hlParam: 'ru' })).toEqual({
      lang: 'ru',
      redirectTo: '/ru/pricing',
      setCookie: true,
    });
    // Switching back off a localized page works the same way.
    expect(decide({ pathname: '/es/pricing', country: 'MX', cookieLang: 'es', hlParam: 'en' })).toEqual({
      lang: 'en',
      redirectTo: '/pricing',
      setCookie: true,
    });
  });

  it('rule: ?hl= that merely confirms the cookie does not rewrite it', () => {
    expect(decide({ pathname: '/es/pricing', country: 'US', cookieLang: 'es', hlParam: 'es' })).toEqual({
      lang: 'es',
      redirectTo: null,
      setCookie: false,
    });
  });

  it('rule: a prefixed URL never redirects, even from a US IP (the Googlebot case)', () => {
    // A crawler or a shared link hitting /es/pricing from the US must render
    // Spanish, and must not have its language pinned by the visit.
    expect(decide({ pathname: '/es/pricing', country: 'US' })).toEqual({
      lang: 'es',
      redirectTo: null,
      setCookie: false,
    });
    expect(decide({ pathname: '/ru/pricing', country: 'US', cookieLang: 'es' })).toEqual({
      lang: 'ru',
      redirectTo: null,
      setCookie: false,
    });
    expect(decide({ pathname: '/es', country: 'US', cookieLang: 'en' })).toEqual({
      lang: 'es',
      redirectTo: null,
      setCookie: false,
    });
  });

  it('rule: on an unprefixed page, the cookie beats geo', () => {
    // Someone in Mexico who chose English stays in English...
    expect(decide({ pathname: TRANSLATED, country: 'MX', cookieLang: 'en' })).toEqual({
      lang: 'en',
      redirectTo: null,
      setCookie: false,
    });
    // ...and someone in the US who chose Spanish gets Spanish.
    expect(decide({ pathname: TRANSLATED, country: 'US', cookieLang: 'es' })).toEqual({
      lang: 'es',
      redirectTo: '/es/pricing',
      setCookie: false,
    });
  });

  it('rule: geo applies only when there is no cookie', () => {
    expect(decide({ pathname: TRANSLATED, country: 'CL', cookieLang: null })).toEqual({
      lang: 'es',
      redirectTo: '/es/pricing',
      setCookie: true,
    });
    expect(decide({ pathname: TRANSLATED, country: 'RU', cookieLang: null })).toEqual({
      lang: 'ru',
      redirectTo: '/ru/pricing',
      setCookie: true,
    });
    // A US/unknown visitor is already where they belong.
    expect(decide({ pathname: TRANSLATED, country: null })).toEqual({
      lang: 'en',
      redirectTo: null,
      setCookie: true,
    });
  });

  it('rule: a path outside LOCALIZED_PATHS never redirects', () => {
    // The language is still resolved and remembered — it just cannot be
    // honoured until that page has a translation.
    expect(decide({ pathname: UNTRANSLATED, country: 'MX' })).toEqual({
      lang: 'es',
      redirectTo: null,
      setCookie: true,
    });
    expect(decide({ pathname: UNTRANSLATED, country: 'US', hlParam: 'ru' })).toEqual({
      lang: 'ru',
      redirectTo: null,
      setCookie: true,
    });
    expect(decide({ pathname: '/', country: 'MX' }).redirectTo).toBeNull();
    expect(decide({ pathname: '/contact', country: 'RU' }).redirectTo).toBeNull();
  });

  it('rule: garbage cookie and ?hl= values are ignored, not trusted', () => {
    // Bad ?hl= falls through to the cookie...
    expect(decide({ pathname: TRANSLATED, country: 'MX', cookieLang: 'en', hlParam: 'klingon' })).toEqual({
      lang: 'en',
      redirectTo: null,
      setCookie: false,
    });
    // ...and a bad cookie falls through to geo, and is replaced.
    expect(decide({ pathname: TRANSLATED, country: 'MX', cookieLang: 'xx' })).toEqual({
      lang: 'es',
      redirectTo: '/es/pricing',
      setCookie: true,
    });
    // Case matters: language codes are lowercase everywhere.
    expect(decide({ pathname: TRANSLATED, country: 'US', hlParam: 'ES' }).lang).toBe('en');
    for (const junk of ['', ' ', 'en-US', 'es-419', 'de', '../es']) {
      expect(decide({ pathname: TRANSLATED, country: 'US', hlParam: junk }).lang).toBe('en');
      expect(decide({ pathname: TRANSLATED, country: 'US', cookieLang: junk }).lang).toBe('en');
    }
  });

  it('only ever redirects to a path in the language it just chose', () => {
    const countries = [null, 'US', 'MX', 'ES', 'RU', 'DE', 'ZZ'];
    const langs: (string | null)[] = [null, 'en', 'es', 'ru', 'garbage'];
    for (const country of countries) {
      for (const cookieLang of langs) {
        for (const hlParam of langs) {
          for (const pathname of [TRANSLATED, '/es/pricing', '/ru/pricing', UNTRANSLATED, '/']) {
            const d = decide({ pathname, country, cookieLang, hlParam });
            if (d.redirectTo === null) continue;
            expect(splitLocalizedPath(d.redirectTo).lang).toBe(d.lang);
            expect(splitLocalizedPath(d.redirectTo).basePath).toBe(
              splitLocalizedPath(pathname).basePath,
            );
          }
        }
      }
    }
  });

  it('never redirects twice — the target of a redirect is a fixed point', () => {
    // The proxy preserves the query string, so ?hl= survives the hop. If a
    // decision could redirect again the visitor would loop forever.
    const countries = [null, 'US', 'MX', 'RU', 'ES'];
    const langs: (string | null)[] = [null, 'en', 'es', 'ru'];
    for (const country of countries) {
      for (const cookieLang of langs) {
        for (const hlParam of langs) {
          const first = decide({ pathname: TRANSLATED, country, cookieLang, hlParam });
          if (!first.redirectTo) continue;
          const second = decideLangRouting({
            pathname: first.redirectTo,
            country,
            // The hop sets the cookie the first decision asked for.
            cookieLang: first.setCookie ? first.lang : cookieLang,
            hlParam,
          });
          expect(second.redirectTo, `${first.redirectTo} redirected again`).toBeNull();
          expect(second.lang).toBe(first.lang);
        }
      }
    }
  });

  it('resolves to a real Lang for every input, however hostile', () => {
    const inputs: (string | null)[] = [null, '', 'en', 'es', 'ru', 'EN', 'zz', '<script>'];
    for (const cookieLang of inputs) {
      for (const hlParam of inputs) {
        const d = decide({ pathname: TRANSLATED, country: 'MX', cookieLang, hlParam });
        expect(isLang(d.lang)).toBe(true);
        expect(LANGS as readonly Lang[]).toContain(d.lang);
      }
    }
  });
});

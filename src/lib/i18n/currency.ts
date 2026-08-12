/**
 * Display-currency engine for the marketing site.
 *
 * The product's price points are set ONCE, in USD, in lib/services.ts. Every
 * other currency is that same USD price converted at a PINNED rate and
 * rounded to a clean, whole, human-looking number ($97 → AED 355, not
 * AED 356.23). No live FX at runtime: the rates below are a deliberate
 * snapshot so displayed prices are stable and reviewable in git.
 *
 * These numbers are a READING AID, never a quote. Checkout is Creem
 * (src/app/checkout/page.tsx) and it charges in USD; the visitor's own bank
 * does the conversion at whatever rate it likes. Two things follow, and both
 * matter: the rounding below is free to be generous with accuracy because no
 * one is billed against it, and any copy near a localized price has to say
 * plainly that the card is charged in dollars. `PRICING_DICTS.billedInUsdNote`
 * is that sentence.
 *
 * (An earlier version of this note claimed these rates would be "mirrored 1:1
 * into Stripe `currency_options`". There is no Stripe in this codebase and
 * never was — the line was inherited from the template this project started
 * from, along with the pricing copy it justified.)
 *
 * TODO(founder): verify/adjust the pinned rates below before launch, and
 * re-pin them on a deliberate schedule (quarterly, or when a rate drifts
 * >10%) — never automatically.
 */

import type { Currency, Lang } from './markets';
import { LANG_TAG } from './markets';

/** USD → currency. Pinned snapshot (see header note), not live FX. */
export const PINNED_USD_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.86,
  AED: 3.6725, // pegged
  ARS: 1300,
  BOB: 6.9,
  CLP: 950,
  COP: 4100,
  MXN: 18.5,
  PEN: 3.55,
  PYG: 7300,
  UYU: 40,
};

/**
 * Round a converted amount to a "clean" price — always a whole number, with
 * the rounding step scaled to the amount's magnitude so big-denomination
 * currencies land on round figures (CLP 92,150 → 92,000; COP 397,700 →
 * 400,000) while small ones keep fidelity (EUR 83.42 → 83).
 */
export function cleanRound(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const step =
    amount < 100 ? 1
    : amount < 1_000 ? 5
    : amount < 10_000 ? 50
    : amount < 100_000 ? 500
    : 5_000;
  return Math.round(amount / step) * step;
}

/** A USD price point in a display currency: converted at the pinned rate,
 *  clean-rounded. USD passes through untouched (base prices stay exact). */
export function localizePrice(usd: number, currency: Currency): number {
  if (currency === 'USD') return usd;
  return cleanRound(usd * PINNED_USD_RATES[currency]);
}

/**
 * Format an amount of a currency for a language ("$97", "355 AED" style comes
 * from Intl per locale). Always whole numbers — the entire point is no weird
 * cent values in any currency.
 */
export function formatMoney(amount: number, currency: Currency, lang: Lang): string {
  return new Intl.NumberFormat(LANG_TAG[lang], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Convenience: a USD price point rendered in a display currency. */
export function formatUsdPriceIn(usd: number, currency: Currency, lang: Lang): string {
  return formatMoney(localizePrice(usd, currency), currency, lang);
}

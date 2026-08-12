/**
 * Shared currency-disclosure copy, all languages.
 *
 * NAME IS INHERITED, AND WRONG. This file arrived from the source template as
 * a whole pricing PAGE dictionary — plans, seats, credits, trials, an FAQ —
 * for a product Fortitudo does not sell. None of that survives. What is left
 * is the currency disclosure and `fill()`, so the honest name is
 * `currency-notes.ts`. Renaming it is a bigger move than it looks: `fill()`
 * has importers all over the marketing tree.
 *
 * `billedInUsdNote` IS NOT RENDERED ANYWHERE. It was drawn by `<CurrencyNote>`
 * under the prices on `/pricing` when the visitor's display currency was not
 * USD. The public site advertises no price now — you tell us what you need and
 * we send you a fixed one — so the prices, the `LocalPrice` components and
 * that note's only mount all went. The string stays because the disclosure is
 * still true of what a card is charged in, and because deleting three
 * translations is easy and writing them again is not. Wire it up, or delete
 * it; do not leave it half-alive if `/pricing` ever quotes money again.
 *
 * The live export is `fill()` at the foot of this file, which every marketing
 * page uses for its `{token}` counts.
 *
 * WHY es/ru EXIST WITH NO TRANSLATED PAGES. English is the only shipped
 * language: there is no `/es` or `/ru` route tree, so cross-language redirects
 * stay switched off in the proxy and every visitor lands on the English page
 * with their own currency. Only `lang="en"` is ever passed in today. The
 * translations stay anyway — they cost one line each, they are the register
 * reference the next dictionary copies, and a disclosure about money is the
 * last string that should ship untranslated when those routes land.
 *
 * HOW TO EDIT.
 *  - `en` (American English) is the CANONICAL BASE. `PricingDict` is derived
 *    from it, so adding a key to `en` breaks the build until every language
 *    carries it. Edit `en` first, then bring es and ru with it.
 *  - Register: es is neutral Latin-American Spanish (es-419), informal "tú",
 *    no vosotros, no Castilian idiom. ru is formal «вы». A translation carries
 *    the same plain meaning, not the same words (`copy.md`).
 *  - Never hardcode a number or a currency in the prose. Values interpolate as
 *    `{token}` through `fill()`, so currency localization happens in one place.
 */

import type { Lang } from '../markets';

const en = {
  /**
   * Shown only when the display currency isn't USD.
   *
   * Two things have to be true at once. The amount beside this note is a USD
   * price converted at a PINNED rate (`../currency.ts`) and rounded to a clean
   * figure, so it is a readable approximation and not a quote. And checkout
   * charges USD: payment runs through Creem's hosted checkout
   * (`src/app/checkout/page.tsx`), which has no local-currency mode here — the
   * card network and the visitor's bank set what they finally pay. Hence
   * "your bank sets the final amount" rather than the softer "at the
   * equivalent rate" this string used to carry, which implied our pinned rate
   * was the billing rate. Delete this note rather than soften it if checkout
   * ever charges local currency.
   *
   * {currency} = the display currency code.
   */
  billedInUsdNote:
    'We show prices in {currency} so they are easy to read. You pay in US dollars, and your bank sets the final amount.',
};

export type PricingDict = typeof en;

const es: PricingDict = {
  billedInUsdNote:
    'Mostramos los precios en {currency} para que sean fáciles de leer. Te cobramos en dólares estadounidenses, y tu banco define el monto final.',
};

const ru: PricingDict = {
  billedInUsdNote:
    'Мы показываем цены в {currency}, чтобы их было проще читать. Оплата проходит в долларах США, а итоговую сумму определяет ваш банк.',
};

export const PRICING_DICTS: Record<Lang, PricingDict> = { en, es, ru };

/**
 * Tiny token interpolation: fill('{days} days of help', { days: 30 }). Tokens
 * with no provided value are left as-is — an unfilled `{days}` is visible in
 * review, where a silently dropped one is not.
 *
 * Every marketing page uses it for the counts that must not be typed into
 * prose: the post-launch support window, the pipeline stage count, the contact
 * address in the form's failure notices. It used to fill price tokens too, via
 * `<PriceText>`; there are no prices on the site any more. (A `pluralWord()`
 * helper lived here too; it existed to decline the word "credits" in Russian,
 * and went out with the credits.)
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
}

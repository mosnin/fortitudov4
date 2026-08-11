/**
 * The global 404.
 *
 * It used to be `bg-charcoal-dark text-white`. That token is a back-compat
 * alias which resolves to #ffffff under the current neutral system, so the
 * page was white text on a white background — the whole thing was invisible,
 * on every wrong URL, in both themes.
 *
 * It is charcoal now, like the rest of the logged-out site, with the palette
 * written out rather than pulled from `--fx-*`: those tokens are scoped to
 * `[data-marketing-shell]`, and a 404 can be served from anywhere in the app.
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1b1b1d] px-6 text-center text-white">
      <p
        style={{ fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }}
        className="text-[11px] tracking-[0.2em] text-white/40 uppercase"
      >
        Error 404
      </p>
      <h1 className="mt-5 text-[clamp(3rem,12vw,7rem)] leading-none font-semibold tracking-[-0.04em]">
        Page not found
      </h1>
      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/55">
        The link is wrong, or the page moved. Neither is your fault.
      </p>
      <Link
        href="/"
        className="mt-9 inline-flex h-11 items-center justify-center rounded-[4px] bg-[#f8cd02] px-6 text-[14px] font-medium text-[#0d0d0d] transition-colors duration-200 hover:bg-[#dcb602]"
      >
        Go home
      </Link>
    </div>
  );
}

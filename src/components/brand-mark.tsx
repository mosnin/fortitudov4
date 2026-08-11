import { cn } from '@/lib/utils';

/**
 * The Fortitudo mark, rendered as a CSS mask rather than an image.
 *
 * The asset is a single-colour silhouette — one opaque RGB with alpha doing
 * all the anti-aliasing — so painting it through a mask is lossless and buys
 * one thing a flat `<img>` cannot: the mark takes the colour of whatever it
 * sits on.
 *
 * That matters because the same lockup appears on two palettes. On the
 * logged-out site it needs to be racing yellow on charcoal (11.2:1). In the
 * product it sits on white, where that same yellow is 1.5:1 and effectively
 * disappears. Shipping two PNGs and remembering which to import at each of the
 * six call sites is the version of this that goes wrong in six months.
 *
 * `currentColor` means the mark simply inherits, and every surface is right by
 * default. Pass a text colour to override.
 */
export const BRAND_MARK_SRC = '/brand/fortitudo-mark.png';

export function BrandMark({
  className,
  label,
  style,
}: {
  className?: string;
  /** For call sites that size in px rather than Tailwind height classes. */
  style?: React.CSSProperties;
  /**
   * Only pass this when the mark stands alone. Beside a visible "Fortitudo"
   * wordmark it must stay unlabelled, or a screen reader says the brand twice.
   */
  label?: string;
}) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('inline-block aspect-square shrink-0 bg-current', className)}
      style={{
        ...style,
        WebkitMaskImage: `url(${BRAND_MARK_SRC})`,
        maskImage: `url(${BRAND_MARK_SRC})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}

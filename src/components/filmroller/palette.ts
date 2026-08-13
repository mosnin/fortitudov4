/**
 * Every colour the film roller draws, in one bag, supplied by the caller.
 *
 * The engine never invents a colour. The React section that mounts it reads
 * the `--fx-*` tokens off its own computed style (the `page-hero.tsx`
 * convention) and passes them here as plain CSS strings; the fallbacks it
 * uses when the tokens do not resolve are the token values themselves.
 *
 * Upstream was a white-gallery installation: paper floor, ink film. This
 * site's logged-out surface is the inversion — charcoal ground, so the floor
 * IS the page and the piece sits in it rather than on a white island. The
 * blank frames stay paper so the unrolled prints read against the dark, the
 * film carrier sits a step above the ground (`raised`) so the strip is
 * legible on charcoal, and the single yellow accent is the drum's index mark
 * — yellow is the primary-action colour on this surface and a 3D toy does not
 * get to spend more of it than a dot.
 */
export type FilmRollerPalette = {
  /** The ground: scene background, fog, and the floor plane. `--fx-charcoal`. */
  ground: string;
  /** One step above the ground — the film carrier strip. `--fx-charcoal-raised`. */
  raised: string;
  /** The blank frames' paper, and the drum band they wrap. */
  paper: string;
  /** Ink for hairlines and the frame indices drawn ON the paper. */
  ink: string;
  /** The one accent: the drum's index dot. `--fx-yellow`. */
  yellow: string;
};

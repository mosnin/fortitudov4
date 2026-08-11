/**
 * The homepage hero.
 *
 * The kit shipped a companion `hero-21.css` holding the palette and four
 * Google Font imports. Both are gone: the palette lives on
 * `[data-marketing-shell]` in globals.css so the whole logged-out site draws
 * from one set of tokens, and the faces resolve to the self-hosted Geist the
 * app already loads. Nothing else in the section changed shape.
 */

import { Section25Hero } from "@/components/originkit/ui/hero-21/section-25-hero";

const Hero21 = () => <Section25Hero />;

export default Hero21;

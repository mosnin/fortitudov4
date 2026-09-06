"use client";

import { Hero } from "./hero";

export function HeroExperience() {
  // Shader's own pill-to-viewport entrance needs no loading overlay or asset
  // gate. Navigation and the server-rendered page remain available immediately.
  return <Hero />;
}

"use client";

import { useCallback, useState } from "react";
import { Hero } from "./hero";
import { Preloader } from "./preloader";

export function HeroExperience() {
  const [ready, setReady] = useState(false);
  const revealHero = useCallback(() => setReady(true), []);
  return <><Preloader onReveal={revealHero} /><Hero entranceReady={ready} /></>;
}

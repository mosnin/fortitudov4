"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { parallaxCarousel } from "./effects/library/parallaxCarousel";
import { SERVICE_CATALOG, servicePdf } from "@/lib/service-catalog";
import { servicePhoto } from "@/content/service-groups";
const featured = ["websites", "software-solutions", "ai-solutions", "ecommerce", "brand"].map(slug => SERVICE_CATALOG.find(s => s.slug === slug)!);
export function DeckCarousel() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = ref.current as (HTMLElement & { parallaxCarouselCleanup?: () => void }) | null;
    if (!root) return;
    parallaxCarousel(root);
    return () => root.parallaxCarouselCleanup?.();
  }, []);
  return <div className="deck-carousel"><div className="deck-carousel-intro"><p>Explore the service collection</p><span>Drag to explore · Arrow keys to browse</span></div><section ref={ref} className="keen-slider" data-parallax-carousel data-drag-speed="0.502" aria-label="Featured service decks" aria-roledescription="carousel" tabIndex={0}>{featured.map((s,i) => <figure className="card" key={s.slug} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${featured.length}`}><div className="frame"><div className="media">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={servicePhoto(s.slug)} alt="" width={1600} height={1000} /></div></div><figcaption className="caption"><p className="eyebrow">Service deck / 0{i+1}</p><h2 className="title"><Link href={`/services/${s.slug}`}>{s.name}</Link></h2><a href={servicePdf(s)} download data-keen-slider-clickable>Download PDF ↓</a></figcaption></figure>)}</section></div>;
}

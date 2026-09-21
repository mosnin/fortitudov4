"use client";
/* eslint-disable @next/next/no-img-element -- Canonical template media is cloned by the supplied controller. */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { WORK_PROJECTS } from "@/lib/work-projects";
import { squeezeCarousel } from "./effects/library/squeezeCarousel";
import { ArrowButton } from "./arrow-button";
const projects = ["stored", "govern", "chippi", "plat-bio-labs", "tellme", "hannah-joy"].map(slug => WORK_PROJECTS.find(p => p.slug === slug)!);
const arrow = "M0 8.88482V6.76069L13.2244 6.78353L12.8362 6.3724L7.94837 1.50745L9.41014 0L17.2672 7.81133L9.43298 15.6455L7.94837 14.1381L13.2473 8.86198L0 8.88482Z";
export function SourceProjectCarousel() {
 const scope = useRef<HTMLDivElement>(null);
 useEffect(() => { const el = scope.current; if (!el) return; squeezeCarousel(el); return () => { el.querySelector<HTMLElement & { squeezeCleanup?: () => void }>("[data-morphing-carousel-2]")?.squeezeCleanup?.(); }; }, []);
 return <section className="source-projects" aria-labelledby="source-work-title"><div className="source-section-heading"><div><p>Selected work</p><h2 id="source-work-title" data-reveal-06>Built with Fortitudo.</h2></div><ArrowButton href="/work">Explore our work</ArrowButton></div><div ref={scope}>
 <section data-morphing-carousel-2 aria-roledescription="carousel" aria-label="Selected Fortitudo projects">
  <div className="arrows">{["previous", "next"].map(direction => <button key={direction} type="button" {...{[`data-${direction}`]: ""}} aria-label={`${direction === "next" ? "Next" : "Previous"} project`}><span className="arrow" aria-hidden="true">{[0,1].map(i=><svg key={i} width="18" height="16" viewBox="0 0 18 16" fill="none"><path d={arrow} fill="currentColor"/></svg>)}</span></button>)}</div>
  <div className="strip" data-strip aria-hidden="true">{projects.map(p=><template key={p.slug} data-item data-shift="0" dangerouslySetInnerHTML={{__html:`<div class="media"><img src="${p.image}" alt="" width="1600" height="900" /></div>`}}/>)}</div>
  <div className="captions">{projects.map((p,i)=><p key={p.slug} className={`caption ${i===0?"is-active":""}`} data-caption aria-hidden={i!==0}><strong><Link href={`/work/${p.slug}`}>{p.name} ↗</Link></strong> <span>{p.blurb}</span></p>)}</div>
 </section></div></section>;
}

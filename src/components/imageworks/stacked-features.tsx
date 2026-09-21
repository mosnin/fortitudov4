"use client";
/* eslint-disable @next/next/no-img-element -- Supplied panel media structure. */
import { useEffect, useRef } from "react";
import { stackedScrollPanels } from "./effects/stacked-scroll-panels";
import { ArrowButton } from "./arrow-button";
const FEATURES = [
  { title: ["Software", "that works."], image: "/work/case-studies/govern.png", alt: "Govern software project", text: "The public website, customer application and admin tools, built and deployed together. From the first brief to the working product and handover.", href: "/services/software-solutions", cta: "Explore software" },
  { title: ["AI with", "context."], image: "/work/case-studies/stored.png", alt: "Stored shared memory product", text: "Custom agents, connected tools and shared memory. We build around the work your team needs to do, with results you can inspect and review.", href: "/services/ai-solutions", cta: "Explore applied AI" },
  { title: ["Connected", "workflows."], image: "/work/case-studies/chippi.png", alt: "Chippi lead-to-tour workflow", text: "Connect the systems behind your business. From incoming inquiries to follow-up and the next action, bring the workflow into one coherent experience.", href: "/services/other-tech-solutions", cta: "Explore integrations" },
];
export function StackedFeatures() {
  const scope = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scope.current) return stackedScrollPanels(scope.current); }, []);
  return <div ref={scope} className="stacked-scroll-preview" data-theme="dark">
    <section className="stacked-scroll-panels" data-stacked-scroll-panels aria-label="Software and AI capabilities">
      <div className="scroll-cue"><p className="section-cue"><span data-reveal-06>Built for the way you work.</span></p></div>
      {FEATURES.map(feature => <article key={feature.href} className="stacked-scroll-panel"><div className="stacked-scroll-panel__inner">
        <div className="stacked-scroll-panel__media"><img className="stacked-scroll-panel__image" src={feature.image} alt={feature.alt} /></div>
        <div className="stacked-scroll-panel__content"><div className="stacked-scroll-panel__main">
          <div className="stacked-scroll-panel__title"><h2>{feature.title.map(t => <span key={t} data-reveal-06>{t}</span>)}</h2></div>
          <div className="stacked-scroll-panel__description"><p>{feature.text}</p><ArrowButton href={feature.href} className="mt-8">{feature.cta}</ArrowButton></div>
        </div></div>
      </div></article>)}
    </section>
  </div>;
}

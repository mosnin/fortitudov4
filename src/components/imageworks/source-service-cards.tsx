"use client";
/* eslint-disable @next/next/no-img-element -- Preserve the supplied card media DOM. */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { stackedServiceCards } from "./effects/library/stackedServiceCards";
import { ArrowButton } from "./arrow-button";
const cards = [
 {title:"Websites & ecommerce",body:"Business websites and online stores, from strategy and design to development, launch and handover.",href:"websites",pdf:"website-design-and-development",image:"feature-motion.webp",links:[["Websites","websites"],["Ecommerce","ecommerce"]]},
 {title:"Software & integrations",body:"Complete digital products and connected business systems. The customer experience, operating tools and infrastructure, built together.",href:"software-solutions",pdf:"complete-software-buildout",image:"feature-moss.webp",links:[["Custom software","software-solutions"],["MCP & API integrations","mcp-and-api"]]},
 {title:"AI & automation",body:"Agents, teams and workflows connected to your business tools and knowledge. Define the task, build the system and review the result.",href:"ai-solutions",pdf:"ai-agents-and-infrastructure",image:"feature-marsh.webp",links:[["Custom AI agents","ai-solutions"],["Agent teams","agent-teams"],["Infrastructure","agent-infrastructure"],["Jev implementation","jev-implementation"],["Context & memory","context-and-memory"],["Creative AI workflows","creative-ai-workflows"],["AI setup & consulting","ai-setup-and-consulting"]]},
 {title:"Design & advisory",body:"Create your identity, improve an existing product or get a clear plan for the next stage. Focused work with practical deliverables.",href:"brand",pdf:"brand-creation-and-implementation",image:"feature-motion.webp",links:[["Brand design","brand"],["Unslop","unslop"],["Consultation","consultation"]]},
];
export function SourceServiceCards() {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{ if(ref.current) return stackedServiceCards(ref.current); },[]);
 return <div ref={ref}><section className="stacked-scroll-panel-2 source-services" data-stacked-scroll-panel-2 data-theme="dark" aria-label="Fortitudo services"><div className="stack" data-card-stack>{cards.map(card=><article className="card" data-card key={card.title}><div className="card-content"><h2>{card.title}</h2><p>{card.body}</p><div className="source-service-links">{card.links.map(([label,slug])=><Link key={slug} href={`/services/${slug}`}>{label} ↗</Link>)}</div><div className="source-card-actions"><ArrowButton href={`/services/${card.href}`}>Explore service</ArrowButton><a href={`/resources/fortitudo-${card.pdf}.pdf`} download>Download deck ↓</a></div></div><div className="media" aria-hidden="true"><img src={`https://www.details.so/vault-previews/stacked-scroll-panel-2/media/${card.image}`} alt="" loading="lazy"/></div></article>)}</div></section></div>;
}

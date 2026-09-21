"use client";
import Link from "next/link";
import { useState } from "react";
import { SERVICE_GROUPS } from "@/content/service-groups";
import catalog from "@/content/service-catalog.json";
export function ServiceMenu(){const [expanded,setExpanded]=useState(false);return <div className="service-menu"><article className="item"><input className="service-menu-check" type="checkbox" id="drawer-services" checked={expanded} onChange={e=>setExpanded(e.target.checked)} aria-controls="drawer-service-links" aria-expanded={expanded}/><label className="question" htmlFor="drawer-services"><span>Services</span><span className="icon" aria-hidden="true"><span className="icon-mark"/></span></label><div className="answer" id="drawer-service-links" inert={!expanded}><div className="answer-inner"><Link href="/services">All services ↗</Link>{SERVICE_GROUPS.map(g=><div key={g.title}><p>{g.title}</p>{g.slugs.map(slug=><Link key={slug} href={`/services/${slug}`}>{catalog.find(s=>s.slug===slug)!.name}</Link>)}</div>)}</div></div></article></div>}

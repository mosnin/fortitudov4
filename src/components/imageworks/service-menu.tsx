"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { INDUSTRIES } from "@/content/industries";
import { SERVICE_GROUPS } from "@/content/service-groups";
import catalog from "@/content/service-catalog.json";

function DrawerMenu({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const linksId = `drawer-${id}-links`;
  return (
    <div className="service-menu">
      <article className="item">
        <input
          className="service-menu-check"
          type="checkbox"
          id={`drawer-${id}`}
          checked={expanded}
          onChange={(event) => setExpanded(event.target.checked)}
          aria-controls={linksId}
          aria-expanded={expanded}
        />
        <label className="question" htmlFor={`drawer-${id}`}>
          <span>{label}</span>
          <span className="icon" aria-hidden="true">
            <span className="icon-mark" />
          </span>
        </label>
        <div className="answer" id={linksId} inert={!expanded}>
          <div className="answer-inner">{children}</div>
        </div>
      </article>
    </div>
  );
}

export function ServiceMenu() {
  return (
    <DrawerMenu id="services" label="Services">
      <Link href="/services">All services ↗</Link>
      {SERVICE_GROUPS.map((group) => (
        <div key={group.title}>
          <p>{group.title}</p>
          {group.slugs.map((slug) => (
            <Link key={slug} href={`/services/${slug}`}>
              {catalog.find((service) => service.slug === slug)!.name}
            </Link>
          ))}
        </div>
      ))}
    </DrawerMenu>
  );
}

export function IndustryMenu() {
  return (
    <DrawerMenu id="industries" label="Industries">
      <Link href="/industries">All industries ↗</Link>
      <div>
        <p>Sector experience</p>
        {INDUSTRIES.map((item) => (
          <Link key={item.slug} href={`/industries/${item.slug}`}>
            {item.label}
          </Link>
        ))}
      </div>
    </DrawerMenu>
  );
}

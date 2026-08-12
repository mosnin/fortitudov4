/**
 * What Fortitudo sells.
 *
 * AGENTS.md: exactly five offerings — Websites, Software Solutions, AI
 * Solutions, Consultation, Digital Marketing — declared in `services.ts` and
 * mirrored by `pricing.ts` and the `service_type` enum. Three files, one list,
 * nothing enforcing the agreement: a sixth service added to the marketing copy
 * and not to the enum is a runtime insert failure.
 *
 * These test the documented invariant rather than the current copy: the ids,
 * the cross-file agreement, and the arithmetic. Marketing wording is free to
 * change without touching this file.
 *
 * `services.ts` used to carry a `startingPrice` string per offering, and this
 * file asserted it matched `pricing.ts` to the dollar. The public site no
 * longer advertises a price anywhere — you tell us what you need and we send
 * you a fixed one — so the field is gone and a test below checks it stays
 * gone. `pricing.ts` is untouched: it is what the product invoices real
 * clients from, and nothing here is about the marketing site's figures any
 * more because there are none.
 */

import { describe, expect, it } from "vitest";
import { SERVICE_LABELS, services, type ServiceType } from "./services";
import { formatUsd, getPricing } from "./pricing";
import { serviceTypeEnum } from "@/db/schema";

const THE_FIVE: ServiceType[] = [
  "websites",
  "software_solutions",
  "ai_solutions",
  "consultation",
  "digital_marketing",
];

describe("the catalogue", () => {
  it("sells exactly the five offerings AGENTS.md names", () => {
    expect(services.map((service) => service.id)).toEqual(THE_FIVE);
  });

  it("names each of them once", () => {
    const ids = services.map((service) => service.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("agrees with the service_type database enum", () => {
    expect([...serviceTypeEnum.enumValues].sort()).toEqual([...THE_FIVE].sort());
  });

  it("labels every offering, and labels nothing that is not one", () => {
    expect(Object.keys(SERVICE_LABELS).sort()).toEqual([...THE_FIVE].sort());
    for (const service of services) {
      expect(SERVICE_LABELS[service.id]).toBe(service.name);
    }
  });

  it("carries none of the swept-out GHL machinery", () => {
    // AGENTS.md: no SaaS-plan reselling, no ad-campaign products, no tiers.
    const blob = JSON.stringify(services.map(({ id, name, description, features }) => ({
      id,
      name,
      description,
      features,
    }))).toLowerCase();

    for (const banned of ["bronze", "gold tier", "diamond", "gohighlevel", "ghl"]) {
      expect(blob).not.toContain(banned);
    }
  });

  it("gives every offering copy the marketing pages can render", () => {
    for (const service of services) {
      expect(service.name.trim().length, service.id).toBeGreaterThan(0);
      expect(service.description.trim().length, service.id).toBeGreaterThan(20);
      expect(service.features.length, service.id).toBeGreaterThan(0);
      expect(typeof service.icon, service.id).not.toBe("undefined");
    }
  });

  it("keeps every id short enough for the columns that store it", () => {
    // leads.service_interest is varchar(100) and the contact form posts the id.
    for (const service of services) {
      expect(service.id.length).toBeLessThanOrEqual(100);
    }
  });
});

describe("pricing", () => {
  it("prices every offering", () => {
    for (const id of THE_FIVE) {
      expect(getPricing(id), id).toBeDefined();
    }
  });

  it("labels each price the same way the catalogue does", () => {
    for (const service of services) {
      expect(getPricing(service.id)?.label).toBe(service.name);
    }
  });

  it("advertises no price at all — the public site quotes none", () => {
    // The marketing site used to carry a `startingPrice` string per offering
    // and assert it matched pricing.ts to the dollar. Every advertised figure
    // is gone: you tell us what you need and we send you a fixed price. The
    // amounts below stay, because they are what the PRODUCT invoices from.
    for (const service of services) {
      expect(Object.keys(service), service.id).not.toContain("startingPrice");
      expect(JSON.stringify(service), service.id).not.toMatch(/\$\s?\d/);
    }
  });

  it("bills digital marketing monthly and every build once", () => {
    // The billing cycle used to be checked against the "/mo" suffix on the
    // advertised price. It is a property of the offering, not of the copy.
    for (const id of THE_FIVE) {
      expect(getPricing(id)!.billing, id).toBe(
        id === "digital_marketing" ? "monthly" : "one_time"
      );
    }
  });

  it("holds amounts in whole cents, never dollars or floats", () => {
    for (const id of THE_FIVE) {
      const pricing = getPricing(id)!;
      expect(Number.isInteger(pricing.amountCents), id).toBe(true);
      expect(pricing.amountCents, id).toBeGreaterThan(0);
      for (const item of pricing.lineItems) {
        expect(Number.isInteger(item.amountCents), `${id}/${item.name}`).toBe(true);
      }
    }
  });

  it("sums its line items to the total, so an invoice stays consistent", () => {
    for (const id of THE_FIVE) {
      const pricing = getPricing(id)!;
      const sum = pricing.lineItems.reduce((total, item) => total + item.amountCents, 0);
      expect(sum, id).toBe(pricing.amountCents);
    }
  });

  it("gives every line item a name and a positive amount", () => {
    for (const id of THE_FIVE) {
      for (const item of getPricing(id)!.lineItems) {
        expect(item.name.trim().length, id).toBeGreaterThan(0);
        expect(item.amountCents, `${id}/${item.name}`).toBeGreaterThan(0);
      }
    }
  });

  it("returns undefined for a service that is not sold", () => {
    for (const unknown of ["", "custom", "seo", "websites ", "Websites", "branding"]) {
      expect(getPricing(unknown), unknown).toBeUndefined();
    }
  });

  it("returns undefined for inherited Object keys", () => {
    // A bare index reads through the prototype, so unvalidated input used to
    // get Object.prototype's member back and the documented `undefined` check
    // never fired. getPricing now tests for an own property first.
    for (const inherited of [
      "constructor",
      "toString",
      "hasOwnProperty",
      "valueOf",
      "__proto__",
    ]) {
      expect(getPricing(inherited), inherited).toBeUndefined();
    }
  });
});

describe("formatUsd", () => {
  it("prints whole dollars with thousands separators", () => {
    expect(formatUsd(150000)).toBe("$1,500");
    expect(formatUsd(350000)).toBe("$3,500");
    expect(formatUsd(50000)).toBe("$500");
    expect(formatUsd(120000)).toBe("$1,200");
    expect(formatUsd(123456789)).toBe("$1,234,568");
  });

  it("prints nothing owed as $0", () => {
    expect(formatUsd(0)).toBe("$0");
  });

  it("rounds part-dollar amounts to the nearest dollar", () => {
    expect(formatUsd(149)).toBe("$1");
    expect(formatUsd(150)).toBe("$2");
    expect(formatUsd(99)).toBe("$1");
    expect(formatUsd(49)).toBe("$0");
  });

  it("keeps a credit negative rather than dropping the sign", () => {
    expect(formatUsd(-150000)).toBe("$-1,500");
  });
});

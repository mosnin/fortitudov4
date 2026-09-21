import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { JOURNAL, articleStructuredData, articleUrl } from "./journal";
import { catalogService } from "./service-catalog";
import sitemap from "@/app/sitemap";
describe("journal publishing integrity",()=>{
 it("publishes unique routes with usable service destinations and cover assets",()=>{
   expect(new Set(JOURNAL.map(p=>p.slug)).size).toBe(JOURNAL.length);
   for(const p of JOURNAL){
     expect(p.service === "other-tech-solutions" || Boolean(catalogService(p.service))).toBe(true);
     expect(existsSync(join(process.cwd(),"public",p.cover))).toBe(true);
     expect(new Set(p.sections.map(s=>s.id)).size).toBe(p.sections.length);
     const schema=articleStructuredData(p);
     expect(schema.headline).toBe(p.title);
     expect(schema.author.name).toBe("Fortitudo");
     expect(schema.image[0]).toContain(p.cover);
     expect(sitemap().some(s=>s.url===`https://www.fortitudo.agency${articleUrl(p)}`)).toBe(true);
   }
 });
});

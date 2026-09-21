import photography from "./service-photography.json";
export const SERVICE_GROUPS = [
 {title:"Websites & ecommerce",slugs:["websites","ecommerce"],photo:"feature-motion.webp"},
 {title:"Software & integrations",slugs:["software-solutions","mcp-and-api"],photo:"feature-moss.webp"},
 {title:"AI & automation",slugs:["ai-solutions","agent-teams","agent-infrastructure","jev-implementation","context-and-memory","creative-ai-workflows","ai-setup-and-consulting"],photo:"feature-marsh.webp"},
 {title:"Design & advisory",slugs:["brand","unslop","consultation"],photo:"feature-motion.webp"},
];
export const servicePhoto = (slug: string) => photography[slug as keyof typeof photography] ?? "/photography/feature-moss.webp";

import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// Enums
// The four building disciplines. We are builders — software, commerce, AI, and
// infrastructure. No marketing/SEO/funnels.
export const serviceTypeEnum = pgEnum("service_type", [
  "software",
  "commerce",
  "ai",
  "infrastructure",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "onboarding",
  "payment_pending",
  "in_progress",
  "revision",
  "completed",
  "cancelled",
]);

export const phaseStatusEnum = pgEnum("phase_status", [
  "pending",
  "in_progress",
  "completed",
]);

export const messageRoleEnum = pgEnum("message_role", ["client", "admin"]);

export const revisionStatusEnum = pgEnum("revision_status", [
  "pending",
  "in_progress",
  "completed",
  "rejected",
]);

// Users - synced with Clerk
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  imageUrl: text("image_url"),
  role: varchar("role", { length: 50 }).notNull().default("client"),
  // Principal type: a human client, an autonomous agent, or an organization.
  // Agents authenticate via api_keys and ride the same domain core as humans.
  type: varchar("type", { length: 20 }).notNull().default("human"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  status: projectStatusEnum("status").notNull().default("onboarding"),
  currentPhase: integer("current_phase").notNull().default(0),
  // The productized starting point this project was bought from, if any.
  catalogItemId: uuid("catalog_item_id").references(() => catalogItems.id, {
    onDelete: "set null",
  }),
  // The architect leading this build.
  architectId: uuid("architect_id").references(() => teamMembers.id, {
    onDelete: "set null",
  }),
  // Estimation loop: scoped vs. actual effort (hours) to sharpen pricing over time.
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_projects_user_id").on(table.userId),
]);

// Onboarding submissions
export const onboardingSubmissions = pgTable("onboarding_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 255 }),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  targetAudience: text("target_audience"),
  timeline: varchar("timeline", { length: 100 }),
  budget: varchar("budget", { length: 100 }),
  additionalNotes: text("additional_notes"),
  brandColors: text("brand_colors"),
  features: jsonb("features"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_onboarding_project_id").on(table.projectId),
]);

// Project phases
export const projectPhases = pgTable("project_phases", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  status: phaseStatusEnum("status").notNull().default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_phases_project_id").on(table.projectId),
]);

// Payments
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  creemPaymentId: varchar("creem_payment_id", { length: 255 }).unique(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("usd"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_payments_project_id").on(table.projectId),
  index("idx_payments_user_id").on(table.userId),
]);

// Milestones — phase-gated billing. Each is its own payable slice of a build.
export const milestones = pgTable("milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  amount: integer("amount").notNull(), // cents
  order: integer("order").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending | paid
  dueAt: timestamp("due_at"),
  paidAt: timestamp("paid_at"),
  paymentId: uuid("payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_milestones_project_id").on(table.projectId),
]);

// Messages
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_messages_project_id").on(table.projectId),
]);

// Files
export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 500 }).notNull(),
  url: text("url").notNull(),
  size: integer("size"),
  type: varchar("type", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_files_project_id").on(table.projectId),
]);

// Revision requests
export const revisionRequests = pgTable("revision_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(),
  status: revisionStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_revisions_project_id").on(table.projectId),
]);

// Notifications
export const notificationTypeEnum = pgEnum("notification_type", [
  "phase_update",
  "message_received",
  "revision_response",
  "payment_confirmed",
  "project_completed",
  "file_uploaded",
  "comment_added",
  "survey_request",
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  read: boolean("read").notNull().default(false),
  actionUrl: varchar("action_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_notifications_user_id").on(table.userId),
]);

// Project comments (thread-based)
export const projectComments = pgTable("project_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  parentId: uuid("parent_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_comments_project_id").on(table.projectId),
]);

// Client satisfaction surveys
export const satisfactionSurveys = pgTable("satisfaction_surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  score: integer("score").notNull(), // 1-10 NPS
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_surveys_project_id").on(table.projectId),
]);

// Invoices
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  paymentId: uuid("payment_id")
    .references(() => payments.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  items: jsonb("items").notNull(),
  subtotal: integer("subtotal").notNull(),
  tax: integer("tax").notNull().default(0),
  total: integer("total").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("paid"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
}, (table) => [
  index("idx_invoices_user_id").on(table.userId),
  index("idx_invoices_project_id").on(table.projectId),
]);

// Analytics events (client-facing)
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  event: varchar("event", { length: 100 }).notNull(),
  value: integer("value"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_analytics_project_id").on(table.projectId),
]);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectPhase = typeof projectPhases.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type File = typeof files.$inferSelect;
export type RevisionRequest = typeof revisionRequests.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type OnboardingSubmission = typeof onboardingSubmissions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ProjectComment = typeof projectComments.$inferSelect;
export type SatisfactionSurvey = typeof satisfactionSurveys.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// ---------------------------------------------------------------------------
// Studio core: catalog, blueprints, decision loop, deliverables, agents, team
// ---------------------------------------------------------------------------

// Team / architects — the humans (and the studio's identity) behind the build.
export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Optional link to a Clerk-synced user (architects who also log in).
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  discipline: serviceTypeEnum("discipline"),
  bio: text("bio"),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Catalog — the productized "starting points" (the hybrid model's on-ramp).
// Directly purchasable by humans and agents; anything beyond becomes a Blueprint.
export const catalogItems = pgTable("catalog_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  discipline: serviceTypeEnum("discipline").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  summary: varchar("summary", { length: 500 }),
  description: text("description"),
  // Price in cents. fixedPrice=false means this is a "from" / starting price.
  fromPrice: integer("from_price").notNull(),
  fixedPrice: boolean("fixed_price").notNull().default(false),
  // Whether an autonomous agent may purchase this without a human in the loop.
  agentPurchasable: boolean("agent_purchasable").notNull().default(true),
  features: jsonb("features").$type<string[]>(),
  estimatedTimeline: varchar("estimated_timeline", { length: 100 }),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_catalog_discipline").on(table.discipline),
]);

// Blueprint — the bespoke proposal. Scope + architecture + price, signable.
export const blueprintStatusEnum = pgEnum("blueprint_status", [
  "draft",
  "sent",
  "accepted",
  "declined",
  "expired",
]);

export type BlueprintLineItem = { label: string; description?: string; amount: number };
export type BlueprintScopeItem = { title: string; detail?: string };

export const blueprints = pgTable("blueprints", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  scope: jsonb("scope").$type<BlueprintScopeItem[]>().notNull(),
  architectureNotes: text("architecture_notes"),
  lineItems: jsonb("line_items").$type<BlueprintLineItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  total: integer("total").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("usd"),
  estimatedTimeline: varchar("estimated_timeline", { length: 100 }),
  status: blueprintStatusEnum("status").notNull().default("draft"),
  validUntil: timestamp("valid_until"),
  acceptedAt: timestamp("accepted_at"),
  acceptedBy: uuid("accepted_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_blueprints_project_id").on(table.projectId),
]);

// Decision loop — the spine. The project only interrupts the client (or their
// agent) when a human-judgment decision, asset, or credential is needed.
export const decisionKindEnum = pgEnum("decision_kind", [
  "info",
  "asset",
  "credential",
  "approval",
  "choice",
]);

export const decisionStatusEnum = pgEnum("decision_status", [
  "open",
  "answered",
  "cancelled",
]);

export const decisionRequests = pgTable("decision_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  kind: decisionKindEnum("kind").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  prompt: text("prompt").notNull(),
  // For "choice": { options: string[] }. For "info": { fields: [...] }. Etc.
  schema: jsonb("schema").$type<Record<string, unknown>>(),
  status: decisionStatusEnum("status").notNull().default("open"),
  // Whether it blocks build progress until answered.
  blocking: boolean("blocking").notNull().default(true),
  response: jsonb("response").$type<Record<string, unknown>>(),
  respondedBy: uuid("responded_by").references(() => users.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  dueAt: timestamp("due_at"),
  answeredAt: timestamp("answered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_decisions_project_id").on(table.projectId),
  index("idx_decisions_status").on(table.status),
]);

// Deliverables — the actual digital assets, surfaced as they land.
export const deliverableKindEnum = pgEnum("deliverable_kind", [
  "preview",
  "repo",
  "deploy_url",
  "design",
  "document",
  "other",
]);

export const deliverables = pgTable("deliverables", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  kind: deliverableKindEnum("kind").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url"),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  // Client review: pending → approved | changes_requested.
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at"),
  clientNote: text("client_note"),
  releasedAt: timestamp("released_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_deliverables_project_id").on(table.projectId),
]);

// API keys — how autonomous agents authenticate to the agent API.
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  // Shown-once display prefix (e.g. "ftd_live_ab12") for identification.
  prefix: varchar("prefix", { length: 32 }).notNull(),
  // SHA-256 of the full key; the raw key is never stored.
  hashedKey: varchar("hashed_key", { length: 128 }).notNull().unique(),
  lastUsedAt: timestamp("last_used_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_api_keys_user_id").on(table.userId),
  index("idx_api_keys_hashed").on(table.hashedKey),
]);

export type TeamMember = typeof teamMembers.$inferSelect;
export type CatalogItem = typeof catalogItems.$inferSelect;
export type Blueprint = typeof blueprints.$inferSelect;
export type DecisionRequest = typeof decisionRequests.$inferSelect;
export type Deliverable = typeof deliverables.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;

// Business profile — captured at onboarding so the studio (and our agents)
// understand who the client is. One per user; prefills future Briefs.
export const businessStageEnum = pgEnum("business_stage", [
  "idea",
  "early",
  "growing",
  "established",
]);

export const businessProfiles = pgTable("business_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 255 }),
  website: varchar("website", { length: 500 }),
  description: text("description").notNull(),
  targetMarket: text("target_market"),
  stage: businessStageEnum("stage"),
  teamSize: varchar("team_size", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_business_profiles_user_id").on(table.userId),
]);

export type BusinessProfile = typeof businessProfiles.$inferSelect;

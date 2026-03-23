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
} from "drizzle-orm/pg-core";

// Enums
export const serviceTypeEnum = pgEnum("service_type", [
  "web_application",
  "ecommerce_store",
  "funnels",
  "ai_automation",
  "open_claw_deployment",
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  status: projectStatusEnum("status").notNull().default("onboarding"),
  currentPhase: integer("current_phase").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Onboarding submissions
export const onboardingSubmissions = pgTable("onboarding_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
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
});

// Project phases
export const projectPhases = pgTable("project_phases", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  status: phaseStatusEnum("status").notNull().default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payments
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  creemPaymentId: varchar("creem_payment_id", { length: 255 }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("usd"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id)
    .notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Files
export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 500 }).notNull(),
  url: text("url").notNull(),
  size: integer("size"),
  type: varchar("type", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Revision requests
export const revisionRequests = pgTable("revision_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  description: text("description").notNull(),
  status: revisionStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
export type OnboardingSubmission = typeof onboardingSubmissions.$inferSelect;

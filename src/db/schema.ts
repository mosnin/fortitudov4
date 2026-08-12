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

// Staff roles (tiered access): admin > project_manager > va. Clients use "client".
export const userRoles = ["client", "admin", "project_manager", "va"] as const;
export type UserRole = (typeof userRoles)[number];

export const serviceTypeEnum = pgEnum("service_type", [
  "websites",
  "software_solutions",
  "ai_solutions",
  "consultation",
  "digital_marketing",
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
  bio: text("bio"),
  // "client" | "admin" | "project_manager" | "va" — see lib/permissions.ts
  role: varchar("role", { length: 50 }).notNull().default("client"),
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
  // Legacy column from the retired Creem checkout flow — kept for old rows.
  creemPaymentId: varchar("creem_payment_id", { length: 255 }).unique(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("usd"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  // Free-form admin notes ("wire ref 4421", "50% deposit", …).
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_payments_project_id").on(table.projectId),
  index("idx_payments_user_id").on(table.userId),
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
  // Helix queued a change significant enough that it must not be swept up in a
  // bulk approval. Routine changes deliberately do not notify.
  "helix_approval_needed",
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

// Leads — captured from the public site (contact form, get-started funnel).
// This table IS the record; there is no external CRM behind it. The comment
// here used to say leads were synced into GoHighLevel, which was true of the
// template this project started from and has never been true of Fortitudo.
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
]);

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  serviceInterest: varchar("service_interest", { length: 100 }),
  monthlyBudget: varchar("monthly_budget", { length: 100 }),
  message: text("message"),
  // Where the lead came from: "contact_form" | "get_started_funnel" | ...
  source: varchar("source", { length: 100 }).notNull().default("contact_form"),
  status: leadStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_leads_email").on(table.email),
  index("idx_leads_status").on(table.status),
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "in_review",
  "done",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull().default(0),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_tasks_project_id").on(table.projectId),
  index("idx_tasks_assignee_id").on(table.assigneeId),
]);

// Agency clients — the business record of who we serve (which offering they
// bought, setup + any monthly fee). Separate from portal logins: a client may
// exist here before (or without) ever signing in, and can be linked to a
// portal user once they do.
export const clientPackageEnum = pgEnum("client_package", [
  "websites",
  "software_solutions",
  "ai_solutions",
  "consultation",
  "digital_marketing",
  "custom",
]);

export const clientStatusEnum = pgEnum("client_status", [
  "active",
  "paused",
  "churned",
]);

// The delivery pipeline every engagement walks. Drives the Client CRM board
// columns and each client's kickoff checklist. Order matters — stage
// auto-progression walks it top to bottom.
export const crmStageEnum = pgEnum("crm_stage", [
  "onboarding",
  "discovery",
  "design",
  "build",
  "client_review",
  "launched",
  "retained",
]);

export const clientTaskStatusEnum = pgEnum("client_task_status", [
  "pending",
  "in_progress",
  "completed",
]);

export const clientTaskPriorityEnum = pgEnum("client_task_priority", [
  "low",
  "medium",
  "high",
]);

export const agencyClients = pgTable("agency_clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  businessType: varchar("business_type", { length: 100 }),
  package: clientPackageEnum("package").notNull().default("websites"),
  // Display name for package = "custom" (e.g. a bespoke retainer).
  packageLabel: varchar("package_label", { length: 100 }),
  // Money in cents.
  setupFee: integer("setup_fee").notNull().default(0),
  monthlyFee: integer("monthly_fee").notNull().default(0),
  startDate: timestamp("start_date").defaultNow().notNull(),
  nextDueDate: timestamp("next_due_date"),
  status: clientStatusEnum("status").notNull().default("active"),
  // When this client churned — set on the status change so churn can be
  // reported for a date range rather than only lifetime-to-date.
  churnedAt: timestamp("churned_at"),
  // Current position in the delivery pipeline (Client CRM board).
  stage: crmStageEnum("stage").notNull().default("onboarding"),
  // Login email for the portal invite (kept even before the account exists).
  email: varchar("email", { length: 255 }),
  // Shared asset links surfaced on the client portal.
  driveUrl: text("drive_url"),
  landingPageUrl: text("landing_page_url"),
  // Optional link to the client's portal login.
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agency_clients_status").on(table.status),
]);

// Delivery checklist tasks per client — the default kickoff steps (auto-created
// on client creation) plus any custom tasks. Completing tasks auto-advances
// the client's pipeline stage.
export const clientTasks = pgTable("client_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .references(() => agencyClients.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  // Which pipeline stage this task belongs to (null for ad-hoc custom tasks).
  stage: crmStageEnum("stage"),
  status: clientTaskStatusEnum("status").notNull().default("pending"),
  priority: clientTaskPriorityEnum("priority").notNull().default("medium"),
  // Denormalized assignee name so the checklist reads correctly even if the
  // staff account is later removed; assigneeId is the live link.
  assigneeId: uuid("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  assigneeName: varchar("assignee_name", { length: 255 }),
  order: integer("order").notNull().default(0),
  dueDate: timestamp("due_date"),
  // Private admin notes the client never sees.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_client_tasks_client_id").on(table.clientId),
]);

// Weekly performance reports — the reporting loop for DIGITAL MARKETING
// engagements only (clients on other offerings never see these). The agency
// enters leads + spend; the report lands on the client's portal as
// "pending_client" until they add their closes and revenue, which completes it
// and feeds the true-ROAS numbers.
export const weeklyReportStatusEnum = pgEnum("weekly_report_status", [
  "pending_client",
  "completed",
]);

export const weeklyReports = pgTable("weekly_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .references(() => agencyClients.id, { onDelete: "cascade" })
    .notNull(),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  // Agency side (ads manager numbers). CPL and spend in cents.
  leads: integer("leads").notNull().default(0),
  cpl: integer("cpl").notNull().default(0),
  totalSpend: integer("total_spend").notNull().default(0),
  // Client side — filled from the portal when they complete the report.
  closes: integer("closes"),
  revenue: integer("revenue"),
  status: weeklyReportStatusEnum("status").notNull().default("pending_client"),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "set null" }),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_weekly_reports_client_id").on(table.clientId),
]);

// Client payments — money actually collected from agency clients (setup fees
// and monthly retainers). Feeds the Financials revenue metrics.
export const clientPaymentTypeEnum = pgEnum("client_payment_type", [
  "setup_fee",
  "monthly_retainer",
]);

export const clientPayments = pgTable("client_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .references(() => agencyClients.id, { onDelete: "cascade" })
    .notNull(),
  paymentType: clientPaymentTypeEnum("payment_type").notNull(),
  method: varchar("method", { length: 50 }).notNull().default("zelle"),
  // Cents. Snapshot of the fee at collection time (fees can change later).
  amount: integer("amount").notNull(),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_client_payments_client_id").on(table.clientId),
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
export type OnboardingSubmission = typeof onboardingSubmissions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ProjectComment = typeof projectComments.$inferSelect;
export type SatisfactionSurvey = typeof satisfactionSurveys.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type AgencyClient = typeof agencyClients.$inferSelect;
export type NewAgencyClient = typeof agencyClients.$inferInsert;
export type ClientPayment = typeof clientPayments.$inferSelect;
export type NewClientPayment = typeof clientPayments.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// Helix OS
//
// The agentic layer. Architecture adopted from cloudflare-os (see
// plans/helix-os.md); their Workers runtime is not portable to this stack, but
// the four primitives are:
//
//   Thread        a durable agent session. Starts with access to NOTHING.
//   Introduction  a capability grant. A resource must be introduced before
//                 Helix can touch it; Helix may request one, a human decides.
//   Action        a proposed side effect. Simulated first, executed only after
//                 a human approves — so Helix never blocks mid-task.
//   Gadget        a sandboxed per-client mini-app Helix writes. A Blueprint is
//                 its shareable source.
// ─────────────────────────────────────────────────────────────────────────────

export const helixThreadStatusEnum = pgEnum("helix_thread_status", [
  "active",
  "archived",
]);

// A thread's scope is its ceiling of authority, enforced before any grant: an
// agency thread may be introduced to anything its owner can already see; a
// client thread can only ever reach that client's own records.
export const helixThreadScopeEnum = pgEnum("helix_thread_scope", [
  "agency",
  "client",
]);

export const helixThreads = pgTable("helix_threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  scope: helixThreadScopeEnum("scope").notNull().default("agency"),
  // Set on client-scoped threads — the hard boundary for every introduction.
  clientId: uuid("client_id").references(() => agencyClients.id, {
    onDelete: "cascade",
  }),
  title: varchar("title", { length: 255 }).notNull().default("New thread"),
  status: helixThreadStatusEnum("status").notNull().default("active"),
  // Rolling one-line summary of where the work stands, written by Helix.
  standing: text("standing"),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_helix_threads_owner").on(table.ownerId),
  index("idx_helix_threads_client").on(table.clientId),
]);

export const helixMessageRoleEnum = pgEnum("helix_message_role", [
  "user",
  "assistant",
  "system",
]);

export const helixMessages = pgTable("helix_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .references(() => helixThreads.id, { onDelete: "cascade" })
    .notNull(),
  role: helixMessageRoleEnum("role").notNull(),
  content: text("content").notNull().default(""),
  // Reasoning/among-tools narration kept separate from the spoken answer so the
  // transcript can render it collapsed.
  thinking: text("thinking"),
  // Ordering within the thread. Monotonic; actions reference the turn that
  // proposed them by message id, but replay reads by sequence.
  sequence: integer("sequence").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_helix_messages_thread").on(table.threadId),
]);

// One kind per registered gatekeeper. Adding a kind without registering its
// gatekeeper is a type error at the registry (see src/lib/helix/gatekeepers).
export const helixResourceKindEnum = pgEnum("helix_resource_kind", [
  "client",
  "project",
  "task",
  "invoice",
  "payment",
  "conversation",
  "file",
  "report",
  "gadget",
]);

export const helixIntroductionStatusEnum = pgEnum("helix_introduction_status", [
  "requested",
  "granted",
  "denied",
  "revoked",
]);

export const helixIntroductions = pgTable("helix_introductions", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .references(() => helixThreads.id, { onDelete: "cascade" })
    .notNull(),
  resourceKind: helixResourceKindEnum("resource_kind").notNull(),
  // The row id inside that kind's own table. Kept loose (uuid) rather than a
  // real FK because the target table varies by kind.
  resourceId: uuid("resource_id").notNull(),
  // Denormalized so a revoked or deleted resource still reads correctly in the
  // audit trail.
  resourceLabel: varchar("resource_label", { length: 255 }).notNull(),
  status: helixIntroductionStatusEnum("status").notNull().default("granted"),
  // Set when Helix asked rather than the human offering — this is what the
  // "Helix is requesting access" card renders.
  requestReason: text("request_reason"),
  // false narrows the grant to read ops only; write ops are refused outright
  // rather than queued for approval.
  allowWrites: boolean("allow_writes").notNull().default(true),
  grantedBy: uuid("granted_by").references(() => users.id, {
    onDelete: "set null",
  }),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_helix_introductions_thread").on(table.threadId),
]);

// The lifecycle that makes deferred approval work. A write op never touches
// the database on first call: it is simulated, and the thread reads its own
// simulated overlay from then on, so Helix stays internally consistent while
// the human is away.
export const helixActionStatusEnum = pgEnum("helix_action_status", [
  "simulated",
  "approved",
  "executed",
  "rejected",
  "failed",
]);

// Drives ordering in the queue and which actions bulk-approve will take.
export const helixActionRiskEnum = pgEnum("helix_action_risk", [
  "low",
  "medium",
  "high",
]);

export const helixActions = pgTable("helix_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .references(() => helixThreads.id, { onDelete: "cascade" })
    .notNull(),
  // The assistant turn that proposed it.
  messageId: uuid("message_id").references(() => helixMessages.id, {
    onDelete: "set null",
  }),
  gatekeeper: varchar("gatekeeper", { length: 64 }).notNull(),
  op: varchar("op", { length: 64 }).notNull(),
  resourceKind: helixResourceKindEnum("resource_kind").notNull(),
  resourceId: uuid("resource_id"),
  // One sentence in plain English — the line the approval card leads with.
  summary: varchar("summary", { length: 500 }).notNull(),
  risk: helixActionRiskEnum("risk").notNull().default("medium"),
  input: jsonb("input").notNull().default({}),
  // What simulate() returned. Serves subsequent reads in this thread.
  simulatedResult: jsonb("simulated_result"),
  // Field-level before/after the approval card renders.
  preview: jsonb("preview"),
  executedResult: jsonb("executed_result"),
  status: helixActionStatusEnum("status").notNull().default("simulated"),
  // Actions execute in proposal order — a later action may depend on an
  // earlier one's real result.
  sequence: integer("sequence").notNull().default(0),
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at"),
  executedAt: timestamp("executed_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_helix_actions_thread").on(table.threadId),
  index("idx_helix_actions_status").on(table.status),
]);

export const helixGadgetStatusEnum = pgEnum("helix_gadget_status", [
  "draft",
  "live",
  "archived",
]);

// A gadget is a private instance of an app. Its source is a flat file map
// ({ "index.html": "…" }); the runtime serves it into a sandboxed iframe with
// no network reach except the scoped RPC bridge back to this app.
export const helixGadgets = pgTable("helix_gadgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  // Gadgets built for a specific engagement show on that client's portal.
  clientId: uuid("client_id").references(() => agencyClients.id, {
    onDelete: "cascade",
  }),
  threadId: uuid("thread_id").references(() => helixThreads.id, {
    onDelete: "set null",
  }),
  blueprintId: uuid("blueprint_id"),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  summary: text("summary"),
  source: jsonb("source").notNull().default({}),
  // Per-gadget key/value the sandbox reads and writes over the bridge.
  state: jsonb("state").notNull().default({}),
  version: integer("version").notNull().default(1),
  status: helixGadgetStatusEnum("status").notNull().default("draft"),
  // Whether the client can open it from their portal.
  sharedWithClient: boolean("shared_with_client").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_helix_gadgets_owner").on(table.ownerId),
  index("idx_helix_gadgets_client").on(table.clientId),
]);

// Every edit keeps its predecessor so a gadget can be rolled back after Helix
// changes it — the sandbox makes experimenting safe, history makes it cheap.
export const helixGadgetVersions = pgTable("helix_gadget_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  gadgetId: uuid("gadget_id")
    .references(() => helixGadgets.id, { onDelete: "cascade" })
    .notNull(),
  version: integer("version").notNull(),
  source: jsonb("source").notNull().default({}),
  note: varchar("note", { length: 500 }),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_helix_gadget_versions_gadget").on(table.gadgetId),
]);

// A blueprint is a gadget's source without its data — install it and you get
// your own copy, which you are then free to change.
export const helixBlueprints = pgTable("helix_blueprints", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary"),
  category: varchar("category", { length: 64 }).notNull().default("general"),
  source: jsonb("source").notNull().default({}),
  // Seeded blueprints ship with the product and cannot be deleted.
  builtIn: boolean("built_in").notNull().default(false),
  installCount: integer("install_count").notNull().default(0),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Append-only audit trail. Every gatekeeper call, grant, approval and
// execution lands here — the record the agency reviews, written as a byproduct
// of the work rather than typed up afterwards.
export const helixEventKindEnum = pgEnum("helix_event_kind", [
  "thread_created",
  "introduction_requested",
  "introduction_granted",
  "introduction_denied",
  "introduction_revoked",
  "read",
  "action_simulated",
  "action_approved",
  "action_rejected",
  "action_executed",
  "action_failed",
  "gadget_created",
  "gadget_updated",
  "blueprint_installed",
]);

export const helixEvents = pgTable("helix_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id").references(() => helixThreads.id, {
    onDelete: "cascade",
  }),
  kind: helixEventKindEnum("kind").notNull(),
  // "helix" when the agent acted on its own, otherwise the user who did.
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  byHelix: boolean("by_helix").notNull().default(false),
  summary: varchar("summary", { length: 500 }).notNull(),
  resourceKind: helixResourceKindEnum("resource_kind"),
  resourceId: uuid("resource_id"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_helix_events_thread").on(table.threadId),
  index("idx_helix_events_created").on(table.createdAt),
]);

export type HelixThread = typeof helixThreads.$inferSelect;
export type NewHelixThread = typeof helixThreads.$inferInsert;
export type HelixMessage = typeof helixMessages.$inferSelect;
export type NewHelixMessage = typeof helixMessages.$inferInsert;
export type HelixIntroduction = typeof helixIntroductions.$inferSelect;
export type NewHelixIntroduction = typeof helixIntroductions.$inferInsert;
export type HelixAction = typeof helixActions.$inferSelect;
export type NewHelixAction = typeof helixActions.$inferInsert;
export type HelixGadget = typeof helixGadgets.$inferSelect;
export type NewHelixGadget = typeof helixGadgets.$inferInsert;
export type HelixGadgetVersion = typeof helixGadgetVersions.$inferSelect;
export type HelixBlueprint = typeof helixBlueprints.$inferSelect;
export type NewHelixBlueprint = typeof helixBlueprints.$inferInsert;
export type HelixEvent = typeof helixEvents.$inferSelect;
export type NewHelixEvent = typeof helixEvents.$inferInsert;

-- Milestone billing — run once in the Supabase SQL editor. Idempotent.

CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label varchar(255) NOT NULL,
  description text,
  amount integer NOT NULL,          -- cents
  "order" integer NOT NULL DEFAULT 0,
  status varchar(50) NOT NULL DEFAULT 'pending',  -- pending | paid
  due_at timestamp,
  paid_at timestamp,
  payment_id uuid,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);

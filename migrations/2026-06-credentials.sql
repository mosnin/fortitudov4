-- Credentials vault (two-way login exchange). Run once in Supabase. Idempotent.
-- `secret` stores an AES-256-GCM blob; set CREDENTIALS_KEY in the env.

CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label varchar(255) NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'requested',  -- requested | provided
  secret text,
  note text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credentials_project_id ON credentials(project_id);

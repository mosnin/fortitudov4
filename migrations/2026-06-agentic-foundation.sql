-- Agentic foundation: per-build settings (autonomy + brand), an auditable
-- activity timeline, and compounding agency memory. Idempotent.

CREATE TABLE IF NOT EXISTS project_settings (
  project_id uuid PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  autonomy_level varchar(20) NOT NULL DEFAULT 'assisted',
  brand_color varchar(9),
  brand_name varchar(255),
  concierge_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_type varchar(20) NOT NULL DEFAULT 'human',
  kind varchar(50) NOT NULL,
  summary text NOT NULL,
  metadata jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_project_id ON activity_events(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_events(created_at);

CREATE TABLE IF NOT EXISTS agency_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope varchar(20) NOT NULL DEFAULT 'project',
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  kind varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  content text NOT NULL,
  tags jsonb,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_memory_scope ON agency_memory(scope);
CREATE INDEX IF NOT EXISTS idx_memory_user_id ON agency_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_project_id ON agency_memory(project_id);

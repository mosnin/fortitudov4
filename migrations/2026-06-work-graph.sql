-- Build work-graph: task attributes, dependencies, submissions. Idempotent.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS kind varchar(40) NOT NULL DEFAULT 'build',
  ADD COLUMN IF NOT EXISTS acceptance_criteria text,
  ADD COLUMN IF NOT EXISTS estimate_hours integer,
  ADD COLUMN IF NOT EXISTS submitted_at timestamp,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_notes text;

CREATE TABLE IF NOT EXISTS task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_task_deps_task ON task_dependencies(task_id);

CREATE TABLE IF NOT EXISTS task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  summary text NOT NULL,
  artifact_url text,
  deliverable_id uuid,
  status varchar(50) NOT NULL DEFAULT 'pending',
  review_notes text,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task ON task_submissions(task_id);

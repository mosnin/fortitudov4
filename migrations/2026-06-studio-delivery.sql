-- Studio delivery batch — run once in the Supabase SQL editor.
-- Idempotent: safe to re-run. Backward compatible with the current prod code.

-- Deliverables: client review workflow (pending → approved | changes_requested)
ALTER TABLE deliverables
  ADD COLUMN IF NOT EXISTS status varchar(50) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp,
  ADD COLUMN IF NOT EXISTS client_note text;

-- Projects: estimation loop (scoped vs. actual effort, in hours)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS estimated_hours integer,
  ADD COLUMN IF NOT EXISTS actual_hours integer;

ALTER TABLE IF EXISTS prayer_requests
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT,
  content TEXT NOT NULL CHECK (NULLIF(BTRIM(content), '') IS NOT NULL),
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  publication_consent BOOLEAN NOT NULL DEFAULT FALSE,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  CHECK (NOT published OR (moderation_status = 'approved' AND publication_consent))
);

CREATE INDEX IF NOT EXISTS testimonies_status_created_idx
  ON testimonies (moderation_status, created_at DESC);
CREATE INDEX IF NOT EXISTS testimonies_published_created_idx
  ON testimonies (created_at DESC) WHERE published;

DROP TRIGGER IF EXISTS testimonies_updated_at ON testimonies;
CREATE TRIGGER testimonies_updated_at BEFORE UPDATE ON testimonies
  FOR EACH ROW EXECUTE FUNCTION sofan_set_updated_at();

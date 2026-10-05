CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  contact_email TEXT,
  request_text TEXT,
  audio_path TEXT,
  audio_duration INTEGER,
  audio_mime_type TEXT,
  audio_size BIGINT,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'new_request'
    CHECK (status IN ('new_request', 'contacted', 'prayer_in_progress', 'follow_up_needed', 'answered', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (NULLIF(BTRIM(request_text), '') IS NOT NULL OR audio_path IS NOT NULL),
  CHECK (
    (audio_path IS NULL AND audio_duration IS NULL AND audio_mime_type IS NULL AND audio_size IS NULL)
    OR
    (audio_path IS NOT NULL
      AND audio_duration BETWEEN 1 AND 300
      AND audio_size BETWEEN 1 AND 10485760
      AND audio_mime_type IN ('audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'))
  )
);

CREATE INDEX IF NOT EXISTS prayer_requests_status_created_idx
  ON prayer_requests (status, created_at DESC);

DROP TRIGGER IF EXISTS prayer_requests_updated_at ON prayer_requests;
CREATE TRIGGER prayer_requests_updated_at BEFORE UPDATE ON prayer_requests
  FOR EACH ROW EXECUTE FUNCTION sofan_set_updated_at();

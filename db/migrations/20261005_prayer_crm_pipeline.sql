ALTER TABLE prayer_requests
  DROP CONSTRAINT IF EXISTS prayer_requests_status_check;

UPDATE prayer_requests
SET status = CASE status
  WHEN 'pending' THEN 'new_request'
  WHEN 'prayed_for' THEN 'prayer_in_progress'
  WHEN 'archived' THEN 'closed'
  ELSE status
END
WHERE status IN ('pending', 'prayed_for', 'archived');

ALTER TABLE prayer_requests
  ALTER COLUMN status SET DEFAULT 'new_request',
  ADD CONSTRAINT prayer_requests_status_check
    CHECK (status IN (
      'new_request',
      'contacted',
      'prayer_in_progress',
      'follow_up_needed',
      'answered',
      'closed'
    ));

CREATE INDEX IF NOT EXISTS prayer_requests_pipeline_created_idx
  ON prayer_requests (status, created_at DESC);

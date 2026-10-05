ALTER TABLE IF EXISTS testimonies
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

CREATE TABLE IF NOT EXISTS daily_devotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (NULLIF(BTRIM(title), '') IS NOT NULL),
  scripture TEXT NOT NULL CHECK (NULLIF(BTRIM(scripture), '') IS NOT NULL),
  message TEXT NOT NULL CHECK (NULLIF(BTRIM(message), '') IS NOT NULL),
  prayer TEXT NOT NULL CHECK (NULLIF(BTRIM(prayer), '') IS NOT NULL),
  devotion_date DATE NOT NULL,
  image_url TEXT,
  video_url TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS daily_devotions_published_date_idx
  ON daily_devotions (devotion_date DESC) WHERE published;
CREATE INDEX IF NOT EXISTS daily_devotions_admin_date_idx
  ON daily_devotions (devotion_date DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS ministry_media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('sermon', 'prayer_video', 'ministry_video')),
  category TEXT,
  title TEXT NOT NULL CHECK (NULLIF(BTRIM(title), '') IS NOT NULL),
  description TEXT NOT NULL CHECK (NULLIF(BTRIM(description), '') IS NOT NULL),
  speaker TEXT,
  media_date DATE,
  scripture TEXT,
  video_url TEXT NOT NULL CHECK (NULLIF(BTRIM(video_url), '') IS NOT NULL),
  thumbnail_url TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ministry_media_published_date_idx
  ON ministry_media_items (media_date DESC NULLS LAST, created_at DESC) WHERE published;
CREATE INDEX IF NOT EXISTS ministry_media_admin_date_idx
  ON ministry_media_items (media_date DESC NULLS LAST, created_at DESC);

CREATE TABLE IF NOT EXISTS charity_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (NULLIF(BTRIM(title), '') IS NOT NULL),
  category TEXT NOT NULL CHECK (NULLIF(BTRIM(category), '') IS NOT NULL),
  description TEXT NOT NULL CHECK (NULLIF(BTRIM(description), '') IS NOT NULL),
  image_url TEXT NOT NULL CHECK (NULLIF(BTRIM(image_url), '') IS NOT NULL),
  support_contact TEXT,
  support_cta TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS charity_projects_published_created_idx
  ON charity_projects (created_at DESC) WHERE published;
CREATE INDEX IF NOT EXISTS charity_projects_admin_created_idx
  ON charity_projects (created_at DESC);

DROP TRIGGER IF EXISTS daily_devotions_updated_at ON daily_devotions;
CREATE TRIGGER daily_devotions_updated_at BEFORE UPDATE ON daily_devotions
  FOR EACH ROW EXECUTE FUNCTION sofan_set_updated_at();

DROP TRIGGER IF EXISTS ministry_media_items_updated_at ON ministry_media_items;
CREATE TRIGGER ministry_media_items_updated_at BEFORE UPDATE ON ministry_media_items
  FOR EACH ROW EXECUTE FUNCTION sofan_set_updated_at();

DROP TRIGGER IF EXISTS charity_projects_updated_at ON charity_projects;
CREATE TRIGGER charity_projects_updated_at BEFORE UPDATE ON charity_projects
  FOR EACH ROW EXECUTE FUNCTION sofan_set_updated_at();

DROP FUNCTION IF EXISTS public.get_finance_summary();

DROP TABLE IF EXISTS public.admins;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'finance_transactions',
    'news',
    'events',
    'prayer_requests',
    'testimonies',
    'daily_devotions',
    'ministry_media_items',
    'charity_projects'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', table_name);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', table_name);
  END LOOP;
END;
$$;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON TABLE public.user_roles TO service_role;

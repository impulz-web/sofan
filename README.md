# Sofan

SOFAN's public church website and Supabase-backed administration workspace, built with Next.js.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase project API settings. Public pages can run without these services; database-managed content and submissions show an explicit unavailable state until configured.

## SOFAN administration

The administration interface is available at `/sofan` and uses Supabase Auth plus database roles. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the Supabase project API settings, then apply the role-table and Auth-trigger migrations. The trigger automatically creates a `member` row in `public.user_roles` whenever Supabase Auth creates a user. Admins created in the dashboard are promoted to `admin` automatically by the server-side account-creation flow. Access is granted only when a user's role is `admin`; there is no admin email allowlist in environment configuration. The app uses Supabase's verified user lookup and refreshed HttpOnly session cookies. Testimony publishing is separately controlled by the user's `can_publish_testimonies` database permission, defaulting to false. Keep the service role key and all other secrets server-side and out of source control.

There is no public self-registration. Once the first administrator has been granted the `admin` role, signed-in administrators can use **Admin Users** in the dashboard to create another SOFAN admin account with an email and initial password. The Auth trigger creates the account's default role row, and the server-side flow promotes it to `admin`. New staff receive the same dashboard privileges as the creating admin; share the initial password through a secure channel. Creating accounts uses the server-only service role key and requires the `20261005_supabase_api_access.sql` migration.

Grant admin access from the Supabase SQL Editor after the user has been created or invited:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id)
DO UPDATE SET role = EXCLUDED.role, can_publish_testimonies = FALSE;
```

To allow the user to publish consented testimonies, set `can_publish_testimonies = TRUE` on that row. Revoke dashboard access by deleting the role row or changing `role` to `member`. Row-level security permits authenticated users to read only their own role and does not permit role changes through the app. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code.

The app accesses Supabase Postgres through Supabase's Data API using the project URL and server-only service-role key; it does not need a separate `DATABASE_URL` or direct Postgres driver. The anon key is used for Supabase Auth. Never expose the service-role key to browser code or public client environment variables. In Supabase Dashboard → SQL Editor, run these files in order, pasting each file's contents into a new query:

1. `db/schema.sql`
2. `db/prayer-requests.sql`
3. `db/migrations/20261005_admin_testimonies.sql`
4. `db/migrations/20261005_ministry_content.sql`
5. `db/migrations/20261005_prayer_crm_pipeline.sql`
6. `db/migrations/20261005_user_roles.sql`
7. `db/migrations/20261005_auth_user_role_trigger.sql`
8. `db/migrations/20261005_supabase_api_access.sql`
9. `db/migrations/20261005_finance_currency_usd.sql`

The database setup intentionally inserts no sample records. After the scripts run, tables will be empty until actual admin users submit requests or staff add and publish content. The migrations are idempotent and preserve application data. The CRM migration maps existing Pending → New Request, Prayed For → Prayer in Progress, and Archived → Closed. New submissions start in New Request. The ministry migration creates draft-by-default devotion, media, and charity-project tables. The Auth trigger creates a `member` role record for every Auth user; the dashboard's trusted-admin creation flow promotes newly created staff accounts. The final access migration enables RLS and denies anon/authenticated access to server-managed content; the user-roles migration separately grants authenticated users read access only to their own role. It also removes the obsolete `admins` table and any older unused finance-summary RPC; SOFAN staff accounts are managed by Supabase Auth and `user_roles`.

Finance entries use USD. The USD migration changes the default for new rows but does not convert existing KES amounts; legacy records retain their original currency and are excluded from USD totals until they are reconciled and re-entered in USD.

## Public content and submissions

- Published devotions, sermons, prayer videos, ministry videos, and charity projects are managed in `/sofan` and read by their public pages. Draft or unpublished records are not shown.
- Prayer requests may be written or recorded. Each submission is saved in the Supabase `public.prayer_requests` table and appears in the admin pipeline at New Request. Staff can move it through Contacted, Prayer in Progress, Follow-up Needed, Answered, and Closed. Requests remain private and admin-only; an optional email and private-request selection are stored. Audio is stored outside `public` and played through short-lived, authenticated links.
- Testimonies require review and explicit publication consent. Submission does not publish automatically; only approved, consented submissions can be published, and publication permission is disabled by default.
- Events, news, finance records, and prayer requests are managed from the authenticated admin area. Public events include only published upcoming rows.
- Contact-form and giving links are enquiry flows, not direct web submissions or payments.

## Private prayer-audio storage

Create a **private** Supabase Storage bucket named `prayer-request-audio` (or set `SUPABASE_PRAYER_AUDIO_BUCKET` to the private bucket name). Set `SUPABASE_SERVICE_ROLE_KEY` from the Supabase project API settings. The service role key is used only by server code to upload, download, and remove objects; no public bucket or browser-side storage access is used. Existing audio validation, non-public storage paths, admin-only signed playback links, and byte-range playback remain in place.

New production voice recordings require Supabase Storage configuration. Local development without Supabase Storage uses a private directory outside `public`; set `SOFAN_PRAYER_AUDIO_DIR` to an absolute path if you need a custom location. Existing recordings stored on a production filesystem are not automatically migrated: keep their existing private volume mounted and `SOFAN_PRAYER_AUDIO_DIR` configured until those recordings have been separately migrated or retired.

Set `PRAYER_AUDIO_SIGNING_SECRET` to at least 32 random bytes encoded as text for short-lived playback tokens. Generate a value locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. This key is separate from Supabase credentials.

To configure the first administrator without sharing project secrets, create the user in Supabase Auth. The Auth trigger adds a `member` role row; update that row to `admin` in `public.user_roles`. After that, signed-in administrators can create and promote more staff from the dashboard. Use the service-role key only in `.env.local` and your deployment's encrypted environment settings. Never paste the service-role key into source files, issues, or chat.

## Giving

The Donate page directs visitors to contact SOFAN for current giving information.

## Documentation

See the internal development guide in [docs/architecture.md](docs/architecture.md).

## Core standards

- App Router with server-first rendering and intentional client boundaries
- Centralized design tokens for layout, color, spacing, type, and motion
- Reusable UI primitives rather than one-off markup
- Accessibility, responsive behavior, and reduced-motion support by default
- Performance-conscious defaults: no unnecessary client state or animation libraries

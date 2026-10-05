# SOFAN Website — Owner Report

**Reviewed:** 5 October 2026
**Status:** Website and feature implementation are in place. Production database, owner content verification, and payment activation are still pending.

## What visitors can use

- **Home:** SOFAN introduction, hero and calls to action, ministry links, Life at SOFAN photos, and upcoming events.
- **About:** SOFAN story, vision, mission, beliefs, and ministry leadership profile.
- **Charity & Outreach:** community support areas, enquiry links, and published projects when the database is connected.
- **Contact:** public contact details and service information; message actions open the visitor’s email app rather than submitting to a website inbox.
- **Prayer Request:** written or recorded requests, with anonymous and private options.
- **Daily Devotion, Sermons, Prayer for Viewers, Videos, Testimonies:** public pages for approved content; database-managed items are shown only after publication.
- **Donate:** giving guidance and contact details for visitors to enquire with SOFAN.

The homepage keeps its photo and dark image overlay, with the requested terracotta text panel. The “Life at SOFAN” collage has been adapted for mobile so the photos display larger and stack vertically.

## Administration and content

The private `/sofan` area uses Supabase Auth and grants access only to users with the `admin` role in the database; it has these tools:

- Dashboard and manual finance records, including transaction filters.
- News, events, and prayer-request management.
- Prayer-request status updates and protected audio playback.
- A six-stage prayer-request CRM pipeline: New Request → Contacted → Prayer in Progress → Follow-up Needed → Answered → Closed.
- Testimony review and moderation.
- Create, edit, publish, unpublish, and delete actions for devotions, sermon/prayer/ministry videos, and charity projects.
- Admin user management: an existing admin can create staff admin accounts by email and initial password. There is no public self-registration; staff accounts have the same admin dashboard access.

Public events show only published future events. Devotions, media, and projects show only published records. Testimonies remain pending until reviewed; publication additionally requires consent and an explicit admin permission setting.

Prayer requests are saved to the Supabase `public.prayer_requests` table and are not public. New submissions enter **New Request** and staff can move them through Contacted, Prayer in Progress, Follow-up Needed, Answered, and Closed. The migration maps existing statuses into the new pipeline without deleting requests. New recordings use a private Supabase Storage bucket, and playback still requires an admin-authorized short-lived link. Local development can use a private filesystem directory. Existing production recordings on the old filesystem are not automatically migrated and need the original private volume mounted until migrated or retired.

## What is not live yet

- **Database and Supabase:** No production Supabase project credentials were configured for this review. The site’s public pages work without them, but admin authentication requires Supabase Auth; prayer-audio production storage requires a private Supabase bucket; database-backed submissions and published libraries require the supplied SQL setup and migrations to be applied in Supabase.
- **Giving enquiries:** Visitors are directed to contact SOFAN for current giving information.
- **Contact inbox:** Contact actions open email; there is no website inbox or direct contact-form submission.
- **Media:** No unprovided recordings or third-party video links are invented. The owner/admin needs to add and publish real recordings.
- **Social links:** Confirm and provide official accounts before adding them.
- **Owner-supplied information:** Verify contact details, service times, location, leadership biography, current outreach activity, giving instructions, and all public wording. Existing sermon listings and any dated information should be refreshed.

## Owner/deployment checklist

1. Confirm the public facts and provide current photos, approved sermon/prayer links, event details, and official social links.
2. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`; in Supabase SQL Editor apply `db/schema.sql`, `db/prayer-requests.sql`, and all five feature/access migrations in the order listed in README.md. No sample data is inserted and no separate `DATABASE_URL` is used. The pipeline migration preserves existing requests and maps their old statuses.
3. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in encrypted server/deployment variables; create a private `prayer-request-audio` bucket.
4. Create the first staff account in Supabase Auth and assign `role = 'admin'` in `public.user_roles`. After that, existing admins can create additional staff accounts from the dashboard's Admin Users section. Role assignment is managed in the database, not environment variables. `can_publish_testimonies` provides a separate per-user testimony-publishing permission, false by default.
5. Set `PRAYER_AUDIO_SIGNING_SECRET` to at least 32 random bytes encoded as text. Retain the old private audio volume and configure `SOFAN_PRAYER_AUDIO_DIR` until legacy recordings are migrated or retired.
6. Before launch, test database migrations and CRUD flows, admin login and role denial, prayer audio storage/playback, backups, and production deployment with the owner’s actual configuration. Consider login rate limiting for admin sign-in.

## Verification in this review

- `npm run lint` — passed.
- `npm run build` — passed.
- Public page routes returned HTTP 200 in a production-server smoke check with no database configured; dynamic pages displayed setup/unavailable states.
- Mobile-width browser checks found no horizontal overflow on Home, Sermons, Videos, or Charity.
- No database credentials were available, so database migrations, admin CRUD, and real submissions were not exercised end to end.

This report reflects the current code and local smoke checks; it is not confirmation of a live production deployment.

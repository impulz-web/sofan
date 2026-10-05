# SOFAN Website — Owner Report

**Reviewed:** 5 October 2026
**Status:** Feature-rich website prototype; several items need owner input and setup before launch.

## What the site includes

- **Home:** Ministry introduction and founder message, community photos, location, four ministry areas, sermon cards, events, and giving prompt.
- **About:** Pastor MJ profile, SOFAN’s vision and mission, ministry story, and statement of faith.
- **Charity & Outreach:** Feeding, orphan support, widow support, and mission outreach, with email links to enquire or offer support.
- **Contact:** Juba location, WhatsApp and email contacts, service times, and a contact form.
- **Prayer Request:** Written or recorded voice requests, with an anonymous option.
- **Admin (`/sofan`):** Dashboard, finance records, news, events, and prayer-request management, including prayer status tracking and voice playback.

## How it works today

- The public site’s ministry, sermon, and event content is currently entered in the website code.
- The admin area is designed to use PostgreSQL for finance, news, events, and prayer requests. It requires a configured `DATABASE_URL` and the supplied database setup scripts.
- The contact form opens the visitor’s email app; it does not submit messages directly to a website inbox.
- Giving links currently do not process payments. Charity support links open an email enquiry.

## Owner decisions and launch priorities

1. **Confirm public information:** service times, location, contact details, ministry descriptions, outreach-program claims, and founder biography.
2. **Refresh dated content:** the listed sermons and events are from May–June 2026 and should be replaced with current information.
3. **Complete calls to action:** provide sermon/video links, official social-media links, and the preferred giving/payment method.
4. **Prepare administration:** configure and test PostgreSQL; connect published admin news/events to the public pages if those should be managed there.
5. **Secure and prepare deployment:** `/sofan` currently has no sign-in, so it must not be exposed publicly until authentication and access controls are added. Prayer audio is stored on the server’s local filesystem, which needs durable private storage in production.

## Review note

The local website endpoint returned HTTP 200 during review. The browser preview remained on a loading state, so the rendered experience still needs an end-to-end visual check. This report describes the implemented routes and code, not a confirmed public production deployment.

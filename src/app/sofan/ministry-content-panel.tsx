"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type {
  ActionResult,
  CharityProject,
  CharityProjectInput,
  DailyDevotion,
  DailyDevotionInput,
  MinistryMediaInput,
  MinistryMediaItem,
} from "@/lib/admin-types";
import {
  deleteCharityProjectAction,
  deleteDailyDevotionAction,
  deleteMinistryMediaItemAction,
  getMinistryContentAction,
  saveCharityProjectAction,
  saveDailyDevotionAction,
  saveMinistryMediaItemAction,
  setCharityProjectPublishedAction,
  setDailyDevotionPublishedAction,
  setMinistryMediaPublishedAction,
} from "./actions";
import styles from "./admin.module.css";

type ContentSection = "devotions" | "media" | "charity";

function blankDevotion(): DailyDevotionInput {
  return { title: "", scripture: "", message: "", prayer: "", devotionDate: "", imageUrl: "", videoUrl: "", published: false };
}

function blankMedia(): MinistryMediaInput {
  return { kind: "sermon", category: "", title: "", description: "", speaker: "", mediaDate: "", scripture: "", videoUrl: "", thumbnailUrl: "", published: false };
}

function blankProject(): CharityProjectInput {
  return { title: "", category: "", description: "", imageUrl: "", supportContact: "", supportCta: "", published: false };
}

function Field({ label, htmlFor, children, wide = false }: { label: string; htmlFor: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

function PublishedBadge({ published }: { published: boolean }) {
  return <span className={`${styles.statusPill} ${published ? styles.statusPublished : styles.statusDraft}`}>{published ? "Published" : "Draft"}</span>;
}

export function MinistryContentPanel({ connected }: { connected: boolean }) {
  const [section, setSection] = useState<ContentSection>("devotions");
  const [devotions, setDevotions] = useState<DailyDevotion[]>([]);
  const [media, setMedia] = useState<MinistryMediaItem[]>([]);
  const [projects, setProjects] = useState<CharityProject[]>([]);
  const [devotionEditor, setDevotionEditor] = useState<DailyDevotionInput | null>(null);
  const [mediaEditor, setMediaEditor] = useState<MinistryMediaInput | null>(null);
  const [projectEditor, setProjectEditor] = useState<CharityProjectInput | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(connected);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function refresh() {
    if (!connected) {
      setDevotions([]);
      setMedia([]);
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getMinistryContentAction();
      if (result.success) {
        setDevotions(result.devotions);
        setMedia(result.media);
        setProjects(result.projects);
        setNotice("");
      } else {
        setNotice(result.message);
      }
    } catch {
      setNotice("Your admin session may have expired. Sign in again to continue.");
    }
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    if (!connected) return;
    getMinistryContentAction().then((result) => {
      if (!active) return;
      if (result.success) {
        setDevotions(result.devotions);
        setMedia(result.media);
        setProjects(result.projects);
      } else {
        setNotice(result.message);
      }
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setNotice("Your admin session may have expired. Sign in again to continue.");
      setLoading(false);
    });
    return () => { active = false; };
  }, [connected]);

  async function perform(action: Promise<ActionResult>, onSuccess?: () => void) {
    setBusy(true);
    setNotice("");
    try {
      const result = await action;
      if (result.success) {
        onSuccess?.();
        setNotice(result.message ?? "Saved.");
        await refresh();
      } else {
        setNotice(result.message);
      }
    } catch {
      setNotice("Your admin session may have expired. Sign in again to continue.");
    }
    setBusy(false);
  }

  function submitDevotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (devotionEditor) void perform(saveDailyDevotionAction({ ...devotionEditor }), () => setDevotionEditor(null));
  }

  function submitMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mediaEditor) void perform(saveMinistryMediaItemAction({ ...mediaEditor }), () => setMediaEditor(null));
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (projectEditor) void perform(saveCharityProjectAction({ ...projectEditor }), () => setProjectEditor(null));
  }

  async function deletePending() {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    const action = section === "devotions"
      ? deleteDailyDevotionAction(id)
      : section === "media"
        ? deleteMinistryMediaItemAction(id)
        : deleteCharityProjectAction(id);
    await perform(action, () => setPendingDelete(null));
  }

  return (
    <section className={styles.panel} aria-labelledby="ministry-content-heading">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="ministry-content-heading">Ministry content</h2>
          <p className={styles.mutedText}>Manage devotionals, video media, and charity project information.</p>
        </div>
        <button className={styles.textButton} type="button" onClick={() => void refresh()} disabled={!connected || loading || busy}>Refresh</button>
      </div>

      <nav className={styles.subnav} aria-label="Ministry content types">
        {([
          ["devotions", "Daily devotions"],
          ["media", "Media"],
          ["charity", "Charity projects"],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" className={section === id ? styles.subnavActive : ""} aria-current={section === id ? "page" : undefined} onClick={() => { setSection(id); setPendingDelete(null); setNotice(""); }}>
            {label}
          </button>
        ))}
      </nav>

      {notice && <p className={styles.feedback} role="status">{notice}</p>}
      {loading ? <p className={styles.emptyState}>Loading ministry content…</p> : !connected ? <p className={styles.emptyState}>Connect PostgreSQL to manage ministry content.</p> : (
        <>
          {section === "devotions" && (
            <>
              <div className={styles.sectionHeading}>
                <p className={styles.mutedText}>Create and schedule daily devotionals; drafts remain private.</p>
                <button className={styles.primaryButton} type="button" disabled={busy} onClick={() => setDevotionEditor(blankDevotion())}>Add devotion</button>
              </div>
              {devotionEditor && (
                <form className={styles.editorForm} onSubmit={submitDevotion}>
                  <div className={styles.editorHeading}><h3>{devotionEditor.id ? "Edit devotion" : "Add devotion"}</h3><button className={styles.textButton} type="button" onClick={() => setDevotionEditor(null)}>Cancel</button></div>
                  <div className={styles.formGrid}>
                    <Field label="Title" htmlFor="devotion-title"><input id="devotion-title" value={devotionEditor.title} maxLength={200} onChange={(event) => setDevotionEditor({ ...devotionEditor, title: event.target.value })} required /></Field>
                    <Field label="Date" htmlFor="devotion-date"><input id="devotion-date" type="date" value={devotionEditor.devotionDate} onChange={(event) => setDevotionEditor({ ...devotionEditor, devotionDate: event.target.value })} required /></Field>
                    <Field label="Scripture" htmlFor="devotion-scripture"><input id="devotion-scripture" value={devotionEditor.scripture} maxLength={500} onChange={(event) => setDevotionEditor({ ...devotionEditor, scripture: event.target.value })} required /></Field>
                    <Field label="Image URL (optional)" htmlFor="devotion-image"><input id="devotion-image" type="url" value={devotionEditor.imageUrl} onChange={(event) => setDevotionEditor({ ...devotionEditor, imageUrl: event.target.value })} /></Field>
                    <Field label="Video URL (optional)" htmlFor="devotion-video"><input id="devotion-video" type="url" value={devotionEditor.videoUrl} onChange={(event) => setDevotionEditor({ ...devotionEditor, videoUrl: event.target.value })} /></Field>
                    <Field label="Message" htmlFor="devotion-message" wide><textarea id="devotion-message" rows={5} value={devotionEditor.message} onChange={(event) => setDevotionEditor({ ...devotionEditor, message: event.target.value })} required /></Field>
                    <Field label="Prayer" htmlFor="devotion-prayer" wide><textarea id="devotion-prayer" rows={4} value={devotionEditor.prayer} onChange={(event) => setDevotionEditor({ ...devotionEditor, prayer: event.target.value })} required /></Field>
                    <label className={styles.checkboxField}><input type="checkbox" checked={devotionEditor.published} onChange={(event) => setDevotionEditor({ ...devotionEditor, published: event.target.checked })} /> Published</label>
                  </div>
                  <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Saving…" : "Save devotion"}</button>
                </form>
              )}
              {pendingDelete && <DeletePrompt row={pendingDelete} busy={busy} onCancel={() => setPendingDelete(null)} onConfirm={() => void deletePending()} />}
              <div className={styles.ministryRecords}>
                {devotions.length ? devotions.map((row) => (
                  <ContentCard key={row.id} title={row.title} subtitle={`${row.scripture} · ${row.devotionDate}`} published={row.published} busy={busy} onEdit={() => setDevotionEditor({ id: row.id, title: row.title, scripture: row.scripture, message: row.message, prayer: row.prayer, devotionDate: row.devotionDate, imageUrl: row.imageUrl ?? "", videoUrl: row.videoUrl ?? "", published: row.published })} onToggle={() => void perform(setDailyDevotionPublishedAction(row.id, !row.published))} onDelete={() => setPendingDelete({ id: row.id, title: row.title })} />
                )) : <p className={styles.emptyState}>No devotions yet.</p>}
              </div>
            </>
          )}

          {section === "media" && (
            <>
              <div className={styles.sectionHeading}>
                <p className={styles.mutedText}>Manage sermon, prayer video, and ministry video entries.</p>
                <button className={styles.primaryButton} type="button" disabled={busy} onClick={() => setMediaEditor(blankMedia())}>Add media</button>
              </div>
              {mediaEditor && (
                <form className={styles.editorForm} onSubmit={submitMedia}>
                  <div className={styles.editorHeading}><h3>{mediaEditor.id ? "Edit media item" : "Add media item"}</h3><button className={styles.textButton} type="button" onClick={() => setMediaEditor(null)}>Cancel</button></div>
                  <div className={styles.formGrid}>
                    <Field label="Kind" htmlFor="media-kind"><select id="media-kind" value={mediaEditor.kind} onChange={(event) => setMediaEditor({ ...mediaEditor, kind: event.target.value as MinistryMediaInput["kind"] })}><option value="sermon">Sermon</option><option value="prayer_video">Prayer video</option><option value="ministry_video">Ministry video</option></select></Field>
                    <Field label="Category (optional)" htmlFor="media-category"><input id="media-category" value={mediaEditor.category} maxLength={120} onChange={(event) => setMediaEditor({ ...mediaEditor, category: event.target.value })} /></Field>
                    <Field label="Title" htmlFor="media-title"><input id="media-title" value={mediaEditor.title} maxLength={200} onChange={(event) => setMediaEditor({ ...mediaEditor, title: event.target.value })} required /></Field>
                    <Field label="Speaker (optional)" htmlFor="media-speaker"><input id="media-speaker" value={mediaEditor.speaker} maxLength={200} onChange={(event) => setMediaEditor({ ...mediaEditor, speaker: event.target.value })} /></Field>
                    <Field label="Date (optional)" htmlFor="media-date"><input id="media-date" type="date" value={mediaEditor.mediaDate} onChange={(event) => setMediaEditor({ ...mediaEditor, mediaDate: event.target.value })} /></Field>
                    <Field label="Scripture (optional)" htmlFor="media-scripture"><input id="media-scripture" value={mediaEditor.scripture} maxLength={500} onChange={(event) => setMediaEditor({ ...mediaEditor, scripture: event.target.value })} /></Field>
                    <Field label="Video URL" htmlFor="media-video" wide><input id="media-video" type="url" value={mediaEditor.videoUrl} onChange={(event) => setMediaEditor({ ...mediaEditor, videoUrl: event.target.value })} required /></Field>
                    <Field label="Thumbnail URL (optional)" htmlFor="media-thumbnail" wide><input id="media-thumbnail" type="url" value={mediaEditor.thumbnailUrl} onChange={(event) => setMediaEditor({ ...mediaEditor, thumbnailUrl: event.target.value })} /></Field>
                    <Field label="Description" htmlFor="media-description" wide><textarea id="media-description" rows={4} value={mediaEditor.description} onChange={(event) => setMediaEditor({ ...mediaEditor, description: event.target.value })} required /></Field>
                    <label className={styles.checkboxField}><input type="checkbox" checked={mediaEditor.published} onChange={(event) => setMediaEditor({ ...mediaEditor, published: event.target.checked })} /> Published</label>
                  </div>
                  <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Saving…" : "Save media"}</button>
                </form>
              )}
              {pendingDelete && <DeletePrompt row={pendingDelete} busy={busy} onCancel={() => setPendingDelete(null)} onConfirm={() => void deletePending()} />}
              <div className={styles.ministryRecords}>
                {media.length ? media.map((row) => (
                  <ContentCard key={row.id} title={row.title} subtitle={`${row.kind.replaceAll("_", " ")}${row.category ? ` · ${row.category}` : ""}`} published={row.published} busy={busy} onEdit={() => setMediaEditor({ id: row.id, kind: row.kind, category: row.category ?? "", title: row.title, description: row.description, speaker: row.speaker ?? "", mediaDate: row.mediaDate ?? "", scripture: row.scripture ?? "", videoUrl: row.videoUrl, thumbnailUrl: row.thumbnailUrl ?? "", published: row.published })} onToggle={() => void perform(setMinistryMediaPublishedAction(row.id, !row.published))} onDelete={() => setPendingDelete({ id: row.id, title: row.title })} />
                )) : <p className={styles.emptyState}>No media items yet.</p>}
              </div>
            </>
          )}

          {section === "charity" && (
            <>
              <div className={styles.sectionHeading}>
                <p className={styles.mutedText}>Manage published project descriptions and optional support contact/CTA text.</p>
                <button className={styles.primaryButton} type="button" disabled={busy} onClick={() => setProjectEditor(blankProject())}>Add project</button>
              </div>
              {projectEditor && (
                <form className={styles.editorForm} onSubmit={submitProject}>
                  <div className={styles.editorHeading}><h3>{projectEditor.id ? "Edit charity project" : "Add charity project"}</h3><button className={styles.textButton} type="button" onClick={() => setProjectEditor(null)}>Cancel</button></div>
                  <div className={styles.formGrid}>
                    <Field label="Title" htmlFor="project-title"><input id="project-title" value={projectEditor.title} maxLength={200} onChange={(event) => setProjectEditor({ ...projectEditor, title: event.target.value })} required /></Field>
                    <Field label="Category" htmlFor="project-category"><input id="project-category" value={projectEditor.category} maxLength={120} onChange={(event) => setProjectEditor({ ...projectEditor, category: event.target.value })} required /></Field>
                    <Field label="Image URL" htmlFor="project-image" wide><input id="project-image" type="url" value={projectEditor.imageUrl} onChange={(event) => setProjectEditor({ ...projectEditor, imageUrl: event.target.value })} required /></Field>
                    <Field label="Description" htmlFor="project-description" wide><textarea id="project-description" rows={5} value={projectEditor.description} onChange={(event) => setProjectEditor({ ...projectEditor, description: event.target.value })} required /></Field>
                    <Field label="Support contact (optional)" htmlFor="project-contact"><input id="project-contact" value={projectEditor.supportContact} maxLength={500} onChange={(event) => setProjectEditor({ ...projectEditor, supportContact: event.target.value })} /></Field>
                    <Field label="Support call to action (optional)" htmlFor="project-cta"><input id="project-cta" value={projectEditor.supportCta} maxLength={300} onChange={(event) => setProjectEditor({ ...projectEditor, supportCta: event.target.value })} /></Field>
                    <label className={styles.checkboxField}><input type="checkbox" checked={projectEditor.published} onChange={(event) => setProjectEditor({ ...projectEditor, published: event.target.checked })} /> Published</label>
                  </div>
                  <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Saving…" : "Save project"}</button>
                </form>
              )}
              {pendingDelete && <DeletePrompt row={pendingDelete} busy={busy} onCancel={() => setPendingDelete(null)} onConfirm={() => void deletePending()} />}
              <div className={styles.ministryRecords}>
                {projects.length ? projects.map((row) => (
                  <ContentCard key={row.id} title={row.title} subtitle={row.category} published={row.published} busy={busy} onEdit={() => setProjectEditor({ id: row.id, title: row.title, category: row.category, description: row.description, imageUrl: row.imageUrl, supportContact: row.supportContact ?? "", supportCta: row.supportCta ?? "", published: row.published })} onToggle={() => void perform(setCharityProjectPublishedAction(row.id, !row.published))} onDelete={() => setPendingDelete({ id: row.id, title: row.title })} />
                )) : <p className={styles.emptyState}>No charity projects yet.</p>}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

function ContentCard({ title, subtitle, published, busy, onEdit, onToggle, onDelete }: {
  title: string;
  subtitle: string;
  published: boolean;
  busy: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article className={styles.mobileRecord}>
      <div className={styles.mobileRecordTop}><strong>{title}</strong><PublishedBadge published={published} /></div>
      <p className={styles.mutedText}>{subtitle}</p>
      <div className={styles.rowActions}>
        <button className={styles.textButton} type="button" disabled={busy} onClick={onEdit}>Edit</button>
        <button className={styles.textButton} type="button" disabled={busy} onClick={onToggle}>{published ? "Unpublish" : "Publish"}</button>
        <button className={styles.deleteTextButton} type="button" disabled={busy} onClick={onDelete}>Delete</button>
      </div>
    </article>
  );
}

function DeletePrompt({ row, busy, onCancel, onConfirm }: {
  row: { title: string };
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.deleteConfirm} role="group" aria-label="Confirm deletion">
      <p>Delete “{row.title}”?</p>
      <div>
        <button className={styles.secondaryButton} type="button" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className={styles.deleteButton} type="button" onClick={onConfirm} disabled={busy}>Delete</button>
      </div>
    </div>
  );
}

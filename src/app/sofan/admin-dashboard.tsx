"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  createAdminUserAction,
  deleteEvent,
  deleteFinanceTransaction,
  deleteNewsArticle,
  filterFinanceTransactions,
  getPrayerRequestsAction,
  refreshAdminSnapshot,
  saveEvent,
  saveFinanceTransaction,
  saveNewsArticle,
  setEventPublished,
  setNewsPublished,
} from "./actions";
import type {
  ActionResult,
  AdminEvent,
  AdminSnapshot,
  AdminTab,
  EventInput,
  FinanceFilter,
  FinanceInput,
  FinanceTransaction,
  NewsArticle,
  NewsInput,
  PrayerRequest,
  PrayerStatus,
} from "@/lib/admin-types";
import styles from "./admin.module.css";
import { PrayerRequestsPanel } from "./prayer-requests-panel";
import { TestimoniesPanel } from "./testimonies-panel";
import { MinistryContentPanel } from "./ministry-content-panel";
import { logoutAdminAction } from "./auth-actions";

const navItems: { id: AdminTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "finance", label: "Finance" },
  { id: "news", label: "News" },
  { id: "events", label: "Events" },
  { id: "prayer-requests", label: "Prayer Requests" },
  { id: "testimonies", label: "Testimonies" },
  { id: "ministry", label: "Ministry Content" },
  { id: "admin-users", label: "Admin Users" },
];

const financeViews: { id: "overview" | FinanceFilter; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "tithe", label: "Tithes" },
  { id: "offering", label: "Offerings" },
  { id: "donation", label: "Donations" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function blankFinance(): FinanceInput {
  return {
    type: "tithe",
    amount: "",
    currency: "KES",
    paymentMethod: "M-Pesa",
    reference: "",
    donorName: "",
    phone: "",
    notes: "",
    transactionDate: today(),
  };
}

function financeDraft(row: FinanceTransaction): FinanceInput {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    currency: row.currency,
    paymentMethod: row.paymentMethod,
    reference: row.reference ?? "",
    donorName: row.donorName ?? "",
    phone: row.phone ?? "",
    notes: row.notes ?? "",
    transactionDate: row.transactionDate,
  };
}

function blankNews(): NewsInput {
  return { title: "", content: "", imageUrl: "", published: false };
}

function blankEvent(): EventInput {
  return {
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    imageUrl: "",
    published: false,
  };
}

function money(amount: string, currency = "KES") {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${currency} 0.00`;
  return `${currency} ${new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function dateLabel(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function timeLabel(start: string | null, end: string | null) {
  if (!start) return "Time to be set";
  return end ? `${start}–${end}` : start;
}

function Field({
  label,
  htmlFor,
  children,
  wide = false,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className={styles.emptyState}>{children}</p>;
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span className={`${styles.statusPill} ${published ? styles.statusPublished : styles.statusDraft}`}>
      {published ? "Published" : "Draft"}
    </span>
  );
}

function DatabaseNotice({ status }: { status: AdminSnapshot["databaseStatus"] }) {
  if (status === "connected") return null;
  const message = status === "not-configured"
    ? "Supabase is not configured. Set the Supabase project URL, anon key, and service-role key, then apply the SQL files described in README.md."
    : "Supabase is unavailable or the schema is missing. Check the project configuration and apply the SQL setup and migration files.";
  return (
    <div className={styles.databaseNotice} role="status">
      <strong>{status === "not-configured" ? "Database setup required" : "Database unavailable"}</strong>
      <span>{message}</span>
    </div>
  );
}

export function AdminDashboard({
  initialData,
  canPublishTestimonies,
}: {
  initialData: AdminSnapshot;
  canPublishTestimonies: boolean;
}) {
  const [snapshot, setSnapshot] = useState(initialData);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [financeView, setFinanceView] = useState<"overview" | FinanceFilter>("overview");
  const [financeType, setFinanceType] = useState<FinanceFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [financeRows, setFinanceRows] = useState(initialData.transactions);
  const [financeEditor, setFinanceEditor] = useState<FinanceInput | null>(null);
  const [newsEditor, setNewsEditor] = useState<NewsInput | null>(null);
  const [eventEditor, setEventEditor] = useState<EventInput | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ kind: "finance" | "news" | "event"; id: string } | null>(null);
  const [prayerStatusFilter, setPrayerStatusFilter] = useState<PrayerStatus | "all">("all");
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  const connected = snapshot.databaseStatus === "connected";
  const pageTitle = navItems.find((item) => item.id === activeTab)?.label ?? "Dashboard";

  async function loadPrayerRequests(status: PrayerStatus | "all" = prayerStatusFilter) {
    setPrayerStatusFilter(status);
    setNotice("");
    if (!connected) {
      setPrayerRequests([]);
      return;
    }
    setPrayerLoading(true);
    const result = await getPrayerRequestsAction(status);
    if (result.success) {
      setPrayerRequests(result.rows);
    } else {
      setPrayerRequests([]);
      setNotice(result.message);
    }
    setPrayerLoading(false);
  }

  function selectAdminTab(tab: AdminTab) {
    setActiveTab(tab);
    setNotice("");
    if (tab === "prayer-requests") void loadPrayerRequests("all");
  }

  async function reloadSnapshot() {
    const nextSnapshot = await refreshAdminSnapshot();
    setSnapshot(nextSnapshot);
    if (nextSnapshot.databaseStatus === "connected") {
      const nextRows = await filterFinanceTransactions({ type: financeType, from: fromDate, to: toDate });
      if (nextRows.success) setFinanceRows(nextRows.rows);
    } else {
      setFinanceRows([]);
    }
  }

  async function applyFinanceFilters(type = financeType, from = fromDate, to = toDate) {
    setBusy(true);
    setNotice("");
    const result = await filterFinanceTransactions({ type, from, to });
    if (result.success) {
      setFinanceRows(result.rows);
    } else {
      setNotice(result.message);
    }
    setBusy(false);
  }

  async function completeAction(action: Promise<ActionResult>, onSuccess?: () => void) {
    setBusy(true);
    setNotice("");
    const result = await action;
    if (result.success) {
      onSuccess?.();
      setNotice(result.message ?? "Saved.");
      await reloadSnapshot();
    } else {
      setNotice(result.message);
    }
    setBusy(false);
  }

  function submitFinance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!financeEditor) return;
    const input = { ...financeEditor };
    void completeAction(saveFinanceTransaction(input), () => setFinanceEditor(null));
  }

  function submitNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newsEditor) return;
    const input = { ...newsEditor };
    void completeAction(saveNewsArticle(input), () => setNewsEditor(null));
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventEditor) return;
    const input = { ...eventEditor };
    void completeAction(saveEvent(input), () => setEventEditor(null));
  }

  function submitAdminUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = newAdminEmail;
    const password = newAdminPassword;
    void completeAction(createAdminUserAction(email, password), () => {
      setNewAdminEmail("");
      setNewAdminPassword("");
    });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const pending = pendingDelete;
    const deletion = pending.kind === "finance"
      ? deleteFinanceTransaction(pending.id)
      : pending.kind === "news"
        ? deleteNewsArticle(pending.id)
        : deleteEvent(pending.id);
    await completeAction(deletion, () => setPendingDelete(null));
  }

  function renderFinanceSummary() {
    return (
      <div className={styles.metricGrid}>
        <Metric label="Total Received" value={snapshot.summary.totalReceived} />
        <Metric label="Tithes" value={snapshot.summary.tithes} />
        <Metric label="Offerings" value={snapshot.summary.offerings} />
        <Metric label="Donations" value={snapshot.summary.donations} />
      </div>
    );
  }

  function renderDashboard() {
    return (
      <>
        <section className={styles.sectionBlock} aria-labelledby="dashboard-finance-heading">
          <div className={styles.sectionHeading}>
            <h2 id="dashboard-finance-heading">Finance summary</h2>
            <button className={styles.textButton} type="button" onClick={() => setActiveTab("finance")}>View finance</button>
          </div>
          {connected ? renderFinanceSummary() : <EmptyState>Finance totals unavailable.</EmptyState>}
        </section>

        <div className={styles.dashboardGrid}>
          <section className={styles.panel} aria-labelledby="dashboard-transactions-heading">
            <div className={styles.sectionHeading}>
              <h2 id="dashboard-transactions-heading">Recent transactions</h2>
              <button className={styles.textButton} type="button" onClick={() => setActiveTab("finance")}>View all</button>
            </div>
            <TransactionList rows={snapshot.transactions.slice(0, 5)} onEdit={(row) => { setFinanceEditor(financeDraft(row)); setActiveTab("finance"); }} onDelete={(id) => { setPendingDelete({ kind: "finance", id }); setActiveTab("finance"); }} disabled={!connected || busy} compact />
          </section>

          <section className={styles.panel} aria-labelledby="dashboard-news-heading">
            <div className={styles.sectionHeading}>
              <h2 id="dashboard-news-heading">Recent news</h2>
              <button className={styles.textButton} type="button" onClick={() => setActiveTab("news")}>View all</button>
            </div>
            {snapshot.recentNews.length ? (
              <ul className={styles.simpleList}>
                {snapshot.recentNews.map((article) => (
                  <li key={article.id}>
                    <strong>{article.title}</strong>
                    <span>{dateLabel(article.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState>No news articles yet.</EmptyState>}
          </section>

          <section className={`${styles.panel} ${styles.dashboardWide}`} aria-labelledby="dashboard-events-heading">
            <div className={styles.sectionHeading}>
              <h2 id="dashboard-events-heading">Upcoming events</h2>
              <button className={styles.textButton} type="button" onClick={() => setActiveTab("events")}>View all</button>
            </div>
            {snapshot.upcomingEvents.length ? (
              <ul className={styles.simpleList}>
                {snapshot.upcomingEvents.map((churchEvent) => (
                  <li key={churchEvent.id}>
                    <strong>{churchEvent.title}</strong>
                    <span>{dateLabel(churchEvent.eventDate)} · {timeLabel(churchEvent.startTime, churchEvent.endTime)}</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState>No upcoming events.</EmptyState>}
          </section>

          <section className={styles.panel} aria-labelledby="dashboard-prayers-heading">
            <div className={styles.sectionHeading}>
              <h2 id="dashboard-prayers-heading">Prayer Requests</h2>
              <button className={styles.textButton} type="button" onClick={() => selectAdminTab("prayer-requests")}>View requests</button>
            </div>
            <p className={styles.prayerPendingSummary}>
              {connected && snapshot.newPrayerRequestCount !== null ? `${snapshot.newPrayerRequestCount} New Requests` : "New-request count unavailable"}
            </p>
          </section>
        </div>
      </>
    );
  }

  function renderFinance() {
    return (
      <>
        <nav className={styles.subnav} aria-label="Finance sections">
          {financeViews.map((view) => (
            <button
              key={view.id}
              type="button"
              className={financeView === view.id ? styles.subnavActive : ""}
              aria-current={financeView === view.id ? "page" : undefined}
              onClick={() => {
                setFinanceView(view.id);
                const type = view.id === "overview" ? "all" : view.id;
                setFinanceType(type);
                void applyFinanceFilters(type);
              }}
            >
              {view.label}
            </button>
          ))}
        </nav>

        {financeView === "overview" && connected && renderFinanceSummary()}

        <section className={styles.panel} aria-labelledby="transactions-heading">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="transactions-heading">{financeView === "overview" ? "Transactions" : financeViews.find((view) => view.id === financeView)?.label}</h2>
              <p className={styles.mutedText}>KES transactions</p>
            </div>
            <button className={styles.primaryButton} type="button" disabled={!connected || busy} onClick={() => setFinanceEditor(blankFinance())}>
              Add transaction
            </button>
          </div>

          {financeEditor && (
            <form className={styles.editorForm} onSubmit={submitFinance}>
              <div className={styles.editorHeading}>
                <h3>{financeEditor.id ? "Edit transaction" : "Add transaction"}</h3>
                <button className={styles.textButton} type="button" onClick={() => setFinanceEditor(null)}>Cancel</button>
              </div>
              <div className={styles.formGrid}>
                <Field label="Transaction type" htmlFor="finance-type">
                  <select id="finance-type" value={financeEditor.type} onChange={(event) => setFinanceEditor({ ...financeEditor, type: event.target.value as FinanceInput["type"] })} required>
                    <option value="tithe">Tithe</option>
                    <option value="offering">Offering</option>
                    <option value="donation">Donation</option>
                  </select>
                </Field>
                <Field label="Amount" htmlFor="finance-amount">
                  <input id="finance-amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={financeEditor.amount} onChange={(event) => setFinanceEditor({ ...financeEditor, amount: event.target.value })} required />
                </Field>
                <Field label="Currency" htmlFor="finance-currency">
                  <select id="finance-currency" value={financeEditor.currency} onChange={(event) => setFinanceEditor({ ...financeEditor, currency: event.target.value })}>
                    <option value="KES">KES</option>
                  </select>
                </Field>
                <Field label="Payment method" htmlFor="finance-method">
                  <input id="finance-method" value={financeEditor.paymentMethod} onChange={(event) => setFinanceEditor({ ...financeEditor, paymentMethod: event.target.value })} required />
                </Field>
                <Field label="Reference" htmlFor="finance-reference">
                  <input id="finance-reference" value={financeEditor.reference} onChange={(event) => setFinanceEditor({ ...financeEditor, reference: event.target.value })} />
                </Field>
                <Field label="Donor name" htmlFor="finance-donor">
                  <input id="finance-donor" value={financeEditor.donorName} onChange={(event) => setFinanceEditor({ ...financeEditor, donorName: event.target.value })} />
                </Field>
                <Field label="Phone" htmlFor="finance-phone">
                  <input id="finance-phone" type="tel" autoComplete="tel" value={financeEditor.phone} onChange={(event) => setFinanceEditor({ ...financeEditor, phone: event.target.value })} />
                </Field>
                <Field label="Transaction date" htmlFor="finance-date">
                  <input id="finance-date" type="date" value={financeEditor.transactionDate} onChange={(event) => setFinanceEditor({ ...financeEditor, transactionDate: event.target.value })} required />
                </Field>
                <Field label="Notes" htmlFor="finance-notes" wide>
                  <textarea id="finance-notes" rows={3} value={financeEditor.notes} onChange={(event) => setFinanceEditor({ ...financeEditor, notes: event.target.value })} />
                </Field>
              </div>
              <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Saving…" : "Save transaction"}</button>
            </form>
          )}

          <div className={styles.filterBar}>
            <label className={styles.filterField}>
              <span>Type</span>
              <select value={financeType} onChange={(event) => {
                const nextType = event.target.value as FinanceFilter;
                setFinanceType(nextType);
                void applyFinanceFilters(nextType);
              }}>
                <option value="all">All</option>
                <option value="tithe">Tithes</option>
                <option value="offering">Offerings</option>
                <option value="donation">Donations</option>
              </select>
            </label>
            <label className={styles.filterField}>
              <span>From</span>
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </label>
            <label className={styles.filterField}>
              <span>To</span>
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </label>
            <button className={styles.secondaryButton} type="button" disabled={!connected || busy} onClick={() => void applyFinanceFilters()}>
              Apply filters
            </button>
          </div>

          {pendingDelete?.kind === "finance" && <DeleteConfirm onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmDelete()} busy={busy} label="this transaction" />}
          <TransactionList rows={financeRows} onEdit={(row) => setFinanceEditor(financeDraft(row))} onDelete={(id) => setPendingDelete({ kind: "finance", id })} disabled={!connected || busy} />
        </section>
      </>
    );
  }

  function renderNews() {
    return (
      <section className={styles.panel} aria-labelledby="news-heading">
        <div className={styles.sectionHeading}>
          <div><h2 id="news-heading">News</h2><p className={styles.mutedText}>Manage articles and publication status.</p></div>
          <button className={styles.primaryButton} type="button" disabled={!connected || busy} onClick={() => setNewsEditor(blankNews())}>Add news</button>
        </div>

        {newsEditor && (
          <form className={styles.editorForm} onSubmit={submitNews}>
            <div className={styles.editorHeading}>
              <h3>{newsEditor.id ? "Edit news" : "Add news"}</h3>
              <button className={styles.textButton} type="button" onClick={() => setNewsEditor(null)}>Cancel</button>
            </div>
            <div className={styles.formGrid}>
              <Field label="Title" htmlFor="news-title" wide>
                <input id="news-title" value={newsEditor.title} onChange={(event) => setNewsEditor({ ...newsEditor, title: event.target.value })} required maxLength={200} />
              </Field>
              <Field label="Content" htmlFor="news-content" wide>
                <textarea id="news-content" rows={6} value={newsEditor.content} onChange={(event) => setNewsEditor({ ...newsEditor, content: event.target.value })} required />
              </Field>
              <Field label="Image URL" htmlFor="news-image" wide>
                <input id="news-image" type="url" value={newsEditor.imageUrl} onChange={(event) => setNewsEditor({ ...newsEditor, imageUrl: event.target.value })} />
              </Field>
              <label className={styles.checkboxField}>
                <input type="checkbox" checked={newsEditor.published} onChange={(event) => setNewsEditor({ ...newsEditor, published: event.target.checked })} />
                Published
              </label>
            </div>
            <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Saving…" : "Save news"}</button>
          </form>
        )}

        {pendingDelete?.kind === "news" && <DeleteConfirm onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmDelete()} busy={busy} label="this news article" />}
        <NewsList rows={snapshot.news} busy={busy || !connected} onEdit={(article) => setNewsEditor({ id: article.id, title: article.title, content: article.content, imageUrl: article.imageUrl ?? "", published: article.published })} onDelete={(id) => setPendingDelete({ kind: "news", id })} onToggle={(id, published) => void completeAction(setNewsPublished(id, published))} />
      </section>
    );
  }

  function renderEvents() {
    return (
      <section className={styles.panel} aria-labelledby="events-heading">
        <div className={styles.sectionHeading}>
          <div><h2 id="events-heading">Events</h2><p className={styles.mutedText}>Manage dates, details, and publication status.</p></div>
          <button className={styles.primaryButton} type="button" disabled={!connected || busy} onClick={() => setEventEditor(blankEvent())}>Add event</button>
        </div>

        {eventEditor && (
          <form className={styles.editorForm} onSubmit={submitEvent}>
            <div className={styles.editorHeading}>
              <h3>{eventEditor.id ? "Edit event" : "Add event"}</h3>
              <button className={styles.textButton} type="button" onClick={() => setEventEditor(null)}>Cancel</button>
            </div>
            <div className={styles.formGrid}>
              <Field label="Event" htmlFor="event-title">
                <input id="event-title" value={eventEditor.title} onChange={(event) => setEventEditor({ ...eventEditor, title: event.target.value })} required maxLength={200} />
              </Field>
              <Field label="Date" htmlFor="event-date">
                <input id="event-date" type="date" value={eventEditor.eventDate} onChange={(event) => setEventEditor({ ...eventEditor, eventDate: event.target.value })} required />
              </Field>
              <Field label="Start time" htmlFor="event-start-time">
                <input id="event-start-time" type="time" value={eventEditor.startTime} onChange={(event) => setEventEditor({ ...eventEditor, startTime: event.target.value })} />
              </Field>
              <Field label="End time" htmlFor="event-end-time">
                <input id="event-end-time" type="time" value={eventEditor.endTime} onChange={(event) => setEventEditor({ ...eventEditor, endTime: event.target.value })} />
              </Field>
              <Field label="Location" htmlFor="event-location">
                <input id="event-location" value={eventEditor.location} onChange={(event) => setEventEditor({ ...eventEditor, location: event.target.value })} />
              </Field>
              <Field label="Image URL" htmlFor="event-image">
                <input id="event-image" type="url" value={eventEditor.imageUrl} onChange={(event) => setEventEditor({ ...eventEditor, imageUrl: event.target.value })} />
              </Field>
              <Field label="Description" htmlFor="event-description" wide>
                <textarea id="event-description" rows={4} value={eventEditor.description} onChange={(event) => setEventEditor({ ...eventEditor, description: event.target.value })} required />
              </Field>
              <label className={styles.checkboxField}>
                <input type="checkbox" checked={eventEditor.published} onChange={(event) => setEventEditor({ ...eventEditor, published: event.target.checked })} />
                Published
              </label>
            </div>
            <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Saving…" : "Save event"}</button>
          </form>
        )}

        {pendingDelete?.kind === "event" && <DeleteConfirm onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmDelete()} busy={busy} label="this event" />}
        <EventList rows={snapshot.events} busy={busy || !connected} onEdit={(churchEvent) => setEventEditor({ id: churchEvent.id, title: churchEvent.title, description: churchEvent.description, eventDate: churchEvent.eventDate, startTime: churchEvent.startTime ?? "", endTime: churchEvent.endTime ?? "", location: churchEvent.location ?? "", imageUrl: churchEvent.imageUrl ?? "", published: churchEvent.published })} onDelete={(id) => setPendingDelete({ kind: "event", id })} onToggle={(id, published) => void completeAction(setEventPublished(id, published))} />
      </section>
    );
  }

  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar} aria-label="SOFAN administration">
        <div className={styles.brandBlock}>
          <span className={styles.brandMark} aria-hidden="true">S</span>
          <div><strong>SOFAN</strong><span>Administration</span></div>
        </div>
        <nav className={styles.sidebarNav} aria-label="Main sections">
          {navItems.map((item) => (
            <button key={item.id} type="button" className={activeTab === item.id ? styles.navActive : ""} aria-current={activeTab === item.id ? "page" : undefined} onClick={() => selectAdminTab(item.id)}>
              {item.label}
              {item.id === "prayer-requests" && snapshot.newPrayerRequestCount !== null && <span className={styles.prayerNavCount}>{snapshot.newPrayerRequestCount}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <form action={logoutAdminAction}>
            <button className={styles.textButton} type="submit">Sign out</button>
          </form>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            <Link href="/" className={styles.backButton}>← Back to website</Link>
            <div>
            <p className={styles.breadcrumb}>SOFAN / Admin</p>
            <h1>{pageTitle}</h1>
            </div>
          </div>
          <div className={styles.topbarStatus}>
            <span className={`${styles.connectionDot} ${connected ? styles.connectionReady : ""}`} />
            <span>{connected ? "Supabase connected" : snapshot.databaseStatus === "not-configured" ? "Database setup required" : "Database unavailable"}</span>
            <span className={styles.demoBadge}>ADMIN</span>
          </div>
        </header>

        <div className={styles.content}>
          <DatabaseNotice status={snapshot.databaseStatus} />
          {notice && <p className={styles.feedback} role="status">{notice}</p>}
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "finance" && renderFinance()}
          {activeTab === "news" && renderNews()}
          {activeTab === "events" && renderEvents()}
          {activeTab === "prayer-requests" && (
            <PrayerRequestsPanel
              connected={connected}
              newCount={snapshot.newPrayerRequestCount}
              onNewCountChange={(newPrayerRequestCount) => setSnapshot((current) => ({ ...current, newPrayerRequestCount }))}
              requests={prayerRequests}
              loading={prayerLoading}
              onRefresh={() => loadPrayerRequests(prayerStatusFilter)}
            />
          )}
          {activeTab === "testimonies" && (
            <TestimoniesPanel connected={connected} canPublish={canPublishTestimonies} />
          )}
          {activeTab === "ministry" && <MinistryContentPanel connected={connected} />}
          {activeTab === "admin-users" && (
            <section className={styles.panel} aria-labelledby="admin-users-heading">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="admin-users-heading">Create an admin account</h2>
                  <p className={styles.mutedText}>Add trusted staff who need access to the SOFAN administration dashboard.</p>
                </div>
              </div>
              <form className={styles.editorForm} onSubmit={submitAdminUser}>
                <div className={styles.formGrid}>
                  <Field label="Email address" htmlFor="new-admin-email">
                    <input
                      id="new-admin-email"
                      type="email"
                      autoComplete="email"
                      value={newAdminEmail}
                      onChange={(event) => setNewAdminEmail(event.target.value)}
                      maxLength={254}
                      required
                    />
                  </Field>
                  <Field label="Initial password" htmlFor="new-admin-password">
                    <input
                      id="new-admin-password"
                      type="password"
                      autoComplete="new-password"
                      value={newAdminPassword}
                      onChange={(event) => setNewAdminPassword(event.target.value)}
                      minLength={8}
                      maxLength={1024}
                      required
                    />
                  </Field>
                </div>
                <p className={styles.mutedText}>
                  The new staff account will have the same admin access as yours. Share the initial password securely.
                </p>
                <button className={styles.primaryButton} type="submit" disabled={!connected || busy}>
                  {busy ? "Creating account…" : "Create admin account"}
                </button>
              </form>
            </section>
          )}
        </div>
      </main>

      <nav className={styles.mobileNav} aria-label="Admin sections">
        {navItems.map((item) => (
          <button key={item.id} type="button" className={activeTab === item.id ? styles.mobileNavActive : ""} aria-current={activeTab === item.id ? "page" : undefined} onClick={() => selectAdminTab(item.id)}>
            {item.label}
            {item.id === "prayer-requests" && snapshot.newPrayerRequestCount !== null && <span className={styles.prayerNavCount}>{snapshot.newPrayerRequestCount}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.metric}>
      <span>{label}</span>
      <strong>{money(value)}</strong>
    </article>
  );
}

function DeleteConfirm({ onCancel, onConfirm, busy, label }: { onCancel: () => void; onConfirm: () => void; busy: boolean; label: string }) {
  return (
    <div className={styles.deleteConfirm} role="group" aria-label="Confirm deletion">
      <p>Delete {label}?</p>
      <div>
        <button className={styles.secondaryButton} type="button" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className={styles.deleteButton} type="button" onClick={onConfirm} disabled={busy}>Delete</button>
      </div>
    </div>
  );
}

function TransactionList({ rows, onEdit, onDelete, disabled, compact = false }: {
  rows: FinanceTransaction[];
  onEdit: (row: FinanceTransaction) => void;
  onDelete: (id: string) => void;
  disabled: boolean;
  compact?: boolean;
}) {
  if (!rows.length) return <EmptyState>No transactions found.</EmptyState>;
  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.dataTable}>
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Payment Method</th><th>Reference</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{dateLabel(row.transactionDate)}</td>
                <td><span className={styles.typeLabel}>{row.type}</span></td>
                <td className={styles.amountCell}>{money(row.amount, row.currency)}</td>
                <td>{row.paymentMethod}</td>
                <td>{row.reference || "—"}</td>
                <td><RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)} disabled={disabled} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.mobileRecords}>
        {rows.map((row) => (
          <article className={styles.mobileRecord} key={row.id}>
            <div className={styles.mobileRecordTop}><strong>{row.type}</strong><strong>{money(row.amount, row.currency)}</strong></div>
            <div className={styles.mobileRecordDetails}><span>{dateLabel(row.transactionDate)}</span><span>{row.paymentMethod}</span><span>{row.reference || "No reference"}</span></div>
            <RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)} disabled={disabled} />
          </article>
        ))}
      </div>
      {compact && <p className={styles.listNote}>Latest {rows.length} records</p>}
    </>
  );
}

function RowActions({ onEdit, onDelete, disabled }: { onEdit: () => void; onDelete: () => void; disabled: boolean }) {
  return (
    <div className={styles.rowActions}>
      <button type="button" className={styles.textButton} onClick={onEdit} disabled={disabled}>Edit</button>
      <button type="button" className={styles.deleteTextButton} onClick={onDelete} disabled={disabled}>Delete</button>
    </div>
  );
}

function NewsList({ rows, busy, onEdit, onDelete, onToggle }: {
  rows: NewsArticle[];
  busy: boolean;
  onEdit: (article: NewsArticle) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, published: boolean) => void;
}) {
  if (!rows.length) return <EmptyState>No news articles yet.</EmptyState>;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.dataTable}>
        <thead><tr><th>Title</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map((article) => (
            <tr key={article.id}>
              <td className={styles.primaryCell}>{article.title}</td>
              <td><StatusPill published={article.published} /></td>
              <td>{dateLabel(article.createdAt)}</td>
              <td><div className={styles.rowActions}>
                <button className={styles.textButton} type="button" disabled={busy} onClick={() => onEdit(article)}>Edit</button>
                <button className={styles.textButton} type="button" disabled={busy} onClick={() => onToggle(article.id, !article.published)}>{article.published ? "Unpublish" : "Publish"}</button>
                <button className={styles.deleteTextButton} type="button" disabled={busy} onClick={() => onDelete(article.id)}>Delete</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.mobileRecords}>
        {rows.map((article) => (
          <article className={styles.mobileRecord} key={article.id}>
            <div className={styles.mobileRecordTop}><strong>{article.title}</strong><StatusPill published={article.published} /></div>
            <span className={styles.mutedText}>Created {dateLabel(article.createdAt)}</span>
            <div className={styles.rowActions}>
              <button className={styles.textButton} type="button" disabled={busy} onClick={() => onEdit(article)}>Edit</button>
              <button className={styles.textButton} type="button" disabled={busy} onClick={() => onToggle(article.id, !article.published)}>{article.published ? "Unpublish" : "Publish"}</button>
              <button className={styles.deleteTextButton} type="button" disabled={busy} onClick={() => onDelete(article.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function EventList({ rows, busy, onEdit, onDelete, onToggle }: {
  rows: AdminEvent[];
  busy: boolean;
  onEdit: (churchEvent: AdminEvent) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, published: boolean) => void;
}) {
  if (!rows.length) return <EmptyState>No upcoming events.</EmptyState>;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.dataTable}>
        <thead><tr><th>Event</th><th>Date</th><th>Time</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map((churchEvent) => (
            <tr key={churchEvent.id}>
              <td className={styles.primaryCell}>{churchEvent.title}</td>
              <td>{dateLabel(churchEvent.eventDate)}</td>
              <td>{timeLabel(churchEvent.startTime, churchEvent.endTime)}</td>
              <td>{churchEvent.location || "—"}</td>
              <td><StatusPill published={churchEvent.published} /></td>
              <td><div className={styles.rowActions}>
                <button className={styles.textButton} type="button" disabled={busy} onClick={() => onEdit(churchEvent)}>Edit</button>
                <button className={styles.textButton} type="button" disabled={busy} onClick={() => onToggle(churchEvent.id, !churchEvent.published)}>{churchEvent.published ? "Unpublish" : "Publish"}</button>
                <button className={styles.deleteTextButton} type="button" disabled={busy} onClick={() => onDelete(churchEvent.id)}>Delete</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.mobileRecords}>
        {rows.map((churchEvent) => (
          <article className={styles.mobileRecord} key={churchEvent.id}>
            <div className={styles.mobileRecordTop}><strong>{churchEvent.title}</strong><StatusPill published={churchEvent.published} /></div>
            <div className={styles.mobileRecordDetails}><span>{dateLabel(churchEvent.eventDate)}</span><span>{timeLabel(churchEvent.startTime, churchEvent.endTime)}</span><span>{churchEvent.location || "Location not set"}</span></div>
            <div className={styles.rowActions}>
              <button className={styles.textButton} type="button" disabled={busy} onClick={() => onEdit(churchEvent)}>Edit</button>
              <button className={styles.textButton} type="button" disabled={busy} onClick={() => onToggle(churchEvent.id, !churchEvent.published)}>{churchEvent.published ? "Unpublish" : "Publish"}</button>
              <button className={styles.deleteTextButton} type="button" disabled={busy} onClick={() => onDelete(churchEvent.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export type FinanceType = "tithe" | "offering" | "donation";
export type FinanceFilter = "all" | FinanceType;
export type AdminTab = "dashboard" | "finance" | "news" | "events" | "prayer-requests";
export type DatabaseStatus = "connected" | "not-configured" | "unavailable";
export type PrayerStatus = "pending" | "prayed_for" | "archived";

export interface FinanceTransaction {
  id: string;
  type: FinanceType;
  amount: string;
  currency: string;
  paymentMethod: string;
  reference: string | null;
  donorName: string | null;
  phone: string | null;
  notes: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
}

export interface FinanceSummary {
  totalReceived: string;
  tithes: string;
  offerings: string;
  donations: string;
}

export interface AdminSnapshot {
  databaseStatus: DatabaseStatus;
  summary: FinanceSummary;
  pendingPrayerCount: string | null;
  transactions: FinanceTransaction[];
  news: NewsArticle[];
  events: AdminEvent[];
  recentNews: NewsArticle[];
  upcomingEvents: AdminEvent[];
}

export interface PrayerRequest {
  id: string;
  name: string | null;
  phone: string | null;
  requestText: string | null;
  isAnonymous: boolean;
  hasAudio: boolean;
  audioDuration: number | null;
  audioMimeType: string | null;
  audioSize: string | null;
  status: PrayerStatus;
  createdAt: string;
}

export interface FinanceInput {
  id?: string;
  type: FinanceType;
  amount: string;
  currency: string;
  paymentMethod: string;
  reference: string;
  donorName: string;
  phone: string;
  notes: string;
  transactionDate: string;
}

export interface NewsInput {
  id?: string;
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
}

export interface EventInput {
  id?: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  imageUrl: string;
  published: boolean;
}

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; message: string };

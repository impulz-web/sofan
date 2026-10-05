import type { Metadata } from "next";
import { connection } from "next/server";
import { loadAdminSnapshot } from "@/lib/admin-repository";
import { AdminDashboard } from "./admin-dashboard";

export const metadata: Metadata = {
  title: "SOFAN Admin",
  robots: { index: false, follow: false },
};

export default async function SofanAdminPage() {
  await connection();
  const initialData = await loadAdminSnapshot();

  return <AdminDashboard initialData={initialData} />;
}

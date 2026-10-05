import type { Metadata } from "next";
import { connection } from "next/server";
import { canPublishTestimonies, isAdminAuthenticated } from "@/lib/admin-auth";
import { loadAdminSnapshot } from "@/lib/admin-repository";
import { AdminDashboard } from "./admin-dashboard";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "SOFAN Admin",
  robots: { index: false, follow: false },
};

export default async function SofanAdminPage() {
  await connection();
  if (!(await isAdminAuthenticated())) {
    return <AdminLoginForm />;
  }

  const initialData = await loadAdminSnapshot();

  return <AdminDashboard initialData={initialData} canPublishTestimonies={await canPublishTestimonies()} />;
}

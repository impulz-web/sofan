"use server";

import { isSupabaseAdminUser } from "@/lib/admin-auth";
import { isSupabaseAdminAuthConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/admin-types";

export async function loginAdminAction(emailInput: string, password: string): Promise<ActionResult> {
  if (!isSupabaseAdminAuthConfigured()) {
    return { success: false, message: "Admin sign-in is not configured. Contact the site administrator." };
  }

  const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || typeof password !== "string" || !password || password.length > 1024) {
    return { success: false, message: "Enter your administrator email and password." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { success: false, message: "Sign-in failed. Check your email and password." };
    }
    if (!(await isSupabaseAdminUser(supabase, data.user.id))) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) console.error("Could not clear a Supabase session without the admin role.", signOutError);
      return { success: false, message: "Sign-in failed. Check your email and password." };
    }
    return { success: true };
  } catch (error) {
    console.error("Supabase admin sign-in could not be completed.", error);
    return { success: false, message: "Admin sign-in is temporarily unavailable. Please try again later." };
  }
}

export async function logoutAdminAction() {
  if (!isSupabaseAdminAuthConfigured()) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Could not sign out of the admin session.");
}

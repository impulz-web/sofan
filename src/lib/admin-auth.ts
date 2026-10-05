import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isSupabaseAdminAuthConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function isAdminAuthConfigured() {
  return isSupabaseAdminAuthConfigured();
}

export async function canPublishTestimonies() {
  const context = await getAuthenticatedAdminContext();
  return context?.canPublishTestimonies ?? false;
}

async function getAuthenticatedAdminContext(): Promise<{
  user: User;
  isAdmin: boolean;
  canPublishTestimonies: boolean;
} | null> {
  if (!isAdminAuthConfigured()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      if (error.name !== "AuthSessionMissingError") {
        console.error("Supabase could not verify the current admin session.", error);
      }
      return null;
    }
    if (!user) return null;

    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role, can_publish_testimonies")
      .eq("user_id", user.id)
      .maybeSingle();
    if (roleError) {
      console.error("Supabase could not verify the user's admin role.", roleError);
      return null;
    }
    const isAdmin = role?.role === "admin";
    return {
      user,
      isAdmin,
      canPublishTestimonies: isAdmin && role.can_publish_testimonies === true,
    };
  } catch (error) {
    console.error("Could not verify the current Supabase admin role.", error);
    return null;
  }
}

export async function isSupabaseAdminUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("Supabase could not verify the user's admin role.", error);
    throw error;
  }
  return data?.role === "admin";
}

export async function getAuthenticatedAdmin(): Promise<User | null> {
  const context = await getAuthenticatedAdminContext();
  return context?.isAdmin ? context.user : null;
}

export async function isAdminAuthenticated() {
  return Boolean(await getAuthenticatedAdmin());
}

export async function requireAdminSession() {
  if (!(await getAuthenticatedAdmin())) {
    throw new Error("Unauthorized.");
  }
}

export async function requireTestimonyPublishPermission() {
  const context = await getAuthenticatedAdminContext();
  if (!context?.isAdmin) throw new Error("Unauthorized.");
  if (!context.canPublishTestimonies) {
    throw new Error("You do not have permission to publish testimonies.");
  }
}

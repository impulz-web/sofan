import "server-only";

import { createSupabaseDatabaseClient } from "@/lib/supabase/database";

export async function createAdminUser(email: string, password: string) {
  const supabase = createSupabaseDatabaseClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return the new user account.");

  const { error: roleError } = await supabase.from("user_roles").upsert({
    user_id: data.user.id,
    role: "admin",
    can_publish_testimonies: false,
  }, { onConflict: "user_id" });
  if (roleError) {
    const { error: cleanupError } = await supabase.auth.admin.deleteUser(data.user.id);
    if (cleanupError) {
      console.error("Could not remove a newly created account after role assignment failed.", cleanupError);
    }
    throw roleError;
  }

  return { email: data.user.email ?? email };
}

import "server-only";

import { insertTestimonySubmission } from "@/lib/admin-repository";
import type { TestimonySubmission } from "@/lib/admin-types";

export async function createTestimonySubmission(input: TestimonySubmission) {
  if (!input || typeof input !== "object"
    || typeof input.isAnonymous !== "boolean"
    || typeof input.publicationConsent !== "boolean") {
    return { success: false as const, message: "Enter valid testimony details." };
  }
  const content = typeof input?.content === "string" ? input.content.trim() : "";
  const displayName = typeof input?.displayName === "string" ? input.displayName.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  if (!content || content.length > 10_000 || displayName.length > 120 || email.length > 254 || phone.length > 80) {
    return { success: false as const, message: "Enter a testimony under 10,000 characters and valid contact details." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false as const, message: "Enter a valid email address or leave it blank." };
  }

  try {
    const id = await insertTestimonySubmission({
      content,
      displayName: input.isAnonymous ? null : displayName || null,
      email: email || null,
      phone: phone || null,
      isAnonymous: Boolean(input.isAnonymous),
      publicationConsent: Boolean(input.publicationConsent),
    });
    return id
      ? { success: true as const, id }
      : { success: false as const, message: "Could not submit the testimony." };
  } catch {
    return { success: false as const, message: "Could not submit the testimony." };
  }
}

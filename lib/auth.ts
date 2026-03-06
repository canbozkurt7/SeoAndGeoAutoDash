import { createServerSupabase } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";
import { redirect } from "next/navigation";

export async function requireUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireRole(required: AppRole) {
  const user = await requireUser();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    throw new Error("Unauthorized");
  }

  if (required === "owner" && data.role !== "owner") {
    throw new Error("Forbidden");
  }

  return user;
}

export function isInternalRequest(request: Request) {
  const expected = process.env.PIPELINE_SHARED_SECRET;
  if (!expected) {
    return false;
  }
  const token = request.headers.get("x-pipeline-secret");
  return token === expected;
}

export async function requireRoleOrRedirect(required: AppRole) {
  try {
    await requireRole(required);
  } catch {
    redirect("/login");
  }
}

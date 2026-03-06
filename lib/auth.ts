import { createServerSupabase } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";
import { redirect } from "next/navigation";

const AUTH_BYPASS = process.env.AUTH_BYPASS !== "false";
const BYPASS_USER_ID =
  process.env.DEFAULT_BYPASS_USER_ID ?? "00000000-0000-0000-0000-000000000001";

function bypassUser() {
  return { id: BYPASS_USER_ID } as any;
}

export function isAuthBypassed() {
  return AUTH_BYPASS;
}

export async function requireUser() {
  if (AUTH_BYPASS) {
    return bypassUser();
  }

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
  if (AUTH_BYPASS) {
    return bypassUser();
  }

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
  if (AUTH_BYPASS) {
    return;
  }

  try {
    await requireRole(required);
  } catch {
    redirect("/login");
  }
}

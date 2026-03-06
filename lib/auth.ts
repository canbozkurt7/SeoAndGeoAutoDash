import type { AppRole } from "@/lib/types";

// Authentication disabled intentionally: allow direct dashboard access.
const BYPASS_USER_ID =
  process.env.DEFAULT_BYPASS_USER_ID ?? "00000000-0000-0000-0000-000000000001";

function bypassUser() {
  return { id: BYPASS_USER_ID } as const;
}

export function isAuthBypassed() {
  return true;
}

export async function requireUser() {
  return bypassUser();
}

export async function requireRole(_required: AppRole) {
  return bypassUser();
}

export function isInternalRequest(request: Request) {
  const expected = process.env.PIPELINE_SHARED_SECRET;
  if (!expected) {
    return false;
  }
  const token = request.headers.get("x-pipeline-secret");
  return token === expected;
}

export async function requireRoleOrRedirect(_required: AppRole) {
  return;
}

const AUTHORITATIVE_SESSION_FAILURES = new Set([400, 401, 403, 404, 422]);

export function shouldClearSession(status: number): boolean {
  return AUTHORITATIVE_SESSION_FAILURES.has(status);
}

import "server-only";

const DEFAULT_API_URL = "http://localhost:9289/api/v1";
const REQUEST_TIMEOUT_MS = 8_000;

export interface UpstreamResponse<T> {
  body: T;
  status: number;
}

export async function callBackend<T>(
  path: string,
  init: RequestInit = {},
): Promise<UpstreamResponse<T>> {
  const baseUrl = (process.env.MIKOZI_API_URL ?? DEFAULT_API_URL).replace(
    /\/$/,
    "",
  );
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");

  if (init.body) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  return {
    body:
      response.status === 204
        ? (undefined as T)
        : ((await response.json()) as T),
    status: response.status,
  };
}

export function publicUpstreamError(
  status: number,
  fallback: string,
): { error: { code: string; message: string } } {
  if (status === 429) {
    return {
      error: {
        code: "RATE_LIMITED",
        message: "Too many attempts. Please wait a moment and try again.",
      },
    };
  }

  return {
    error: {
      code: "REQUEST_FAILED",
      message: fallback,
    },
  };
}

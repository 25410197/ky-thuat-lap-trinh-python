import { env } from "@/lib/env";
import { authStorage } from "@/lib/auth/auth-storage";
import { ApiError } from "./api-error";
import type { ApiErrorResponse } from "@/types/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;
  const token = skipAuth ? null : authStorage.getToken();

  const isFormData = body instanceof FormData;
  const fetchHeaders: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  
  if (!isFormData && !fetchHeaders.hasOwnProperty("Content-Type")) {
    (fetchHeaders as any)["Content-Type"] = "application/json";
  } else if (isFormData) {
    if (fetchHeaders.hasOwnProperty("Content-Type")) {
      delete (fetchHeaders as any)["Content-Type"];
    }
  }

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    headers: fetchHeaders,
    body: isFormData ? (body as FormData) : (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(payload?.detail ?? res.statusText, res.status, payload?.code);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

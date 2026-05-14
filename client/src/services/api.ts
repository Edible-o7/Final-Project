const STORAGE_KEY = "auth_token"

const DEFAULT_BASE = "http://localhost:3000"

function getErrorMessage(value: unknown): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const maybeMessage = (value as { message?: unknown }).message
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage
    }
  }

  return "Request failed"
}

export function getBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_BASE
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(STORAGE_KEY, token)
  else localStorage.removeItem(STORAGE_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const json = await res.json()
    if (!res.ok) throw new Error(getErrorMessage(json))
    return json
  }

  const text = await res.text()
  if (!res.ok) throw new Error(text || "Request failed")
  return text
}

export async function request(method: string, path: string, body?: any, opts?: RequestInit) {
  const base = getBaseUrl()
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts && (opts.headers as Record<string, string>)),
  }

  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : (body as any),
    ...opts,
  })

  return parseResponse(res)
}

export const api = {
  get: (path: string, opts?: RequestInit) => request("GET", path, undefined, opts),
  post: (path: string, body?: any, opts?: RequestInit) => request("POST", path, body, opts),
  put: (path: string, body?: any, opts?: RequestInit) => request("PUT", path, body, opts),
  del: (path: string, opts?: RequestInit) => request("DELETE", path, undefined, opts),
  setToken,
  getToken,
}

export default api

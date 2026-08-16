// ============================================
// GGLOG — Frontend API Client
// ============================================
//
// Every request includes `credentials: "include"` so
// the browser sends the HTTP-only session cookie.
//
// The backend returns a consistent envelope:
//   Success: { success: true,  data: T }
//   Error:   { success: false, error: { code, message } }
//
// This client unwraps the envelope, returning `data`
// on success and throwing `ApiError` on failure.
// ============================================

import { ApiError, type ApiResponse } from '@/lib/types'

const BASE_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
}

/**
 * Core request function — every public method delegates here.
 */
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...BASE_HEADERS,
        ...options.headers,
      },
    })
  } catch {
    // Network-level failure (offline, DNS, CORS, etc.)
    throw new ApiError(0, 'NETWORK_ERROR', 'Connection failed.')
  }

  // Parse JSON body (some responses may be empty, e.g. 204)
  let json: ApiResponse<T>

  try {
    json = await response.json()
  } catch {
    // Non-JSON response from server
    if (response.ok) {
      return {} as T
    }
    throw new ApiError(
      response.status,
      'PARSE_ERROR',
      'An unexpected error occurred.'
    )
  }

  // Envelope check
  if (!json.success) {
    throw new ApiError(
      response.status,
      json.error?.code ?? 'UNKNOWN_ERROR',
      json.error?.message ?? 'An unexpected error occurred.'
    )
  }

  return json.data
}

// ---- Public API ----

export function apiGet<T>(url: string): Promise<T> {
  return request<T>(url, { method: 'GET' })
}

export function apiPost<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: body != null ? JSON.stringify(body) : undefined,
  })
}

export function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'PATCH',
    body: body != null ? JSON.stringify(body) : undefined,
  })
}

export function apiDelete<T>(url: string): Promise<T> {
  return request<T>(url, { method: 'DELETE' })
}

import type { BrowseEnvelope, SessionResponse } from './types';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const message = typeof body === 'object' && body && 'message' in body
      ? String((body as { message?: unknown }).message)
      : `Request failed with ${status}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const TOKEN_KEY = 'oblecto.accessToken';
const API_BASE = (import.meta.env.VITE_OBLECTO_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function apiUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE}${normalizedPath}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return API_BASE ? url.toString() : `${url.pathname}${url.search}`;
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return text.length > 0 ? text : null;
}

export async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null; query?: Record<string, string | number | boolean | null | undefined> } = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = options.token ?? getStoredToken();

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(apiUrl(path, options.query), {
    ...options,
    headers
  });
  const body = await parseBody(response);

  if (!response.ok) throw new ApiError(response.status, body);
  return body as T;
}

export async function login(username: string, password: string): Promise<string> {
  const result = await request<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    token: null
  });
  return result.accessToken;
}

export function browse<T>(
  media: 'movies' | 'series',
  sorting: string,
  query: Record<string, string | number | boolean | null | undefined>
): Promise<BrowseEnvelope<T>> {
  return request<BrowseEnvelope<T>>(`/${media}/list/${sorting}`, {
    query: {
      mode: 'browse',
      ...query
    }
  });
}

export async function createSession(
  fileId: number,
  options: {
    type: 'hls' | 'directhttp' | 'recode';
    offset?: number;
    audioStreamIndex?: number | null;
    subtitleStreamIndex?: number | null;
    subtitleMode?: 'off' | 'auto' | 'forced';
  }
): Promise<SessionResponse> {
  return request<SessionResponse>(`/session/create/${fileId}`, {
    query: {
      type: options.type,
      formats: 'mp4',
      videoCodecs: 'h264',
      audioCodec: 'aac',
      offset: options.offset ?? 0,
      audioStreamIndex: options.audioStreamIndex,
      subtitleStreamIndex: options.subtitleStreamIndex,
      subtitleMode: options.subtitleMode ?? 'auto'
    }
  });
}

export function decodeToken(token: string): Record<string, unknown> | null {
  const [, payload] = token.split('.');
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

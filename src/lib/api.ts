/* src/lib/api.ts */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

/**
 * API client and auth utilities for Gloria Student app.
 *
 * Responsibilities:
 * - Create an axios client pointed at NEXT_PUBLIC_API_URL
 * - Store / retrieve access & refresh tokens (localStorage)
 * - Attach Authorization header to requests
 * - Handle 401 by refreshing tokens and retrying the failed request
 * - Provide helper functions: login, logout, getCurrentUser, deleteAccount
 *
 * Notes:
 * - This implementation uses localStorage for token persistence (client-side).
 * - It exposes a simple subscription API (`onAuthChange`) so app can react to logout events.
 */

/* ============================
   Configuration & Constants
   ============================ */

const API_BASE =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL)) ||
  "http://localhost:8000";

const ACCESS_TOKEN_KEY = "gloria_access_token";
const REFRESH_TOKEN_KEY = "gloria_refresh_token";

/* ============================
   Token Storage Utilities
   ============================ */

function isClient() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

export function setTokens({
  access,
  refresh,
}: {
  access: string;
  refresh: string;
}) {
  if (!isClient()) return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    notifyAuthChange(true);
  } catch {
    // ignore storage errors
  }
}

export function getAccessToken(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  if (!isClient()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyAuthChange(false);
}

/* ============================
   Auth Change Subscription
   ============================ */

type AuthCallback = (loggedIn: boolean) => void;
const authCallbacks = new Set<AuthCallback>();

export function onAuthChange(cb: AuthCallback) {
  authCallbacks.add(cb);
  return () => authCallbacks.delete(cb);
}

function notifyAuthChange(loggedIn: boolean) {
  for (const cb of Array.from(authCallbacks)) {
    try {
      cb(loggedIn);
    } catch {
      // swallow subscriber errors
    }
  }
}

/* ============================
   Axios Clients
   ============================ */

/**
 * Raw axios instance without auth interceptors (used to call refresh endpoint).
 */
const rawAxios = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Primary api client used across the app. Interceptors attached below.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ============================
   Token Refresh Queue Logic
   ============================ */

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
const pendingRequests: Array<(token: string | null) => void> = [];

/**
 * Call refresh endpoint with stored refresh token.
 * On success updates storage and returns the new access token.
 * On failure clears tokens and returns null.
 */
async function refreshTokens(): Promise<string | null> {
  // If a refresh is already in progress, return that promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return null;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const res = await rawAxios.post("/api/auth/refresh-token/", { refresh });
      // API uses uniform response format { message, data } — tokens may be in data
      // Try to extract tokens sensibly:
      // - If res.data.data has { access, refresh } use that
      // - Otherwise if res.data has { access, refresh } use that
      const payload = res?.data?.data ?? res?.data ?? {};
      const access = payload?.access ?? payload?.access_token ?? null;
      const newRefresh = payload?.refresh ?? payload?.refresh_token ?? null;

      if (!access) {
        // Unable to refresh
        clearTokens();
        return null;
      }

      // Persist tokens (if refresh not returned, keep previous refresh)
      setTokens({ access, refresh: newRefresh ?? refresh });
      return access as string;
    } catch (err) {
      // refresh failed => clear local auth and notify
      clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* ============================
   Axios Interceptors
   ============================ */

// Attach access token before requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config && config.headers) {
      config.headers = config.headers ?? {};
      // Only set Authorization if not already provided
      if (!("Authorization" in config.headers)) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to catch 401 and attempt token refresh & retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If there's no response or it's not a 401, propagate
    const status = (error.response?.status ?? null) as number | null;
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loop: mark request as retried
    if (originalRequest && originalRequest._retry) {
      // already retried once
      clearTokens();
      return Promise.reject(error);
    }
    if (!originalRequest) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Attempt refresh. If it works, retry original request with new token
    const newAccess = await refreshTokens();

    if (newAccess) {
      // update Authorization header and retry
      if (!originalRequest.headers) originalRequest.headers = {};
      (originalRequest.headers as Record<string, string>)["Authorization"] =
        `Bearer ${newAccess}`;

      try {
        // Use rawAxios or apiClient to retry? Use apiClient to preserve baseURL & interceptors (but avoid recursion due to _retry flag)
        return apiClient(originalRequest);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }

    // refresh failed -> redirect to login by clearing tokens and notifying app via subscribers
    clearTokens();
    return Promise.reject(error);
  },
);

/* ============================
   Helper Utilities
   ============================ */

/**
 * Decode JWT payload (naive base64 decode). Returns null if token invalid.
 * We only decode on client; no external jwt-decode dependency required.
 */
export function decodeJwtPayload(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Try to extract a user id from the access token payload.
 * The token payload may contain different keys depending on backend.
 */
export function getUserIdFromAccessToken(): string | null {
  const token = getAccessToken();
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return (
    (payload.user_id as string) ??
    (payload.sub as string) ??
    (payload.id as string) ??
    null
  );
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  // Basic expiration check if token contains exp
  const payload = decodeJwtPayload(token);
  if (!payload) return true; // conservative: token exists but no exp claim
  const exp = (payload.exp as number) ?? null;
  if (!exp) return true;
  // exp is seconds since epoch
  return Date.now() / 1000 < exp;
}

/* ============================
   High-level API Helpers
   ============================ */

/**
 * Perform login by calling the backend login endpoint.
 * On success tokens are stored via setTokens().
 *
 * Request:
 *  POST /api/auth/login/
 *  { email, password }
 *
 * Response format (per documentation): uniform { message, data }
 * where data likely contains { access, refresh }.
 */
export async function login(email: string, password: string) {
  const res = await rawAxios.post("/api/auth/login/", { email, password });
  const payload = res?.data?.data ?? res?.data ?? {};
  const access = payload?.access ?? payload?.access_token ?? null;
  const refresh = payload?.refresh ?? payload?.refresh_token ?? null;

  if (!access || !refresh) {
    throw new Error("Login did not return tokens");
  }

  setTokens({ access, refresh });
  return { access, refresh };
}

/**
 * Logout: call backend logout if possible, then clear tokens.
 * POST /api/auth/logout/ with body { refresh } and Authorization header
 */
export async function logout() {
  const refresh = getRefreshToken();
  try {
    // call logout endpoint (requires Authorization header)
    await apiClient.post("/api/auth/logout/", { refresh });
  } catch {
    // Swallow errors - we'll still clear tokens locally
  } finally {
    clearTokens();
  }
}

/**
 * Get current user details (GET /api/auth/user-details/) - requires Authorization header
 * Returns the data object (or throws if request fails)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCurrentUser(): Promise<any> {
  const res = await apiClient.get("/api/auth/user-details/");
  // Based on uniform response, the meaningful payload is res.data.data
  return res.data?.data ?? res.data ?? null;
}

/**
 * Delete student account:
 * DELETE /api/auth/delete-user/<user_id>/
 * Requires Authorization header
 *
 * This helper will try to determine the current user's id from the access token
 * or accept a provided userId.
 */
export async function deleteAccount(userId?: string) {
  const id = userId ?? getUserIdFromAccessToken();
  if (!id) {
    throw new Error("Unable to determine user id for account deletion.");
  }
  const url = `/api/auth/delete-user/${encodeURIComponent(id)}/`;
  const res = await apiClient.delete(url);
  return res.data ?? res;
}

/* ============================
   Convenience Exports
   ============================ */

export default {
  apiClient,
  rawAxios,
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  login,
  logout,
  getCurrentUser,
  deleteAccount,
  decodeJwtPayload,
  getUserIdFromAccessToken,
  isAuthenticated,
  onAuthChange,
};

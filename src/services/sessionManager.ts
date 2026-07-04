import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export type SessionRecoveryResult =
  | "RECOVERED"
  | "SESSION_INVALID"
  | "TRANSIENT_FAILURE";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SESSION_EXPIRED_EVENT = "auth:sessionExpired";
const SESSION_EXPIRED_TOAST_ID = "session-expired";

let recoveryPromise: Promise<SessionRecoveryResult> | null = null;
let logoutHandler: (() => void) | null = null;
let sessionInvalidNotified = false;
const sessionInvalidHandlers = new Set<() => void>();

const axiosRefresh = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

function isSessionInvalidRefreshError(err: unknown) {
  const status = (err as AxiosError)?.response?.status;
  return status === 401 || status === 403;
}

function notifySessionInvalid() {
  if (sessionInvalidNotified) return;
  sessionInvalidNotified = true;

  for (const handler of sessionInvalidHandlers) {
    try {
      handler();
    } catch (err) {
      console.warn("Session invalid handler failed:", err);
    }
  }

  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
    id: SESSION_EXPIRED_TOAST_ID,
  });
  logoutHandler?.();
}

async function refreshSession(): Promise<SessionRecoveryResult> {
  try {
    await axiosRefresh.get("/auth/refresh-token");
    sessionInvalidNotified = false;
    return "RECOVERED";
  } catch (err) {
    if (isSessionInvalidRefreshError(err)) {
      notifySessionInvalid();
      return "SESSION_INVALID";
    }

    console.warn("Session refresh failed transiently:", err);
    return "TRANSIENT_FAILURE";
  }
}

export function setLogoutHandler(handler: () => void) {
  logoutHandler = handler;
}

export function triggerLogout() {
  notifySessionInvalid();
}

export function onSessionInvalid(handler: () => void) {
  sessionInvalidHandlers.add(handler);
  return () => sessionInvalidHandlers.delete(handler);
}

export function markSessionInvalid() {
  notifySessionInvalid();
  return "SESSION_INVALID" as const;
}

export function hasSessionExpired() {
  return sessionInvalidNotified;
}

export async function recoverSession(): Promise<SessionRecoveryResult> {
  if (!recoveryPromise) {
    recoveryPromise = refreshSession().finally(() => {
      recoveryPromise = null;
    });
  }

  return recoveryPromise;
}

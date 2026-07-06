import { io, Socket } from "socket.io-client";
import { recoverSession } from "./sessionManager";

let socket: Socket | null = null;
let manualDisconnect = false;
let authRecoveryPromise: Promise<void> | null = null;

const resolveSocketUrl = () => {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
  if (explicitSocketUrl) return explicitSocketUrl;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  try {
    const url = new URL(apiUrl);
    url.pathname = url.pathname.replace(/\/api\/?$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return apiUrl.replace(/\/api\/?$/, "");
  }
};

function isAuthRequiredSocketError(err: Error & { data?: { errorType?: string } }) {
  return err.message === "AUTH_REQUIRED" || err.data?.errorType === "AUTH_REQUIRED";
}

function recoverSocketAuth() {
  if (!authRecoveryPromise) {
    authRecoveryPromise = recoverSession()
      .then((result) => {
        if (result === "RECOVERED" && socket && !manualDisconnect) {
          socket.connect();
          return;
        }

        if (result === "SESSION_INVALID") {
          manualDisconnect = true;
          socket?.disconnect();
          socket = null;
        }
      })
      .finally(() => {
        authRecoveryPromise = null;
      });
  }

  return authRecoveryPromise;
}

export const initSocket = () => {
  if (socket) {
    if (!socket.connected && !manualDisconnect) {
      socket.connect();
    }
    return socket;
  }

  manualDisconnect = false;
  socket = io(resolveSocketUrl(), {
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    const error = err as Error & { data?: { errorType?: string } };
    if (isAuthRequiredSocketError(error)) {
      void recoverSocketAuth();
      return;
    }

    console.error("Socket connect error:", err.message);
  });

  try {
    (socket as any).onAny((event: string, ...args: any[]) => {
      window.dispatchEvent(
        new CustomEvent("socket:any", { detail: { event, args } })
      );
    });
  } catch {
    // Socket.IO v3+ supports onAny; older clients can ignore this bridge.
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    manualDisconnect = true;
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected manually");
  }
};

export const getSocket = () => socket;

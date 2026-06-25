import { io, Socket } from "socket.io-client";
import { normalizeSocketConnectError } from "../utils/chatErrors";
import {
  markSessionInvalid,
  onSessionInvalid,
  recoverSession,
} from "./sessionManager";

let socket: Socket | null = null;
let reconnectedAfterRecovery = false;
let removeSessionInvalidHandler: (() => void) | null = null;

type SocketWithOnAny = Socket & {
  onAny?: (handler: (event: string, ...args: unknown[]) => void) => void;
};

const getSocketUrl = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl) return socketUrl;

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl.replace(/\/api\/?$/, "");

  return "http://localhost:5000";
};

async function handleAuthRequiredConnectError() {
  if (!socket) return;

  if (reconnectedAfterRecovery) {
    markSessionInvalid();
    return;
  }

  const recovery = await recoverSession();

  if (recovery === "RECOVERED") {
    reconnectedAfterRecovery = true;
    socket.connect();
    return;
  }

  if (recovery === "SESSION_INVALID") return;

  console.warn("Socket auth recovery failed transiently; waiting for reconnect.");
}

function registerSessionInvalidSocketHandler() {
  removeSessionInvalidHandler?.();
  removeSessionInvalidHandler = onSessionInvalid(() => {
    if (!socket) return;
    socket.disconnect();
  });
}

export const initSocket = () => {
  if (socket && socket.connected) {
    console.log("Socket da duoc khoi tao, bo qua.");
    return socket;
  }

  socket = io(getSocketUrl(), {
    withCredentials: true,
    transports: ["websocket"],
  });
  registerSessionInvalidSocketHandler();

  socket.on("connect", () => {
    reconnectedAfterRecovery = false;
    console.log("Socket da ket noi:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket da ngat ket noi:", reason);
  });

  socket.on("connect_error", (err) => {
    const normalized = normalizeSocketConnectError(err);
    console.error("Loi ket noi socket:", err.message);

    if (normalized.errorType === "AUTH_REQUIRED") {
      void handleAuthRequiredConnectError();
      return;
    }

    // Non-auth socket errors are usually transient. Let Socket.IO retry.
  });

  try {
    (socket as SocketWithOnAny).onAny?.((event: string, ...args: unknown[]) => {
      window.dispatchEvent(
        new CustomEvent("socket:any", { detail: { event, args } })
      );
    });
  } catch {
    // If onAny isn't available, ignore silently.
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    reconnectedAfterRecovery = false;
    removeSessionInvalidHandler?.();
    removeSessionInvalidHandler = null;
    console.log("Da ngat ket noi socket thu cong");
  }
};

export const getSocket = () => socket;

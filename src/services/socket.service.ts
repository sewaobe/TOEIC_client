import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket && socket.connected) {
    console.log("⚠️ Socket đã được khởi tạo, bỏ qua.");
    return socket;
  }

  socket = io("http://localhost:5000", {
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connect error:", err.message);
  });

  return socket;
};

/**
 * Ngắt kết nối socket (khi logout)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected manually");
  }
};

/**
 * Trả về instance socket (nếu đã connect)
 */
export const getSocket = () => socket;

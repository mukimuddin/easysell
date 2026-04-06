import { io as ClientIO } from "socket.io-client";

let socket;

/**
 * Get or initialize the Socket.IO client instance (client-side only).
 * On Vercel, we only connect to localhost to avoid 404 errors.
 */
export const getSocket = () => {
  if (typeof window === "undefined") return null;
  
  const isLocal = window.location.hostname === "localhost" || 
                  window.location.hostname === "127.0.0.1";
  const forceEnable = process.env.NEXT_PUBLIC_SOCKET_ENABLED === "true";

  if (!socket && (isLocal || forceEnable)) {
    try {
      socket = ClientIO(); // Connects to the same host/port 
    } catch (e) {
      console.warn("Socket.io connection failed", e);
      return null;
    }
  }
  return socket;
};

/**
 * Emit an event from the server side (accessible via global.io).
 */
export const emitEvent = (event, data) => {
  if (typeof window === "undefined" && global.io) {
    global.io.emit(event, data);
  }
};

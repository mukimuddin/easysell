import { io as ClientIO } from "socket.io-client";

let socket;

/**
 * Get or initialize the Socket.IO client instance (client-side only).
 */
export const getSocket = () => {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = ClientIO(); // Connects to the same host/port as the current window
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

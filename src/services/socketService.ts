import { io, Socket } from "socket.io-client";
import { GameRoom, SocketEvents } from "@/types/game";

// Define a class for the socket service
class SocketService {
  private socket: Socket | null = null;
  private callbacks: Record<string, any> = {};

  // Initialize socket connection
  initialize() {
    if (this.socket) return;

    // Use localhost in development, actual server in production
    const socketUrl = import.meta.env.PROD
      ? window.location.origin
      : "http://localhost:3000";

    this.socket = io(socketUrl);

    // Listen for all registered callbacks
    Object.keys(this.callbacks).forEach((event) => {
      if (this.socket) {
        this.socket.on(event, this.callbacks[event]);
      }
    });

    // Handle connection events
    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  // Close socket connection
  close() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Register event listener
  on<T extends keyof SocketEvents>(
    event: T,
    callback: (data: SocketEvents[T]) => void
  ) {
    this.callbacks[event] = callback;

    // If socket already exists, register the callback
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  // Remove event listener
  off<T extends keyof SocketEvents>(event: T) {
    if (this.socket) {
      this.socket.off(event);
    }
    delete this.callbacks[event];
  }

  // Emit event to server
  emit<T extends keyof SocketEvents>(event: T, data: SocketEvents[T]) {
    if (!this.socket) {
      this.initialize();
    }

    this.socket?.emit(event, data);
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;

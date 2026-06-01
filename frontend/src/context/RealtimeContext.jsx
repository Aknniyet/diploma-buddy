import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { dispatchRealtimeEvent, getRealtimeUrl } from "../lib/realtime";

const RealtimeContext = createContext(null);
const MAX_RECONNECT_DELAY_MS = 10000;

export function RealtimeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] = useState("idle");
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    const clearReconnectTimeout = () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const closeSocket = () => {
      const socket = socketRef.current;

      if (!socket) {
        return;
      }

      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
      socketRef.current = null;
    };

    const scheduleReconnect = () => {
      clearReconnectTimeout();
      reconnectAttemptsRef.current += 1;
      const delay = Math.min(1000 * 2 ** (reconnectAttemptsRef.current - 1), MAX_RECONNECT_DELAY_MS);
      setConnectionState("reconnecting");
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    };

    const connect = () => {
      const realtimeUrl = getRealtimeUrl();

      if (!realtimeUrl) {
        setConnectionState("idle");
        return;
      }

      clearReconnectTimeout();
      closeSocket();
      setConnectionState("connecting");

      const socket = new WebSocket(realtimeUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setConnectionState("connected");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          dispatchRealtimeEvent(payload);
        } catch {
          dispatchRealtimeEvent({
            type: "realtime.error",
            payload: { message: "Could not parse realtime payload." },
          });
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (getRealtimeUrl()) {
          scheduleReconnect();
        } else {
          setConnectionState("idle");
        }
      };
    };

    if (isAuthenticated) {
      connect();
    } else {
      clearReconnectTimeout();
      closeSocket();
      reconnectAttemptsRef.current = 0;
      setConnectionState("idle");
    }

    return () => {
      clearReconnectTimeout();
      closeSocket();
    };
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      connectionState,
      isConnected: connectionState === "connected",
    }),
    [connectionState]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }

  return context;
}

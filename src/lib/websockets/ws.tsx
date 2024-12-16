"use client";

import { useEffect, useRef, useState } from "react";

const socketUrl = process.env.NEXT_PUBLIC_BINANCE_WSS;

if (!socketUrl) {
  throw new Error("BINANCE_WSS environment variable is not set.");
}

export const useCustomWebSocket = (path: string) => {
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!path) {
      console.error("Path is required to establish a WebSocket connection.");
      return;
    }

    const ws = new WebSocket(`${socketUrl}${path}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connection opened for path: ${path}`);
      setReadyState(WebSocket.OPEN);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log(`WebSocket connection closed for path: ${path}`);
      setReadyState(WebSocket.CLOSED);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for path: ${path}`, error);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [path]);

  return { wsRef, readyState, messages };
};

export const useChartDataWebSocket = ({
  coin,
  interval,
}: {
  coin: string;
  interval: string;
}) => {
  const path = `${coin.toLowerCase()}@kline_${interval.toLowerCase()}`;
  return useCustomWebSocket(path);
};

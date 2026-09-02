"use client";

import { io, Socket } from "socket.io-client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ChatMessage, ChatReplyTo } from "@/types/models";

export interface UseGlobalChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string, replyTo?: ChatReplyTo | null) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<void>;
  socket: Socket | null;
}

const MAX_MESSAGES = 100;

export function useGlobalChat(): UseGlobalChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  // Synchronous-known message ids so the same msg is never added twice,
  // whether it arrives from our own POST response or the socket broadcast.
  const knownIdsRef = useRef<Set<string>>(new Set());

  const addMessage = useCallback((msg: ChatMessage) => {
    const id = msg?._id?.toString();
    if (!id || knownIdsRef.current.has(id)) return;
    knownIdsRef.current.add(id);
    setMessages((prev) => [...prev, msg].slice(-MAX_MESSAGES));
  }, []);

  useEffect(() => {
    const socketUrl = typeof window !== "undefined" ? window.location.origin : "";
    const socketClient = io(socketUrl, {
      transports: ["websocket"],
      reconnection: false,
      timeout: 5000,
    });

    setSocket(socketClient);

    socketClient.on("connect", () => {
      console.log("Socket.io connected");
    });

    socketClient.on("connect_error", () => {
      // Suppress noisy WebSocket failed logs during unmount/HMR
    });

    socketClient.on("disconnect", () => {
      console.log("Socket.io disconnected");
    });

    socketClient.on("chat:message", (message: ChatMessage) => {
      addMessage(message);
    });

    socketClient.on("chat:error", (err: any) => {
      setError(err.error || "Socket error");
    });

    socketClient.on("chat:pin", (payload: any) => {
      const msg = payload?.message as ChatMessage | undefined;
      if (!msg?._id) return;
      const id = msg._id.toString();
      setMessages((prev) =>
        prev.map((m) =>
          m._id?.toString() === id ? { ...m, isPinned: !!payload.isPinned } : m
        )
      );
    });

    const loadInitialMessages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/chat/history?roomId=global&limit=50");
        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();
        const list: ChatMessage[] = data.messages || [];
        knownIdsRef.current = new Set(list.map((m) => m._id?.toString()).filter(Boolean) as string[]);
        setMessages(list);
      } catch (err: any) {
        setError(err.message || "Failed to load chat history");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialMessages();

    return () => {
      socketClient.disconnect();
    };
  }, [addMessage]);

  const sendMessage = async (text: string, replyTo?: ChatReplyTo | null) => {
    if (!text.trim()) return;

    setError(null);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: "global", message: text, replyTo: replyTo ?? null }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message");
        return;
      }

      const data = await res.json();
      if (data.message) {
        addMessage(data.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    setError(null);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update pin");
        return;
      }
      setMessages((prev) =>
        prev.map((m) => (m._id?.toString() === id ? { ...m, isPinned } : m))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update pin");
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    togglePin,
    socket,
  };
}

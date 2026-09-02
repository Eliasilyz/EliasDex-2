"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Send, Trash2, Loader2 } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { LevelBadge } from "@/components/ui/LevelBadge";

import { UserNameDisplay } from "@/components/collectibles/UserNameDisplay";
import PusherJS from "pusher-js";
import type { ChatMessage } from "@/types/models";

interface ChatPanelProps {
 roomId?: string;
 className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
 roomId = "global",
 className = "",
}) => {
 const { data: session } = useSession();
 const [messages, setMessages] = useState<ChatMessage[]>([]);
 const [newMessage, setNewMessage] = useState("");
 const [isLoading, setIsLoading] = useState(true);
 const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
   const [myCollectibles, setMyCollectibles] = useState<import("@/types/models").ResolvedCollectibles | null>(null);
   // Track delivered message ids so the real-time broadcast never produces a duplicate.
  const knownIdsRef = useRef<Set<string>>(new Set());

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<PusherJS | null>(null);

  const scrollToBottom = useCallback(() => {
    if (!shouldAutoScroll) return;
    const el = messagesContainerRef.current;
    // Scroll the container itself (NOT scrollIntoView) so a parent page never
    // jumps when the chat list is short / nested inside another scroll area.
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [shouldAutoScroll]);

  useEffect(() => {
   scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
   if (!session?.user) return;
   fetch("/api/user/collectibles")
     .then((r) => (r.ok ? r.json() : null))
     .then((data) => {
       if (data?.equipped) setMyCollectibles(data.equipped);
     })
     .catch(() => {});
  }, [session?.user]);

 const handleScroll = useCallback(() => {
  if (!messagesContainerRef.current) return;

  const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
  setShouldAutoScroll(isAtBottom);
 }, []);

 useEffect(() => {
  const container = messagesContainerRef.current;
  if (!container) return;

  container.addEventListener("scroll", handleScroll);
  return () => container.removeEventListener("scroll", handleScroll);
 }, [handleScroll]);

  useEffect(() => {
   setIsLoading(true);
   fetch(`/api/chat/messages?roomId=${roomId}&limit=50`)
    .then((res) => res.json())
    .then((data) => {
     const list: ChatMessage[] = data.messages || [];
     knownIdsRef.current = new Set(
      list.map((m) => m._id?.toString()).filter(Boolean) as string[]
     );
     setMessages(list);
     setIsLoading(false);
    })
    .catch((err) => {
     console.error("Failed to fetch messages:", err);
     setIsLoading(false);
    });
  }, [roomId]);

  useEffect(() => {
   if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

   const pusher = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
    channelAuthorization: {
     endpoint: "/api/chat/pusher-auth",
     transport: "ajax",
    },
   });

   pusherRef.current = pusher;

   const channel = pusher.subscribe(roomId);

    channel.bind("message", (data: any) => {
     if (!data.isDeleted) {
      const id = data.id?.toString();
      if (!id || knownIdsRef.current.has(id)) return;
      knownIdsRef.current.add(id);
      setMessages((prev) => [
       ...prev,
       {
        _id: id,
        userId: data.userId,
        username: data.username,
        avatarUrl: data.avatarUrl,
        message: data.message,
        roomId,
        createdAt: new Date(data.createdAt),
        isDeleted: false,
        isVerified: data.isVerified ?? false,
        level: data.level,
        equippedCollectibles: data.equippedCollectibles ?? null,
       },
      ]);
     }
    });

  channel.bind("message-deleted", (data: any) => {
   setMessages((prev) =>
    prev.map((msg) =>
     msg._id?.toString() === data.messageId
      ? { ...msg, isDeleted: true }
      : msg
    )
   );
  });

  return () => {
   channel.unbind_all();
   pusher.unsubscribe(roomId);
   pusher.disconnect();
  };
 }, [roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
   e.preventDefault();
 
   if (!newMessage.trim() || !session?.user) return;
 
   setIsSending(true);
   setError(null);
 
   const user = session.user as any;
   const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: ChatMessage & { _tempId?: string } = {
     userId: user.id,
     username: user.username,
     avatarUrl: user.avatarUrl,
     message: newMessage,
     roomId,
     createdAt: new Date(),
     isDeleted: false,
     isVerified: user.isVerified === true,
     level: user.level ?? 0,
     equippedCollectibles: myCollectibles,
     _tempId: tempId,
    };
 
   setMessages((prev) => [...prev, optimisticMessage]);
   setNewMessage("");
 
   try {
    const res = await fetch("/api/chat/messages", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ roomId, message: newMessage }),
    });
 
    if (!res.ok) {
     const data = await res.json();
     setError(data.error || "Failed to send message");
     setMessages((prev) => prev.filter((m) => (m as any)._tempId !== tempId));
    } else {
     const data = await res.json();
     if (data.message?._id) {
      knownIdsRef.current.add(data.message._id.toString());
      setMessages((prev) =>
       prev.map((m) => ((m as any)._tempId === tempId ? data.message : m))
      );
     }
    }
   } catch (err: any) {
    setError(err.message || "Failed to send message");
    setMessages((prev) => prev.filter((m) => (m as any)._tempId !== tempId));
   } finally {
    setIsSending(false);
   }
  };

 const handleDeleteMessage = async (messageId: string | undefined) => {
  if (!messageId || (session?.user as any)?.role !== "admin") return;

  try {
   const res = await fetch(`/api/chat/messages?id=${messageId}`, {
    method: "DELETE",
   });

   if (!res.ok) {
    const data = await res.json();
    setError(data.error || "Failed to delete message");
   }
  } catch (err: any) {
   setError(err.message || "Failed to delete message");
  }
 };

  if (!session?.user) {
   return (
    <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-ink-500/60 bg-surface-raised/60 p-4 text-center">
     <p className="text-sm text-ink-500">Sign in to participate in chat</p>
    </div>
   );
  }

  const isGuest = (session.user as any).isGuest;
  const isAdmin = (session.user as any).role === "admin";
  const myId = (session?.user as any)?.id;

   const AVATAR_COLORS = [
    "from-indigo-500/40 via-indigo-900/40 to-transparent",
    "from-emerald-500/40 via-emerald-900/40 to-transparent",
    "from-fuchsia-500/40 via-fuchsia-900/40 to-transparent",
    "from-amber-400/40 via-amber-900/40 to-transparent",
    "from-rose-500/40 via-rose-900/40 to-transparent",
    "from-cyan-400/40 via-cyan-900/40 to-transparent",
    "from-violet-500/40 via-violet-900/40 to-transparent",
  ];
  const avatarColor = (name: string) => {
    const h = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0);
    return AVATAR_COLORS[((h % AVATAR_COLORS.length) + AVATAR_COLORS.length) % AVATAR_COLORS.length];
  };

  // Mirror the GlobalChatWidget message row so the watch-page chatbox (room chat)
  // looks identical to the floating global chat.
  const renderAvatar = (msg: ChatMessage, size: string, ring: string) => {
    if (msg.isDeleted) return null;
    const base = `w-${size} h-${size} rounded-full object-cover shrink-0`;
    if (msg.avatarUrl) {
      return <img src={msg.avatarUrl} alt={msg.username} className={base} />;
    }
    return (
      <span
        className={`w-${size} h-${size} rounded-full bg-gradient-to-tr ${avatarColor(msg.username)} flex items-center justify-center text-[10px] font-bold leading-none text-white shrink-0 ring-2 ${ring}`}
        aria-hidden="true"
        title={msg.username}
      >
        {msg.username?.charAt(0).toUpperCase() || "?"}
      </span>
    );
  };

  return (
    <div
      className={`flex flex-col h-full rounded-xl border border-ink-700 bg-surface-raised overflow-hidden ${className}`}
    >
      {/* Messages Container — self-scrolling so the input bar never scrolls away */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-2.5 p-3"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-ink-500">
            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-ink-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = myId && msg.userId === myId;
            const msgKey = msg._id ? msg._id.toString() : msg._id;
            return (
              <div
                key={msgKey ?? msg.createdAt?.toString() ?? `${msg.username}-${messages.indexOf(msg)}`}
                className={`group flex items-start gap-2.5 text-xs ${msg.isDeleted ? "opacity-60" : ""} ${isOwn ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar (matches GlobalChatWidget) */}
                {msg.isDeleted ? (
                  msg.avatarUrl ? (
                    <img src={msg.avatarUrl} alt={msg.username} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-ink-700 to-ink-900 flex items-center justify-center text-[10px] font-bold text-ink-300 shrink-0">
                      {msg.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  )
                ) : (
                  renderAvatar(msg, "7", isOwn ? "ring-orange-500/40" : "ring-transparent")
                )}

                <div className={`min-w-0 max-w-[80%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                  {/* Meta */}
                  <div className={`flex items-center gap-1 mb-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <UserNameDisplay
                      username={msg.username}
                      nameStyle={msg.equippedCollectibles?.nameStyle}
                      rank={msg.equippedCollectibles?.rank}
                      className={`font-semibold text-[11px] max-w-[120px] ${isOwn ? "text-orange-300" : "text-ink-300"}`}
                    />
                    {msg.isVerified && <VerifiedBadge className="scale-75" />}
                    {typeof msg.level === "number" && msg.level > 0 && (
                      <LevelBadge level={msg.level} size="sm" showIcon={false} />
                    )}
                    <span className="text-[9px] text-ink-500 whitespace-nowrap shrink-0">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>

                  {/* Bubble (matches GlobalChatWidget) */}
                  <div
                    className={`px-3 py-1.5 rounded-lg leading-relaxed break-words ${
                      msg.isDeleted
                        ? "bg-ink-700/40 text-ink-500 italic"
                        : isOwn
                        ? "bg-orange-600/20 text-surface-primary rounded-bl-none"
                        : "bg-ink-700/50 text-ink-300"
                    }`}
                  >
                    {msg.isDeleted ? "[deleted]" : msg.message}
                  </div>

                  {/* Hover actions (admin delete) */}
                  {!msg.isDeleted && isAdmin && (
                    <div className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg._id?.toString())}
                        className="p-1 rounded-md text-ink-500 hover:text-rose-300 hover:bg-white/[0.05] transition-colors"
                        title="Delete message"
                        aria-label="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Section — pinned at the bottom, never scrolls with the list */}
      <div className="border-t border-ink-700 bg-surface-raised p-3">
        {error && <p className="text-xs text-rose-400 mb-1">{error}</p>}

        {isGuest ? (
          <p className="text-xs text-ink-500 text-center">Guests can view but not send messages</p>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
              maxLength={500}
              className="flex-1 px-3.5 py-2 text-xs text-surface-primary placeholder-ink-500 bg-ink-700 border border-ink-500 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              aria-label="Send message"
              title="Send message"
              className="
                w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500
                hover:brightness-110 text-white
                flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed transition-[filter]
              "
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
 
 function formatTime(date: Date | string | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
 }

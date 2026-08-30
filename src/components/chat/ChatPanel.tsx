"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Send, Trash2, Loader2 } from "lucide-react";
import { LevelBadge } from "@/components/ui/LevelBadge";
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

 const messagesEndRef = useRef<HTMLDivElement>(null);
 const messagesContainerRef = useRef<HTMLDivElement>(null);
 const pusherRef = useRef<PusherJS | null>(null);

 const scrollToBottom = useCallback(() => {
  if (shouldAutoScroll && messagesEndRef.current) {
   messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
 }, [shouldAutoScroll]);

 useEffect(() => {
  scrollToBottom();
 }, [messages, scrollToBottom]);

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
    setMessages(data.messages || []);
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
    setMessages((prev) => [
     ...prev,
     {
      _id: data.id,
      userId: data.userId,
      username: data.username,
      avatarUrl: data.avatarUrl,
      message: data.message,
      roomId,
      createdAt: new Date(data.createdAt),
      isDeleted: false,
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

  const optimisticMessage: ChatMessage = {
   userId: session.user.id,
   username: session.user.username,
   avatarUrl: (session.user as any).avatarUrl,
   message: newMessage,
   roomId,
   createdAt: new Date(),
   isDeleted: false,
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
    setMessages((prev) => prev.slice(0, -1));
   }
  } catch (err: any) {
   setError(err.message || "Failed to send message");
   setMessages((prev) => prev.slice(0, -1));
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
   <div className="flex items-center justify-center h-64 rounded-2xl border border-dashed border-ink-500/60 bg-surface-canvas/40 p-4 text-center">
    <p className="text-sm text-ink-500">Sign in to participate in chat</p>
   </div>
  );
 }

 const isGuest = (session.user as any).isGuest;
 const isAdmin = (session.user as any).role === "admin";

 return (
  <div className={`flex flex-col h-full rounded-2xl border border-ink-700 bg-surface-canvas/60 overflow-hidden ${className}`}>
   {/* Messages Container */}
   <div
    ref={messagesContainerRef}
    className="flex-1 overflow-y-auto space-y-3 p-4 min-h-[200px] lg:min-h-[400px]"
   >
    {isLoading ? (
     <div className="flex items-center justify-center h-full">
      <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
     </div>
    ) : messages.length === 0 ? (
     <div className="flex items-center justify-center h-full text-ink-500 text-sm">
      No messages yet. Start the conversation!
     </div>
    ) : (
     messages.map((msg, idx) => (
      <div
       key={idx}
       className={`text-xs space-y-1 ${msg.isDeleted ? "opacity-50" : ""}`}
      >
       <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
         {msg.avatarUrl && (
          <img
           src={msg.avatarUrl}
           alt={msg.username}
           className="w-6 h-6 rounded-full shrink-0"
          />
         )}
         <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
           <span className="font-semibold text-ink-300 truncate">
            {msg.username}
           </span>
           {msg.level !== undefined && (
            <LevelBadge level={msg.level} size="sm" showText={false} />
           )}
          </div>
          <p className="text-ink-500 break-words">
           {msg.isDeleted ? "[deleted]" : msg.message}
          </p>
         </div>
        </div>
        {isAdmin && !msg.isDeleted && (
          <button
           onClick={() => handleDeleteMessage(msg._id?.toString())}
           className="p-1 text-ink-500 hover:text-rose-400 transition-colors shrink-0"
           title="Delete message"
           aria-label="Delete message"
          >
          <Trash2 className="w-3 h-3" />
         </button>
        )}
       </div>
      </div>
     ))
    )}
    <div ref={messagesEndRef} />
   </div>

   {/* Input Section */}
   <div className="border-t border-ink-700 p-3 space-y-2 bg-surface-canvas/40">
    {error && (
     <p className="text-xs text-rose-400">{error}</p>
    )}

    {isGuest ? (
     <p className="text-xs text-ink-500 text-center">Guests can view but not send messages</p>
    ) : (
     <form onSubmit={handleSendMessage} className="flex gap-2">
      <input
       type="text"
       value={newMessage}
       onChange={(e) => setNewMessage(e.target.value)}
       placeholder="Type a message..."
       disabled={isSending}
       className="flex-1 px-3 py-2 text-xs bg-ink-700 border border-ink-500 rounded-lg text-surface-primary placeholder-ink-500 focus:outline-none focus:ring-2 focus: disabled:opacity-50"
      />
      <button
       type="submit"
       disabled={isSending || !newMessage.trim()}
       className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
       title="Send message"
       aria-label="Send message"
      >
       {isSending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
       ) : (
        <Send className="w-4 h-4" />
       )}
      </button>
     </form>
    )}
   </div>
  </div>
 );
};

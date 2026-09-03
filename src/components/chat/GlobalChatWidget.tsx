"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useGlobalChat } from "@/hooks/useGlobalChat";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

import { UserNameDisplay } from "@/components/collectibles/UserNameDisplay";
import {
  Send,
  Loader2,
  MessageSquare,
  X,
  Trash2,
  CornerDownRight,
  Pin,
  PinOff,
  XCircle,
} from "lucide-react";
import { LevelBadge } from "@/components/ui/LevelBadge";
import type { ChatMessage, ChatReplyTo } from "@/types/models";

function formatTime(date: Date | string | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const MESSAGE_LIST_STYLE = {
  minHeight: "220px",
  maxHeight: "320px",
} as const;

const MESSAGE_LIST_STYLE_MOBILE = {
  minHeight: "200px",
  flex: "1 1 0%",
} as const;

export const GlobalChatWidget: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { messages, isLoading, error, sendMessage, togglePin, socket } = useGlobalChat();
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [replyingTo, setReplyingTo] = useState<ChatReplyTo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const isGuest = (session?.user as any)?.isGuest;
  const isAdmin = (session?.user as any)?.role === "admin";
  const myId = (session?.user as any)?.id;
  const connected = socket?.connected === true;

  // Track unread messages received while the panel is closed
  useEffect(() => {
    if (open) {
      setUnread(0);
    } else if (messages.length > prevCountRef.current) {
      setUnread((u) => u + (messages.length - prevCountRef.current));
    }
    prevCountRef.current = messages.length;
  }, [messages.length, open]);

  // Follow the conversation: auto-scroll to the newest message only when the
  // user is already near the bottom, or right after opening.
  const stickToBottomRef = useRef(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance < 60;
  };

  const scrollToBottom = (behavior: ScrollBehavior) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    if (!open) return;
    stickToBottomRef.current = true;
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && stickToBottomRef.current) {
      scrollToBottom("smooth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGuest) return;
    const text = input;
    setInput("");
    const replyContext = replyingTo;
    setReplyingTo(null);
    await sendMessage(text, replyContext);
  };

  const scrollToMessage = (id: string | undefined) => {
    if (!id) return;
    const el = messageRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-orange-500/50", "rounded-lg");
      setTimeout(() => el.classList.remove("ring-2", "ring-orange-500/50", "rounded-lg"), 1500);
    }
  };

  const openUserProfile = (username: string) => {
    if (!username) return;
    router.push(`/user/${encodeURIComponent(username)}`);
  };

  const startReply = (msg: ChatMessage) => {
    if (!msg._id || msg.isDeleted) return;
    setReplyingTo({
      id: msg._id.toString(),
      username: msg.username,
      message: msg.message,
    });
  };

  const handleDelete = useCallback(
    async (id: string | undefined) => {
      if (!id || !isAdmin) return;
      try {
        await fetch(`/api/chat/messages?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Failed to delete message:", err);
      }
    },
    [isAdmin]
  );

  const canSend = !isGuest && connected && !isLoading;
  const pinnedMessages = messages.filter((m) => m.isPinned && !m.isDeleted);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:items-stretch">
      {open && (
        <div className="mb-3 max-sm:mb-0 w-[340px] max-sm:w-full max-sm:h-[70vh] sm:w-[380px] rounded-xl max-sm:rounded-t-xl overflow-hidden border border-ink-700 max-sm:border-b-0 bg-surface-raised shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-ink-700/60 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-surface-primary leading-tight">Global Chat</h3>
                <p className="flex items-center gap-1 text-[10px] text-ink-500">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-ink-500"}`} />
                  {connected ? "Live" : "Connecting..."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-1.5 rounded-lg text-ink-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 space-y-2.5 max-sm:min-h-0"
            style={MESSAGE_LIST_STYLE}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-ink-500 text-xs">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <>
                {/* Pinned zone */}
                {pinnedMessages.length > 0 && (
                  <div className="rounded-lg border border-ink-700/60 bg-surface-canvas/60 px-3 py-2 space-y-1.5 mb-1">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                      <Pin className="w-3 h-3 text-amber-400" /> Pinned ({pinnedMessages.length})
                    </p>
                    {pinnedMessages.map((pm) => (
                      <div
                        key={`pin-${pm._id ? pm._id.toString() : ""}`}
                        className="flex items-center gap-2 text-[11px] text-ink-300 hover:text-surface-primary transition-colors cursor-pointer"
                        onClick={() => scrollToMessage(pm._id?.toString())}
                        title={`${pm.username}: ${pm.message}`}
                      >
                        <CornerDownRight className="w-3 h-3 shrink-0 text-ink-500" />
                        <span className="font-semibold text-ink-300 shrink-0 max-w-[60px] truncate">{pm.username}:</span>
                        <span className="truncate flex-1">{pm.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, idx) => {
                  const isOwn = myId && msg.userId === myId;
                  const msgId = msg._id ? msg._id.toString() : "";
                  return (
                    <div
                      key={msgId || idx}
                      ref={(el) => {
                        if (el && msgId) messageRefs.current.set(msgId, el);
                      }}
                      className={`group flex items-start gap-2.5 text-xs ${msg.isDeleted ? "opacity-60" : ""} ${isOwn ? "flex-row-reverse" : ""}`}
                    >
                      {/* Avatar (clickable -> public profile) */}
                      {msg.isDeleted ? (
                        msg.avatarUrl ? (
                          <img
                            src={msg.avatarUrl}
                            alt={msg.username}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-ink-700/70 flex items-center justify-center text-[10px] font-bold text-ink-300 shrink-0">
                            {(msg.username || "?").charAt(0).toUpperCase()}
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => openUserProfile(msg.username)}
                          title={`View ${msg.username}'s profile`}
                          aria-label={`View ${msg.username}'s profile`}
                          className="shrink-0 cursor-pointer rounded-full hover:opacity-80 transition-opacity"
                        >
                          {msg.avatarUrl ? (
                            <img
                              src={msg.avatarUrl}
                              alt={msg.username}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-ink-700/70 flex items-center justify-center text-[10px] font-bold text-ink-300">
                              {(msg.username || "?").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </button>
                      )}

                      <div className={`min-w-0 max-w-[78%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                        {/* Meta */}
                        <div className={`flex items-center gap-1 mb-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                          {!msg.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => openUserProfile(msg.username)}
                              title={`View ${msg.username}'s profile`}
                              className="cursor-pointer hover:underline"
                            >
                              <UserNameDisplay
                                username={msg.username}
                                nameStyle={msg.equippedCollectibles?.nameStyle}
                                rank={msg.equippedCollectibles?.rank}
                                className={`font-semibold text-[11px] max-w-[120px] ${isOwn ? "text-orange-300" : "text-ink-300"}`}
                              />
                            </button>
                          ) : (
                            <UserNameDisplay
                              username={msg.username}
                              nameStyle={msg.equippedCollectibles?.nameStyle}
                              rank={msg.equippedCollectibles?.rank}
                              className={`font-semibold text-[11px] max-w-[120px] ${isOwn ? "text-orange-300" : "text-ink-300"}`}
                            />
                          )}
                          {msg.isVerified && <VerifiedBadge />}
                          {typeof msg.level === "number" && msg.level > 0 && (
                            <LevelBadge level={msg.level} size="sm" showIcon={false} />
                          )}
                          {msg.isPinned && <Pin className="w-2.5 h-2.5 text-amber-400" />}
                          <span className="text-[9px] text-ink-500">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>

                        {/* Reply quote */}
                        {!msg.isDeleted && msg.replyTo && (
                          <button
                            type="button"
                            onClick={() => scrollToMessage(msg.replyTo?.id)}
                            className={`max-w-full mb-0.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] border border-ink-700/60 bg-ink-950/60 text-ink-500 hover:text-ink-300 transition-colors text-left ${isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                          >
                            <CornerDownRight className="w-3 h-3 shrink-0 text-ink-500" />
                            <span className="shrink-0 font-semibold text-orange-300/90">{msg.replyTo.username}</span>
                            <span className="truncate">{msg.replyTo.message}</span>
                          </button>
                        )}

                        {/* Bubble */}
                        <div
                          className={`px-3 py-1.5 rounded-lg leading-relaxed break-words ${
                            msg.isDeleted
                              ? "bg-ink-700/40 text-ink-500 italic"
                              : isOwn
                              ? "bg-orange-600/20 text-surface-primary"
                              : "bg-ink-700/50 text-ink-300"
                          }`}
                        >
                          {msg.isDeleted ? "[deleted]" : msg.message}
                        </div>

                        {/* Hover actions */}
                        {!msg.isDeleted && (
                          <div className={`mt-0.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "flex-row-reverse" : ""}`}>
                            <button
                              type="button"
                              onClick={() => startReply(msg)}
                              aria-label="Reply"
                              title="Reply"
                              className="p-1 rounded-md text-ink-500 hover:text-orange-300 hover:bg-white/[0.05] transition-colors"
                            >
                              <CornerDownRight className="w-3 h-3" />
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => togglePin(msgId, !msg.isPinned)}
                                aria-label={msg.isPinned ? "Unpin message" : "Pin message"}
                                title={msg.isPinned ? "Unpin" : "Pin"}
                                className="p-1 rounded-md text-ink-500 hover:text-amber-300 hover:bg-white/[0.05] transition-colors"
                              >
                                {msg.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDelete(msgId)}
                                aria-label="Delete message"
                                title="Delete"
                                className="p-1 rounded-md text-ink-500 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Guest notice / input */}
          {isGuest ? (
            <div className="px-4 py-3 border-t border-ink-700/60 text-[11px] text-center text-ink-500">
              Guest can view but not send. <span className="text-orange-400">Sign in</span> to chat.
            </div>
          ) : (
            <form onSubmit={handleSend} className="border-t border-ink-700/60">
              {replyingTo && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border-b border-ink-700/50">
                  <CornerDownRight className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-orange-300">Replying to {replyingTo.username}</span>
                    <p className="text-[10px] text-ink-500 truncate">{replyingTo.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    aria-label="Cancel reply"
                    className="shrink-0 p-1 rounded-md text-ink-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-center px-3 py-2.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={connected ? "Type a message..." : "Connecting..."}
                  disabled={!canSend}
                  maxLength={500}
                  className="
                    flex-1 px-3.5 py-2 text-xs
                    bg-ink-700/70 border border-ink-500
                    rounded-full text-surface-primary placeholder-ink-500
                    focus:outline-none focus:ring-2 focus:ring-orange-500/30
                    disabled:opacity-50 transition-colors
                  "
                />
                <button
                  type="submit"
                  disabled={!canSend || !input.trim()}
                  aria-label="Send message"
                  className="
                    w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500
                    hover:brightness-110 text-white
                    flex items-center justify-center
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-[filter]
                  "
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="px-4 py-2 border-t border-ink-700/60 text-[11px] text-rose-400 bg-rose-500/5">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Floating bubble — hidden on mobile when chat is open (panel has its own close button) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle global chat"
        aria-expanded={open}
        className={`
          relative p-3 rounded-full shadow-xl
          bg-gradient-to-br from-orange-600 to-amber-500
          hover:brightness-110 text-white
          flex items-center justify-center
          transition-[filter]
          ${open ? "max-sm:hidden" : ""}
        `}
        style={{ width: "52px", height: "52px" }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
    </div>
  );
};

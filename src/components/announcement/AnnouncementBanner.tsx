"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Megaphone, X } from "lucide-react";
import { useToast } from "@/components/ui/shadcn/use-toast";

interface Announcement {
  id?: string;
  _id?: string;
  title: string;
  body: string;
  isActive?: boolean;
}

const DISMISSED_KEY = "dismissed_announcements";

function getAnnId(ann: Announcement): string {
  return ann.id || ann._id || "";
}

export const AnnouncementBanner: React.FC = () => {
  const { toast } = useToast();
  const [active, setActive] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  // Track ids we've already toasted so each announcement only triggers once
  const toastedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (stored) {
      try {
        setDismissed(new Set(JSON.parse(stored)));
      } catch {
        /* ignore malformed storage */
      }
    }
  }, []);

  const showToast = (ann: Announcement) => {
    const id = getAnnId(ann);
    if (!id || toastedRef.current.has(id)) return;
    toastedRef.current.add(id);
    toast({
      title: "📢 " + ann.title,
      description: ann.body,
    });
  };

  const loadAnnouncements = (silent = false) => {
    fetch("/api/announcements", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list: Announcement[] = data?.announcements || [];
        setActive(list.filter((a) => a.isActive !== false));
        if (!silent) list.forEach((ann) => showToast(ann));
      })
      .catch((err) => console.error("Failed to fetch announcements:", err));
  };

  // Load active announcements on mount so any user (even one who comes
  // online later) still sees the persistent banner.
  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Realtime: notify + show banner as soon as an admin creates one
  useEffect(() => {
    const socketUrl = typeof window !== "undefined" ? window.location.origin : "";
    const socketClient: Socket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: false,
      timeout: 5000,
    });

    socketClient.on("connect_error", () => {});

    socketClient.on("announcement:new", (ann: Announcement) => {
      const id = getAnnId(ann);
      if (!id) return;
      setActive((prev) => (prev.some((p) => getAnnId(p) === id) ? prev : [ann, ...prev]));
      showToast(ann);
    });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  const dismiss = (id: string) => {
    if (!id) return;
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  // Persistent banner: all active announcements not yet dismissed by this user
  const visible = active.filter(
    (a) => a.isActive !== false && !dismissed.has(getAnnId(a))
  );

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-5 z-30 w-[300px] flex flex-col gap-2 pointer-events-none">
      {visible.slice(0, 2).map((ann) => (
        <div
          key={getAnnId(ann)}
          className="pointer-events-auto rounded-2xl border border-orange-500/30 bg-surface-raised shadow-2xl p-3 animate-in slide-in-from-bottom-3 fade-in duration-300"
        >
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-surface-primary truncate">{ann.title}</p>
              <p className="text-[11px] text-ink-500 mt-0.5 line-clamp-3 break-words">{ann.body}</p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(getAnnId(ann))}
              className="shrink-0 p-1 -mr-1 rounded-md hover:bg-ink-700 transition-colors text-ink-500 hover:text-white"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

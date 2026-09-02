"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Check, X as XIcon, Sparkles } from "lucide-react";
import type {
  Collectible,
  CollectibleType,
  UserCollectible,
  UserCollectibleSlots,
} from "@/types/models";
import { emitCollectiblesChange } from "@/lib/collectibleEvents";

const SLOTS: { type: CollectibleType; label: string }[] = [
  { type: "nameStyle", label: "Name Style" },
  { type: "border", label: "Border" },
  { type: "rank", label: "Rank" },
];

const RARITY_DOT: Record<string, string> = {
  common: "bg-ink-500",
  rare: "bg-blue-400",
  epic: "bg-purple-400",
  legendary: "bg-amber-400",
};

function GradientText({ gradient, children }: { gradient: [string, string]; children: React.ReactNode }) {
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

export function CollectibleInventoryPanel() {
  const [inventory, setInventory] = useState<UserCollectible[]>([]);
  const [equipped, setEquipped] = useState<UserCollectibleSlots>({ border: null, nameStyle: null, rank: null });
  const [allCollectibles, setAllCollectibles] = useState<Collectible[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CollectibleType>("nameStyle");

  const fetchData = useCallback(async () => {
    try {
      const [invRes, shopRes] = await Promise.all([
        fetch("/api/user/collectibles"),
        fetch("/api/collectibles"),
      ]);
      if (invRes.ok) {
        const d = await invRes.json();
        setInventory(d.inventory);
        setEquipped(d.equipped);
      }
      if (shopRes.ok) {
        const d = await shopRes.json();
        setAllCollectibles(d.collectibles);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen]);

  const ownedIds = new Set(inventory.map((uc) => uc.collectibleId.toString()));

  const isEquipped = (cid: string, slot: CollectibleType): boolean => {
    return equipped[slot]?.toString() === cid;
  };

  const handleToggle = async (slot: CollectibleType, collectibleId: string) => {
    const currently = isEquipped(collectibleId, slot);
    setActionLoading(collectibleId);
    try {
      const res = await fetch(currently ? "/api/user/collectibles/unequip" : "/api/user/collectibles/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, collectibleId }),
      });
      if (res.ok) {
        await fetchData();
        emitCollectiblesChange();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const ownedByType = (slot: CollectibleType) =>
    allCollectibles
      .filter((c) => c.type === slot && ownedIds.has(c._id?.toString() ?? ""))
      .sort((a, b) => (["common", "rare", "epic", "legendary"].indexOf(a.rarity)) - (["common", "rare", "epic", "legendary"].indexOf(b.rarity)));

  const activeItems = ownedByType(activeTab);
  const hasAny = SLOTS.some((s) => ownedByType(s.type).length > 0);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-ink-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
      </div>
    );
  }

  if (!hasAny) return null;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-ink-800/40 transition-colors text-xs text-ink-400 hover:text-ink-300"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Collectibles
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-sm bg-surface-raised border border-ink-700/60 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/40">
              <span className="text-sm font-semibold text-surface-primary">Collectibles</span>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-ink-700/50 text-ink-500 hover:text-ink-300 transition-colors">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-ink-700/40">
              {SLOTS.map((s) => {
                const owned = ownedByType(s.type);
                const eq = equipped[s.type]?.toString();
                return (
                  <button
                    key={s.type}
                    onClick={() => setActiveTab(s.type)}
                    className={`
                      flex-1 py-2 text-[11px] font-medium transition-colors relative
                      ${activeTab === s.type ? "text-surface-primary" : "text-ink-500 hover:text-ink-300"}
                    `}
                  >
                    {s.label}
                    {eq && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />}
                  </button>
                );
              })}
            </div>

            {/* Items */}
            <div className="p-3 max-h-64 overflow-y-auto space-y-1">
              {activeItems.length === 0 ? (
                <p className="text-xs text-ink-500 text-center py-6">No {SLOTS.find((s) => s.type === activeTab)?.label.toLowerCase()} owned yet.</p>
              ) : (
                activeItems.map((c) => {
                  const cid = c._id?.toString() ?? "";
                  const eq = isEquipped(cid, activeTab);
                  const busy = actionLoading === cid;

                  return (
                    <button
                      key={cid}
                      onClick={() => handleToggle(activeTab, cid)}
                      disabled={busy}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left
                        ${eq
                          ? "bg-orange-500/10 border border-orange-500/30"
                          : "border border-transparent hover:bg-ink-800/50"
                        }
                      `}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${RARITY_DOT[c.rarity] ?? RARITY_DOT.common}`} />
                      <span className="flex-1 min-w-0">
                        <span className="text-sm text-surface-primary">
                          {activeTab === "nameStyle" && c.styleConfig?.gradient ? (
                            <GradientText gradient={c.styleConfig.gradient}>{c.name}</GradientText>
                          ) : (
                            c.name
                          )}
                        </span>
                        <span className="ml-2 text-[10px] text-ink-500 capitalize">{c.rarity}</span>
                      </span>
                      {busy ? (
                        <Loader2 className="w-4 h-4 text-orange-400 animate-spin shrink-0" />
                      ) : eq ? (
                        <Check className="w-4 h-4 text-orange-400 shrink-0" />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

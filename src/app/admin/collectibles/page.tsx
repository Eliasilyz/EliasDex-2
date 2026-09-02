"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ShadcnButton } from "@/components/ui/shadcn/button";
import { Plus, Trash2, Loader2, X, Save, Pencil, Palette } from "lucide-react";
import type { CollectibleType, Rarity } from "@/types/models";

interface Collectible {
  _id?: string;
  type: CollectibleType;
  slug: string;
  name: string;
  description?: string;
  rarity: Rarity;
  assetUrl?: string;
  styleConfig?: { className?: string; gradient?: [string, string]; animation?: string };
  obtainMethod: string;
  createdAt: string;
}

const TYPES: CollectibleType[] = ["border", "nameStyle", "rank"];
const RARITIES: Rarity[] = ["common", "rare", "epic", "legendary"];
const RARITY_COLORS: Record<string, string> = {
  common: "bg-ink-700/60 text-ink-300",
  rare: "bg-blue-900/40 text-blue-300",
  epic: "bg-purple-900/40 text-purple-300",
  legendary: "bg-amber-900/40 text-amber-300",
};

// NameStyle preset gradients the admin can pick from
const STYLE_PRESETS: { label: string; gradient: [string, string]; className?: string }[] = [
  { label: "Fire", gradient: ["#f97316", "#ef4444"] },
  { label: "Ocean", gradient: ["#3b82f6", "#06b6d4"] },
  { label: "Neon", gradient: ["#a855f7", "#ec4899"] },
  { label: "Gold", gradient: ["#f59e0b", "#eab308"] },
  { label: "Emerald", gradient: ["#10b981", "#34d399"] },
  { label: "Frost", gradient: ["#e0f2fe", "#93c5fd"], className: "text-blue-900" },
  { label: "Cherry", gradient: ["#be123c", "#f43f5e"] },
  { label: "Sunset", gradient: ["#f97316", "#a855f7"] },
];

const EMPTY_FORM = {
  type: "border" as CollectibleType,
  slug: "",
  name: "",
  description: "",
  rarity: "common" as Rarity,
  assetUrl: "",
  obtainMethod: "admin_grant",
  gradient1: "#f97316",
  gradient2: "#ef4444",
  nameStyleClass: "",
};

export default function AdminCollectiblesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchCollectibles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/collectibles", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCollectibles(data.collectibles || []);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollectibles(); }, [fetchCollectibles]);

  const needsAssetUrl = (type: CollectibleType) => type === "border";
  const needsStyleConfig = (type: CollectibleType) => type === "nameStyle";
  const needsNothing = (type: CollectibleType) => type === "rank";

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      type: form.type,
      slug: form.slug,
      name: form.name,
      description: form.description || undefined,
      rarity: form.rarity,
      obtainMethod: form.obtainMethod,
    };
    if (needsAssetUrl(form.type) && form.assetUrl) {
      payload.assetUrl = form.assetUrl;
    }
    if (needsStyleConfig(form.type)) {
      payload.styleConfig = {
        gradient: [form.gradient1, form.gradient2],
        className: form.nameStyleClass || undefined,
      };
    }
    return payload;
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/collectibles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (res.ok) {
        setShowForm(false);
        setForm(EMPTY_FORM);
        await fetchCollectibles();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        rarity: form.rarity,
      };
      if (needsAssetUrl(form.type)) payload.assetUrl = form.assetUrl || "";
      if (needsStyleConfig(form.type)) {
        payload.styleConfig = {
          gradient: [form.gradient1, form.gradient2],
          className: form.nameStyleClass || undefined,
        };
      }
      const res = await fetch(`/api/admin/collectibles/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingId(null);
        setForm(EMPTY_FORM);
        await fetchCollectibles();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collectible?")) return;
    const res = await fetch(`/api/admin/collectibles/${id}`, { method: "DELETE" });
    if (res.ok) await fetchCollectibles();
  };

  const startEdit = (c: Collectible) => {
    setEditingId(c._id ?? null);
    setForm({
      type: c.type,
      slug: c.slug,
      name: c.name,
      description: c.description || "",
      rarity: c.rarity,
      assetUrl: c.assetUrl || "",
      obtainMethod: c.obtainMethod,
      gradient1: c.styleConfig?.gradient?.[0] ?? "#f97316",
      gradient2: c.styleConfig?.gradient?.[1] ?? "#ef4444",
      nameStyleClass: c.styleConfig?.className ?? "",
    });
    setShowForm(true);
  };

  if (status === "loading" || (isLoading && collectibles.length === 0)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Loader2 className="w-5 h-5 text-ink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading text-surface-primary">Manage Collectibles</h1>
        <ShadcnButton
          size="sm"
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY_FORM); }}
          className="gap-1.5"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Collectible"}
        </ShadcnButton>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{editingId ? "Edit Collectible" : "Create Collectible"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-ink-500 uppercase tracking-wider">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CollectibleType })}
                  disabled={!!editingId}
                  className="w-full mt-1 px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50">
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-ink-500 uppercase tracking-wider">Rarity</label>
                <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value as Rarity })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                  {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-ink-500 uppercase tracking-wider">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={!!editingId}
                  className="w-full mt-1 px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:opacity-50"
                  placeholder="unique-slug" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-ink-500 uppercase tracking-wider">
                  {form.type === "rank" ? "Rank Label" : "Name"}
                </label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  placeholder={form.type === "rank" ? "e.g. Champion, Legend" : "Display name"} />
              </div>
              {needsAssetUrl(form.type) && (
                <div>
                  <label className="text-[10px] text-ink-500 uppercase tracking-wider">Image URL</label>
                  <input value={form.assetUrl} onChange={(e) => setForm({ ...form, assetUrl: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    placeholder="https://..." />
                </div>
              )}
            </div>

            {/* NameStyle config — only show for nameStyle type */}
            {needsStyleConfig(form.type) && (
              <div className="space-y-3 rounded-lg border border-ink-700/50 bg-ink-950/30 p-3">
                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <Palette className="w-3.5 h-3.5" />
                  <span className="font-semibold">Name Style Config</span>
                </div>

                {/* Preset quick-picks */}
                <div>
                  <label className="text-[10px] text-ink-500 uppercase tracking-wider">Presets</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {STYLE_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setForm({ ...form, gradient1: p.gradient[0], gradient2: p.gradient[1], nameStyleClass: p.className ?? "" })}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-ink-700/50 bg-ink-950/40 hover:border-ink-500/60 transition-colors"
                      >
                        <span className="w-3 h-3 rounded-full" style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }} />
                        <span className="text-[10px] text-ink-300">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-ink-500 uppercase tracking-wider">Gradient Start</label>
                    <div className="flex gap-2 mt-1">
                      <input type="color" value={form.gradient1} onChange={(e) => setForm({ ...form, gradient1: e.target.value })}
                        className="w-8 h-8 rounded border border-ink-500 cursor-pointer bg-transparent" />
                      <input value={form.gradient1} onChange={(e) => setForm({ ...form, gradient1: e.target.value })}
                        className="flex-1 px-2 py-1 bg-ink-700 border border-ink-500 rounded-lg text-xs text-surface-primary font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-500 uppercase tracking-wider">Gradient End</label>
                    <div className="flex gap-2 mt-1">
                      <input type="color" value={form.gradient2} onChange={(e) => setForm({ ...form, gradient2: e.target.value })}
                        className="w-8 h-8 rounded border border-ink-500 cursor-pointer bg-transparent" />
                      <input value={form.gradient2} onChange={(e) => setForm({ ...form, gradient2: e.target.value })}
                        className="flex-1 px-2 py-1 bg-ink-700 border border-ink-500 rounded-lg text-xs text-surface-primary font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                <div>
                  <label className="text-[10px] text-ink-500 uppercase tracking-wider">Preview</label>
                  <div className="mt-1 p-3 rounded-lg bg-ink-900/60 text-center">
                    <span
                      className="text-lg font-bold font-heading"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${form.gradient1}, ${form.gradient2})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {form.name || "Username"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank preview */}
            {form.type === "rank" && (
              <div className="rounded-lg border border-ink-700/50 bg-ink-950/30 p-3">
                <label className="text-[10px] text-ink-500 uppercase tracking-wider">Preview</label>
                <div className="mt-1 p-3 rounded-lg bg-ink-900/60 text-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${RARITY_COLORS[form.rarity]}`}>
                    &#9733; {form.name || "Rank Name"}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] text-ink-500 uppercase tracking-wider">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full mt-1 px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="How to obtain this collectible" />
            </div>

            <ShadcnButton size="sm" onClick={editingId ? handleUpdate : handleCreate} disabled={saving || !form.slug || !form.name} className="gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editingId ? "Update" : "Create"}
            </ShadcnButton>
          </CardContent>
        </Card>
      )}

      {/* Collectibles list */}
      {collectibles.length === 0 ? (
        <p className="text-ink-500 text-sm">No collectibles yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collectibles.map((c) => (
            <div key={c._id} className="rounded-lg border border-ink-700/50 bg-surface-raised p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Preview thumbnail */}
                  {c.type === "nameStyle" && c.styleConfig?.gradient ? (
                    <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${c.styleConfig.gradient[0]}, ${c.styleConfig.gradient[1]})` }}>
                      <span className="text-white font-bold text-xs">Aa</span>
                    </div>
                  ) : c.type === "rank" ? (
                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${RARITY_COLORS[c.rarity]}`}>
                      <span className="font-bold text-xs">&#9733;</span>
                    </div>
                  ) : c.assetUrl ? (
                    <img src={c.assetUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-ink-700/60 flex items-center justify-center text-ink-400 text-xs font-bold shrink-0">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-surface-primary text-sm truncate">
                      {c.type === "nameStyle" && c.styleConfig?.gradient ? (
                        <span style={{ backgroundImage: `linear-gradient(135deg, ${c.styleConfig.gradient[0]}, ${c.styleConfig.gradient[1]})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                          {c.name}
                        </span>
                      ) : c.name}
                    </p>
                    <p className="text-[10px] text-ink-500 truncate">{c.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(c)} className="p-1 rounded text-ink-500 hover:text-orange-400 transition-colors" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => c._id && handleDelete(c._id)} className="p-1 rounded text-ink-500 hover:text-rose-400 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold capitalize ${RARITY_COLORS[c.rarity] ?? ""}`}>
                  {c.rarity}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-ink-700/50 text-ink-400 capitalize">
                  {c.type}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-ink-700/50 text-ink-400">
                  {c.obtainMethod}
                </span>
              </div>
              {c.description && (
                <p className="text-xs text-ink-500 line-clamp-2">{c.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

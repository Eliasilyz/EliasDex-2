"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ShadcnButton } from "@/components/ui/shadcn/button";
import {
  Search, Shield, BadgeCheck, Star, Trash2, ChevronDown, ChevronUp,
  User as UserIcon, Loader2, X, Save,
} from "lucide-react";
import type { UserRole, UserSocials, UserCollectibleSlots, Collectible } from "@/types/models";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  level: number;
  xp: number;
  bio: string;
  isVerified: boolean;
  isGuest: boolean;
  isPublicProfile: boolean;
  joinedAt: Date;
  socials: UserSocials;
  equippedCollectibles: UserCollectibleSlots;
}

const ROLES: UserRole[] = ["guest", "member", "premium", "admin"];
const ROLE_COLORS: Record<string, string> = {
  guest: "bg-ink-700 text-ink-400",
  member: "bg-blue-900/40 text-blue-300",
  premium: "bg-amber-900/40 text-amber-300",
  admin: "bg-red-900/40 text-red-300",
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [allCollectibles, setAllCollectibles] = useState<Collectible[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    fetch("/api/collectibles").then((r) => r.json()).then((d) => setAllCollectibles(d.collectibles || [])).catch(() => {});
  }, []);

  const apiCall = async (userId: string, body: Record<string, unknown>) => {
    setSavingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchUsers();
        return true;
      }
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    setSavingId(user._id);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      if (res.ok) await fetchUsers();
    } finally {
      setSavingId(null);
    }
  };

  if (status === "loading" || (isLoading && users.length === 0)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Loader2 className="w-5 h-5 text-ink-500 animate-spin" />
      </div>
    );
  }

  if (!session?.user || (session.user as any).role !== "admin") {
    return <div className="p-6 text-center"><p className="text-ink-500">No permission.</p></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-heading text-surface-primary">Manage Users</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-ink-700 border border-ink-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
        />
      </div>

      {users.length === 0 ? (
        <p className="text-ink-500 text-sm">No users found.</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              expanded={expandedId === user._id}
              onToggle={() => setExpandedId(expandedId === user._id ? null : user._id)}
              saving={savingId === user._id}
              apiCall={apiCall}
              onDelete={() => handleDelete(user)}
              allCollectibles={allCollectibles}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserRow({
  user, expanded, onToggle, saving, apiCall, onDelete, allCollectibles,
}: {
  user: AdminUser;
  expanded: boolean;
  onToggle: () => void;
  saving: boolean;
  apiCall: (userId: string, body: Record<string, unknown>) => Promise<boolean>;
  onDelete: () => void;
  allCollectibles: Collectible[];
}) {
  const [editRole, setEditRole] = useState(user.role);
  const [editXp, setEditXp] = useState(user.xp);
  const [editLevel, setEditLevel] = useState(user.level);
  const [editBio, setEditBio] = useState(user.bio);
  const [grantId, setGrantId] = useState("");

  useEffect(() => {
    if (expanded) {
      setEditRole(user.role);
      setEditXp(user.xp);
      setEditLevel(user.level);
      setEditBio(user.bio);
    }
  }, [expanded, user]);

  return (
    <div className="rounded-lg border border-ink-700/50 bg-surface-raised overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-ink-950/30 transition-colors"
        onClick={onToggle}
      >
        <div className={`p-1.5 rounded-full ${user.isVerified ? "bg-green-500/20 text-green-400" : "bg-ink-700 text-ink-500"}`}>
          <UserIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-surface-primary truncate flex items-center gap-2">
            {user.username}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${ROLE_COLORS[user.role] ?? ROLE_COLORS.member}`}>
              {user.role}
            </span>
            {user.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-green-400" />}
          </p>
          <p className="text-xs text-ink-500 truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span>Lv.{user.level}</span>
          <span>{user.xp} XP</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-ink-500" /> : <ChevronDown className="w-4 h-4 text-ink-500" />}
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-ink-700/50 px-4 py-4 space-y-4 bg-ink-950/20">
          {saving && (
            <div className="absolute inset-0 bg-surface-raised/60 flex items-center justify-center z-10 rounded-lg">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
            </div>
          )}

          {/* Role */}
          <Section title="Role">
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setEditRole(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    editRole === r ? "bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/40" : "bg-ink-700/50 text-ink-400 hover:text-ink-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {editRole !== user.role && (
              <ShadcnButton size="sm" onClick={() => apiCall(user._id, { action: "setRole", role: editRole })} className="mt-2 gap-1">
                <Save className="w-3 h-3" /> Save Role
              </ShadcnButton>
            )}
          </Section>

          {/* XP & Level */}
          <Section title="XP & Level">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-ink-500 uppercase tracking-wider">XP</label>
                <input type="number" value={editXp} onChange={(e) => setEditXp(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
              </div>
              <div>
                <label className="text-[10px] text-ink-500 uppercase tracking-wider">Level</label>
                <input type="number" value={editLevel} onChange={(e) => setEditLevel(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
              </div>
            </div>
            {(editXp !== user.xp || editLevel !== user.level) && (
              <ShadcnButton size="sm" onClick={() => apiCall(user._id, { action: "setXp", xp: editXp })} className="mt-2 gap-1">
                <Save className="w-3 h-3" /> Save XP (auto-recalculates level)
              </ShadcnButton>
            )}
          </Section>

          {/* Verified */}
          <Section title="Verification">
            <ShadcnButton
              size="sm"
              variant={user.isVerified ? "default" : "outline"}
              onClick={() => apiCall(user._id, { action: "toggleVerified" })}
              className="gap-1.5"
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              {user.isVerified ? "Remove Verification" : "Grant Verification"}
            </ShadcnButton>
          </Section>

          {/* Bio */}
          <Section title="Bio">
            <textarea value={editBio} onChange={(e) => setEditBio(e.target.value.slice(0, 300))} rows={2}
              className="w-full px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary resize-y focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="User bio..." />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-ink-500">{editBio.length}/300</span>
              {editBio !== user.bio && (
                <ShadcnButton size="sm" onClick={() => apiCall(user._id, { action: "updateProfile", bio: editBio })} className="gap-1">
                  <Save className="w-3 h-3" /> Save
                </ShadcnButton>
              )}
            </div>
          </Section>

          {/* Grant Collectible */}
          <Section title="Grant Collectible">
            <div className="flex gap-2">
              <select value={grantId} onChange={(e) => setGrantId(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-sm text-surface-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                <option value="">Select collectible...</option>
                {allCollectibles.map((c) => (
                  <option key={c._id?.toString()} value={c._id?.toString()}>
                    [{c.type}] {c.name} ({c.rarity})
                  </option>
                ))}
              </select>
              <ShadcnButton
                size="sm"
                disabled={!grantId}
                onClick={async () => {
                  if (!grantId) return;
                  await apiCall(user._id, { action: "grantCollectible", collectibleId: grantId });
                  setGrantId("");
                }}
                className="gap-1"
              >
                <Star className="w-3 h-3" /> Grant
              </ShadcnButton>
            </div>
            {/* Current collectibles */}
            {user.equippedCollectibles && (() => {
              const lookup = new Map(allCollectibles.map((c) => [c._id?.toString(), c]));
              const slots = user.equippedCollectibles;
              const allEquipped: { slot: string; id: string; name: string; type: string }[] = [];
              for (const s of ["border", "nameStyle", "rank"] as const) {
                const v = slots[s];
                if (v) {
                  const id = v?.toString?.() ?? "";
                  const c = lookup.get(id);
                  allEquipped.push({ slot: s, id, name: c?.name ?? id.slice(-6), type: s });
                }
              }
              if (allEquipped.length === 0) return null;
              return (
                <div className="mt-2 flex flex-wrap gap-1">
                  {allEquipped.map((eq) => (
                    <span key={`${eq.slot}-${eq.id}`} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-ink-700/50 text-ink-300">
                      <span className="text-ink-500">[{eq.type}]</span> {eq.name}
                      <button
                        onClick={() => apiCall(user._id, { action: "revokeCollectible", collectibleId: eq.id })}
                        className="text-rose-400 hover:text-rose-300 ml-0.5"
                        title="Revoke"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              );
            })()}
          </Section>

          {/* Danger zone */}
          <div className="pt-2 border-t border-rose-900/30">
            <ShadcnButton size="sm" variant="destructive" onClick={onDelete} className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete User
            </ShadcnButton>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">{title}</p>
      {children}
    </div>
  );
}

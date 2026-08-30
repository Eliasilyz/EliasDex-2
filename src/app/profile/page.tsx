"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Clock, Play, Bookmark, Edit2, Save, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ShadcnButton } from "@/components/ui/shadcn/button";
import { Progress } from "@/components/ui/shadcn/progress";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { xpToNextLevel, XP_PER_EPISODE } from "@/lib/xp";
import type { WatchHistoryEntry, Favorite } from "@/types/models";

interface ProfileData {
 user: {
  id: string;
  email: string;
  username: string;
  role: string;
  level: number;
  xp: number;
  avatarUrl?: string;
  createdAt?: string;
 };
 watchHistory: WatchHistoryEntry[];
 favorites: Favorite[];
}

export default function ProfilePage() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [profile, setProfile] = useState<ProfileData | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [loadError, setLoadError] = useState<string | null>(null);
 const [isEditing, setIsEditing] = useState(false);
 const [editUsername, setEditUsername] = useState("");
 const [isSaving, setIsSaving] = useState(false);
 const [saveError, setSaveError] = useState<string | null>(null);

 useEffect(() => {
  if (status === "unauthenticated") {
   router.push("/login?callbackUrl=/profile");
  }
 }, [status, router]);

 useEffect(() => {
  if (!session?.user) return;

  setIsLoading(true);
  fetch("/api/profile")
   .then((res) => {
    if (!res.ok) throw new Error("Failed to load profile");
    return res.json();
   })
   .then((data: ProfileData) => {
    setProfile(data);
    setEditUsername(data.user.username);
    setIsLoading(false);
   })
   .catch((err) => {
    setLoadError(err.message || "Failed to load profile");
    setIsLoading(false);
   });
 }, [session]);

 const handleSaveProfile = async () => {
  if (!editUsername.trim()) return;

  setIsSaving(true);
  setSaveError(null);

  try {
   const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: editUsername.trim() }),
   });

   if (!res.ok) {
    const body = await res.json();
    setSaveError(body.error || "Failed to update profile");
    return;
   }

   const data = await res.json();
   setProfile((prev) => prev ? {
    ...prev,
    user: { ...prev.user, username: data.user.username }
   } : null);
   setIsEditing(false);
  } catch (err: any) {
   setSaveError(err.message || "Failed to update profile");
  } finally {
   setIsSaving(false);
  }
 };

 if (status === "loading" || isLoading) {
  return (
   <div className="space-y-6 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
    <div className="h-8 w-32 rounded bg-ink-700 animate-pulse" />
    <Card>
     <CardContent className="pt-6">
      <div className="flex items-center gap-4">
       <div className="w-16 h-16 rounded-2xl bg-ink-700 animate-pulse" />
       <div className="space-y-2">
        <div className="h-5 w-40 rounded bg-ink-700 animate-pulse" />
        <div className="h-4 w-24 rounded bg-ink-700/70 animate-pulse" />
       </div>
      </div>
     </CardContent>
    </Card>
   </div>
  );
 }

 if (!session?.user) return null;

 if (loadError) {
  return (
   <div className="py-20 text-center space-y-4 max-w-md mx-auto">
    <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
    <p className="text-sm text-ink-500">{loadError}</p>
    <ShadcnButton variant="secondary" size="sm" onClick={() => window.location.reload()}>
     Try Again
    </ShadcnButton>
   </div>
  );
 }

 const user = profile?.user;
 const watchHistory = profile?.watchHistory || [];
 const favorites = profile?.favorites || [];

 const xp = user?.xp || 0;
 const { currentLevel, nextLevel, xpIntoLevel, xpNeeded, progress } = xpToNextLevel(xp);
 const completedEpisodes = watchHistory.filter((h) => h.completed).length;
 const totalHours = Math.round((completedEpisodes * 24) / 60);
 const uniqueAnime = new Set(watchHistory.map((h) => h.animeId)).size;

 return (
  <div className="space-y-6 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
   {/* Header */}
   <div className="flex items-start justify-between gap-4">
    <div>
     <h1 className="text-2xl font-extrabold font-heading text-surface-primary tracking-tight">Profile</h1>
     <p className="text-sm text-ink-500 mt-1">Your watching stats and account settings</p>
    </div>
    <ShadcnButton
     variant="outline"
     size="sm"
     onClick={() => setIsEditing(!isEditing)}
     className="gap-1.5"
     aria-label={isEditing ? "Cancel editing" : "Edit profile"}
    >
     {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
     {isEditing ? "Cancel" : "Edit"}
    </ShadcnButton>
   </div>

   {/* Profile Card */}
   <Card>
    <CardHeader>
     <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white font-bold text-2xl shrink-0">
       {(user?.username || session.user.username).charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
       {isEditing ? (
        <input
         type="text"
         value={editUsername}
         onChange={(e) => setEditUsername(e.target.value)}
         className="w-full px-3 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-surface-primary text-lg font-semibold focus:outline-none focus:ring-2 focus:"
         placeholder="Username"
         aria-label="Username"
        />
       ) : (
        <div className="flex items-center gap-2 flex-wrap">
         <h2 className="text-xl font-bold font-heading text-surface-primary truncate">
          {user?.username || session.user.username}
         </h2>
         <LevelBadge level={currentLevel} size="md" />
        </div>
       )}
       <p className="text-sm text-ink-500 mt-0.5">{user?.email || session.user.email}</p>
      </div>
     </div>
    </CardHeader>
    <CardContent className="space-y-4">
     {saveError && <p className="text-sm text-rose-400" role="alert">{saveError}</p>}

     {isEditing && (
      <ShadcnButton
       onClick={handleSaveProfile}
       disabled={isSaving || !editUsername.trim()}
       className="gap-1.5"
      >
       <Save className="w-4 h-4" />
       {isSaving ? "Saving..." : "Save Changes"}
      </ShadcnButton>
     )}

     {/* XP Progress */}
     <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
       <span className="text-ink-500">Level {currentLevel}</span>
       <span className="text-ink-300 font-mono" aria-label={`${xpIntoLevel} of ${xpNeeded} XP`}>
        {xpIntoLevel} / {xpNeeded} XP
       </span>
      </div>
      <Progress value={progress} aria-label="XP progress" />
      <p className="text-xs text-ink-500">
       {xpNeeded - xpIntoLevel} XP to Level {nextLevel} &mdash; {Math.ceil((xpNeeded - xpIntoLevel) / XP_PER_EPISODE)} more episodes
      </p>
     </div>
    </CardContent>
   </Card>

   {/* Stats Overview */}
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-raised border border-ink-700/80 rounded-2xl p-4 divide-y sm:divide-y-0 sm:divide-x divide-ink-700/60">
    {[
     { icon: Play, label: "Episodes", value: completedEpisodes },
     { icon: Clock, label: "Hours", value: totalHours },
     { icon: Bookmark, label: "Watchlist", value: favorites.length },
     { icon: User, label: "Anime", value: uniqueAnime },
    ].map(({ icon: Icon, label, value }) => (
     <div key={label} className="p-3 first:pt-0 sm:first:pt-3">
      <div className="flex items-center gap-2 text-ink-500 mb-1">
       <Icon className="w-4 h-4" aria-hidden="true" />
       <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-surface-primary">{value}</p>
     </div>
    ))}
   </div>

   {/* Watchlist Grid */}
   {favorites.length > 0 && (
    <Card>
     <CardHeader>
      <CardTitle>Watchlist</CardTitle>
     </CardHeader>
     <CardContent>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
       {favorites.slice(0, 8).map((fav) => (
        <div
         key={fav.animeId}
         onClick={() => router.push(`/anime/${fav.animeId}`)}
         className="group cursor-pointer rounded-xl overflow-hidden bg-ink-700/50 border border-ink-500/50 hover:border-orange-500/50 transition-colors focus-visible:ring-2 focus-visible:"
         role="button"
         tabIndex={0}
         onKeyDown={(e) => e.key === "Enter" && router.push(`/anime/${fav.animeId}`)}
         aria-label={`Go to ${fav.animeTitle}`}
        >
         {fav.animeCoverImageUrl && (
          <img
           src={fav.animeCoverImageUrl}
           alt={fav.animeTitle}
           className="w-full aspect-[3/4] object-cover transition-transform"
          />
         )}
         <div className="p-2">
          <p className="text-xs font-semibold text-surface-primary truncate">{fav.animeTitle}</p>
          <p className="text-xs text-ink-500 capitalize">{fav.status.replace("_", " ")}</p>
         </div>
        </div>
       ))}
      </div>
      {favorites.length > 8 && (
       <ShadcnButton
        variant="ghost"
        size="sm"
        onClick={() => router.push("/watchlist")}
        className="w-full mt-3"
       >
        View all {favorites.length} →
       </ShadcnButton>
      )}
     </CardContent>
    </Card>
   )}
  </div>
 );
}

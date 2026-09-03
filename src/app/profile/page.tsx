"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Edit2, Save, X, AlertCircle, LogOut, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ShadcnButton } from "@/components/ui/shadcn/button";
import { Progress } from "@/components/ui/shadcn/progress";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ProfileBorderWrapper } from "@/components/collectibles/ProfileBorderWrapper";
import { UserNameDisplay } from "@/components/collectibles/UserNameDisplay";
import { xpToNextLevel, XP_PER_EPISODE } from "@/lib/xp";
import { CollectibleInventoryPanel } from "@/components/collectibles/CollectibleInventoryPanel";
import { onCollectiblesChange } from "@/lib/collectibleEvents";
import { ConnectedAccounts } from "@/components/profile/ConnectedAccounts";
import type { WatchHistoryEntry, Favorite, UserSocials, SocialPlatform, ResolvedCollectibles } from "@/types/models";

const SOCIAL_PLATFORMS: { key: SocialPlatform; label: string; placeholder: string; color: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "username or URL", color: "hover:border-pink-500/50 hover:text-pink-400" },
  { key: "tiktok", label: "TikTok", placeholder: "username or URL", color: "hover:border-cyan-400/50 hover:text-cyan-300" },
  { key: "x", label: "X (Twitter)", placeholder: "username or URL", color: "hover:border-ink-300/70 hover:text-surface-primary" },
  { key: "discord", label: "Discord", placeholder: "username#0000 or display name", color: "hover:border-indigo-400/50 hover:text-indigo-400" },
  { key: "anilist", label: "AniList", placeholder: "username or profile URL", color: "hover:border-blue-400/50 hover:text-blue-400" },
  { key: "myanimelist", label: "MyAnimeList", placeholder: "username or profile URL", color: "hover:border-blue-500/50 hover:text-blue-300" },
];

interface ProfileData {
 user: {
  id: string;
  email: string;
  username: string;
  role: string;
  level: number;
  xp: number;
  avatarUrl?: string;
  profileBannerUrl?: string;
  bio?: string;
  isPublicProfile?: boolean;
  isVerified?: boolean;
  joinedAt?: string;
  createdAt?: string;
   socials?: UserSocials;
   collectibles?: ResolvedCollectibles;
   totalEpisodesWatched?: number;
   totalAnimeWatched?: number;
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
 const [editBio, setEditBio] = useState("");
 const [editAvatarUrl, setEditAvatarUrl] = useState("");
 const [editBannerUrl, setEditBannerUrl] = useState("");
 const [editIsPublic, setEditIsPublic] = useState(true);
 const [editSocials, setEditSocials] = useState<UserSocials>({});
 const [isSaving, setIsSaving] = useState(false);
 const [saveError, setSaveError] = useState<string | null>(null);
 const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);
 const [uploadError, setUploadError] = useState<string | null>(null);
 const avatarInputRef = useRef<HTMLInputElement>(null);
 const bannerInputRef = useRef<HTMLInputElement>(null);

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
    setEditBio(data.user.bio || "");
    setEditAvatarUrl(data.user.avatarUrl || "");
    setEditBannerUrl(data.user.profileBannerUrl || "");
    setEditIsPublic(data.user.isPublicProfile ?? true);
    setEditSocials(data.user.socials || {});
    setIsLoading(false);
   })
   .catch((err) => {
    setLoadError(err.message || "Failed to load profile");
    setIsLoading(false);
   });
  }, [session]);

  // Re-fetch profile when collectibles change (equip/unequip in inventory panel)
  useEffect(() => {
    return onCollectiblesChange(() => {
      if (!session?.user) return;
      fetch("/api/profile")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: ProfileData | null) => {
          if (data) setProfile(data);
        })
        .catch(() => {});
    });
  }, [session]);

 const handleLogout = async () => {
  await signOut({ callbackUrl: "/?loggedOut=1" });
 };

 const handleSaveProfile = async () => {
  if (!editUsername.trim()) return;

  setIsSaving(true);
  setSaveError(null);

  try {
   const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     username: editUsername.trim(),
     bio: editBio.trim(),
     avatarUrl: editAvatarUrl.split("?")[0].trim(),
     profileBannerUrl: editBannerUrl.split("?")[0].trim(),
     isPublicProfile: editIsPublic,
     socials: editSocials,
    }),
   });

   if (!res.ok) {
    const body = await res.json();
    setSaveError(body.error || "Failed to update profile");
    return;
   }

   const data = await res.json();
   setProfile((prev) => prev ? {
    ...prev,
    user: {
     ...prev.user,
     username: data.user.username,
     bio: data.user.bio,
     avatarUrl: data.user.avatarUrl,
     profileBannerUrl: data.user.profileBannerUrl,
      isPublicProfile: data.user.isPublicProfile,
      socials: data.user.socials,
    }
   } : null);
   setIsEditing(false);
  } catch (err: any) {
   setSaveError(err.message || "Failed to update profile");
  } finally {
   setIsSaving(false);
  }
 };

 const handleFileUpload = async (file: File, type: "avatar" | "banner") => {
  setUploading(type);
  setUploadError(null);

  try {
   const formData = new FormData();
   formData.append("file", file);

   const res = await fetch("/api/profile/upload", {
    method: "POST",
    body: formData,
   });

   const data = await res.json();

   if (!res.ok) {
    setUploadError(data.error || "Upload failed");
    return;
   }

    if (type === "avatar") {
     setEditAvatarUrl(data.url + "?t=" + Date.now());
    } else {
     setEditBannerUrl(data.url + "?t=" + Date.now());
    }
  } catch (err: any) {
   setUploadError(err.message || "Upload failed");
  } finally {
   setUploading(null);
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
// Use accurate count from MAL import, fall back to watch_history entries
  const totalEpisodes = user?.totalEpisodesWatched || watchHistory.length;
  const totalHours = Math.round((totalEpisodes * 24) / 60);
  // Anime count must come from the same MAL-anchored source as episodes so the
  // two stats can never disagree (avoid counting locally-watched anime that
  // aren't on the user's MAL list).
  const uniqueAnime =
    (user?.totalAnimeWatched && user.totalAnimeWatched > 0)
      ? user.totalAnimeWatched
      : new Set(watchHistory.map((h) => h.animeId)).size;

 return (
  <div className="space-y-6 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
   {/* Header */}
    <div className="flex items-start justify-between gap-4">
     <div>
      <h1 className="text-2xl font-extrabold font-heading text-surface-primary tracking-tight">Your profile</h1>
      <p className="text-sm text-ink-500 mt-1">Watching stats, level, and account settings</p>
     </div>
      <div className="flex items-center gap-2">
       {isEditing && <CollectibleInventoryPanel />}
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
      <ShadcnButton
       variant="ghost"
       size="sm"
       onClick={handleLogout}
       className="gap-1.5 text-rose-400 hover:text-rose-300"
       aria-label="Log out"
      >
       <LogOut className="w-4 h-4" />
       <span className="hidden sm:inline">Logout</span>
      </ShadcnButton>
     </div>
    </div>

   {/* Profile Card */}
   <Card>
    <CardContent className="pt-6 space-y-4">
     {saveError && <p className="text-sm text-rose-400" role="alert">{saveError}</p>}

      {isEditing ? (
       /* ---- Edit mode ---- */
       <div className="space-y-4">
        {uploadError && <p className="text-sm text-rose-400" role="alert">{uploadError}</p>}

        {/* Hidden file inputs */}
        <input
         ref={bannerInputRef}
         type="file"
         accept="image/jpeg,image/png,image/gif,image/webp"
         className="hidden"
         onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f, "banner");
          e.target.value = "";
         }}
        />
        <input
         ref={avatarInputRef}
         type="file"
         accept="image/jpeg,image/png,image/gif,image/webp"
         className="hidden"
         onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f, "avatar");
          e.target.value = "";
         }}
        />

        {/* Banner — hover overlay to upload */}
        <div className="space-y-2">
         <label className="block text-xs text-ink-500 font-medium">Profile Banner</label>
         <div
          className="relative h-24 sm:h-28 w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#3b5bfd]/50 via-[#3b5bfd]/20 to-transparent border border-ink-700/60 group/banner cursor-pointer"
          onClick={() => bannerInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && bannerInputRef.current?.click()}
          aria-label="Upload banner image"
         >
          {editBannerUrl ? (
           <img src={editBannerUrl} alt="Banner preview" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
           <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-ink-500">Click to upload banner</p>
           </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center z-10">
           {uploading === "banner" ? (
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
           ) : (
            <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
             <Upload className="w-4 h-4" />
             Change banner
            </div>
           )}
          </div>
         </div>
         <input
          id="edit-banner"
          type="url"
          value={editBannerUrl}
          onChange={(e) => setEditBannerUrl(e.target.value)}
          className="w-full px-3 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-surface-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          placeholder="Or paste image URL"
          aria-label="Profile banner URL"
         />
        </div>

        {/* Avatar — hover overlay to upload */}
        <div className="flex items-start gap-4">
         <div
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white font-bold text-2xl shrink-0 overflow-hidden group/avatar cursor-pointer"
          onClick={() => avatarInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && avatarInputRef.current?.click()}
          aria-label="Upload avatar image"
         >
          {editAvatarUrl ? (
           <img src={editAvatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
           editUsername.charAt(0).toUpperCase() || (user?.username || session.user.username).charAt(0).toUpperCase()
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
           {uploading === "avatar" ? (
            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
           ) : (
            <Upload className="w-5 h-5 text-white" />
           )}
          </div>
         </div>
         <div className="flex-1 min-w-0">
          <label className="block text-xs text-ink-500 font-medium mb-1">Avatar</label>
          <input
           id="edit-avatar"
           type="url"
           value={editAvatarUrl}
           onChange={(e) => setEditAvatarUrl(e.target.value)}
           className="w-full px-3 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-surface-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
           placeholder="Or paste image URL"
           aria-label="Avatar URL"
          />
          <p className="text-[10px] text-ink-600 mt-1">Click avatar to upload, or paste a URL</p>
         </div>
        </div>

       {/* Username */}
       <div>
        <label className="block text-xs text-ink-500 font-medium mb-1" htmlFor="edit-username">Username</label>
        <input
         id="edit-username"
         type="text"
         value={editUsername}
         onChange={(e) => setEditUsername(e.target.value)}
         className="w-full px-3 py-2 bg-ink-700 border border-ink-500 rounded-lg text-surface-primary text-base font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/40"
         placeholder="Username (3-20 characters)"
         aria-label="Username"
        />
       </div>

       {/* Bio */}
       <div>
        <label className="block text-xs text-ink-500 font-medium mb-1" htmlFor="edit-bio">
         Bio <span className="text-ink-700">({editBio.length}/300)</span>
        </label>
        <textarea
         id="edit-bio"
         value={editBio}
         onChange={(e) => setEditBio(e.target.value.slice(0, 300))}
         rows={3}
         className="w-full px-3 py-2 bg-ink-700 border border-ink-500 rounded-lg text-surface-primary text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-500/40"
         placeholder="Tell everyone a little about yourself..."
         aria-label="Bio"
        />
       </div>

        {/* Social Media Links */}
        <div className="space-y-2">
         <label className="block text-xs text-ink-500 font-medium">Social Media</label>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SOCIAL_PLATFORMS.map((p) => (
           <div key={p.key} className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-ink-500 uppercase tracking-wider pointer-events-none">
             {p.label}
            </span>
            <input
             type="text"
             value={editSocials[p.key] || ""}
             onChange={(e) => setEditSocials({ ...editSocials, [p.key]: e.target.value })}
             className="w-full pl-[4.5rem] pr-3 py-1.5 bg-ink-700 border border-ink-500 rounded-lg text-surface-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
             placeholder={p.placeholder}
             aria-label={p.label}
            />
           </div>
          ))}
         </div>
        </div>

        {/* Public profile toggle */}
       <div className="flex items-center justify-between gap-4 rounded-xl border border-ink-700/80 bg-ink-950/40 px-4 py-3">
        <div>
         <p className="text-sm font-semibold text-surface-primary">Public profile</p>
         <p className="text-xs text-ink-500">Allow others to view your profile at /user/{editUsername}</p>
        </div>
        <button
         type="button"
         role="switch"
         aria-checked={editIsPublic}
         onClick={() => setEditIsPublic(!editIsPublic)}
         className={`relative inline-flex items-center h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${editIsPublic ? "bg-orange-500" : "bg-ink-700"}`}
        >
         <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsPublic ? "translate-x-6" : "translate-x-1"}`} />
        </button>
       </div>

       {/* Actions */}
       <div className="flex items-center gap-2 pt-1">
        <ShadcnButton
         onClick={handleSaveProfile}
         disabled={isSaving || !editUsername.trim()}
         className="gap-1.5"
        >
         <Save className="w-4 h-4" />
         {isSaving ? "Saving..." : "Save Changes"}
        </ShadcnButton>
        <ShadcnButton variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
         Cancel
        </ShadcnButton>
       </div>
      </div>
     ) : (
      /* ---- View mode ---- */
      <div className="space-y-3">
       {/* Banner strip (matches public profile card) */}
       <div className="relative h-24 sm:h-32 w-full overflow-hidden rounded-lg border border-ink-700/60">
        {user?.profileBannerUrl ? (
         <img
          src={user.profileBannerUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
         />
        ) : (
         <div
          className={`absolute inset-0 bg-gradient-to-br ${
           user?.role === "admin"
            ? "from-red-700/40 via-red-900/30 to-transparent"
            : user?.role === "premium"
            ? "from-amber-600/40 via-amber-800/25 to-transparent"
            : "from-[#3b5bfd]/50 via-[#3b5bfd]/20 to-transparent"
          }`}
         />
        )}
       </div>

        <div className="flex items-center gap-4">
         <ProfileBorderWrapper border={user?.collectibles?.border}>
           <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white font-bold text-2xl overflow-hidden ring-4 ring-surface-canvas">
            {user?.avatarUrl ? (
             <img src={user.avatarUrl} alt={user?.username || session.user.username} className="w-full h-full object-cover" />
            ) : (
             (user?.username || session.user.username).charAt(0).toUpperCase()
            )}
           </div>
          </ProfileBorderWrapper>
         <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
           <UserNameDisplay
            username={user?.username || session.user.username}
            nameStyle={user?.collectibles?.nameStyle}
            rank={user?.collectibles?.rank}
            className="text-xl font-bold font-heading text-surface-primary truncate"
           />
           {user?.isVerified && <VerifiedBadge className="shrink-0" />}
           <LevelBadge level={currentLevel} size="md" />
          </div>
          <p className="text-sm text-ink-500 mt-0.5">{user?.email || session.user.email}</p>
         </div>
        </div>

       {user?.bio ? (
         <p className="text-sm text-ink-300 leading-relaxed">{user.bio}</p>
        ) : (
         <p className="text-sm text-ink-700 italic">No bio yet — click Edit to add one.</p>
        )}

        {/* Social Links */}
        {user?.socials && Object.keys(user.socials).length > 0 && (
         <div className="flex flex-wrap gap-2">
          {user.socials.instagram && (
           <a
            href={user.socials.instagram.startsWith("http") ? user.socials.instagram : `https://instagram.com/${user.socials.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-pink-500/50 hover:text-pink-400 transition-colors"
           >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            Instagram
           </a>
          )}
          {user.socials.tiktok && (
           <a
            href={user.socials.tiktok.startsWith("http") ? user.socials.tiktok : `https://tiktok.com/@${user.socials.tiktok.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-colors"
           >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 007.04 6.3 6.34 6.34 0 005.14-6.22V9.12a8.16 8.16 0 004.78 1.52V7.2a4.85 4.85 0 01-.52-.51z"/></svg>
            TikTok
           </a>
          )}
          {user.socials.x && (
           <a
            href={user.socials.x.startsWith("http") ? user.socials.x : `https://x.com/${user.socials.x.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-ink-300/70 hover:text-surface-primary transition-colors"
           >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
           </a>
          )}
          {user.socials.discord && (
           <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            {user.socials.discord}
           </span>
          )}
          {user.socials.anilist && (
           <a
            href={user.socials.anilist.startsWith("http") ? user.socials.anilist : `https://anilist.co/user/${user.socials.anilist.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-blue-400/50 hover:text-blue-400 transition-colors"
           >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.268 21.078l-1.82-4.763h.002l-1.803 4.763H5.866l2.977-7.34L6.055 3.923h3.606l1.755 4.594L13.146 3.923h3.038l-2.754 7.815 3.03 7.34h-3.038l-1.854-4.763-.006.003zM17.823 15.288h1.656l-3.312-8.382v8.382z"/></svg>
            AniList
           </a>
          )}
          {user.socials.myanimelist && (
           <a
            href={user.socials.myanimelist.startsWith("http") ? user.socials.myanimelist : `https://myanimelist.net/profile/${user.socials.myanimelist.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700/50 bg-ink-950/50 px-2.5 py-1 text-xs text-ink-300 hover:border-blue-500/50 hover:text-blue-300 transition-colors"
           >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.667 14.083c0 .415-.337.752-.752.752H5.417v-1.5h1.5c.415 0 .75.337.75.75zm8.333-3.333v1.5h-1.5V9.25h1.5v1.5zm-5 0v1.5h-1.5V9.25H10.5v1.5zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 7.5h-1.5v1.5h1.5v-1.5zm7 0h-1.5v1.5h1.5v-1.5zm-3.5 7.5c-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5zm-2-6.5h1.5v-1.5H11.5v1.5zm5 0h-1.5v-1.5H16.5v1.5zm-5 0h1.5v-1.5H11.5v1.5z"/></svg>
            MAL
           </a>
          )}
         </div>
        )}

       {/* Public/private hint */}
       <div className="flex items-center justify-between rounded-lg border border-ink-700/60 bg-ink-950/40 px-3 py-2">
        <span className="text-xs text-ink-500">Profile visibility</span>
        {user?.isPublicProfile === false ? (
         <span className="text-xs font-semibold text-rose-400">Private</span>
        ) : (
         <span className="text-xs font-semibold text-emerald-400">Public</span>
        )}
       </div>

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
      </div>
     )}
    </CardContent>
   </Card>

   {/* Stats — dense row, no per-tile chrome. */}
   <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-lg border border-ink-700/60 bg-ink-700/40">
    {[
     { label: "Episodes", value: totalEpisodes },
     { label: "Hours", value: totalHours },
     { label: "Watchlist", value: favorites.length },
     { label: "Anime", value: uniqueAnime },
    ].map((s) => (
     <div key={s.label} className="bg-surface-raised px-3 py-4 text-center">
      <div className="font-heading text-2xl font-bold text-surface-primary leading-none">{s.value}</div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-500">{s.label}</div>
     </div>
    ))}
    </dl>

    {/* Connected Accounts */}
    {!(session.user as any).isGuest && <ConnectedAccounts />}

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
          className="group cursor-pointer rounded-lg overflow-hidden bg-ink-700/50 border border-ink-700/60 hover:border-ink-300/70 focus-visible:ring-2 focus-visible:ring-orange-500/40 transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push(`/anime/${fav.animeId}`)}
          aria-label={`Go to ${fav.animeTitle}`}
         >
          {fav.animeCoverImageUrl && (
           <img
            src={fav.animeCoverImageUrl}
            alt={fav.animeTitle}
            className="w-full aspect-[3/4] object-cover"
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

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ShadcnButton } from "@/components/ui/shadcn/button";
import { useToast } from "@/components/ui/shadcn/use-toast";
import { Plus, Check, ArrowRight, Trash2, X } from "lucide-react";

interface AnnouncementItem {
  _id: string;
  title: string;
  body: string;
  isActive: boolean;
  createdAt: Date;
}

export default function AdminAnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch announcements");
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formTitle.trim() || !formBody.trim()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle, body: formBody }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || "Failed to create announcement");
        setIsSaving(false);
        return;
      }

      const data = await res.json();
      setAnnouncements((prev) => [data.announcement, ...prev]);
      setFormTitle("");
      setFormBody("");
      setShowForm(false);
      setIsSaving(false);
    } catch (err: any) {
      setSaveError(err.message || "Failed to create announcement");
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await fetch(`/api/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to toggle announcement:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return;
    try {
      await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="animate-pulse rounded-xl bg-surface-canvas/50 w-48 h-6" />
      </div>
    );
  }

  if (!session?.user || (session.user as any).role !== "admin") {
    return (
      <div className="p-6 text-center">
        <p className="text-ink-500">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-heading text-surface-primary">
        Pengumuman
      </h1>

      {/* Create form toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {saveError && (
            <p className="text-sm text-rose-400">{saveError}</p>
          )}

          {isSaving ? (
            <p className="text-sm text-ink-500 animate-pulse">Menyimpan...</p>
          ) : (
            <ShadcnButton onClick={() => setShowForm(!showForm)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              {showForm ? "Batal" : "Buat Pengumuman"}
            </ShadcnButton>
          )}
        </CardContent>
      </Card>

      {/* Announcement form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Buat Pengumuman Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-surface-primary mb-1">Judul</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Judul pengumuman"
                className="w-full px-3 py-2 text-sm bg-ink-700 border border-ink-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-primary mb-1">Body</label>
              <textarea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder="Isi pengumuman..."
                className="w-full px-3 py-2 text-sm bg-ink-700 border border-ink-500 rounded-lg h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                required
              ></textarea>
            </div>
            <div className="flex gap-2">
              <ShadcnButton onClick={handleCreate} disabled={isSaving || !formTitle.trim() || !formBody.trim()}>
                Simpan
              </ShadcnButton>
              <ShadcnButton variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </ShadcnButton>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements list */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengumuman</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-ink-500 text-sm">Tidak ada pengumuman aktif.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann._id}
                  className="flex items-center justify-between px-3 py-2 bg-surface-canvas/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-medium rounded px-2 py-0.5 ${ann.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                      {ann.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <span className="font-medium text-surface-primary truncate">{ann.title}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <ShadcnButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggle(ann._id, ann.isActive)}
                      title={ann.isActive ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {ann.isActive ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </ShadcnButton>
                    <ShadcnButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(ann._id)}
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </ShadcnButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
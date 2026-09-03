"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ShadcnButton } from "@/components/ui/shadcn/button";
import { Loader2, Link2, Unlink, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface SyncStatus {
  mal: {
    connected: boolean;
    username: string | null;
    autoSync: boolean;
    lastImportedAt: number | null;
  };
}

interface ImportResult {
  platform: string;
  imported: number;
  matched: number;
  unmatched: number;
  unmatchedTitles: string[];
  xpAwarded?: number;
  newLevel?: number;
}

export function ConnectedAccounts() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<"mal" | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/sync/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch sync status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Check URL params for sync results
    const params = new URLSearchParams(window.location.search);
    if (params.get("sync_success")) {
      setImportResult({
        platform: params.get("sync_success")!,
        imported: 0,
        matched: 0,
        unmatched: 0,
        unmatchedTitles: [],
      });
      // Clean URL
      window.history.replaceState({}, "", "/profile");
    }
    if (params.get("sync_error")) {
      setError(`Failed to connect MyAnimeList`);
      window.history.replaceState({}, "", "/profile");
    }
  }, [fetchStatus]);

  const handleConnect = (platform: "mal") => {
    window.location.href = `/api/auth/${platform}`;
  };

  const handleDisconnect = async (platform: "mal") => {
    if (!confirm(`Disconnect MyAnimeList?`)) return;

    try {
      const res = await fetch("/api/sync/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });

      if (res.ok) {
        await fetchStatus();
        setImportResult(null);
      }
    } catch (err) {
      setError("Failed to disconnect");
    }
  };

  const handleImport = async (platform: "mal") => {
    setImporting(platform);
    setError(null);
    setImportResult(null);

    try {
      const res = await fetch("/api/sync/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });

      if (res.ok) {
        const data = await res.json();
        setImportResult(data);
        await fetchStatus();
      } else {
        const data = await res.json();
        setError(data.error || "Import failed");
      }
    } catch (err) {
      setError("Import failed");
    } finally {
      setImporting(null);
    }
  };

  const handleToggleAutoSync = async (platform: "mal", enabled: boolean) => {
    try {
      const res = await fetch("/api/sync/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoSyncMal: enabled,
        }),
      });

      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      setError("Failed to update auto-sync setting");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const platforms = [
    {
      key: "mal" as const,
      name: "MyAnimeList",
      data: status.mal,
      color: "from-blue-600 to-blue-500",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-8h2v8zm-6-8V7h2v2h-2z" />
        </svg>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-orange-400" />
          Connected Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {importResult && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {importResult.imported > 0
                  ? `${importResult.imported} episodes imported from MAL`
                  : `Connected to MAL`}
                {importResult.unmatched > 0 && ` (${importResult.unmatched} not found)`}
              </span>
            </div>
            {(importResult.xpAwarded ?? 0) > 0 && (
              <div className="flex items-center gap-2 pl-6 text-xs text-amber-400">
                <span>+{importResult.xpAwarded} XP</span>
                <span className="text-ink-500">·</span>
                <span>Level {importResult.newLevel}</span>
              </div>
            )}
          </div>
        )}

        {platforms.map((platform) => (
          <div
            key={platform.key}
            className="flex items-center justify-between p-4 rounded-lg border border-ink-700/60 bg-surface-canvas/50"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-white`}>
                {platform.icon}
              </div>
              <div>
                <div className="font-medium text-surface-primary">{platform.name}</div>
                {platform.data.connected ? (
                  <div className="text-xs text-ink-400">
                    Connected as <span className="text-orange-400">{platform.data.username}</span>
                  </div>
                ) : (
                  <div className="text-xs text-ink-500">Not connected</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {platform.data.connected && (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={platform.data.autoSync}
                      onClick={() =>
                        handleToggleAutoSync(platform.key, !platform.data.autoSync)
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 ${
                        platform.data.autoSync ? "bg-orange-600" : "bg-ink-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          platform.data.autoSync ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs text-ink-500">Auto-sync</span>
                  </div>

                  <ShadcnButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleImport(platform.key)}
                    disabled={importing === platform.key}
                    className="gap-1.5"
                  >
                    {importing === platform.key ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Re-import
                  </ShadcnButton>

                  <ShadcnButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(platform.key)}
                    className="gap-1.5 text-rose-400 hover:text-rose-300"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Disconnect
                  </ShadcnButton>
                </>
              )}

              {!platform.data.connected && (
                <ShadcnButton
                  variant="default"
                  size="sm"
                  onClick={() => handleConnect(platform.key)}
                  className="gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Connect
                </ShadcnButton>
              )}
            </div>
          </div>
        ))}

        <p className="text-xs text-ink-500 pt-2">
          Connect your accounts to sync watch progress automatically. When you mark an episode as watched here, it will be pushed to connected platforms.
        </p>
      </CardContent>
    </Card>
  );
}

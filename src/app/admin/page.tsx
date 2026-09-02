"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Users, Trophy, Megaphone, Shield } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalCollectibles: number;
  totalAnnouncements: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/collectibles").then((r) => r.json()),
      fetch("/api/announcements").then((r) => r.json()),
    ]).then(([users, collectibles, announcements]) => {
      setStats({
        totalUsers: users.users?.length ?? 0,
        totalCollectibles: collectibles.collectibles?.length ?? 0,
        totalAnnouncements: announcements.announcements?.length ?? 0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-blue-400" },
    { label: "Collectibles", value: stats?.totalCollectibles ?? "—", icon: Trophy, color: "text-amber-400" },
    { label: "Announcements", value: stats?.totalAnnouncements ?? "—", icon: Megaphone, color: "text-emerald-400" },
    { label: "Admin", value: "You", icon: Shield, color: "text-rose-400" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-heading text-surface-primary">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="pt-5 pb-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg bg-ink-950/60 ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-heading text-surface-primary leading-none">{c.value}</p>
                  <p className="text-xs text-ink-500 mt-1">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

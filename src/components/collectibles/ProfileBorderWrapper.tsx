"use client";

import React from "react";
import type { Collectible } from "@/types/models";

const BORDER_STYLES: Record<string, string> = {
  common: "border-ink-500",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-amber-400",
};

const BORDER_GLOW: Record<string, string> = {
  common: "",
  rare: "shadow-[0_0_6px_rgba(59,130,246,0.25)]",
  epic: "shadow-[0_0_8px_rgba(168,85,247,0.3)]",
  legendary: "shadow-[0_0_10px_rgba(251,191,36,0.35)]",
};

export function ProfileBorderWrapper({
  border,
  children,
}: {
  border?: Collectible | null;
  children: React.ReactNode;
}) {
  if (!border) return <>{children}</>;

  const borderColor = BORDER_STYLES[border.rarity] ?? BORDER_STYLES.common;
  const glow = BORDER_GLOW[border.rarity] ?? "";

  return (
    <div className={`relative rounded-xl border-2 ${borderColor} ${glow}`}>
      {children}
    </div>
  );
}

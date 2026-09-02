"use client";

import React from "react";
import type { Collectible, User } from "@/types/models";

interface UserNameDisplayProps {
  user?: Pick<User, "username">;
  username?: string;
  nameStyle?: Collectible | null;
  rank?: Collectible | null;
  className?: string;
}

export function UserNameDisplay({ user, username: usernameProp, nameStyle, rank, className }: UserNameDisplayProps) {
  const displayName = user?.username ?? usernameProp ?? "";
  const styleConfig = nameStyle?.styleConfig;

  let inlineStyle: React.CSSProperties = {};
  if (styleConfig?.gradient) {
    inlineStyle.backgroundImage = `linear-gradient(135deg, ${styleConfig.gradient[0]}, ${styleConfig.gradient[1]})`;
    inlineStyle.WebkitBackgroundClip = "text";
    inlineStyle.WebkitTextFillColor = "transparent";
    inlineStyle.backgroundClip = "text";
  }

  const nameClass = styleConfig?.className ?? "";

  return (
    <span className={`inline-flex items-center whitespace-nowrap ${className ?? ""}`}>
      <span className={`truncate ${nameClass}`} style={inlineStyle}>
        {displayName}
      </span>
      {rank && (
        <span className="text-ink-400 font-semibold ml-1 shrink-0 text-[10px]">
          &#9733; {rank.name}
        </span>
      )}
    </span>
  );
}

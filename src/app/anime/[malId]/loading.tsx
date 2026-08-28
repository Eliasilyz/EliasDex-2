import React from "react";
import { DetailPageSkeleton } from "@/components/ui/Skeleton";

export default function LoadingAnimeDetail() {
  return (
    <div className="pb-16 pt-2">
      <DetailPageSkeleton />
    </div>
  );
}

import { DB_ENABLED } from "@/lib/env";

export function DbStatusBanner() {
  if (process.env.NODE_ENV !== "development") return null;
  if (DB_ENABLED) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900 shadow-sm">
      <div className="font-semibold">Database offline</div>
      <div className="text-xs mt-1 opacity-80">
        MONGODB_URI not set. User data & persistence disabled. Browsing works.
      </div>
    </div>
  );
}

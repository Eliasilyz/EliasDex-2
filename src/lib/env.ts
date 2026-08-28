export const DB_ENABLED = !!process.env.MONGODB_URI;

export const ENV = {
  MONGODB_URI: process.env.MONGODB_URI || null,
  JIKAN_BASE_URL: process.env.JIKAN_BASE_URL || "https://api.jikan.moe/v4",
  ANIKOTO_BASE_URL: process.env.ANIKOTO_BASE_URL || "https://anikotoapi.site",
  MEGAPLAY_BASE_URL: process.env.MEGAPLAY_BASE_URL || "https://megaplay.buzz",
  NODE_ENV: process.env.NODE_ENV || "development",
  PUSHER_APP_ID: process.env.PUSHER_APP_ID || "",
  PUSHER_SECRET: process.env.PUSHER_SECRET || "",
  NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
} as const;

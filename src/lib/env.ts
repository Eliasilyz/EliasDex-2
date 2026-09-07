const envObj = {
  MONGODB_URI: null as string | null,
  JIKAN_BASE_URL: "https://api.jikan.moe/v4",
  ANIKOTO_BASE_URL: "https://anikotoapi.site",
  MEGAPLAY_BASE_URL: "https://megaplay.buzz",
  NODE_ENV: "development" as string,
  PUSHER_APP_ID: "",
  PUSHER_SECRET: "",
  NEXT_PUBLIC_PUSHER_KEY: "",
  NEXT_PUBLIC_PUSHER_CLUSTER: "mt1",
};

Object.defineProperty(envObj, "MONGODB_URI", {
  get() { return process.env.MONGODB_URI || null; },
});
Object.defineProperty(envObj, "NODE_ENV", {
  get() { return process.env.NODE_ENV || "development"; },
});
Object.defineProperty(envObj, "JIKAN_BASE_URL", {
  get() { return process.env.JIKAN_BASE_URL || "https://api.jikan.moe/v4"; },
});
Object.defineProperty(envObj, "ANIKOTO_BASE_URL", {
  get() { return process.env.ANIKOTO_BASE_URL || "https://anikotoapi.site"; },
});
Object.defineProperty(envObj, "MEGAPLAY_BASE_URL", {
  get() { return process.env.MEGAPLAY_BASE_URL || "https://megaplay.buzz"; },
});
Object.defineProperty(envObj, "PUSHER_APP_ID", {
  get() { return process.env.PUSHER_APP_ID || ""; },
});
Object.defineProperty(envObj, "PUSHER_SECRET", {
  get() { return process.env.PUSHER_SECRET || ""; },
});
Object.defineProperty(envObj, "NEXT_PUBLIC_PUSHER_KEY", {
  get() { return process.env.NEXT_PUBLIC_PUSHER_KEY || ""; },
});
Object.defineProperty(envObj, "NEXT_PUBLIC_PUSHER_CLUSTER", {
  get() { return process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1"; },
});

export const DB_ENABLED = !!(process.env.MONGODB_URI || "");
export const ENV = envObj;

import { Catbox } from "node-catbox";
import { Readable } from "stream";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const catbox = new Catbox(undefined, { requestTimeoutMs: 30_000 });

export type CatboxUploadResult =
  | { url: string; error?: never }
  | { error: string; url?: never };

/**
 * Upload a File (from FormData) to catbox.moe using node-catbox.
 * Returns the direct URL on success, or error on failure.
 */
export async function uploadToCatbox(file: File): Promise<CatboxUploadResult> {
  // Detect MIME type from extension if browser stripped it
  let fileType = file.type;
  if (!fileType || fileType === "application/octet-stream") {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      gif: "image/gif", webp: "image/webp",
    };
    fileType = mimeMap[ext || ""] || fileType;
  }

  if (!ALLOWED_TYPES.includes(fileType)) {
    return { error: `Invalid file type: ${fileType || "unknown"}. Allowed: JPEG, PNG, GIF, WebP.` };
  }
  if (file.size > MAX_SIZE) {
    return { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max: 10 MB.` };
  }

  try {
    // Convert File to Node.js Buffer → Readable stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // Ensure filename has a valid extension for catbox
    let filename = file.name || "upload.jpg";
    if (!filename.includes(".")) {
      const extMap: Record<string, string> = {
        "image/jpeg": ".jpg", "image/png": ".png",
        "image/gif": ".gif", "image/webp": ".webp",
      };
      filename += extMap[fileType] || ".jpg";
    }

    const url = await catbox.uploadFileStream({
      stream,
      filename,
    });

    return { url };
  } catch (err: any) {
    return { error: err.message || "Upload to catbox.moe failed." };
  }
}

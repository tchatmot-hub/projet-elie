import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Local filesystem storage for development. Files are written under
 * `public/uploads` so Next.js serves them statically at `/uploads/...`.
 * Swap this module for an S3/GCS implementation in production.
 */
const UPLOAD_SUBDIR = "uploads";

function publicUploadDir(): string {
  return path.join(process.cwd(), "public", UPLOAD_SUBDIR);
}

export async function saveFile(
  originalName: string,
  data: Buffer
): Promise<{ url: string; size: number }> {
  const dir = publicUploadDir();
  await fs.mkdir(dir, { recursive: true });
  const ext = path.extname(originalName);
  const safeBase = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40);
  const unique = crypto.randomBytes(8).toString("hex");
  const filename = `${Date.now()}-${unique}-${safeBase}${ext}`;
  await fs.writeFile(path.join(dir, filename), data);
  return { url: `/${UPLOAD_SUBDIR}/${filename}`, size: data.length };
}

import { mkdir, writeFile } from "fs/promises";
import path from "path";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"]);
const inlineImageLimit = Number(process.env.MAX_INLINE_UPLOAD_BYTES ?? 4 * 1024 * 1024);

function safeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

export async function saveUpload(file: File | null, folder = "general") {
  if (!file || file.size === 0) return null;
  if (!allowedTypes.has(file.type)) {
    throw new Error("Unsupported upload type. Use JPG, PNG, WebP, GIF, MP4, or WebM.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.VERCEL === "1" || process.env.UPLOAD_STORAGE === "database") {
    if (!file.type.startsWith("image/")) {
      throw new Error("Video uploads need permanent object storage. Paste a hosted video URL for now.");
    }

    if (file.size > inlineImageLimit) {
      throw new Error("Image upload is too large. Use an image under 4MB or paste a hosted image URL.");
    }

    return `data:${file.type};base64,${bytes.toString("base64")}`;
  }

  const uploadRoot = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
  const directory = path.join(uploadRoot, folder);
  await mkdir(directory, { recursive: true });

  const filename = `${Date.now()}-${safeName(file.name)}`;
  const target = path.join(directory, filename);
  await writeFile(target, bytes);
  return `/uploads/${folder}/${filename}`;
}

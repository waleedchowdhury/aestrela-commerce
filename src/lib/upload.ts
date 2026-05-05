import { mkdir, writeFile } from "fs/promises";
import path from "path";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"]);

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
  const uploadRoot = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
  const directory = path.join(uploadRoot, folder);
  await mkdir(directory, { recursive: true });

  const filename = `${Date.now()}-${safeName(file.name)}`;
  const target = path.join(directory, filename);
  await writeFile(target, bytes);
  return `/uploads/${folder}/${filename}`;
}

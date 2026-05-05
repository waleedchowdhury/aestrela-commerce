import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const cookieName = "aestrela-admin";

export function normalizedAdminPassword() {
  return normalizeSecret(process.env.ADMIN_PASSWORD ?? "change-this-before-launch");
}

function normalizeSecret(value: string) {
  const trimmed = value.trim();
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));

  return quoted ? trimmed.slice(1, -1).trim() : trimmed;
}

function signature() {
  const password = normalizedAdminPassword();
  const secret = normalizeSecret(process.env.ADMIN_COOKIE_SECRET ?? "development-secret");
  return createHmac("sha256", secret).update(password).digest("hex");
}

export async function isAdmin() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) return false;
  const expected = signature();
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(cookieName, signature(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/"
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(cookieName);
}

export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes("USER:PASSWORD") && !url.includes("HOST:5432"));
}

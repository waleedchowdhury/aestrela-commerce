export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes("YourStrong!Passw0rd") && !url.includes("YOUR_HOST"));
}

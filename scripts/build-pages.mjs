import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const basePath = "/aestrela-commerce";

const products = [
  {
    name: "Nocturne Silk Shirt",
    price: "$168.00",
    category: "New arrival",
    image: "https://images.unsplash.com/photo-1520975867597-0af37a22e31e?auto=format&fit=crop&w=1200&q=85"
  },
  {
    name: "Celeste Tailored Blazer",
    price: "$248.00",
    category: "Best sellers",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85"
  },
  {
    name: "Luna Wide-Leg Trouser",
    price: "$188.00",
    category: "Shop all",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85"
  },
  {
    name: "Aurora Column Dress",
    price: "$298.00",
    category: "Shop all",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
  }
];

const productCards = products
  .map(
    (product) => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" />
        <div class="product-meta">
          <div>
            <p class="product-name">${product.name}</p>
            <p class="product-category">${product.category}</p>
          </div>
          <p>${product.price}</p>
        </div>
      </article>`
  )
  .join("");

function layout(title, body) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="AESTRELA premium commerce storefront preview." />
    <link rel="stylesheet" href="${basePath}/styles.css" />
  </head>
  <body>
    <div class="announcement">FREE SHIPPING WORLDWIDE &nbsp;&nbsp;&nbsp; FREE SHIPPING WORLDWIDE &nbsp;&nbsp;&nbsp; FREE SHIPPING WORLDWIDE</div>
    <header class="site-header">
      <nav>
        <div class="nav-links">
          <a href="${basePath}/">Home</a>
          <a href="${basePath}/#collection">Collection</a>
          <a href="${basePath}/shop/">Shop</a>
        </div>
        <a href="${basePath}/" class="logo"><img src="${basePath}/brand/aestrela-logo-navbar-transparent.png" alt="AESTRELA" /></a>
        <div class="nav-icons">
          <a href="${basePath}/admin/">Account</a>
          <a href="${basePath}/shop/">Cart</a>
          <a href="${basePath}/about/">About</a>
        </div>
      </nav>
    </header>
    ${body}
    <footer>
      <div>
        <p class="eyebrow">Designed in Chicago</p>
        <h2>AESTRÉLA</h2>
        <p>A premium fashion house focused on refined silhouettes, lasting materials, and a global standard of service.</p>
      </div>
      <img class="emblem" src="${basePath}/brand/aestrela-emblem-transparent.png" alt="AESTRELA emblem" />
      <div>
        <p class="eyebrow">Trust</p>
        <p>Secure checkout · Worldwide shipping · Premium support</p>
        <p class="socials">Facebook · Instagram</p>
      </div>
    </footer>
  </body>
</html>`;
}

const home = layout(
  "AESTRELA | Premium Commerce",
  `<main>
    <section class="hero">
      <a href="${basePath}/shop-now/" class="hero-cta">Shop Now</a>
    </section>
    <section id="collection" class="section">
      <p class="eyebrow">Collection</p>
      <h1>Selected pieces</h1>
      <div class="grid">${productCards}</div>
    </section>
    <section class="story">
      <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85" alt="AESTRELA editorial" />
      <div>
        <p class="eyebrow">THE STORY</p>
        <h2>"Luxury is the discipline of leaving only what matters."</h2>
        <p>AESTRÉLA is designed in Chicago for wardrobes that move between sharp city days, late dinners, and the small rituals that make a piece feel personal.</p>
      </div>
    </section>
  </main>`
);

const shop = layout(
  "Shop | AESTRELA",
  `<main class="page">
    <p class="eyebrow">Shop</p>
    <h1>Collection</h1>
    <div class="category-bar"><span>New arrival</span><span>Shop all</span><span>Best sellers</span></div>
    <div class="grid">${productCards}</div>
  </main>`
);

const shopNow = layout(
  "Shop Now | AESTRELA",
  `<main class="page">
    <p class="eyebrow">Shop Now</p>
    <h1>New arrivals and signature pieces.</h1>
    <div class="grid">${productCards}</div>
  </main>`
);

const about = layout(
  "About | AESTRELA",
  `<main class="page split-page">
    <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85" alt="AESTRELA atelier mood" />
    <div>
      <p class="eyebrow">About AESTRELA</p>
      <h1>Designed with restraint, made for presence.</h1>
      <p>AESTRÉLA is designed in Chicago for wardrobes that move between sharp city days, late dinners, and the small rituals that make a piece feel personal.</p>
    </div>
  </main>`
);

const admin = layout(
  "Admin | AESTRELA",
  `<main class="page">
    <p class="eyebrow">AESTRELA Admin</p>
    <h1>Admin is available on the live server.</h1>
    <p>GitHub Pages is a static preview. The SQL Server admin panel, uploads, Stripe, and PayPal need a Next.js server host.</p>
  </main>`
);

const css = `
:root{--ink:#0b1f35;--pearl:#f7f3ec;--porcelain:#fbfaf7;--champagne:#c7a85f;--graphite:#222528;--mist:#e7e2d7}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--porcelain);color:var(--graphite);font-family:Arial,sans-serif}a{color:inherit;text-decoration:none}.announcement{height:36px;display:flex;align-items:center;overflow:hidden;background:var(--champagne);color:var(--ink);font-size:11px;letter-spacing:.28em;white-space:nowrap;padding:0 24px}.site-header{position:sticky;top:0;z-index:10;background:var(--ink);color:var(--pearl)}nav{height:82px;max-width:1280px;margin:auto;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 28px}.nav-links,.nav-icons{display:flex;gap:28px;font-size:12px;text-transform:uppercase;letter-spacing:.22em}.nav-icons{justify-content:flex-end}.logo{position:relative;width:220px;height:58px;display:block}.logo img{width:100%;height:100%;object-fit:contain;filter:brightness(0) invert(1)}.hero{min-height:82vh;background:linear-gradient(to bottom,rgba(0,0,0,.18),rgba(11,31,53,.32)),url("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=85") center/cover;display:flex;align-items:flex-end;justify-content:center;padding-bottom:80px}.hero-cta{border:1px solid rgba(247,243,236,.78);background:rgba(11,31,53,.38);color:var(--pearl);padding:14px 32px;text-transform:uppercase;letter-spacing:.24em;font-size:12px}.section,.page{max-width:1280px;margin:auto;padding:88px 28px}.eyebrow{text-transform:uppercase;letter-spacing:.32em;color:var(--champagne);font-size:12px}h1,h2{font-family:Georgia,serif;font-weight:400;line-height:1.04;color:var(--ink)}h1{font-size:clamp(46px,7vw,92px);margin:16px 0 34px}h2{font-size:clamp(38px,5vw,72px)}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px}.product-card img{width:100%;aspect-ratio:3/4;object-fit:cover;background:var(--mist)}.product-meta{display:flex;justify-content:space-between;gap:16px;margin-top:16px;font-size:14px}.product-name{text-transform:uppercase;letter-spacing:.14em;margin:0}.product-category{text-transform:uppercase;letter-spacing:.2em;color:rgba(34,37,40,.52);font-size:12px}.story{max-width:1180px;margin:auto;padding:96px 28px;display:grid;grid-template-columns:.92fr 1.08fr;align-items:center;gap:60px}.story img,.split-page img{width:100%;aspect-ratio:4/5;object-fit:cover}.story p,.page p{font-size:16px;line-height:1.8;color:rgba(34,37,40,.72)}.category-bar{border-top:1px solid rgba(11,31,53,.12);border-bottom:1px solid rgba(11,31,53,.12);display:flex;gap:34px;text-transform:uppercase;letter-spacing:.24em;font-size:12px;padding:18px 0;margin-bottom:40px}.split-page{display:grid;grid-template-columns:.9fr 1.1fr;gap:60px;align-items:center}footer{background:var(--ink);color:var(--pearl);padding:60px 28px;display:grid;grid-template-columns:1fr auto 1fr;gap:48px;align-items:center}footer>div{max-width:380px}footer h2{color:var(--pearl);font-size:54px}.emblem{width:128px;height:128px;object-fit:contain}.socials{color:var(--champagne)}
@media(max-width:900px){nav{grid-template-columns:1fr}.nav-links,.nav-icons{display:none}.logo{margin:auto}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.story,.split-page,footer{grid-template-columns:1fr}.hero{min-height:72vh}}@media(max-width:560px){.grid{grid-template-columns:1fr}.section,.page{padding:64px 18px}.story{padding:64px 18px}.announcement{font-size:10px}.hero{padding-bottom:58px}}
`;

async function writePage(route, html) {
  const directory = path.join(outDir, route);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), html);
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await cp(path.join(root, "public", "brand"), path.join(outDir, "brand"), { recursive: true });
  await writeFile(path.join(outDir, ".nojekyll"), "");
  await writeFile(path.join(outDir, "styles.css"), css);
  await writePage("", home);
  await writePage("shop", shop);
  await writePage("shop-now", shopNow);
  await writePage("about", about);
  await writePage("admin", admin);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

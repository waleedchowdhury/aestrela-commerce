import Image from "next/image";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import {
  deleteProductAction,
  loginAction,
  logoutAction,
  updateAnnouncementAction,
  updateEditorialAction,
  updateFooterAction,
  updateHeroAction,
  upsertProductAction
} from "@/app/admin/actions";
import {
  fallbackAnnouncement,
  fallbackEditorial,
  fallbackFooter,
  fallbackHero,
  fallbackProducts
} from "@/lib/fallback";

async function getAdminData() {
  if (!isDatabaseConfigured()) {
    return {
      connected: false,
      announcement: fallbackAnnouncement,
      hero: fallbackHero,
      editorial: fallbackEditorial,
      footer: fallbackFooter,
      products: fallbackProducts.map((product) => ({
        ...product,
        isActive: true,
        sizes: product.sizes.join(", ")
      }))
    };
  }

  try {
    const [announcement, hero, editorial, footer, products] = await Promise.all([
      prisma.announcement.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } }),
      prisma.heroContent.findUnique({ where: { id: "home" } }),
      prisma.editorialContent.findUnique({ where: { id: "story" } }),
      prisma.footerContent.findUnique({ where: { id: "footer" } }),
      prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        include: { images: { orderBy: { sortOrder: "asc" } }, variants: true }
      })
    ]);

    return {
      connected: true,
      announcement: announcement ?? fallbackAnnouncement,
      hero: hero ?? fallbackHero,
      editorial: editorial ?? fallbackEditorial,
      footer: footer ?? fallbackFooter,
      products: products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isBestSeller: product.isBestSeller,
        isActive: product.isActive,
        imageUrl: product.images[0]?.url ?? "",
        sizes: product.variants.map((variant) => variant.size).join(", ")
      }))
    };
  } catch {
    return {
      connected: false,
      announcement: fallbackAnnouncement,
      hero: fallbackHero,
      editorial: fallbackEditorial,
      footer: fallbackFooter,
      products: fallbackProducts.map((product) => ({
        ...product,
        isActive: true,
        sizes: product.sizes.join(", ")
      }))
    };
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="admin-label">{label}</span>
      {children}
    </label>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink/70">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-ink" />
      {label}
    </label>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return <button className="bg-ink px-5 py-3 text-xs uppercase tracking-[0.2em] text-pearl">{children}</button>;
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  if (process.env.GITHUB_PAGES === "true") {
    return (
      <main className="min-h-screen bg-porcelain px-5 pb-20 pt-40 md:px-8">
        <div className="mx-auto max-w-2xl bg-white p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.32em] text-champagne">AESTRELA Admin</p>
          <h1 className="mt-3 font-editorial text-4xl font-normal text-ink">Admin is available on the live server.</h1>
          <p className="mt-5 text-sm leading-7 text-ink/65">
            GitHub Pages is a static preview and cannot run Postgres, Prisma, uploads, checkout, or admin server actions.
            Deploy this project to a Next.js host with the environment variables from .env.example to use the full admin panel.
          </p>
        </div>
      </main>
    );
  }

  const admin = await isAdmin();
  const params = await searchParams;
  const invalidPassword = params?.error === "invalid";

  if (!admin) {
    return (
      <main className="min-h-screen bg-porcelain px-5 pb-20 pt-40 md:px-8">
        <div className="mx-auto max-w-md bg-white p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.32em] text-champagne">AESTRÉLA Admin</p>
          <h1 className="mt-3 font-editorial text-4xl font-normal text-ink">Sign in</h1>
          {invalidPassword && (
            <p className="mt-5 border border-red-900/20 bg-red-50 p-3 text-sm text-red-900">
              The admin password did not match the Render environment variable. Check `ADMIN_PASSWORD` in Render and do not include quotes.
            </p>
          )}
          <form action={loginAction} className="mt-8 grid gap-5">
            <Field label="Password">
              <input name="password" type="password" className="admin-field" required />
            </Field>
            <SubmitButton>Enter admin</SubmitButton>
          </form>
        </div>
      </main>
    );
  }

  const data = await getAdminData();

  return (
    <main className="bg-porcelain px-5 pb-20 pt-40 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-champagne">AESTRÉLA Admin</p>
            <h1 className="mt-3 font-editorial text-5xl font-normal text-ink">Control room</h1>
          </div>
          <form action={logoutAction}>
            <button className="border border-ink/20 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink">Logout</button>
          </form>
        </div>

        {!data.connected && (
          <div className="mt-8 border border-champagne/50 bg-champagne/10 p-5 text-sm leading-7 text-ink/75">
            Postgres is not connected yet, so the admin is showing fallback content. Add `DATABASE_URL`, run Prisma, then these forms will write directly to Vercel Postgres.
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section className="bg-white p-6 shadow-soft">
            <h2 className="font-editorial text-3xl font-normal">Announcement bar</h2>
            <form action={updateAnnouncementAction} className="mt-6 grid gap-4">
              <Field label="Promotion text">
                <input name="message" defaultValue={data.announcement.message} className="admin-field" />
              </Field>
              <Field label="Optional link">
                <input name="href" defaultValue={data.announcement.href ?? ""} className="admin-field" />
              </Field>
              <Checkbox name="isActive" label="Show announcement" defaultChecked />
              <SubmitButton>Save promotion</SubmitButton>
            </form>
          </section>

          <section className="bg-white p-6 shadow-soft">
            <h2 className="font-editorial text-3xl font-normal">Hero media</h2>
            <form action={updateHeroAction} className="mt-6 grid gap-4">
              <Field label="Title">
                <input name="title" defaultValue={data.hero.title} className="admin-field" />
              </Field>
              <Field label="Subtitle">
                <textarea name="subtitle" defaultValue={data.hero.subtitle} className="admin-field min-h-24" />
              </Field>
              <Field label="Media URL">
                <input name="mediaUrl" defaultValue={data.hero.mediaUrl} className="admin-field" />
              </Field>
              <Field label="Upload image/video">
                <input name="media" type="file" accept="image/*,video/mp4,video/webm" className="admin-field" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Media type">
                  <select name="mediaType" defaultValue={data.hero.mediaType} className="admin-field">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </Field>
                <Field label="CTA label">
                  <input name="ctaLabel" defaultValue={data.hero.ctaLabel} className="admin-field" />
                </Field>
                <Field label="CTA link">
                  <input name="ctaHref" defaultValue={data.hero.ctaHref} className="admin-field" />
                </Field>
              </div>
              <SubmitButton>Save hero</SubmitButton>
            </form>
          </section>

          <section className="bg-white p-6 shadow-soft">
            <h2 className="font-editorial text-3xl font-normal">Editorial story</h2>
            <form action={updateEditorialAction} className="mt-6 grid gap-4">
              <Field label="Small label">
                <input name="label" defaultValue={data.editorial.label} className="admin-field" />
              </Field>
              <Field label="Big quote">
                <textarea name="quote" defaultValue={data.editorial.quote} className="admin-field min-h-24" />
              </Field>
              <Field label="Supporting paragraph">
                <textarea name="body" defaultValue={data.editorial.body} className="admin-field min-h-28" />
              </Field>
              <Field label="Image URL">
                <input name="imageUrl" defaultValue={data.editorial.imageUrl} className="admin-field" />
              </Field>
              <Field label="Upload picture">
                <input name="image" type="file" accept="image/*" className="admin-field" />
              </Field>
              <SubmitButton>Save editorial</SubmitButton>
            </form>
          </section>

          <section className="bg-white p-6 shadow-soft">
            <h2 className="font-editorial text-3xl font-normal">Footer and socials</h2>
            <form action={updateFooterAction} className="mt-6 grid gap-4">
              <Field label="Designed in">
                <input name="designedIn" defaultValue={data.footer.designedIn} className="admin-field" />
              </Field>
              <Field label="Branding">
                <input name="brandText" defaultValue={data.footer.brandText} className="admin-field" />
              </Field>
              <Field label="About AESTRÉLA">
                <textarea name="aboutText" defaultValue={data.footer.aboutText} className="admin-field min-h-24" />
              </Field>
              <Field label="Trust signals">
                <input name="trustText" defaultValue={data.footer.trustText} className="admin-field" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Facebook">
                  <input name="facebookUrl" defaultValue={data.footer.facebookUrl} className="admin-field" />
                </Field>
                <Field label="Instagram">
                  <input name="instagramUrl" defaultValue={data.footer.instagramUrl} className="admin-field" />
                </Field>
              </div>
              <SubmitButton>Save footer</SubmitButton>
            </form>
          </section>
        </div>

        <section className="mt-8 bg-white p-6 shadow-soft">
          <h2 className="font-editorial text-3xl font-normal">Products</h2>
          <form action={upsertProductAction} className="mt-6 grid gap-4 border-b thin-divider pb-8">
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Name">
                <input name="name" className="admin-field" required />
              </Field>
              <Field label="Slug">
                <input name="slug" className="admin-field" />
              </Field>
              <Field label="Price">
                <input name="price" type="number" min="0" step="0.01" className="admin-field" required />
              </Field>
              <Field label="Category">
                <select name="category" className="admin-field" defaultValue="Shop all">
                  <option>New arrival</option>
                  <option>Shop all</option>
                  <option>Best sellers</option>
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea name="description" className="admin-field min-h-24" required />
            </Field>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <Field label="Sizes">
                <input name="sizes" defaultValue="S, M, L, XL, XXL" className="admin-field" />
              </Field>
              <Field label="Product image">
                <input name="image" type="file" accept="image/*" className="admin-field" />
              </Field>
              <div className="flex flex-wrap items-end gap-4 pb-2">
                <Checkbox name="isFeatured" label="Highlight" />
                <Checkbox name="isNewArrival" label="New" />
                <Checkbox name="isBestSeller" label="Best seller" />
                <Checkbox name="isActive" label="Active" defaultChecked />
              </div>
            </div>
            <SubmitButton>Add product</SubmitButton>
          </form>

          <div className="mt-8 grid gap-6">
            {data.products.map((product) => (
              <div key={product.id} className="grid gap-5 border-b thin-divider pb-6 lg:grid-cols-[120px_1fr]">
                <div className="relative aspect-[3/4] overflow-hidden bg-mist">
                  {product.imageUrl && <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />}
                </div>
                <form action={upsertProductAction} className="grid gap-4">
                  <input type="hidden" name="id" value={product.id} />
                  <div className="grid gap-4 md:grid-cols-4">
                    <Field label="Name">
                      <input name="name" defaultValue={product.name} className="admin-field" />
                    </Field>
                    <Field label="Slug">
                      <input name="slug" defaultValue={product.slug} className="admin-field" />
                    </Field>
                    <Field label="Price">
                      <input name="price" type="number" min="0" step="0.01" defaultValue={product.price} className="admin-field" />
                    </Field>
                    <Field label="Category">
                      <select name="category" defaultValue={product.category} className="admin-field">
                        <option>New arrival</option>
                        <option>Shop all</option>
                        <option>Best sellers</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea name="description" defaultValue={product.description} className="admin-field min-h-20" />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <Field label="Sizes">
                      <input name="sizes" defaultValue={product.sizes} className="admin-field" />
                    </Field>
                    <Field label="Add another image">
                      <input name="image" type="file" accept="image/*" className="admin-field" />
                    </Field>
                    <div className="flex flex-wrap items-end gap-4 pb-2">
                      <Checkbox name="isFeatured" label="Highlight" defaultChecked={product.isFeatured} />
                      <Checkbox name="isNewArrival" label="New" defaultChecked={product.isNewArrival} />
                      <Checkbox name="isBestSeller" label="Best seller" defaultChecked={product.isBestSeller} />
                      <Checkbox name="isActive" label="Active" defaultChecked={product.isActive} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <SubmitButton>Update</SubmitButton>
                    <button
                      formAction={deleteProductAction}
                      className="border border-red-900/30 px-5 py-3 text-xs uppercase tracking-[0.2em] text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

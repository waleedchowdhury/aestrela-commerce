"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminCookie, isAdmin, normalizedAdminPassword, setAdminCookie } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";

function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function storefrontChanged() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/shop-now");
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

function adminSuccess(area: string) {
  redirect(`/admin?saved=${encodeURIComponent(area)}`);
}

function adminError(message: string) {
  redirect(`/admin?error=${encodeURIComponent(message)}`);
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Admin login required.");
}

export async function loginAction(formData: FormData) {
  const password = text(formData, "password");
  if (password !== normalizedAdminPassword()) {
    redirect("/admin?error=invalid");
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin");
}

export async function updateAnnouncementAction(formData: FormData) {
  await requireAdmin();
  await prisma.announcement.updateMany({
    where: { id: { not: "launch-shipping" } },
    data: { isActive: false }
  });
  await prisma.announcement.upsert({
    where: { id: "launch-shipping" },
    update: {
      message: text(formData, "message", "Free shipping worldwide"),
      href: text(formData, "href") || null,
      isActive: checkbox(formData, "isActive")
    },
    create: {
      id: "launch-shipping",
      message: text(formData, "message", "Free shipping worldwide"),
      href: text(formData, "href") || null,
      isActive: checkbox(formData, "isActive")
    }
  });
  storefrontChanged();
  adminSuccess("promotion");
}

export async function updateHeroAction(formData: FormData) {
  await requireAdmin();
  const upload = await saveUpload(formData.get("media") as File | null, "hero");
  const current = await prisma.heroContent.findUnique({ where: { id: "home" } });
  const mediaUrl = upload ?? text(formData, "mediaUrl", current?.mediaUrl ?? "");

  await prisma.heroContent.upsert({
    where: { id: "home" },
    update: {
      title: text(formData, "title", "AESTRÉLA"),
      subtitle: text(formData, "subtitle"),
      mediaUrl,
      mediaType: text(formData, "mediaType", "image"),
      ctaLabel: text(formData, "ctaLabel", "Shop the collection"),
      ctaHref: text(formData, "ctaHref", "/shop")
    },
    create: {
      id: "home",
      title: text(formData, "title", "AESTRÉLA"),
      subtitle: text(formData, "subtitle"),
      mediaUrl,
      mediaType: text(formData, "mediaType", "image"),
      ctaLabel: text(formData, "ctaLabel", "Shop the collection"),
      ctaHref: text(formData, "ctaHref", "/shop")
    }
  });
  storefrontChanged();
  adminSuccess("hero");
}

export async function updateEditorialAction(formData: FormData) {
  await requireAdmin();
  const upload = await saveUpload(formData.get("image") as File | null, "editorial");
  const current = await prisma.editorialContent.findUnique({ where: { id: "story" } });

  await prisma.editorialContent.upsert({
    where: { id: "story" },
    update: {
      label: text(formData, "label", "THE STORY"),
      quote: text(formData, "quote"),
      body: text(formData, "body"),
      imageUrl: upload ?? text(formData, "imageUrl", current?.imageUrl ?? "")
    },
    create: {
      id: "story",
      label: text(formData, "label", "THE STORY"),
      quote: text(formData, "quote"),
      body: text(formData, "body"),
      imageUrl: upload ?? text(formData, "imageUrl")
    }
  });
  revalidatePath("/about");
  storefrontChanged();
  adminSuccess("editorial");
}

export async function updateFooterAction(formData: FormData) {
  await requireAdmin();
  await prisma.footerContent.upsert({
    where: { id: "footer" },
    update: {
      designedIn: text(formData, "designedIn", "Designed in Chicago"),
      brandText: text(formData, "brandText", "AESTRÉLA"),
      aboutText: text(formData, "aboutText"),
      trustText: text(formData, "trustText"),
      facebookUrl: text(formData, "facebookUrl", "#"),
      instagramUrl: text(formData, "instagramUrl", "#")
    },
    create: {
      id: "footer",
      designedIn: text(formData, "designedIn", "Designed in Chicago"),
      brandText: text(formData, "brandText", "AESTRÉLA"),
      aboutText: text(formData, "aboutText"),
      trustText: text(formData, "trustText"),
      facebookUrl: text(formData, "facebookUrl", "#"),
      instagramUrl: text(formData, "instagramUrl", "#")
    }
  });
  storefrontChanged();
  adminSuccess("footer");
}

export async function upsertProductAction(formData: FormData) {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    const name = text(formData, "name");
    const baseSlug = slugify(text(formData, "slug") || name);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (!existing || existing.id === id) break;
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const upload = await saveUpload(formData.get("image") as File | null, "products");
    const imageUrl = upload ?? text(formData, "imageUrl");
    const sizes = text(formData, "sizes", "S,M,L,XL,XXL")
      .split(",")
      .map((size) => size.trim().toUpperCase())
      .filter(Boolean);

    const data = {
      slug,
      name,
      description: text(formData, "description"),
      price: text(formData, "price", "0"),
      category: text(formData, "category", "Shop all"),
      isFeatured: checkbox(formData, "isFeatured"),
      isNewArrival: checkbox(formData, "isNewArrival"),
      isBestSeller: checkbox(formData, "isBestSeller"),
      isActive: checkbox(formData, "isActive")
    };

    const product = id ? await prisma.product.update({ where: { id }, data }) : await prisma.product.create({ data });

    if (imageUrl) {
      const primaryImage = await prisma.productImage.findFirst({
        where: { productId: product.id },
        orderBy: { sortOrder: "asc" }
      });

      if (primaryImage) {
        await prisma.productImage.update({
          where: { id: primaryImage.id },
          data: { url: imageUrl, alt: product.name }
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: imageUrl,
            alt: product.name
          }
        });
      }
    }

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.createMany({
      data: (sizes.length ? sizes : ["S", "M", "L", "XL", "XXL"]).map((size) => ({ productId: product.id, size, stock: 25 }))
    });

    storefrontChanged();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Product could not be saved.";
    adminError(message);
  }

  adminSuccess("product");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: text(formData, "id") } });
  storefrontChanged();
  adminSuccess("product removed");
}

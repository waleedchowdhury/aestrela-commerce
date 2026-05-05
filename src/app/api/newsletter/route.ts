import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.redirect(new URL("/?newsletter=pending-db", request.url));
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email }
    });
    return NextResponse.redirect(new URL("/?newsletter=joined", request.url));
  } catch {
    return NextResponse.redirect(new URL("/?newsletter=pending-db", request.url));
  }
}

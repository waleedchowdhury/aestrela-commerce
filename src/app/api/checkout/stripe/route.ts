import { NextResponse } from "next/server";

type CheckoutItem = {
  name: string;
  price: number;
  quantity: number;
  size: string;
};

export async function POST(request: Request) {
  const { items } = (await request.json()) as { items?: CheckoutItem[] };

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is ready to connect. Add STRIPE_SECRET_KEY in .env." }, { status: 503 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/shop?checkout=stripe-success`,
    cancel_url: `${origin}/shop?checkout=cancelled`,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "FR", "DE", "IT", "ES", "NL", "JP"]
    },
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: `${item.name} · Size ${item.size}`
        }
      }
    }))
  });

  return NextResponse.json({ url: session.url });
}

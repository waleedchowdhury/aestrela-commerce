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

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return NextResponse.json({ error: "PayPal is ready to connect. Add PayPal credentials in .env." }, { status: 503 });
  }

  const paypal = await import("@paypal/checkout-server-sdk");
  const environment =
    process.env.PAYPAL_ENVIRONMENT === "live"
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
  const client = new paypal.core.PayPalHttpClient(environment);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderRequest = new paypal.orders.OrdersCreateRequest();
  orderRequest.prefer("return=representation");
  orderRequest.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: subtotal.toFixed(2)
        },
        items: items.map((item) => ({
          name: `${item.name} - Size ${item.size}`,
          quantity: String(item.quantity),
          unit_amount: {
            currency_code: "USD",
            value: item.price.toFixed(2)
          }
        }))
      }
    ],
    application_context: {
      return_url: `${origin}/shop?checkout=paypal-success`,
      cancel_url: `${origin}/shop?checkout=cancelled`
    }
  });

  const order = await client.execute(orderRequest);
  const approval = order.result.links.find((link: { rel: string }) => link.rel === "approve");

  return NextResponse.json({ url: approval?.href });
}

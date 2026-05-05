import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart-provider";
import { getSiteChrome } from "@/lib/store";

export const metadata: Metadata = {
  title: "AESTRÉLA | Premium Commerce",
  description: "Premium AESTRÉLA fashion storefront with curated collections and global checkout."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chrome = await getSiteChrome();

  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header announcement={chrome.announcement} />
          {children}
          <Footer footer={chrome.footer} navItems={chrome.footerNav} />
        </CartProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
};

export const metadata: Metadata = {
  title: "Battleboard — Fitness Competition",
  description: "Compete with your mates on who trains hardest. AI scores any workout fairly.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full" style={{ backgroundColor: "var(--bg-base)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Roof Building Solutions",
  description: "Cement, sand, pipes, paints and all civil materials, delivered to your site.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "One Roof", statusBarStyle: "default" },
};

// Orders, stock and prices must be fresh on every request, so nothing is built statically.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

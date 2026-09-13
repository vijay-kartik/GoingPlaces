import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Honeymoon Trip · Dubai",
  description: "Our Dubai honeymoon, on a map.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1d2a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      {/* Scrolling is locked per-screen, not here: the map fills the viewport and must not
          scroll, but list screens need the document to scroll normally. */}
      <body className="h-full">{children}</body>
    </html>
  );
}

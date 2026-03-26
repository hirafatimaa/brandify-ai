import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brandify AI - Instant Brand Identity Generation",
  description: "Generate complete brand identities powered by AI. Create taglines, color palettes, logo concepts, and social media content in seconds.",
  keywords: "branding, AI, logo generation, brand identity, marketing",
  openGraph: {
    title: "Brandify AI",
    description: "Generate complete brand identities powered by AI in seconds",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}

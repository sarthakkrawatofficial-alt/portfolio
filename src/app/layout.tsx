import type { Metadata, Viewport } from "next";
import { asset } from "@/lib/asset";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sarthakkrawatofficial-alt.github.io/portfolio/"),
  title: "Sarthak Rawat — Video Editor & Motion Designer",
  description:
    "Sarthak Rawat is a video editor and motion designer in Noida, India, making SaaS animation, explainers, reels and trailers. Currently at TestMu AI.",
  openGraph: {
    title: "Sarthak Rawat — Video Editor & Motion Designer",
    description: "Motion designer and video editor at TestMu AI. SaaS animation, explainers, reels and trailers. Showreel 2026 inside.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Sarthak Rawat — Showreel 2026" }],
  },
  twitter: { card: "summary_large_image", title: "Sarthak Rawat — Video Editor & Motion Designer", images: ["/og.jpg"] },
  icons: {
    icon: [
      { url: asset("/icon.svg?v=3"), type: "image/svg+xml" },
      { url: asset("/icon-32.png?v=3"), sizes: "32x32", type: "image/png" },
    ],
    apple: asset("/apple-touch-icon.png?v=3"),
  },
};

export const viewport: Viewport = { themeColor: "#EFE4CF", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js");try{if(localStorage.getItem("sr-intro-v3")==="1")document.documentElement.classList.add("seen")}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

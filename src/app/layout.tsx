import type { Metadata, Viewport } from "next";
import { asset } from "@/lib/asset";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/jetbrains-mono";
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
  icons: { icon: asset("/icon.svg") },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=new URLSearchParams(location.search).get("theme");if(t&&/^(ember|charcoal|cobalt|violet|beige)$/.test(t)){document.documentElement.dataset.theme=t}}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

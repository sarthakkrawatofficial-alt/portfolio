import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sarthakrawat.vercel.app"),
  title: "Sarthak Rawat — Video Editor & Motion Designer",
  description:
    "Sarthak Rawat is a video editor and motion designer in Noida, India, cutting SaaS explainers, reels, trailers and documentary-style films that people remember.",
  openGraph: {
    title: "Sarthak Rawat — Video Editor & Motion Designer",
    description: "Edits and motion design for brands with something worth saying.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Sarthak Rawat — Video Editor & Motion Designer" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#070707", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

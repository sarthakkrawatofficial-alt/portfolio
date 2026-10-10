"use client";
import type { SiteContent } from "@/content/site";
import SmoothScroll from "./motion/SmoothScroll";
import Cursor from "./motion/Cursor";
import PageTransition from "./motion/PageTransition";
import { VideoModalProvider } from "./VideoModal";
import Nav from "./Nav";
import Hero from "./sections/Hero";
import StatsBand from "./sections/StatsBand";
import Work from "./sections/Work";
import CaseTeaser from "./sections/CaseTeaser";
import Services from "./sections/Services";
import Process from "./sections/Process";
import About from "./sections/About";
import Testimonials from "./sections/Testimonials";
import Contact from "./sections/Contact";

export default function Portfolio({ content: c }: { content: SiteContent }) {
  return (
    <VideoModalProvider>
      <SmoothScroll />
      <PageTransition name={c.settings.name} />
      <Cursor />
      <Nav available={c.settings.available} />
      <main className="grain">
        <Hero settings={c.settings} projects={c.projects} />
        <StatsBand stats={c.stats.map((s) => (/year/i.test(s.label) ? { ...s, value: c.settings.yearsExperience } : s))} clients={c.clients} />
        <Work projects={c.projects} />
        <CaseTeaser />
        <Services />
        <Process />
        <About settings={c.settings} journey={c.journey} />
        <Testimonials items={c.testimonials} />
        <Contact settings={c.settings} />
      </main>
    </VideoModalProvider>
  );
}

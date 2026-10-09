"use client";
import type { SiteContent } from "@/content/site";
import SmoothScroll from "./motion/SmoothScroll";
import Cursor from "./motion/Cursor";
import PageTransition from "./motion/PageTransition";
import { VideoModalProvider } from "./VideoModal";
import Nav from "./Nav";
import Hero from "./sections/Hero";
import StatsBand from "./sections/StatsBand";
import Showreel from "./sections/Showreel";
import Work from "./sections/Work";
import Services from "./sections/Services";
import Process from "./sections/Process";
import Tools from "./sections/Tools";
import About from "./sections/About";
import Testimonials from "./sections/Testimonials";
import Faq from "./sections/Faq";
import Contact from "./sections/Contact";
import VoltStrip from "./sections/VoltStrip";

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
        <Showreel settings={c.settings} projects={c.projects} stats={c.stats} clients={c.clients} />
        <Work projects={c.projects} />
        <Services />
        <Process />
        <Tools tools={c.tools} />
        <About settings={c.settings} journey={c.journey} />
        <VoltStrip />
        <Testimonials items={c.testimonials} />
        <Faq items={c.faqs} email={c.settings.email} />
        <Contact settings={c.settings} />
      </main>
    </VideoModalProvider>
  );
}

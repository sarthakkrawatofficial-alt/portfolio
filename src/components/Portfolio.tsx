"use client";
import type { SiteContent } from "@/content/site";
import SmoothScroll from "./motion/SmoothScroll";
import { PlayerProvider } from "./v3/Player";
import Preloader from "./v3/Preloader";
import PageWipe from "./v3/PageWipe";
import Cursor from "./v3/Cursor";
import Playhead from "./v3/Playhead";
import Nav from "./v3/Nav";
import Hero from "./v3/Hero";
import Showreel from "./v3/Showreel";
import Stats from "./v3/Stats";
import Work from "./v3/Work";
import Cases from "./v3/Cases";
import Services from "./v3/Services";
import About from "./v3/About";
import Testimonials from "./v3/Testimonials";
import Contact from "./v3/Contact";

export default function Portfolio({ content: c }: { content: SiteContent }) {
  const s = c.settings;
  return (
    <PlayerProvider>
      <SmoothScroll />
      <Preloader name={s.name} />
      <PageWipe />
      <Cursor />
      <Playhead />
      <Nav email={s.email} available={s.available} />
      <main>
        <Hero settings={s} />
        <Showreel id={s.showreelId} />
        <Stats stats={c.stats.map((x) => (/year/i.test(x.label) ? { ...x, value: s.yearsExperience } : x))} clients={c.clients} />
        <Work projects={c.projects} />
        <Cases />
        <Services />
        <About settings={s} journey={c.journey} />
        <Testimonials items={c.testimonials} />
        <Contact settings={s} />
      </main>
    </PlayerProvider>
  );
}

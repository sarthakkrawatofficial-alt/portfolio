import SectionHead from "./SectionHead";
import Reveal from "../motion/Reveal";

const SERVICES: [string, string, string][] = [
  ["SaaS & product animation", "UI walkthroughs, feature explainers and launch videos. I rebuild the interface in After Effects so it moves the way the story needs.", "16:9 · 30–90 s"],
  ["Explainers & talking heads", "Long-form with a presenter: chapter cards, on-screen diagrams and B-roll that follow the script line by line.", "16:9 · 2–10 min"],
  ["Reels & shorts", "Vertical cuts with captions and graphics designed for 9:16 from the start, not cropped from the wide version.", "9:16 · under 60 s"],
  ["Trailers & promos", "Podcast trailers, event and tour promos. Hook first, then the pitch.", "Any ratio"],
  ["Documentary edits", "Interviews and archive shaped into a story with a beginning, a turn and a payoff.", "16:9 · long-form"],
];

export default function Services() {
  return (
    <section id="services" className="relative py-20 md:py-28">
      <div className="wrap">
        <SectionHead lines={["What you can hire me for"]} aside={<p>Edit and motion are done by me, together. Sound and grade happen in the same pass.</p>} />
        <Reveal as="ul" className="mt-10 border-t border-line md:mt-14" y={24}>
          {SERVICES.map(([title, text, format]) => (
            <li key={title} className="grid grid-cols-12 items-baseline gap-x-6 gap-y-2 border-b border-line py-6 md:py-7">
              <h3 className="col-span-12 text-2xl font-bold tracking-tight md:col-span-4 md:text-[28px]">{title}</h3>
              <p className="col-span-12 max-w-xl leading-relaxed text-fg/65 md:col-span-6">{text}</p>
              <span className="label col-span-12 text-muted md:col-span-2 md:text-right">{format}</span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

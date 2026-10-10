import { CASES } from "@/content/cases";
import { asset } from "@/lib/asset";
import SectionHead from "./SectionHead";
import Reveal from "../motion/Reveal";

export default function CaseTeaser() {
  return (
    <section id="cases" className="relative border-t border-line py-20 md:py-28">
      <div className="wrap">
        <SectionHead lines={["How three of these got made"]} aside={<p>The brief, what I built and why it is built that way.</p>} />
        <Reveal className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3">
          {CASES.map((c) => (
            <a key={c.id} href={asset(`/case-studies/#${c.id}`)} className="group block">
              <div className="relative aspect-video overflow-hidden rounded-[20px] border border-line bg-card transition-colors duration-500 group-hover:border-lime/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(c.images[0])} alt={`${c.title}, still frame`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight md:text-2xl">{c.title}</h3>
              <div className="label mt-1.5 text-lime">{c.client}</div>
              <p className="mt-3 leading-relaxed text-fg/60">{c.summary}</p>
              <span className="mt-4 inline-block font-semibold text-fg underline decoration-lime decoration-2 underline-offset-4">Read the case study</span>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

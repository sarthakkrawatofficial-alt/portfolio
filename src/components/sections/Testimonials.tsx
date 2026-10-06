import type { Testimonial } from "@/content/site";
import { asset } from "@/lib/asset";
import SectionHead from "./SectionHead";
import Reveal from "../motion/Reveal";

function Quote({ t, big = false }: { t: Testimonial; big?: boolean }) {
  const parts = t.highlight && t.quote.includes(t.highlight) ? t.quote.split(t.highlight) : [t.quote];
  return (
    <figure className={`card relative mb-4 break-inside-avoid p-6 md:mb-5 md:p-8 ${big ? "border-lime/30 bg-gradient-to-br from-lime/[0.07] to-transparent" : ""}`}>
      <svg width="34" height="26" viewBox="0 0 34 26" className="text-lime" aria-hidden><path d="M0 26V15C0 6 5 1 14 0v5c-5 1-7 4-7 9h7v12zm20 0V15c0-9 5-14 14-15v5c-5 1-7 4-7 9h7v12z" fill="currentColor" /></svg>
      <blockquote className={`mt-5 leading-snug tracking-tight text-fg/80 ${big ? "text-2xl font-semibold md:text-[28px]" : "text-[17px]"}`}>
        {parts.length > 1 ? (<>{parts[0]}<mark className="bg-transparent text-lime">{t.highlight}</mark>{parts.slice(1).join(t.highlight)}</>) : t.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {t.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(t.avatar)} alt="" className={`h-11 w-11 rounded-full border border-line ${t.isLogo ? "bg-white/90 object-contain p-1.5" : "object-cover"}`} loading="lazy" />
        ) : (
          <span className="grid h-11 w-11 place-items-center rounded-full bg-lime font-bold text-bg">{t.name[0]}</span>
        )}
        <div>
          <div className="font-semibold">{t.name}</div>
          <div className="label text-[10px] text-muted">{t.company}</div>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section id="testimonials" className="tex relative py-24 md:py-36">
      <div aria-hidden className="tex-layer tex-glow" />
      <div aria-hidden className="tex-layer tex-grain" />
      <div className="wrap">
        <SectionHead index="07" label="Kind words" lines={["People I've", { text: "cut for.", className: "text-lime" }]} aside={<p>From newsrooms under deadline to healthcare brands and universities — in their words.</p>} />
        <Reveal className="mt-12 columns-1 gap-4 md:mt-16 md:columns-2 md:gap-5 lg:columns-3">
          {items.map((t) => <Quote key={t.name} t={t} />)}
        </Reveal>
      </div>
    </section>
  );
}

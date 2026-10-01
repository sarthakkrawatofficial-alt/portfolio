"use client";
import { useState } from "react";
import type { Faq as F } from "@/content/site";
import SectionHead from "./SectionHead";
import { ScrollTrigger } from "@/lib/gsap";

export default function Faq({ items, email }: { items: F[]; email: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const toggle = (i: number) => { setOpen((o) => (o === i ? null : i)); setTimeout(() => ScrollTrigger.refresh(), 550); };
  return (
    <section id="faq" className="relative py-24 md:py-36">
      <div className="wrap grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <SectionHead index="08" label="FAQ" lines={["Good", { text: "questions.", className: "text-fg/35" }]} />
          <p className="mt-6 max-w-sm text-fg/60">Something else on your mind? <a href={`mailto:${email}`} className="text-lime underline-offset-4 hover:underline">Email me</a> — I read everything.</p>
        </div>
        <div className="md:col-span-7">
          {items.map((f, i) => {
            const on = open === i;
            return (
              <div key={i} className={`mb-3 rounded-[22px] border transition-colors duration-300 ${on ? "border-lime/40 bg-card" : "border-line bg-fg/[0.015] hover:border-fg/20"}`}>
                <button className="flex w-full items-center justify-between gap-6 p-5 text-left md:p-6" onClick={() => toggle(i)} aria-expanded={on}>
                  <span className="flex items-baseline gap-4">
                    <span className="label text-[10px] text-lime">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-lg font-semibold tracking-tight md:text-xl">{f.question}</span>
                  </span>
                  <span className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-500 ${on ? "rotate-45 bg-lime text-bg" : "border border-line"}`} aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.6" /></svg>
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-6 leading-relaxed text-fg/65 md:pl-[3.9rem] md:pr-16">{f.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

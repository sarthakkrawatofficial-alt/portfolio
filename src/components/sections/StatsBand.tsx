"use client";
import Counter from "../motion/Counter";
import type { Stat } from "@/content/site";

export default function StatsBand({ stats, clients }: { stats: Stat[]; clients: string[] }) {
  const list = [...clients, ...clients];
  return (
    <section className="relative border-y border-line">
      <div className="wrap grid grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className={`py-8 md:py-12 ${i % 2 ? "pl-5 md:pl-8" : "md:pl-8"} ${i ? "md:border-l md:border-line" : "md:pl-0"} ${i % 2 ? "border-l border-line md:border-l" : ""} ${i > 1 ? "border-t border-line md:border-t-0" : ""}`}>
            <Counter value={s.value} suffix={s.suffix} className="block text-6xl font-extrabold tracking-[-0.035em] md:text-7xl" />
            <div className="label mt-2 text-muted">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="fade-x overflow-hidden border-t border-line py-5">
        <div className="marquee" style={{ ["--dur" as string]: "45s" }}>
          {list.map((c, i) => (
            <span key={i} className="flex shrink-0 items-center whitespace-nowrap pr-10 text-xl font-semibold tracking-tight text-fg/45 md:text-2xl">
              {c}
              <svg className="ml-10 text-lime" width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M7 0v14M0 7h14M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" /></svg>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

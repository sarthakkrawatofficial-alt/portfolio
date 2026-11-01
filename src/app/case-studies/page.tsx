import type { Metadata } from "next";
import { CASES } from "@/content/cases";
import { fallbackContent } from "@/content/site";
import { asset } from "@/lib/asset";
import PageWipe from "@/components/v3/PageWipe";

export const metadata: Metadata = {
  title: "Case studies — Sarthak Rawat",
  description: "How three videos got made: the brief, what was built and why. TestMu AI, a Claude Cowork concept film and Workstatus.",
};

export default function CaseStudies() {
  const s = fallbackContent.settings;
  return (
    <main className="min-h-screen bg-cream text-espresso">
      <PageWipe enter />
      <header className="wrap flex h-16 items-center justify-between md:h-[72px]">
        <a href={asset("/")} data-transition data-label="Home" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight" aria-label="Sarthak Rawat — home">
          <span className="block h-2.5 w-2.5 rotate-45 bg-saffron" />
          <span className="font-display text-[21px] font-bold tracking-[-0.03em]">Sarthak</span>
        </a>
        <a href={asset("/#work")} data-transition data-label="Work" className="rounded-full border border-espresso/20 px-5 py-2.5 text-[15px] font-medium hover:border-espresso">All work</a>
      </header>

      <div className="wrap pb-10 pt-14 md:pt-24">
        <h1 className="h-display text-[clamp(2.8rem,8vw,7.5rem)]">Case studies</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-espresso/70">Three projects, opened up: what the video was for, what I made and the decisions behind it.</p>
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Case studies">
          {CASES.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="rounded-full border border-espresso/10 bg-cream-lt px-4 py-2.5 text-sm font-medium text-espresso/75 hover:border-espresso hover:text-espresso">{c.title}</a>
          ))}
        </nav>
      </div>

      {CASES.map((c) => (
        <article key={c.id} id={c.id} className="scroll-mt-6 border-t border-espresso/10 py-16 md:py-24">
          <div className="wrap">
            <div className="grid gap-8 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-5">
                <div className="text-[15px] text-saffron-dp">{c.client.replace(/\s*·\s*/g, ", ")}</div>
                <h2 className="mt-3 text-[clamp(2rem,4.2vw,3.75rem)] font-display font-bold leading-[1.02] tracking-[-0.04em]">{c.title}</h2>
                <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-espresso/10 pt-6">
                  <div><dt className="text-[14px] text-cocoa">Role</dt><dd className="mt-1.5 font-medium">{c.role}</dd></div>
                  <div><dt className="text-[14px] text-cocoa">Format</dt><dd className="mt-1.5 font-medium">{c.format}</dd></div>
                </dl>
                {c.youtubeId && (
                  <a href={`https://www.youtube.com/watch?v=${c.youtubeId}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-saffron px-6 font-medium text-espresso">
                    Watch on YouTube
                  </a>
                )}
              </div>
              <div className="space-y-8 text-[17px] leading-relaxed text-espresso/75 md:col-span-7">
                <section><h3 className="mb-2 text-xl font-semibold tracking-tight text-espresso">The brief</h3><p>{c.context}</p></section>
                <section><h3 className="mb-2 text-xl font-semibold tracking-tight text-espresso">What I made</h3><p>{c.made}</p></section>
                <section>
                  <h3 className="mb-3 text-xl font-semibold tracking-tight text-espresso">Why it is built this way</h3>
                  <ul className="space-y-3">
                    {c.how.map((h) => (
                      <li key={h} className="flex gap-3"><span aria-hidden className="mt-[0.55em] h-2 w-2 shrink-0 rotate-45 bg-saffron" /><span>{h}</span></li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
              {c.images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={asset(src)} alt={`${c.title}, frame ${i + 1}`} loading="lazy" className="aspect-video w-full rounded-[18px] border border-espresso/10 object-cover" />
              ))}
            </div>
          </div>
        </article>
      ))}

      <footer className="border-t border-espresso/10">
        <div className="wrap flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl font-display text-[28px] font-bold tracking-[-0.03em]">Have a video that needs this kind of thinking?</p>
          <a href={`mailto:${s.email}`} className="inline-flex h-14 items-center gap-2 self-start rounded-full bg-saffron px-7 font-medium text-espresso md:self-auto">{s.email}</a>
        </div>
      </footer>
    </main>
  );
}

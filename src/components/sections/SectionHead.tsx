import SplitReveal from "../motion/SplitReveal";

export default function SectionHead({ index, label, lines, aside, className = "" }: { index: string; label: string; lines: (string | { text: string; className?: string })[]; aside?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div>
        <div className="label mb-5 flex items-center gap-3 text-muted">
          <span className="text-lime">{index}</span>
          <span className="h-px w-8 bg-line" />
          {label}
        </div>
        <SplitReveal lines={lines} className="h-section" />
      </div>
      {aside && <div className="max-w-sm text-fg/60 md:pb-3">{aside}</div>}
    </div>
  );
}

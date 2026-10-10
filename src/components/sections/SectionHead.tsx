import SplitReveal from "../motion/SplitReveal";

export default function SectionHead({ label, lines, aside, className = "" }: { /** kept for the unused legacy sections; no longer rendered */ index?: string; label?: string; lines: (string | { text: string; className?: string })[]; aside?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div>
        {label && <div className="label mb-4 text-muted">{label}</div>}
        <SplitReveal lines={lines} className="h-section" />
      </div>
      {aside && <div className="max-w-sm text-fg/60 md:pb-3">{aside}</div>}
    </div>
  );
}

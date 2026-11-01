/** Splits text into masked words > letters. Animate `.ch` (desktop) or `.w-in` (mobile). */
export default function Split({ text, charClass = "" }: { text: string; charClass?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="mask">
            <span className="w-in">
              {w.split("").map((c, j) => (
                <span key={j} className={`ch inline-block ${charClass}`}>{c}</span>
              ))}
            </span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

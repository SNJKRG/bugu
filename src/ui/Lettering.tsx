// Angular stroke letters drawn in the manner of the BUGU wordmark (same 38-unit cap height and stroke).
// Only the letters the site needs. Rendered twice: a light lip under a dark cut reads as an incision.
const GLYPHS: Record<string, [width: number, d: string]> = {
  N: [19, 'M3 33 L4 5 L16 31 L16 4'],
  E: [16, 'M15 5 L3 6 L4 32 L15 31 M4 18 L12 18'],
  O: [20, 'M11 4 L2 18 L10 33 L19 19 Z'],
  M: [25, 'M2 33 L4 5 L12 23 L21 5 L23 32'],
  A: [21, 'M2 33 L11 4 L19 32 M6 22 L16 21'],
  D: [19, 'M3 4 L4 33 L17 24 L15 9 Z'],
  C: [17, 'M16 5 L4 7 L3 30 L16 32'],
  U: [17, 'M2 5 L3 28 L15 33 L15 5'],
  I: [7, 'M3 4 L4 33'],
  S: [17, 'M15 6 L4 4 L2 15 L14 20 L13 32 L2 30'],
};
const GAP = 4;

export function Lettering({ word, className = '' }: { word: string; className?: string }) {
  let x = 0;
  const paths = [...word.toUpperCase()].map((ch, i) => {
    const [w, d] = GLYPHS[ch];
    const el = <path key={i} d={d} transform={`translate(${x} 0)`} />;
    x += w + GAP;
    return el;
  });
  return (
    <svg viewBox={`-1 0 ${x - GAP + 2} 38`} className={`lettering ${className}`} aria-hidden="true"
      fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <g className="lettering__lip" transform="translate(0 1.2)">{paths}</g>
      <g className="lettering__cut">{paths}</g>
    </svg>
  );
}

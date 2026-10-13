// Lucide icons, unmodified files from research-v3/ui-icons (ISC, see src/icons/LICENSE).
const files = import.meta.glob('../icons/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, svg]) => [
    path.match(/([\w-]+)\.svg$/)![1],
    svg.replace(/width="24"\s+height="24"/, 'width="1em" height="1em" aria-hidden="true" focusable="false"'),
  ]),
);

export type IconName =
  | 'arrow-left' | 'arrow-right' | 'calendar' | 'chevron-down' | 'clock' | 'external-link' | 'map-pin' | 'menu'
  | 'pause' | 'phone' | 'play' | 'search' | 'utensils' | 'volume-2' | 'volume-x' | 'x';

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <span className={`icon ${className}`} dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}

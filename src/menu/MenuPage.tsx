import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, som } from '../data/menu';
import { Footer, Header, Tabbar } from '../ui/Chrome';
import { Icon } from '../ui/Icon';

const norm = (s: string) => s.toLowerCase().replaceAll('ё', 'е');
const initialHash = location.hash.slice(1); // read once: the scroll spy rewrites the hash later
const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
};

export default function MenuPage() {
  const [q, setQ] = useState(() => new URLSearchParams(location.search).get('q') ?? '');
  const [active, setActive] = useState(() => location.hash.slice(1) || CATEGORIES[0].id);
  const chips = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const reset = () => { setQ(''); input.current?.focus(); };

  const needle = norm(q.trim());
  const shown = useMemo(
    () => CATEGORIES
      .map((c) => ({ ...c, items: needle ? c.items.filter((d) => norm(`${d.name} ${d.description}`).includes(needle)) : c.items }))
      .filter((c) => c.items.length),
    [needle],
  );
  const found = shown.reduce((n, c) => n + c.items.length, 0);

  // open the section from the address (/menu/#deserty)
  useEffect(() => {
    if (initialHash) document.getElementById(initialHash)?.scrollIntoView();
  }, []);

  // active section follows the scroll and is written to the address, so Back/reload return to it
  useEffect(() => {
    let raf = 0;
    const spy = () => {
      raf = 0;
      const line = innerHeight * 0.3;
      const cats = [...document.querySelectorAll<HTMLElement>('.cat')];
      const passed = cats.filter((el) => el.getBoundingClientRect().top <= line).pop();
      const cur = passed ?? cats[0];
      if (!cur) return;
      setActive(cur.id);
      if (passed && location.hash !== `#${cur.id}`) history.replaceState(history.state, '', `${location.pathname}${location.search}#${cur.id}`);
    };
    const onScroll = () => { raf ||= requestAnimationFrame(spy); };
    addEventListener('scroll', onScroll, { passive: true });
    spy();
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [shown]);

  // keep the active chip in view inside the horizontal strip
  useEffect(() => {
    const row = chips.current;
    const chip = row?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (row && chip && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' });
    }
  }, [active]);

  return (
    <>
      <a className="skip-link" href="#menu-list">К списку блюд</a>
      <Header page="menu" />
      <main className="menu-page">
        <div className="wrap menu-head">
          <a className="link menu-head__back" href="/"><Icon name="arrow-left" />К истории</a>
          <h1 className="menu-head__title">Меню</h1>
        </div>

        <div className="wrap menu-grid">
          <div className="menu-tools">
            <div className="search">
              <label htmlFor="menu-q">Поиск по меню</label>
              <div className="search__field">
                <Icon name="search" />
                <input ref={input} id="menu-q" type="search" value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Беш, куурдак, бозо…" autoComplete="off" enterKeyHint="search" />
                {q && (
                  <button type="button" className="search__clear" onClick={reset} aria-label="Очистить поиск">
                    <Icon name="x" />
                  </button>
                )}
              </div>
            </div>
            <nav className="chips" aria-label="Разделы меню" ref={chips}>
              {shown.map((c) => (
                <a key={c.id} data-id={c.id} href={`#${c.id}`} aria-current={active === c.id ? 'true' : undefined}>
                  {c.title}{needle && <small>{c.items.length}</small>}
                </a>
              ))}
            </nav>
          </div>

          <div id="menu-list" className="menu-list">
            <p className="sr-only" aria-live="polite">{needle ? `Найдено: ${found} ${plural(found, 'позиция', 'позиции', 'позиций')}` : ''}</p>
            {shown.map((c) => (
              <section key={c.id} id={c.id} className="cat" aria-labelledby={`${c.id}-t`}>
                <h2 id={`${c.id}-t`} className="cat__title">{c.title}</h2>
                <ul className="items">
                  {c.items.map((d) => (
                    <li key={d.name} className="item">
                      <div className="item__line">
                        <h3 className="item__name">{d.name}</h3>
                        <span className="item__dots" aria-hidden="true" />
                        <span className="price">{som(d.price)}</span>
                      </div>
                      {d.description && <p className="item__desc">{d.description}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {!found && (
              <div className="empty">
                <p>По запросу «{q.trim()}» ничего нет. Попробуйте другое слово или откройте разделы.</p>
                <button type="button" className="btn btn--line" onClick={reset}>Сбросить поиск</button>
              </div>
            )}
            <div className="menu-end">
              <a className="btn btn--solid" href="/#bron">Забронировать стол</a>
              <a className="link" href="/"><Icon name="arrow-left" />Вернуться к истории</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Tabbar page="menu" />
    </>
  );
}

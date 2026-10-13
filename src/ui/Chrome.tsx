import { useEffect, useState } from 'react';
import { bookingHref, SITE } from '../data/site';
import { Icon } from './Icon';

/** BUGU wordmark, approximate reconstruction (research-v3/brand); replace with the restaurant's master file. */
export function Wordmark({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 96 38" className={className} fill="none" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path
        d="M5 4 L13 8 L9 14 L19 20 L2 33 Z M26 5 L27 28 L40 33 L40 5 M64 4 L45 23 L57 32 L69 23 L59 23 M76 6 L77 30 L90 31 L89 5"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

type Page = 'home' | 'menu';

/** Top bar. Transparent over the story, paper once the story is scrolled past (or always on /menu/). */
export function Header({ page }: { page: Page }) {
  const [solid, setSolid] = useState(page === 'menu');
  useEffect(() => {
    const story = document.getElementById('istoriya');
    if (!story) return;
    // a 1px line at the header's bottom edge: solid as soon as the story no longer reaches under the bar
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), { rootMargin: `-63px 0px -${innerHeight - 64}px 0px` });
    io.observe(story);
    return () => io.disconnect();
  }, []);
  const home = page === 'home' ? '' : '/';
  return (
    <header className="header" data-solid={solid || undefined}>
      <a className="header__brand" href={page === 'home' ? '#istoriya' : '/'}>
        <Wordmark className="header__logo" title="BUGU, на главную" />
      </a>
      <nav className="header__nav" aria-label="Разделы">
        <a href={`${home}#istoriya`}>История</a>
        <a href={`${home}#blyuda`}>Блюда</a>
        <a href="/menu/" aria-current={page === 'menu' ? 'page' : undefined}>Меню</a>
        <a href={`${home}#kontakty`}>Контакты</a>
      </nav>
      <a className="header__phone" href={SITE.tel} aria-label={`Позвонить: ${SITE.phone}`}><Icon name="phone" /></a>
      <a className="btn btn--solid header__cta" href={`${home}#bron`}>Забронировать</a>
    </header>
  );
}

/** Phone-only bottom bar with the three main actions (pattern from Navat / Nakta). */
export function Tabbar({ page }: { page: Page }) {
  const home = page === 'home' ? '' : '/';
  return (
    <nav className="tabbar" aria-label="Быстрые действия">
      <a href="/menu/" aria-current={page === 'menu' ? 'page' : undefined}><Icon name="utensils" />Меню</a>
      <a href={`${home}#bron`} className="tabbar__key"><Icon name="calendar" />Бронь</a>
      <a href={`${home}#kontakty`}><Icon name="map-pin" />Адрес</a>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <Wordmark className="footer__logo" title="BUGU" />
        <p className="footer__tag">{SITE.descriptor}</p>
      </div>
      <div className="footer__grid">
        <p>{SITE.city}, {SITE.address}<br />Ежедневно {SITE.hours}</p>
        <p>
          <a href={SITE.tel}>{SITE.phone}</a><br />
          <a href={bookingHref} target="_blank" rel="noreferrer">WhatsApp</a> · <a href={SITE.instagram} target="_blank" rel="noreferrer">Instagram</a>
        </p>
        <p><a href="/menu/">Меню</a><br /><a href="/#bron">Забронировать стол</a></p>
      </div>
    </footer>
  );
}

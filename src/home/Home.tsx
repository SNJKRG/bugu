import { MotionConfig } from 'motion/react';
import { DISHES_INTRO, SPACE_COPY } from '../data/copy';
import { foodSet, HIGHLIGHTS, SPACE, spaceSet } from '../data/media';
import { CATEGORIES, DISHES, som } from '../data/menu';
import { bookingHref, SITE } from '../data/site';
import { Footer, Header, Tabbar } from '../ui/Chrome';
import { Icon } from '../ui/Icon';
import { Story } from './Story';

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#blyuda">Пропустить историю</a>
      <Header page="home" />
      <main>
        <Story />
        <Dishes />
        <Space />
        <Visit />
      </main>
      <Footer />
      <Tabbar page="home" />
    </MotionConfig>
  );
}

function Dishes() {
  const items = HIGHLIGHTS.map((h) => {
    const d = DISHES.find((x) => x.name === h.name)!;
    const cat = CATEGORIES.find((c) => c.title === d.category)!;
    return { ...h, ...d, href: `/menu/?q=${encodeURIComponent(d.name)}#${cat.id}` };
  });
  return (
    <section id="blyuda" className="section section--paper" aria-labelledby="blyuda-t">
      <div className="wrap">
        <div className="section__head">
          <h2 id="blyuda-t" className="section__title">{DISHES_INTRO.title}</h2>
        </div>
        <ul className="dishes">
          {items.map((d) => (
            <li key={d.slug} className="dish">
              <a href={d.href} className="dish__link">
                <span className="dish__photo">
                  <img srcSet={foodSet(d.slug)} sizes="(min-width: 1100px) 24vw, (min-width: 640px) 46vw, 92vw" src={`/food/${d.slug}-600.webp`}
                    alt={d.alt} width={600} height={750} loading="lazy" decoding="async" />
                </span>
                <span className="dish__row">
                  <span className="dish__name">{d.name}</span>
                  <span className="price">{som(d.price)}</span>
                </span>
                <span className="dish__text">{d.description}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="section__foot">
          <a className="btn btn--solid" href="/menu/">Всё меню</a>
        </div>
      </div>
    </section>
  );
}

function Space() {
  return (
    <section id="zal" className="section" aria-labelledby="zal-t">
      <div className="wrap space">
        <div className="space__text">
          <h2 id="zal-t" className="section__title">{SPACE_COPY.title}</h2>
          <p className="section__lead">{SPACE_COPY.text}</p>
        </div>
        {SPACE.map((p) => (
          <figure key={p.slug} className={`space__photo space__photo--${p.slug}`}>
            <img srcSet={spaceSet(p.slug)} sizes="(min-width: 900px) 34vw, 92vw" src={`/space/${p.slug}-700.webp`}
              alt={p.alt} loading="lazy" decoding="async" />
          </figure>
        ))}
      </div>
    </section>
  );
}

function Visit() {
  return (
    <section id="kontakty" className="section section--paper" aria-labelledby="kontakty-t">
      <div className="wrap visit">
        <div>
          <h2 id="kontakty-t" className="section__title">Приходите</h2>
          <dl className="facts">
            <div>
              <dt><Icon name="map-pin" />Адрес</dt>
              <dd>{SITE.city}, {SITE.address}<br />
                <a className="link" href={SITE.map} target="_blank" rel="noreferrer">Открыть в 2ГИС <Icon name="external-link" /></a>
              </dd>
            </div>
            <div>
              <dt><Icon name="clock" />Часы</dt>
              <dd>Ежедневно {SITE.hours}</dd>
            </div>
            <div>
              <dt><Icon name="phone" />Телефон и WhatsApp</dt>
              <dd><a href={SITE.tel}>{SITE.phone}</a></dd>
            </div>
          </dl>
        </div>

        <div id="bron" className="booking" aria-labelledby="bron-t">
          <h3 id="bron-t" className="booking__title">Забронировать стол</h3>
          <p>Напишите в WhatsApp или позвоните. Администратор ответит и подтвердит бронь. Сайт заявки не сохраняет и не подтверждает.</p>
          <div className="booking__actions">
            <a className="btn btn--solid" href={bookingHref} target="_blank" rel="noreferrer">Написать в WhatsApp <Icon name="external-link" /></a>
            <a className="btn btn--line" href={SITE.tel}><Icon name="phone" />Позвонить</a>
          </div>
          <p className="note">В сообщении уже есть шаблон: допишите дату, время и число гостей. Если нужна кабинка или детский стул, напишите об этом.</p>
        </div>
      </div>
    </section>
  );
}

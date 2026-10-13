import { createRef, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { animate, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { CHAPTERS } from '../data/copy';
import { HIGHLIGHTS, posterSet, SCENES, type Scene } from '../data/media';
import { CATEGORIES, DISHES, som } from '../data/menu';
import { Lettering } from '../ui/Lettering';
import { Icon } from '../ui/Icon';

// One sticky stage with five poster layers, five 140svh chapters scrolling over it. The scroll position drives
// everything; inside the story it is paged: one wheel turn, swipe or key press flips to the next stop and the
// flight plays out by itself. Per chapter, q = scroll progress from "top enters viewport bottom" (0) to "bottom
// leaves viewport top" (1). Text is fully visible while the chapter is pinned (q 0.417..0.583) and the next
// poster fades in between texts (q 0.117..0.30 of the incoming chapter).
const FADE_IN: [number, number] = [0.117, 0.3];
const TEXT: number[] = [0.3, 0.417, 0.583, 0.7];
// one flip: text out, the camera flight at a watchable pace, text in (seconds)
const FLIP = { out: 0.5, flight: 2.4, in: 0.6, plain: 1 };

export function Story() {
  const refs = useMemo(() => SCENES.map(() => createRef<HTMLElement>()), []);
  const reduce = !!useReducedMotion();
  const flip = useRef<(dir: number) => void>(() => {});

  useEffect(() => {
    const top = (el: Element) => el.getBoundingClientRect().top + scrollY;
    const els = () => refs.map((r) => r.current!);
    // stops: the middle of each chapter's pinned part (the first one from the very top), then the dishes
    const stops = () => [0, ...els().slice(1).map((el) => top(el) + (el.offsetHeight - innerHeight) / 2), top(document.getElementById('blyuda')!)];
    // where the flip from here goes, or undefined when the native scroll should take it (below the story)
    const target = (dir: number) => {
      const s = stops(), y = scrollY, last = s[s.length - 1];
      if (y > last + 2 || (dir > 0 && y >= last - 2)) return undefined;
      return dir > 0 ? s.find((v) => v > y + 2) : s.reverse().find((v) => v < y - 2);
    };
    let busy = false, held = false, lastWheel = -1e9, y0: number | null = null;
    let anim: ReturnType<typeof animate> | undefined;
    const go = (to: number) => {
      const y = scrollY, lo = Math.min(y, to), hi = Math.max(y, to);
      const onUpdate = (v: number) => scrollTo({ top: v, behavior: 'instant' });
      busy = held = true;
      if (reduce) { onUpdate(to); busy = false; return; }
      const done = () => { busy = false; };
      // the chapter whose flight lies on the way: scrub it linearly, at its own pace
      const at = (el: HTMLElement, q: number) => top(el) - innerHeight + q * (el.offsetHeight + innerHeight);
      const el = els().find((e, k) => k > 0 && lo < at(e, FADE_IN[0]) && at(e, FADE_IN[1]) < hi);
      if (!el) { anim = animate(y, to, { duration: FLIP.plain, ease: [0.65, 0, 0.35, 1], onUpdate, onComplete: done }); return; }
      const [a, b] = to > y ? [at(el, FADE_IN[0]), at(el, FADE_IN[1])] : [at(el, FADE_IN[1]), at(el, FADE_IN[0])];
      const [d1, d3] = to > y ? [FLIP.out, FLIP.in] : [FLIP.in, FLIP.out], total = d1 + FLIP.flight + d3;
      anim = animate(y, [y, a, b, to], {
        duration: total, times: [0, d1 / total, (d1 + FLIP.flight) / total, 1], ease: ['easeIn', 'linear', 'easeOut'], onUpdate, onComplete: done,
      });
    };
    flip.current = (dir) => { const to = target(dir); if (!busy && to !== undefined) go(to); };

    // a trackpad keeps sending wheel events long after the flip; they belong to the same gesture
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if (e.timeStamp - lastWheel > 200 && !busy) held = false;
      lastWheel = e.timeStamp;
      if (busy || held) return e.preventDefault();
      const to = target(Math.sign(e.deltaY));
      if (to === undefined) return;
      e.preventDefault();
      go(to);
    };
    const onTouchStart = (e: TouchEvent) => { y0 = e.touches.length === 1 ? e.touches[0].clientY : null; };
    const onTouchMove = (e: TouchEvent) => {
      if (busy) return e.cancelable && e.preventDefault();
      if (y0 === null) return;
      const dy = y0 - e.touches[0].clientY;
      if (!dy) return;
      const to = target(Math.sign(dy));
      if (to === undefined) return;
      if (e.cancelable) e.preventDefault();
      if (Math.abs(dy) > 24) { y0 = null; go(to); }
    };
    const KEYS: Record<string, number> = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 };
    const onKey = (e: KeyboardEvent) => {
      const dir = (KEYS[e.key] ?? 0) * (e.shiftKey ? -1 : 1);
      if (!dir || e.altKey || e.ctrlKey || e.metaKey || (e.key === ' ' && e.target !== document.body)) return;
      if ((e.target as Element).closest?.('input, textarea, select, [contenteditable]')) return;
      if (busy) return e.preventDefault();
      const to = target(dir);
      if (to === undefined) return;
      e.preventDefault();
      go(to);
    };
    const opts = { passive: false };
    addEventListener('wheel', onWheel, opts);
    addEventListener('touchstart', onTouchStart, opts);
    addEventListener('touchmove', onTouchMove, opts);
    addEventListener('keydown', onKey);
    return () => {
      anim?.stop();
      removeEventListener('wheel', onWheel);
      removeEventListener('touchstart', onTouchStart);
      removeEventListener('touchmove', onTouchMove);
      removeEventListener('keydown', onKey);
    };
  }, [refs, reduce]);

  return (
    <section id="istoriya" className="story" aria-label="История Bugu в пяти сценах">
      <div className="chapters">
        {SCENES.map((s, i) => <Chapter key={s.id} scene={s} i={i} ref={refs[i]} reduce={reduce} />)}
      </div>
      <div className="stage">
        <div className="layers" aria-hidden="true">
          {SCENES.map((s, i) => <Layer key={s.id} scene={s} i={i} target={refs[i]} prev={refs[Math.max(0, i - 1)]} reduce={reduce} />)}
        </div>
        <button type="button" className="next" onClick={() => flip.current(1)} aria-label="Дальше">
          <Icon name="chevron-down" />
        </button>
      </div>
    </section>
  );
}

function useChapterProgress(target: RefObject<HTMLElement | null>) {
  return useScroll({ target, offset: ['start end', 'end start'] }).scrollYProgress;
}

// With camera-flight videos the motion lives in the videos, whose first and last frames are the posters
// themselves; the posters must then stay put, or the cut to and from a video would jump.
const STILL = SCENES.some((s) => s.transitionIn);
const EDGE = 0.06;
const local = (q: number) => (q - FADE_IN[0]) / (FADE_IN[1] - FADE_IN[0]);

function Layer({ scene, i, target, prev, reduce }: { scene: Scene; i: number; target: RefObject<HTMLElement | null>; prev: RefObject<HTMLElement | null>; reduce: boolean }) {
  const q = useChapterProgress(target);
  const qPrev = useChapterProgress(prev);
  const hasT = !!scene.transitionIn && !reduce;
  const opacity = useTransform(q, FADE_IN, i === 0 || hasT ? [1, 1] : [0, 1]);
  // gentle orbit drift: each stop slides sideways and settles, the direction alternates with the camera path
  const dir = i % 2 ? -1 : 1;
  const calm = reduce || STILL;
  const x = useTransform(q, [0.1, 0.9], calm ? ['0%', '0%'] : [`${1.4 * dir}%`, `${-1.4 * dir}%`]);
  const scale = useTransform(q, [0.1, 0.42], calm ? [1, 1] : [1.05, 1]);
  // Browsers decode video colour slightly differently from images, so the cuts between poster and video are
  // short dissolves (EDGE of the transition at each end) rather than hard switches.
  const imgOpacity = useTransform<number, number>(q, (v) => (!hasT || local(v) >= 1 - EDGE ? 1 : 0));
  const tOpacity = useTransform<number, number>(q, (v) => {
    const t = local(v);
    return t <= 0 || t >= 1 ? 0 : Math.min(1, t / EDGE, (1 - t) / EDGE);
  });

  // load media once the previous chapter starts entering, so a transition video is ready when it is needed
  const [near, setNear] = useState(i < 2);
  const [failed, setFailed] = useState(false);
  useMotionValueEvent(qPrev, 'change', (v) => { if (v > 0 && !near) setNear(true); });
  useMotionValueEvent(q, 'change', (v) => { if (v > 0 && !near) setNear(true); });

  return (
    <motion.div className="layer" style={{ opacity, '--fx': scene.focusX, '--fxw': scene.focusXWide ?? 0.5 } as never}>
      <motion.div className="frame" style={{ x, scale }}>
        {near && (
          <motion.img
            className="frame__img" style={{ opacity: imgOpacity }}
            srcSet={posterSet(scene.poster)} sizes="(max-aspect-ratio: 1/1) 180svh, 100vw" src={`${scene.poster}-1672.webp`}
            alt="" width={1672} height={941} decoding="async" fetchPriority={i === 0 ? 'high' : 'low'}
            onError={() => setFailed(true)}
          />
        )}
        {/* the glow belongs to the poster: a layer with a transition is opaque, so it must not glow over the previous scene */}
        {!failed && (
          <motion.span className="ember-wrap" style={{ opacity: imgOpacity }}>
            <span className="ember" style={{ left: `${scene.fire[0] * 100}%`, top: `${scene.fire[1] * 100}%` }} />
          </motion.span>
        )}
        {scene.loop && near && !reduce && <LoopVideo src={scene.loop} q={q} />}
        {hasT && near && <TransitionVideo src={scene.transitionIn!} q={q} opacity={tOpacity} />}
      </motion.div>
    </motion.div>
  );
}

function LoopVideo({ src, q }: { src: string; q: MotionValue<number> }) {
  const ref = useRef<HTMLVideoElement>(null);
  const sync = () => {
    const v = ref.current, p = q.get();
    if (!v) return;
    if (p > FADE_IN[1] && p < 0.9) v.play().catch(() => {}); else v.pause();
  };
  useMotionValueEvent(q, 'change', sync);
  useEffect(sync);
  // a failed video just disappears and leaves the poster
  return <video ref={ref} className="frame__video" src={src} muted loop playsInline preload="metadata" onError={(e) => e.currentTarget.remove()} />;
}

// The video may come with a fire track (same name, .json): per frame where the fire of the start and the end
// drawing lands, and how far the dissolve has gone. Two ember glows follow it, so the glow travels with the
// fire instead of switching off and on at the cuts.
type Track = number[][]; // [ax, ay, bx, by, w, smoke], positions 0..1 of the frame, y from the top

function TransitionVideo({ src, q, opacity }: { src: string; q: MotionValue<number>; opacity: MotionValue<number> }) {
  const ref = useRef<HTMLVideoElement>(null);
  const glows = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)];
  const track = useRef<Track | null>(null);
  const raf = useRef(0);
  useEffect(() => {
    fetch(src.replace(/\.mp4$/, '.json')).then((r) => (r.ok ? r.json() : null)).then((j) => { track.current = j?.frames ?? null; }).catch(() => {});
  }, [src]);
  useMotionValueEvent(q, 'change', (p) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const v = ref.current;
      if (!v || !v.duration) return;
      const t = Math.min(1, Math.max(0, (p - FADE_IN[0]) / (FADE_IN[1] - FADE_IN[0])));
      v.currentTime = t * (v.duration - 0.05);
      const fr = track.current?.[Math.round(t * (track.current.length - 1))];
      if (!fr) return;
      glows.forEach((g, k) => {
        const el = g.current;
        if (!el) return;
        el.style.opacity = String(k ? fr[4] : 1 - fr[4]);
        const ember = el.firstElementChild as HTMLElement;
        ember.style.left = `${fr[2 * k] * 100}%`;
        ember.style.top = `${fr[2 * k + 1] * 100}%`;
      });
    });
  });
  return (
    <>
      <motion.video ref={ref} className="frame__video" style={{ opacity }} src={src} muted playsInline preload="auto" onError={(e) => e.currentTarget.remove()} />
      <motion.span className="ember-wrap" style={{ opacity }}>
        {glows.map((g, k) => <span key={k} ref={g} className="ember-wrap" style={{ opacity: 0 }}><span className="ember" /></span>)}
      </motion.span>
    </>
  );
}

// "Bugu" inside a title becomes an accent
const accent = (t: string) => t.split(/(Bugu)/).map((part, k) => (part === 'Bugu' ? <em key={k} className="accent">Bugu</em> : part));

const menuHref = (name: string) => {
  const d = DISHES.find((x) => x.name === name)!;
  return `/menu/?q=${encodeURIComponent(name)}#${CATEGORIES.find((c) => c.title === d.category)!.id}`;
};

// The four drawn dishes. Two copies exist: around the table on wide screens / as a strip on phones (.sdishes),
// and a compact row under the title on 16:10–4:3 screens (.sdishes-inline). CSS shows exactly one.
function DishRow({ className, slots }: { className: string; slots?: Scene['dishSlots'] }) {
  return (
    <ul className={className} aria-label="Четыре блюда Bugu, рисунки">
      {HIGHLIGHTS.map((h, k) => {
        const d = DISHES.find((x) => x.name === h.name)!;
        const slot = slots?.[k];
        return (
          <li key={h.slug} className="sdish" style={slot && ({ '--l': slot.left ?? 'auto', '--r': slot.right ?? 'auto', '--t': slot.top } as never)}>
            <a href={menuHref(h.name)}>
              <img src={`/illustrations/${h.slug}-640.webp`} alt={`Рисунок: ${h.name}`} width={640} height={640} loading="lazy" decoding="async" />
              <span className="sdish__name">{h.name}</span>
              <span className="sdish__price">{som(d.price)}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function Chapter({ scene, i, ref, reduce }: { scene: Scene; i: number; ref: RefObject<HTMLElement | null>; reduce: boolean }) {
  const q = useChapterProgress(ref);
  const c = CHAPTERS[i];
  const opacity = useTransform(q, TEXT, i === 0 ? [1, 1, 1, 0] : [0, 1, 1, 0]);
  const y = useTransform(q, TEXT, reduce ? [0, 0, 0, 0] : [24, 0, 0, -24]);
  const H = i === 0 ? 'h1' : 'h2';
  const pos = { '--l': scene.copy.left ?? 'auto', '--r': scene.copy.right ?? 'auto', '--t': scene.copy.top, '--w': scene.copy.width };
  const card = scene.card;
  const cardDish = card && DISHES.find((d) => d.name === (card.dish ?? card.title));

  return (
    <article ref={ref} id={`glava-${i + 1}`} className="chapter" aria-labelledby={`glava-${i + 1}-t`}>
      <div className="chapter__pin">
        <motion.div className={`copy copy--${i + 1}`} style={{ opacity, y, ...pos } as never}>
          {c.carved && (
            <p className="carved" aria-label={c.carved.join(' · ')}>
              {c.carved.map((w) => <Lettering key={w} word={w} />)}
            </p>
          )}
          {c.eyebrow && <p className="copy__eyebrow">{c.eyebrow}</p>}
          <H id={`glava-${i + 1}-t`} className="copy__title">
            {i === 0 && <span className="sr-only">BUGU. </span>}{accent(c.title)}
          </H>
          {c.text && <p className="copy__text">{accent(c.text)}</p>}
          <p className="sr-only">Иллюстрация: {scene.alt}.</p>
          {i === 0 && (
            <div className="copy__actions">
              <a className="btn btn--solid" href="/menu/">Меню</a>
              <a className="btn btn--line" href="#bron">Забронировать</a>
            </div>
          )}
          {scene.dishSlots && <DishRow className="sdishes-inline" />}
          {i === 3 && (
            <div className="copy__actions">
              <a className="btn btn--solid" href="/menu/">Всё меню <Icon name="arrow-right" /></a>
            </div>
          )}
          {i === 4 && (
            <div className="copy__actions">
              <a className="btn btn--solid" href="#bron">Забронировать стол</a>
            </div>
          )}
        </motion.div>

        {card && (
          <motion.a className={`scard scard--${card.side}`} href={cardDish ? menuHref(cardDish.name) : card.href} style={{ opacity }}>
            <img src={`/thumbs/${card.thumb}.webp`} alt="" width={640} height={480} loading="lazy" decoding="async" />
            <span className="scard__row">
              <span className="scard__text">
                <span className="scard__title">{card.title}</span>
                {(cardDish || card.meta) && <span className="scard__meta">{cardDish ? som(cardDish.price) : card.meta}</span>}
              </span>
              <Icon name="arrow-right" />
            </span>
          </motion.a>
        )}

        {scene.dishSlots && (
          <motion.div style={{ opacity }}>
            <DishRow className="sdishes" slots={scene.dishSlots} />
          </motion.div>
        )}
      </div>
    </article>
  );
}

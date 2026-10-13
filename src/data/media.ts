// Media layer. Everything visual that will be replaced later lives here.
//
// Scenes: concept posters from visuals-v2 (built by scripts/build-assets.sh into /public/scenes).
// When the final pencil videos are ready, drop them into /public/video and fill in:
//   loop          : S01..S05 calm loop for the stop (muted, plays only while the scene is on screen)
//   transitionIn  : T01..T04 camera move from the previous stop; its first frame must match the previous
//                   poster and its last frame this poster. It is scrubbed by scroll, so encode it with
//                   short GOPs (e.g. ffmpeg -g 6 -keyint_min 6) for smooth seeking.
// Nothing else in the code needs to change. Without video, posters cross-fade.
// Current transitions: camera flights built from the posters themselves (depth reliefs on the previs route),
// bugu-complete-production-kit 2/previs/src/flight.js + scripts/flight-capture.mjs.

export type Scene = {
  id: 'S01' | 'S02' | 'S03' | 'S04' | 'S05';
  label: string;
  poster: string;
  alt: string;
  /** fire centre in poster coordinates, 0..1 (drives the ember glow) */
  fire: [number, number];
  /** horizontal focus on portrait screens, 0..1 */
  focusX: number;
  /** horizontal focus on landscape screens narrower than 16:9 (default 0.5) */
  focusXWide?: number;
  /** calm text zone on wide screens: CSS insets relative to the viewport */
  copy: { left?: string; right?: string; top: string; width: string };
  loop?: string;
  transitionIn?: string;
  /** small photo card at the bottom of the stop, on the side where the drawing has empty floor */
  card?: { thumb: string; title: string; meta?: string; href: string; side: 'left' | 'right'; /** menu name for price and link */ dish?: string };
  /** S04: the four drawn dishes placed around the table (wide screens; a row under the drawing on phones) */
  dishSlots?: { left?: string; right?: string; top: string }[];
};

export const SCENES: Scene[] = [
  {
    id: 'S01', label: 'Очаг', poster: '/scenes/s01',
    alt: 'Карандашный рисунок: небольшой костёр на сером каменном полу, на камнях светлый орнамент',
    fire: [0.735, 0.56], focusX: 0.66,
    copy: { left: '6vw', top: '21vh', width: 'min(40vw, 620px)' },
    // loop: '/video/S01-loop.mp4',
  },
  {
    id: 'S02', label: 'Музыка', poster: '/scenes/s02',
    alt: 'Рисунок: пожилой мужчина в калпаке играет на комузе в кресле у столика, слева горит костёр',
    fire: [0.41, 0.6], focusX: 0.64,
    copy: { left: '6vw', top: '15vh', width: 'min(33vw, 500px)' },
    card: { thumb: 'hall', title: 'Зал Bugu', href: '#zal', side: 'left' },
    transitionIn: '/video/T01-S01-to-S02.mp4',
  },
  {
    id: 'S03', label: 'Встреча', poster: '/scenes/s03',
    alt: 'Рисунок: дети играют в альчики на полу, мама сидит за столом, справа костёр',
    fire: [0.73, 0.52], focusX: 0.4,
    copy: { left: '31vw', top: '15vh', width: 'min(30vw, 460px)' },
    card: { thumb: 'booth', title: 'Кабинки для встреч', href: '#bron', side: 'right' },
    transitionIn: '/video/T02-S02-to-S03.mp4',
  },
  {
    id: 'S04', label: 'Стол', poster: '/scenes/s04',
    alt: 'Рисунок сверху: семья из трёх поколений за круглым столом с боорсоками и Кесе Куурдаком, вдали костёр',
    fire: [0.2, 0.16], focusX: 0.5, focusXWide: 0.6,
    copy: { right: '4vw', top: '11vh', width: 'min(31vw, 470px)' },
    dishSlots: [{ left: '1.6vw', top: '37vh' }, { left: '1.6vw', top: '63vh' }, { right: '2vw', top: '45vh' }, { right: '2vw', top: '69vh' }],
    transitionIn: '/video/T03-S03-to-S04.mp4',
  },
  {
    id: 'S05', label: 'Руки', poster: '/scenes/s05',
    alt: 'Рисунок: пожилая женщина и молодая героиня режут тесто для боорсока за длинным столом, вдали костёр',
    fire: [0.86, 0.45], focusX: 0.27,
    copy: { left: '47vw', top: '13vh', width: 'min(30vw, 460px)' },
    transitionIn: '/video/T04-S04-to-S05.mp4',
    card: { thumb: 'tushpara', title: 'Тушпара', dish: 'Тушпара с голяшкой из баранины', href: '/menu/', side: 'right' },
  },
];

/** srcset for a poster: 960 and 1672 wide WebP */
export const posterSet = (base: string) => `${base}-960.webp 960w, ${base}-1672.webp 1672w`;

// Four dishes for the home page. Name, price and text come from the menu data by name.
// photo: source image from the restaurant's public menu (authenticity not verified, cropped to drop a sticker)
// drawing: AI-generated pencil illustration, always labelled as such
export const HIGHLIGHTS = [
  { name: 'Нео-Беш', slug: 'neo-besh', alt: 'Нео-Беш: листы домашнего теста с ломтиками чучука на тёмной тарелке, соус в деревянной пиале' },
  { name: 'Кесе Куурдак', slug: 'kese-kuurdak', alt: 'Кесе Куурдак: керамическая пиала с тушёной бараниной, сверху приподнята шапка из запечённого теста' },
  { name: 'Боорсок', slug: 'boorsok', alt: 'Золотистые боорсоки в корзине на льняной салфетке, рядом глиняный чайник' },
  { name: 'Тамга', slug: 'tamga', alt: 'Тамга: ломтик воздушного десерта с талканом и шарик сливочного крема на тёмной тарелке' },
] as const;

export const foodSet = (slug: string) => `/food/${slug}-600.webp 600w, /food/${slug}-1180.webp 1180w`;

// Public-source photos of the dining room (Open Kitchen / RestaurantGuru); replace with the restaurant's originals.
export const SPACE = [
  { slug: 'sign', alt: 'Вывеска BUGU на светлой рельефной каменной стене, под ней столы и мягкие кресла' },
  { slug: 'hall', alt: 'Тёмный зал с каменной стеной, деревьями и шахматным полом' },
  { slug: 'booth', alt: 'Кабинка с деревянными скамьями и орнаментальным текстилем на стене' },
  { slug: 'stairs', alt: 'Лестница с орнаментом на перилах и сухоцветами в глиняной вазе' },
] as const;

export const spaceSet = (slug: string) => `/space/${slug}-700.webp 700w, /space/${slug}-1200.webp 1200w`;

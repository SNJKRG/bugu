import raw from './menu.json';

// menu.json is the untouched RestaurantGuru snapshot (98 items, 14 categories, accessed 2026-10-13).
// The source appends a technical note (sometimes truncated) to 20 descriptions; it is cut out of the text
// and kept as the sourceImageAi flag.
const AI_NOTE = /\s*Изображение товара созда[\s\S]*$/;

// The site uses no em dashes: "На гарнир — хлеб" → "На гарнир: хлеб", other dashes → commas
const noDash = (t: string) => t.replace(/(^|[.!?]\s+)([^.!?—]{1,25}?) — /g, '$1$2: ').replace(/\s*—\s*/g, ', ');

export type Dish = {
  name: string;
  price: number;
  description: string;
  category: string;
  /** source image URL from the third-party menu; not shown on the site */
  sourceImage: string | null;
  /** the source labels its image as AI-generated: by its flag (20 items) or by the note in the text (22 items) */
  sourceImageAi: boolean;
};

type RawItem = { category: string; name: string; price: string; description: string; image_url: string | null; source_marks_ai_image: boolean };

export const MENU_SOURCE = { url: raw.source, accessed: raw.accessed };

export const DISHES: Dish[] = (raw.items as RawItem[]).map((i) => ({
  name: i.name.trim(),
  price: parseInt(i.price, 10),
  description: noDash(i.description.replace(AI_NOTE, '').replace(/\s+/g, ' ').trim()),
  category: i.category,
  sourceImage: i.image_url,
  sourceImageAi: i.source_marks_ai_image || AI_NOTE.test(i.description),
}));

// Latin ids for #anchors in the order the source lists categories
const SLUG: Record<string, string> = {
  'Блюда на гриле': 'gril',
  'Выпечка': 'vypechka',
  'Гарниры': 'garniry',
  'Горячие блюда': 'goryachie',
  'Горячие закуски': 'goryachie-zakuski',
  'Десерты': 'deserty',
  'Добавки': 'dobavki',
  'Коктейли': 'kokteyli',
  'Напитки': 'napitki',
  'Национальные напитки': 'nacionalnye-napitki',
  'Салаты': 'salaty',
  'Свежевыжатые соки': 'soki',
  'Супы': 'supy',
  'Холодные закуски': 'kholodnye-zakuski',
};

export const CATEGORIES = [...new Set(DISHES.map((d) => d.category))].map((title) => ({
  id: SLUG[title] ?? title,
  title,
  items: DISHES.filter((d) => d.category === title),
}));

const nf = new Intl.NumberFormat('ru-RU');
export const som = (n: number) => `${nf.format(n)} сом`;

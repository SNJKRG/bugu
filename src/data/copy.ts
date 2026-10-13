// Proposed site copy (concept/CONTENT-MAP.md). Not quotes from the restaurant.
// Scene characters are fictional; nothing here promises shows, games or workshops.

// "Bugu" in a title or subtitle is set as an accent.
export type Chapter = { eyebrow?: string; carved?: string[]; title: string; text?: string };

export const CHAPTERS: Chapter[] = [
  {
    eyebrow: 'Бишкек, улица Сухэ-Батора, 3',
    title: 'Знакомые вкусы и новые сочетания',
    text: 'Современная кыргызская кухня Bugu',
  },
  {
    // the restaurant's descriptor, lettered like the wordmark and "carved" into the wall of the scene
    carved: ['Neo', 'Nomad', 'Cuisine'],
    title: 'Традиции в прочтении Bugu',
    text: 'Память о кочевой культуре живёт в звуках, историях и вкусах и становится частью сегодняшнего вечера.',
  },
  {
    eyebrow: 'Общий стол',
    title: 'Время быть вместе в Bugu',
    text: 'Встречи, разговоры и общий стол. Для камерного вечера спросите кабинку при брони.',
  },
  {
    // no paragraph: the four dishes stand around the table instead
    eyebrow: 'Кухня',
    title: 'Вкус Bugu собирает за одним столом',
  },
  {
    eyebrow: 'Работа рук',
    title: 'В Bugu знакомое становится новым',
    text: 'Вкус рождается из внимания к продуктам и работе рук. Попробуйте привычное по-новому.',
  },
];

export const DISHES_INTRO = {
  title: 'Блюда, с которых стоит начать',
};

export const SPACE_COPY = {
  title: 'Зал',
  text: 'Каменная стена, ветви под потолком, мягкие кресла и тёмные столы. Для камерной встречи можно спросить кабинку при брони.',
};

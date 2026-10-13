// Restaurant facts: the only place to edit them. Source: bugu-complete-production-kit 3/research-v3/facts.json
// (checked 2026-10-13, public sources). Confirm with the restaurant before publishing.

const phoneE164 = '+996707558558';

export const SITE = {
  name: 'BUGU',
  descriptor: 'NEO · NOMAD · CUISINE',
  city: 'Бишкек',
  address: 'улица Сухэ-Батора, 3',
  phone: '+996 707 558 558',
  tel: `tel:${phoneE164}`,
  whatsapp: 'https://wa.me/996707558558',
  instagram: 'https://www.instagram.com/bugu.restaurant/',
  hours: '11:00–23:00',
  // Instagram bio (priority) says 11:00–23:00, RestaurantGuru says 11:00–00:00: confirm before publishing.
  // 2GIS by coordinates from RestaurantGuru (42.8241309, 74.618848)
  map: 'https://2gis.kg/bishkek/geo/74.618848%2C42.8241309',
};

// Pre-filled WhatsApp text; the guest edits and sends it themselves, the restaurant confirms.
export const bookingHref = `${SITE.whatsapp}?text=${encodeURIComponent('Здравствуйте! Хочу забронировать стол в Bugu. Дата: , время: , гостей: ')}`;

// Список глав курса. Одна глава: одно открытие и одна карточка приёма (docs/Открытия.md).
// Файл главы: js/glavaN.js, в нём GLAVA с кадрами. Цвет плитки: имя цвета из tokens.css.
// karta: название карточки приёма (нет: название главы). img: рисунок карточки (есть у глав нового вида).
export const GLAVY = [
  { n: 1, nazv: 'Сначала беда', mesto: 'Рынок', cvet: 'granat', karta: 'Сначала беда', img: 'img/glava1/karta.webp' },
  { n: 2, nazv: 'Не допрос', mesto: 'Рынок', cvet: 'nebo', karta: 'Не допрос', img: 'img/glava2/karta.webp' },
  { n: 3, nazv: 'Пусть говорит он', mesto: 'Instagram', cvet: 'shafran' },
  { n: 4, nazv: 'Где болит', mesto: 'WhatsApp', cvet: 'izumrud' },
  { n: 5, nazv: 'Чем оборачивается', mesto: 'Кухни на заказ', cvet: 'granat' },
  { n: 6, nazv: 'Пусть скажет сам', mesto: 'Кухни на заказ', cvet: 'nebo' },
  { n: 7, nazv: 'Скрытая и явная', mesto: 'WhatsApp', cvet: 'shafran' },
  { n: 8, nazv: 'Свойство или связь', mesto: 'Instagram', cvet: 'izumrud' },
  { n: 9, nazv: 'Не лечи без жалобы', mesto: 'Рынок', cvet: 'granat' },
  { n: 10, nazv: 'Без нажима', mesto: 'Опт', cvet: 'nebo' },
  { n: 11, nazv: 'Шаг вперёд', mesto: 'Крупная сделка', cvet: 'shafran' },
  { n: 12, nazv: 'Одна привычка', mesto: 'Экзамен', cvet: 'izumrud' },
];

// Глава открыта, если пройдена прошлая. Первая открыта всегда.
export const otkryta = (n, projdeno) => n === 1 || !!projdeno[n - 1] || !!projdeno[n];

export const zagruzit = (n) => import(`./glava${n}.js`).then((m) => m.GLAVA);

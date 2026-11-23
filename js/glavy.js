// Список глав курса. Одна книга: одна тема, у каждой главы своя подача и своё место (кодекс).
// Файл главы: js/glavaN.js, в нём GLAVA с кадрами. Цвет плитки: имя цвета из tokens.css.
export const GLAVY = [
  { n: 1, nazv: 'Сначала вопрос', mesto: 'Рынок', cvet: 'granat' },
  { n: 2, nazv: 'Пусть говорит он', mesto: 'Instagram', cvet: 'nebo' },
  { n: 3, nazv: 'Не больше двух', mesto: 'Рынок', cvet: 'shafran' },
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

export const zagruzit = (n) => import(`./glava${n}.js`).then((m) => m.GLAVA);

// Знакомство для новичка: что это за игра и как в неё играть. Показывается один раз перед первой главой,
// потом по кнопке «Как играть» на карте (#znakomstvo). Подсказки Мусы: перед первым заданием каждого вида, один раз.
// Название книги не называем (решение автора 2026-11-27).
import { esc, kn, slova, figura } from './ekrany.js?v=ecaf8208';

export const KLYUCH_ZNAKOMSTVO = 'prodaj-mne-ruchku-znakomstvo';
export const KLYUCH_PODSKAZKI = 'prodaj-mne-ruchku-podskazki';

// Кадры знакомства: готовые рисунки главы 1, лимит Codex не тратится
export const KADRY = [
  { img: 'img/glava1/oblozhka.webp', fokus: '50% 20%', slovo: 'ПРИВЕТ!',
    tekst: 'Это игра о продажах. Она сделана по мотивам одной из лучших книг о продажах. Вы научитесь продавать без уговоров: покупатель сам захочет купить.' },
  { img: 'img/glava1/k1-2.webp', imya: 'Это Ильяс',
    tekst: 'Ильяс продаёт чехлы на рынке. Он очень старается: показывает товар, хвалит, называет цены.' },
  { img: 'img/glava1/k1-3.webp', imya: 'Но вот беда',
    tekst: 'Покупатели говорят «я подумаю» и уходят. Ильяс не понимает почему. Вы поможете ему разобраться.' },
  { img: 'img/glava1/k1-4.webp', imya: 'Муса, сосед по рядам',
    rech: 'Я буду рядом и подскажу. Ошибётесь: я объясню, в чём дело. Ошибаться здесь не страшно.' },
  { img: 'img/glava1/k1-6.webp', imya: 'Как играть',
    tekst: 'В игре 12 глав. В каждой: история в картинках, одна новая мысль и разговор с покупателем. Вы просто нажимаете ответ А, Б, В или Г.' },
  { img: 'img/glava1/karta.webp', imya: 'Что вы получите',
    tekst: 'В разговоре считаются выручка и доверие. За каждую главу вы получите карточку приёма и задание: попробовать приём сегодня в жизни.' },
];

export function ekranZnakomstva(i, posle) {
  const k = KADRY[i];
  const posled = i === KADRY.length - 1;
  const tochki = KADRY.map((_, n) => `<i class="${n === i ? 'seychas' : n < i ? 'bylo' : ''}"></i>`).join('');
  return `<section class="ekran fon-chernila komiks znakomstvo"><header class="verh"><button class="kn-malaya" data-d="zn-nazad" aria-label="Назад">←</button>
    <span class="verh-imya">Как играть</span><span></span><button class="kn-malaya kn-tekst" data-d="zn-konec">Пропустить</button></header>
    <div class="kom-kadr"><img style="object-position:${k.fokus || '50% 50%'}" src="${k.img}" alt="" draggable="false">
      ${k.slovo ? `<b class="kom-slovo">${esc(k.slovo)}</b>` : ''}</div>
    <div class="kom-niz">
      <div class="oblako kom-oblako${k.rech ? '' : ' kom-avtor'}">${k.imya ? `<b class="oblako-imya">${esc(k.imya)}</b>` : ''}<p>${esc(k.rech ? '«' + k.rech + '»' : k.tekst)}</p></div>
      <div class="kom-tochki" aria-hidden="true">${tochki}</div>
      ${posled ? kn('zn-konec', posle) : kn('zn-dalshe', 'Дальше')}
    </div></section>`;
}

// Что сказать перед первым заданием каждого вида. slovo: крупно сверху, tekst: Муса объясняет.
export const PODSKAZKI = {
  lovushka: { slovo: ['ВАШ ХОД'], tekst: 'Сейчас будет случай из жизни. Выберите, как поступили бы вы сами. Оценки здесь нет: просто выберите честно.' },
  komiks: { slovo: ['ИСТОРИЯ'], tekst: 'Дальше история в картинках. Читайте, что говорят герои, и нажимайте «Дальше».' },
  otkrytie: { slovo: ['ГЛАВНАЯ МЫСЛЬ'], tekst: 'Это главная мысль главы. Сначала то, что думают почти все. Потом то, как на самом деле.' },
  vopros: { slovo: ['ПРОВЕРКА'], tekst: 'Проверим, как вы поняли. Прочитайте и нажмите верный ответ. Я скажу, верно или нет, и объясню почему.' },
  vybor: { slovo: ['ПРОВЕРКА'], tekst: 'Здесь верных ответов несколько. Отметьте нужные и нажмите «Проверить».' },
  korziny: { slovo: ['ПРОВЕРКА'], tekst: 'Будут фразы покупателей. Каждую фразу положите в одну из двух корзин: нажмите нужную.' },
  najdi: { slovo: ['НАЙДИТЕ'], tekst: 'Прочитайте сообщение. Нажмите на ту часть, о которой спрашивают.' },
  poryadok: { slovo: ['ПО ПОРЯДКУ'], tekst: 'Нажимайте карточки по порядку: сначала первую, потом вторую и дальше.' },
  sborka: { slovo: ['СОБЕРИТЕ'], tekst: 'Соберите ответ из частей. Выбирайте части по одной. Неверная часть погаснет.' },
  spisok: { slovo: ['ПРАВИЛА'], tekst: 'Прочитайте правила. Они пригодятся в разговоре.' },
  razgovor: { slovo: ['ТЕПЕРЬ ВЫ'], tekst: 'Теперь продаёте вы. Покупатель говорит, вы выбираете, что ответить. Хороший ответ растит доверие. Неудачный: я подскажу, и можно попробовать ещё.' },
};

export const ekranPodskazki = (p, verh) => `<section class="ekran fon-izumrud panel podskazka">${verh}
  ${slova(p.slovo, 'izumrud')}${figura('musa', ['obyasnyaet', 'obyasnyaet2'])}
  <div class="niz"><div class="oblako"><b class="oblako-imya">Муса</b><p>${esc(p.tekst)}</p></div>${kn('ponyatno', 'Понятно')}</div></section>`;

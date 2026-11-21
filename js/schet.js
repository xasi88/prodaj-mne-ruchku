// Счёт и порядок игры. Чистые функции без экрана: их проверяют тесты (tests/run.mjs).
// Прохождение: { '56': { vybor: 'Б', poryadok: 'ВАБ' } }: буква выбранного ответа и порядок ответов на экране.
export const BUKVY = ['А', 'Б', 'В'];
export const TIPY = {
  chestno: 'Честный ответ',
  ulovka: 'Уловка',
  strah: 'Страх или уступка',
  spor: 'Спор или нажим',
  pusto: 'Пустые слова',
};

export const otvet = (scena, bukva) => scena.otvety.find((o) => o.b === bukva) || null;

// Счёт: начало плюс последний выбор в каждой сцене. Переиграли сцену: старый выбор заменён, очки не копятся.
export function schet(nachalo, sceny, hod) {
  let vyruchka = nachalo.vyruchka;
  let doverie = nachalo.doverie;
  for (const s of sceny) {
    const o = otvet(s, hod?.[s.id]?.vybor);
    if (o) { vyruchka += o.v; doverie += o.d; }
  }
  return { vyruchka: Math.max(0, vyruchka), doverie: Math.max(0, doverie) };
}

// Порядок трёх ответов на экране: случайный, чтобы лучший не стоял на одном месте.
export function peremeshat(rnd = Math.random) {
  const a = [...BUKVY];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join('');
}

const porOk = (p) => typeof p === 'string' && p.length === 3 && BUKVY.every((b) => p.includes(b));

// Выбор ответа: новое прохождение, старое не меняется.
export function vybrat(hod, scena, bukva, poryadok) {
  if (!otvet(scena, bukva) || !porOk(poryadok)) return hod;
  return { ...hod, [scena.id]: { vybor: bukva, poryadok } };
}

export function zabyt(hod, id) {
  const n = { ...hod };
  delete n[id];
  return n;
}

// Буква на экране (А, Б, В по месту кнопки) для ответа из карточки.
export const naEkrane = (poryadok, bukva) => BUKVY[poryadok.indexOf(bukva)] || bukva;

// «Почему» из карточки называет ответы буквами карточки. На экране порядок другой: меняем буквы.
export function pochemu(tekst, poryadok) {
  return tekst.replace(/([Оо]твет[а-яё]*) ([АБВ])(?![а-яёА-ЯЁ])/g, (_, slovo, b) => `${slovo} ${naEkrane(poryadok, b)}`);
}

export const scenyEtapa = (sceny, etap) => sceny.filter((s) => s.etap === etap);
export const proydeno = (sceny, hod) => sceny.filter((s) => otvet(s, hod?.[s.id]?.vybor)).length;

// Следующая сцена того же места или null, если эта последняя.
export function sleduyushchaya(sceny, id) {
  const s = sceny.find((x) => x.id === id);
  if (!s) return null;
  const ryad = scenyEtapa(sceny, s.etap);
  return ryad[ryad.indexOf(s) + 1] || null;
}

// Память браузера может вернуть что угодно: оставляем только годные записи.
export function prochitat(stroka, sceny) {
  let d;
  try { d = JSON.parse(stroka || '{}'); } catch { return {}; }
  const out = {};
  for (const s of sceny) {
    const z = d?.[s.id];
    if (z && otvet(s, z.vybor) && porOk(z.poryadok)) out[s.id] = { vybor: z.vybor, poryadok: z.poryadok };
  }
  return out;
}

export const rubli = (n) => `${n < 0 ? '−' : ''}${String(Math.abs(n)).replace(/\B(?=(\d{3})+$)/g, ' ')} ₽`;
export const soZnakom = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);

// Счёт и память главы: чистые функции, их проверяют тесты (tests/run.mjs).
// Считается только первый ответ на каждый вопрос и шаг: переиграть можно, очки не копятся.

export const KLYUCH = 'prodaj-mne-ruchku-glava-1';

export function pustoe() {
  return { kadr: 0, test: {}, praktika: {} };
}

export function prochitat(tekst, glava) {
  const p = pustoe();
  let d;
  try { d = JSON.parse(tekst); } catch { return p; }
  if (!d || typeof d !== 'object') return p;
  const n = glava.kadry.length;
  if (Number.isInteger(d.kadr) && d.kadr >= 0 && d.kadr < n) p.kadr = d.kadr;
  for (const [pole, celoe] of [['test', 'vid'], ['praktika', 'nomer']]) {
    if (d[pole] && typeof d[pole] === 'object') {
      for (const [k, v] of Object.entries(d[pole])) {
        if (/^\d{1,2}$/.test(k) && (celoe === 'vid' ? typeof v === 'string' : Number.isInteger(v) && v >= 0 && v < 3)) p[pole][k] = v;
      }
    }
  }
  return p;
}

// Записать первый ответ. Повторный ответ на тот же вопрос не меняет запись.
export function pervyj(zapis, nomer, otvet) {
  if (zapis[nomer] !== undefined) return zapis;
  return { ...zapis, [nomer]: otvet };
}

export function itogTesta(voprosy, otvety) {
  return voprosy.filter((q, i) => otvety[i] === q.vid).length;
}

export function itogPraktiki(nachalo, praktika, pervye) {
  let vyruchka = nachalo.vyruchka;
  let doverie = nachalo.doverie;
  let verno = 0;
  praktika.shagi.forEach((sh, i) => {
    const o = sh.otvety[pervye[i]];
    if (!o) return;
    vyruchka += o.v;
    doverie += o.d;
    if (o.tip === 'verno') verno++;
  });
  return { vyruchka: Math.max(0, vyruchka), doverie, verno };
}

// Порядок ответов на экране: случайный, но один и тот же для шага, пока человек на нём
export function peremeshat(n, sluchaj = Math.random) {
  const a = [...Array(n).keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(sluchaj() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const rubli = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
export const soZnakom = (n) => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '0');

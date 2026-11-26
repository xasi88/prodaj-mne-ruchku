// Счёт и память глав: чистые функции, их проверяют тесты (tests/run.mjs).
// Считается только первый ответ на каждый шаг: переиграть можно, очки не копятся.

export const PREFIX = 'prodaj-mne-ruchku-';
export const klyuch = (n) => PREFIX + 'glava-' + n;
export const KLYUCH_PROJDENO = PREFIX + 'projdeno';
export const BUKVY = ['А', 'Б', 'В', 'Г'];

// Кадры с заданием: у каждого свои шаги и свой верный ответ на шаге
export const ZADANIYA = ['vopros', 'razgovor', 'sborka', 'najdi', 'korziny', 'vybor', 'poryadok'];

export function pustoe() {
  return { kadr: 0, otvety: {} };
}

const godnyj = (v) => (Number.isInteger(v) && v >= 0 && v < 16) || (typeof v === 'string' && v.length < 40);

export function prochitat(tekst, glava) {
  const p = pustoe();
  let d;
  try { d = JSON.parse(tekst); } catch { return p; }
  if (!d || typeof d !== 'object') return p;
  const n = glava.kadry.length;
  if (Number.isInteger(d.kadr) && d.kadr >= 0 && d.kadr < n) p.kadr = d.kadr;
  if (d.otvety && typeof d.otvety === 'object') {
    for (const [k, z] of Object.entries(d.otvety)) {
      if (!/^\d{1,2}$/.test(k) || Number(k) >= n || !z || typeof z !== 'object') continue;
      for (const [s, v] of Object.entries(z)) if (/^\d{1,2}$/.test(s) && godnyj(v)) (p.otvety[k] ||= {})[s] = v;
    }
  }
  return p;
}

// Записать первый ответ. Повторный ответ на тот же шаг не меняет запись.
export function pervyj(zapis, nomer, otvet) {
  if (zapis[nomer] !== undefined) return zapis;
  return { ...zapis, [nomer]: otvet };
}

export function zapisat(sost, kadr, shag, otvet) {
  return { ...sost, otvety: { ...sost.otvety, [kadr]: pervyj(sost.otvety[kadr] || {}, shag, otvet) } };
}

// Номер верного ответа на шаге. Для «выбора» и «порядка» шаг один, ответ строкой.
export function vernyj(kd, i) {
  switch (kd.vid) {
    case 'vopros': case 'najdi': return kd.shagi[i].verno;
    case 'sborka': return kd.chasti[i].verno;
    case 'razgovor': return kd.shagi[i].otvety.findIndex((o) => o.tip === 'verno');
    case 'korziny': return kd.frazy[i].k;
    case 'vybor': return kd.punkty.map((p, n) => (p.verno ? n : -1)).filter((n) => n >= 0).join(',');
    case 'poryadok': return 'da';
    default: return undefined;
  }
}

export function shagov(kd) {
  if (kd.vid === 'sborka') return kd.chasti.length;
  if (kd.vid === 'korziny') return kd.frazy.length;
  if (kd.vid === 'vybor' || kd.vid === 'poryadok') return 1;
  return kd.shagi ? kd.shagi.length : 0;
}

export function itogKadra(kd, z = {}) {
  const vsego = shagov(kd);
  let verno = 0;
  for (let i = 0; i < vsego; i++) if (z[i] !== undefined && z[i] === vernyj(kd, i)) verno++;
  return { verno, vsego };
}

// Деньги и доверие в разговоре: по первым ответам. Уловка даёт деньги один раз и роняет доверие.
export function schetRazgovora(kd, z = {}) {
  let vyruchka = 0;
  let doverie = 0;
  kd.shagi.forEach((sh, i) => {
    const o = sh.otvety[z[i]];
    if (!o) return;
    vyruchka += o.v;
    doverie += o.d;
  });
  return { vyruchka: Math.max(0, vyruchka), doverie };
}

export function itogGlavy(glava, otvety = {}) {
  const s = { verno: 0, vsego: 0, vyruchka: 0, doverie: 0, razgovor: false };
  glava.kadry.forEach((kd, k) => {
    if (!ZADANIYA.includes(kd.vid)) return;
    const z = otvety[k] || {};
    const t = itogKadra(kd, z);
    s.verno += t.verno;
    s.vsego += t.vsego;
    if (kd.vid === 'razgovor') {
      const r = schetRazgovora(kd, z);
      s.vyruchka += r.vyruchka;
      s.doverie += r.doverie;
      s.razgovor = true;
    }
  });
  return s;
}

// Пройденные главы: { номер: { verno, vsego } }
export function prochitatProjdeno(tekst) {
  const p = {};
  let d;
  try { d = JSON.parse(tekst); } catch { return p; }
  if (!d || typeof d !== 'object') return p;
  for (const [k, v] of Object.entries(d)) {
    if (/^\d{1,2}$/.test(k) && v && Number.isInteger(v.verno) && Number.isInteger(v.vsego)) p[k] = { verno: v.verno, vsego: v.vsego };
  }
  return p;
}

// Шкала разговора: доля слов покупателя
const slov = (t) => String(t).split(/\s+/).filter(Boolean).length;
export function dolyaPokupatelya(lenta) {
  let on = 0;
  let vy = 0;
  for (const r of lenta) {
    if (r.kto === 'pokupatel') on += slov(r.t);
    else if (r.kto === 'prodavec') vy += slov(r.t);
  }
  return on + vy ? Math.round((on / (on + vy)) * 100) : 50;
}

export const rubli = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
export const soZnakom = (n) => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '0');

// Звание растёт с числом собранных карточек
export const ZVANIYA = [[0, 'Новичок'], [1, 'Ученик'], [4, 'Продавец'], [8, 'Мастер'], [12, 'Мастер продаж']];
export const zvanie = (n) => ZVANIYA.filter(([m]) => n >= m).at(-1)[1];

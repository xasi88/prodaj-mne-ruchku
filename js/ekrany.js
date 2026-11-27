// Экраны заданий. У каждого вида: pokaz(kd, t, verh) даёт HTML, klik(kd, t, b) меняет t и говорит, что записать.
// t: временное состояние кадра, живёт, пока человек на кадре. Первые ответы пишет app.js (schet.js, zapisat).
// Варианты ответа: буквы А-Г сверху вниз, порядок из данных главы (тест проверяет, что верная буква меняется).
import { geroj, REAKCII, IMENA } from './geroi.js?v=ecaf8208';
import { BUKVY, dolyaPokupatelya, rubli, soZnakom, schetRazgovora } from './schet.js?v=ecaf8208';
import { SCENY } from './sceny.js?v=ecaf8208';

export const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const figura = (kto, pozy, temp = 500) =>
  `<div class="figura" data-kto="${kto}" data-pozy="${pozy.join(',')}" data-temp="${temp}" data-seychas="${pozy[0]}">${geroj(kto, pozy[0])}</div>`;

export const slova = (s, fon) => `<div class="slova slova-${fon === 'bumaga' ? 'temnye' : 'svetlye'}" style="--n:${Math.max(5, ...s.map((x) => x.length))}">${s.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`;

export const kn = (d, tekst, kl = 'kn') => `<button class="${kl}" data-d="${d}">${esc(tekst)}</button>`;

const tekstVarianta = (v) => (Array.isArray(v) ? v.map((s) => `<span class="strochka">${esc(s)}</span>`).join('') : esc(v));

// Четыре ответа А-Г. sost: { vybran, verno, zakryto, nevernye }
function varianty(spisok, s = {}, kl = '') {
  return `<div class="abvg ${kl}">${spisok.map((v, n) => {
    let c = '';
    if (s.verno === n && (s.vybran !== undefined && s.vybran !== null)) c = ' verno';
    else if (s.vybran === n || s.nevernye?.includes(n)) c = ' neverno';
    const off = s.zakryto || s.nevernye?.includes(n);
    return `<button class="kn-otvet${c}" data-z="otvet" data-n="${n}" ${off ? 'disabled' : ''}><span class="bukva">${BUKVY[n]}</span><span class="otvet-t">${tekstVarianta(v)}</span></button>`;
  }).join('')}</div>`;
}

const oblako = (imya, tekst, kl = '') => `<div class="oblako ${kl}">${imya ? `<b class="oblako-imya">${esc(imya)}</b>` : ''}<p>${esc(tekst)}</p></div>`;
const otzyv = (da, tekst) => `<div class="otzyv ${da ? 'otzyv-da' : 'otzyv-net'}" role="status">${esc(tekst)}</div>`;
const shapka = (kd, i, n) => `<p class="metka-zad"><b>${esc(kd.zagolovok)}</b>${n > 1 ? `<span>${i + 1} из ${n}</span>` : ''}</p>`;
// Свободное место над кнопкой занимает Муса: думает, кивает на верный ответ, объясняет на неверный.
// Места мало: Муса прячется сам (app.css, .zapas).
function zapas(telo) {
  const p = telo.includes('otzyv-da') ? 'kivaet' : telo.includes('otzyv-net') || telo.includes('oblako-musa') ? 'obyasnyaet' : 'dumaet';
  return `<div class="zapas">${figura('musa', [p, p + '2'])}</div>`;
}
const ekran = (verh, telo) => {
  const i = telo.lastIndexOf('<div class="niz-zad">');
  const s = i < 0 ? telo + zapas(telo) : telo.slice(0, i) + zapas(telo) + telo.slice(i);
  return `<section class="ekran fon-bumaga">${verh}<div class="zadanie">${s}</div></section>`;
};
const dalshe = (tekst = 'Дальше') => `<div class="niz-zad">${kn('dalshe-shag', tekst)}</div>`;
const vernoNet = (da, verno, pochemu) => otzyv(da, (da ? 'Верно. ' : `Нет. Верно: ${BUKVY[verno]}. `) + pochemu);

// Список правил: коротко, всё на одном экране
const spisok = {
  pokaz: (kd, t, verh) => ekran(verh, `<h1 class="zagolovok">${esc(kd.zagolovok)}</h1>${kd.vvod ? `<p class="vvod">${esc(kd.vvod)}</p>` : ''}
    <ol class="punkty">${kd.punkty.map((p, n) => `<li class="punkt fon-${p.cvet || 'belyj'}"><span class="punkt-n">${n + 1}</span>
      <b>${esc(p.nazv)}</b>${p.sut ? `<span>${esc(p.sut)}</span>` : ''}${p.primer ? `<q>${esc(p.primer)}</q>` : ''}</li>`).join('')}</ol>
    <div class="niz-zad">${kn('dalshe', kd.knopka || 'Понятно')}</div>`),
  klik: () => ({}),
};

// Вопрос с четырьмя ответами. oform: 'dubli' (четыре коротких сцены), 'lestnica' (шаги от слабого к сильному)
const vopros = {
  pokaz(kd, t, verh) {
    const sh = kd.shagi[t.shag];
    const o = t.otvet ?? null;
    return ekran(verh, `${shapka(kd, t.shag, kd.shagi.length)}
      ${sh.tekst ? oblako(sh.imya || '', sh.tekst, 'oblako-stim') : ''}
      ${varianty(sh.varianty, { vybran: o, verno: sh.verno, zakryto: o !== null }, kd.oform ? 'abvg-' + kd.oform : '')}
      ${o !== null ? vernoNet(o === sh.verno, sh.verno, sh.pochemu) + dalshe() : ''}`);
  },
  klik(kd, t, b) {
    if (b.dataset.z === 'otvet') {
      const n = Number(b.dataset.n);
      t.otvet = n;
      return { zapis: [t.shag, n], zvuk: n === kd.shagi[t.shag].verno ? 'verno' : 'neverno' };
    }
    return sledShag(t, kd.shagi.length);
  },
};

function sledShag(t, n) {
  if (t.shag < n - 1) { t.shag++; t.otvet = null; return {}; }
  return { dalshe: true };
}

// Разговор с покупателем: видна последняя пара реплик, четыре ответа. Неверный ответ: реакция и подсказка Мусы.
const razgovor = {
  pokaz(kd, t, verh) {
    t.lenta ||= [{ kto: 'pokupatel', t: kd.nachalo }];
    const sh = kd.shagi[Math.min(t.shag, kd.shagi.length - 1)];
    const r = REAKCII[kd.kanal ? 'telefon' : kd.kto];
    const kto = r.kto || kd.kto;
    const poza = t.gotovo ? r.rad : t.oshibka != null ? r.somn : r.stoit;
    const sc = schetRazgovora(kd, t.z);
    const prodavec = kd.prodavec || 'Вы';
    const imya = kd.imya || IMENA[kd.kto] || 'Покупатель';
    const ow = t.oshibka != null ? sh.otvety[t.oshibka] : null;
    let lenta = t.lenta;
    if (ow) lenta = [...lenta, { kto: 'prodavec', t: ow.tekst }, { kto: 'pokupatel', t: ow.rech }];
    const vid = lenta.slice(-2);
    const repl = (x) => `<div class="repl repl-${x.kto}"><b>${esc(x.kto === 'prodavec' ? prodavec : imya)}</b>${esc(x.t)}</div>`;
    let niz;
    if (t.gotovo) niz = kn('dalshe', 'Дальше');
    else if (ow) niz = `${oblako('Муса', ow.musa, 'oblako-musa')}${kn('ewe', 'Попробовать ещё')}`;
    else niz = `<p class="metka-zad"><b>${esc(sh.metka)}</b><span>${t.shag + 1} из ${kd.shagi.length}</span></p>${varianty(sh.otvety.map((o) => o.tekst))}`;
    const dolya = kd.shkala ? dolyaPokupatelya(lenta) : null;
    return `<section class="ekran fon-bumaga razgovor${kd.kanal ? ' v-telefone' : ''}">${verh}
      <div class="scena fon-${kd.fon || 'nebo'}">${figura(kto, [poza, poza + '2'])}
        <div class="schet">${kd.bezDeneg ? '' : `<span class="chip fon-shafran">Выручка ${rubli(sc.vyruchka)}</span>`}
        <span class="chip fon-izumrud">Доверие ${soZnakom(sc.doverie)}</span></div>
        ${dolya !== null ? `<div class="shkala" aria-label="Говорит покупатель ${dolya}%"><i style="width:${dolya}%"></i><span>Говорит ${esc(imya)}: ${dolya}%</span></div>` : ''}
        ${kd.kanal ? `<span class="kanal">${esc(kd.kanal)}</span>` : ''}</div>
      <div class="lenta" aria-live="polite">${vid.map(repl).join('')}</div>
      <div class="niz-razg">${niz}</div></section>`;
  },
  klik(kd, t, b) {
    if (b.dataset.z !== 'otvet') {
      if (b.dataset.d === 'ewe') { t.oshibka = null; return {}; }
      return {};
    }
    const n = Number(b.dataset.n);
    const o = kd.shagi[t.shag].otvety[n];
    const zapis = [t.shag, n];
    if (o.tip !== 'verno') { t.oshibka = n; return { zapis, zvuk: 'neverno' }; }
    t.lenta.push({ kto: 'prodavec', t: o.tekst }, { kto: 'pokupatel', t: o.rech });
    if (t.shag === kd.shagi.length - 1) { t.gotovo = true; return { zapis, zvuk: 'monety' }; }
    t.shag++;
    return { zapis, zvuk: 'verno' };
  },
};

// Найти место: нажать на кусок фразы покупателя или на кадр плёнки (oform: 'plenka')
const najdi = {
  pokaz(kd, t, verh) {
    const sh = kd.shagi[t.shag];
    const o = t.otvet ?? null;
    const kusok = (k, n) => {
      const c = o === null ? '' : n === sh.verno ? ' verno' : n === o ? ' neverno' : '';
      return `<button class="kusok${c}" data-z="otvet" data-n="${n}" ${o !== null ? 'disabled' : ''}>${kd.oform === 'plenka' ? `<span class="bukva">${n + 1}</span>` : ''}${esc(k)}</button>`;
    };
    const telo = kd.oform === 'plenka'
      ? `<div class="plenka">${sh.kuski.map(kusok).join('')}</div>`
      : `<div class="oblako oblako-stim">${sh.imya ? `<b class="oblako-imya">${esc(sh.imya)}</b>` : ''}<p class="kuski">${sh.kuski.map(kusok).join(' ')}</p></div>`;
    return ekran(verh, `${shapka(kd, t.shag, kd.shagi.length)}<p class="vvod">${esc(sh.vvod)}</p>${telo}
      ${o !== null ? otzyv(o === sh.verno, (o === sh.verno ? 'Верно. ' : 'Нет. ') + sh.pochemu) + dalshe() : ''}`);
  },
  klik(kd, t, b) {
    if (b.dataset.z === 'otvet') {
      const n = Number(b.dataset.n);
      t.otvet = n;
      return { zapis: [t.shag, n], zvuk: n === kd.shagi[t.shag].verno ? 'verno' : 'neverno' };
    }
    return sledShag(t, kd.shagi.length);
  },
};

// Порядок: нажимать карточки по очереди. Ошибка: карточка вздрагивает. Считается, если ни разу не ошибся.
const poryadok = {
  pokaz(kd, t, verh) {
    t.sdelano ||= [];
    const gotovo = t.sdelano.length === kd.punkty.length;
    return ekran(verh, `${shapka(kd, 0, 1)}<p class="vvod">${esc(kd.vvod)}</p>
      <div class="poryadok">${kd.pokaz.map((n) => {
        const m = t.sdelano.indexOf(n);
        return `<button class="kartochka${m >= 0 ? ' gotova' : ''}${t.migaet === n ? ' migaet' : ''}" data-z="otvet" data-n="${n}" ${m >= 0 || gotovo ? 'disabled' : ''}>
          <span class="bukva">${m >= 0 ? m + 1 : '?'}</span>${esc(kd.punkty[n])}</button>`;
      }).join('')}</div>
      ${gotovo ? otzyv(!t.oshibka, (t.oshibka ? 'Собрано, но с ошибкой. ' : 'Верно, с первого раза. ') + kd.pochemu) + dalshe() : ''}`);
  },
  klik(kd, t, b) {
    if (b.dataset.z !== 'otvet') return { dalshe: true };
    const n = Number(b.dataset.n);
    t.migaet = null;
    if (n !== t.sdelano.length) { t.oshibka = true; t.migaet = n; return { zapis: [0, 'net'], zvuk: 'neverno' }; }
    t.sdelano.push(n);
    if (t.sdelano.length === kd.punkty.length) return { zapis: [0, 'da'], zvuk: t.oshibka ? 'nazhatie' : 'verno' };
    return { zvuk: 'nazhatie' };
  },
};

// Две корзины: фраза за фразой
const korziny = {
  pokaz(kd, t, verh) {
    const f = kd.frazy[t.shag];
    const o = t.otvet ?? null;
    return ekran(verh, `${shapka(kd, t.shag, kd.frazy.length)}<p class="vvod">${esc(kd.vvod)}</p>
      ${oblako(f.imya || '', f.t, 'oblako-stim')}
      <div class="korziny">${kd.korziny.map((k, n) => {
        const c = o === null ? '' : n === f.k ? ' verno' : n === o ? ' neverno' : '';
        return `<button class="kn-korzina fon-${k.cvet}${c}" data-z="otvet" data-n="${n}" ${o !== null ? 'disabled' : ''}><b>${esc(k.nazv)}</b><span>${esc(k.sut)}</span></button>`;
      }).join('')}</div>
      ${o !== null ? otzyv(o === f.k, (o === f.k ? 'Верно. ' : 'Нет. ') + f.pochemu) + dalshe() : ''}`);
  },
  klik(kd, t, b) {
    if (b.dataset.z === 'otvet') {
      const n = Number(b.dataset.n);
      t.otvet = n;
      return { zapis: [t.shag, n], zvuk: n === kd.frazy[t.shag].k ? 'verno' : 'neverno' };
    }
    return sledShag(t, kd.frazy.length);
  },
};

// Выбор нескольких: отметить нужные, потом «Проверить»
const vybor = {
  pokaz(kd, t, verh) {
    t.vybrano ||= [];
    const p = t.provereno;
    return ekran(verh, `${shapka(kd, 0, 1)}<p class="vvod">${esc(kd.vvod)}</p>
      <div class="vybor">${kd.punkty.map((x, n) => {
        const v = t.vybrano.includes(n);
        const c = p ? (x.verno ? ' verno' : v ? ' neverno' : '') : v ? ' vybran' : '';
        return `<button class="kn-vybor${c}" data-z="otvet" data-n="${n}" aria-pressed="${v}" ${p ? 'disabled' : ''}>${esc(x.t)}</button>`;
      }).join('')}</div>
      ${p ? otzyv(t.vernoVse, (t.vernoVse ? 'Верно. ' : 'Не совсем. ') + kd.pochemu) + dalshe()
    : `<div class="niz-zad"><button class="kn" data-z="proverit" ${t.vybrano.length === kd.nado ? '' : 'disabled'}>Проверить (${t.vybrano.length} из ${kd.nado})</button></div>`}`);
  },
  klik(kd, t, b) {
    if (b.dataset.z === 'otvet') {
      const n = Number(b.dataset.n);
      t.vybrano = t.vybrano.includes(n) ? t.vybrano.filter((x) => x !== n) : t.vybrano.length < kd.nado ? [...t.vybrano, n] : t.vybrano;
      return { zvuk: 'nazhatie' };
    }
    if (b.dataset.z === 'proverit') {
      t.provereno = true;
      const otvet = [...t.vybrano].sort((a, c) => a - c).join(',');
      t.vernoVse = kd.punkty.every((x, n) => !!x.verno === t.vybrano.includes(n));
      return { zapis: [0, otvet], zvuk: t.vernoVse ? 'verno' : 'neverno' };
    }
    return { dalshe: true };
  },
};

// Сборка ответа из кусочков: часть за частью, неверный кусок гаснет, Муса подсказывает
const sborka = {
  pokaz(kd, t, verh) {
    t.sobrano ||= [];
    t.nevernye ||= [];
    const gotovo = t.sobrano.length === kd.chasti.length;
    const ch = kd.chasti[t.sobrano.length];
    return ekran(verh, `${shapka(kd, 0, 1)}${oblako(kd.imya, kd.rech, 'oblako-szhato')}
      <div class="oblako oblako-vash"><b class="oblako-imya">Ваш ответ</b><p>${t.sobrano.map(esc).join(' ')}${gotovo ? '' : ' <span class="pusto">…</span>'}</p></div>
      ${gotovo ? oblako(kd.imya, kd.final, 'oblako-final') + dalshe()
    : `${t.podskazka ? oblako('Муса', t.podskazka, 'oblako-musa') : ''}<p class="metka-zad"><b>${esc(ch.metka)}</b><span>${t.sobrano.length + 1} из ${kd.chasti.length}</span></p>
      ${varianty(ch.varianty, { nevernye: t.nevernye })}`}`);
  },
  klik(kd, t, b) {
    if (b.dataset.z !== 'otvet') return { dalshe: true };
    const i = t.sobrano.length;
    const ch = kd.chasti[i];
    const n = Number(b.dataset.n);
    if (n !== ch.verno) { t.nevernye.push(n); t.podskazka = ch.musa; return { zapis: [i, n], zvuk: 'neverno' }; }
    t.sobrano.push(ch.varianty[n]);
    t.nevernye = [];
    t.podskazka = null;
    return { zapis: [i, n], zvuk: t.sobrano.length === kd.chasti.length ? 'monety' : 'verno' };
  },
};

export const ZADACHI = { spisok, vopros, razgovor, najdi, poryadok, korziny, vybor, sborka, ...SCENY };

// Новые кадры главы (с 1.0): ловушка, комикс, открытие. Глава в пять шагов: ловушка, история, открытие, проба, карточка.
// У каждого вида pokaz(kd, t, verh) и klik(kd, t, b), как в ekrany.js. Ловушка в счёт не идёт: она показывает, чего человек не знал.
import { esc, kn, slova, figura } from './ekrany.js?v=9de95619';
import { BUKVY } from './schet.js?v=9de95619';

const sekciya = (kl, verh, telo) => `<section class="ekran ${kl}">${verh}${telo}</section>`;

// Ловушка: привычный ответ новичка. После выбора: «так думает почти каждый» и переход к истории.
const lovushka = {
  pokaz(kd, t, verh) {
    const o = t.otvet ?? null;
    const otzyv = o === null ? '' : o === kd.verno ? kd.esliVerno : o === kd.lovushka ? kd.esliLov : kd.esliDrugoe;
    return sekciya('fon-bumaga lovushka', verh, `<div class="zadanie">
      <p class="metka-zad"><b>${esc(kd.zagolovok || 'Как бы вы поступили?')}</b></p>
      <div class="oblako oblako-stim"><p>${esc(kd.situaciya)}</p></div>
      <div class="abvg">${kd.varianty.map((v, n) => {
        const c = o === null ? '' : n === o ? (n === kd.verno ? ' verno' : ' vybor-lov') : '';
        return `<button class="kn-otvet${c}" data-z="lov" data-n="${n}" ${o !== null ? 'disabled' : ''}><span class="bukva">${BUKVY[n]}</span><span class="otvet-t">${esc(v)}</span></button>`;
      }).join('')}</div>
      ${o === null ? `<div class="zapas">${figura('ilyas', ['dumaet', 'dumaet2'])}</div>`
        : `<div class="otzyv otzyv-lov" role="status">${esc(otzyv)}</div><div class="zapas">${figura('musa', ['dumaet', 'dumaet2'])}</div>
          <div class="niz-zad">${kn('dalshe-shag', kd.knopka || 'Посмотрим, что вышло')}</div>`}
    </div>`);
  },
  klik(kd, t, b) {
    if (b.dataset.z === 'lov') { t.otvet = Number(b.dataset.n); return { zvuk: 'vlet' }; }
    return { dalshe: true };
  },
};

// Комикс: рисунок кадра на весь экран, облачко выскакивает, «Дальше» листает. Рисунки Codex: img/glavaN/.
const komiks = {
  pokaz(kd, t, verh) {
    const i = t.shag ?? 0;
    const k = kd.kadry[i];
    const tochki = kd.kadry.map((_, n) => `<i class="${n === i ? 'seychas' : n < i ? 'bylo' : ''}"></i>`).join('');
    return sekciya(`fon-${kd.fon || 'chernila'} komiks`, verh, `
      <div class="kom-kadr"><img style="object-position:${k.fokus || '50% 50%'}" src="${k.img}" alt="${esc(k.opis || '')}" draggable="false">
        ${k.slovo ? `<b class="kom-slovo">${esc(k.slovo)}</b>` : ''}</div>
      <div class="kom-niz">
        <div class="oblako kom-oblako${k.imya ? '' : ' kom-avtor'}">${k.imya ? `<b class="oblako-imya">${esc(k.imya)}</b>` : ''}<p>${esc(k.rech ? '«' + k.rech + '»' : k.tekst)}</p></div>
        <div class="kom-tochki" aria-hidden="true">${tochki}</div>
        ${kn('dalshe-shag', i < kd.kadry.length - 1 ? 'Дальше' : kd.knopka || 'Дальше')}
      </div>`);
  },
  klik(kd, t) {
    const i = t.shag ?? 0;
    if (i < kd.kadry.length - 1) { t.shag = i + 1; return { zvuk: 'vlet' }; }
    return { dalshe: true };
  },
};

// Открытие: что вы думали и как на деле. Одна мысль крупно.
const otkrytie = {
  pokaz(kd, t, verh) {
    return sekciya('fon-izumrud otkrytie', verh, `${slova(['ОТКРЫТИЕ'], 'izumrud')}
      <div class="otk-karty">
        <div class="otk-bylo"><b>Обычно думают</b><p>${esc(kd.bylo)}</p></div>
        <div class="otk-stalo"><b>На деле</b><p>${esc(kd.stalo)}</p></div>
      </div>
      ${figura('musa', ['obyasnyaet', 'obyasnyaet2'])}
      <div class="niz">${kd.musa ? `<div class="oblako"><b class="oblako-imya">Муса</b><p>${esc('«' + kd.musa + '»')}</p></div>` : ''}${kn('dalshe-shag', kd.knopka || 'Попробовать')}</div>`);
  },
  klik: () => ({ dalshe: true }),
};

export const SCENY = { lovushka, komiks, otkrytie };

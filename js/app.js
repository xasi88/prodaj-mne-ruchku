// Оболочка: карта глав, кадры главы по порядку, память в localStorage, весь экран.
// Адреса: «#» карта глав, «#g3» глава 3, «#versii» что нового. Экраны заданий: ekrany.js.
import { GLAVY, zagruzit, otkryta } from './glavy.js?v=9de95619';
import { geroj, osnova, ryvok } from './geroi.js?v=9de95619';
import { ZADACHI, esc, figura, slova, kn } from './ekrany.js?v=9de95619';
import * as S from './schet.js?v=9de95619';
import { VERSIONS } from './versions.js?v=9de95619';
import { igrat, razreshit, pereklyuchit, zvukVklyuchen } from './zvuki.js?v=9de95619';

const app = document.getElementById('app');
const tiho = matchMedia('(prefers-reduced-motion: reduce)').matches;
const chitat = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const pisat = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* нет места */ } };

let glava = null; // загруженная глава
let sost = S.pustoe();
let t = {}; // состояние кадра на экране
let projdeno = S.prochitatProjdeno(chitat(S.KLYUCH_PROJDENO));

// Таймеры кадра: стираются при смене экрана
let taimery = [];
const pozzhe = (f, ms) => taimery.push(setTimeout(f, ms));
const ochistit = () => { taimery.forEach(clearTimeout); taimery = []; };

// Рывки поз и дрожь контура, как у рисованного мультфильма
let tik = 0;
const boil = document.getElementById('boil-shum');
if (!tiho) {
  setInterval(() => {
    tik++;
    if (boil) boil.setAttribute('seed', String(1 + (tik % 4)));
    for (const el of app.querySelectorAll('[data-pozy]')) {
      const pozy = el.dataset.pozy.split(',');
      const p = pozy[Math.floor((tik * 125) / Number(el.dataset.temp || 500)) % pozy.length];
      if (el.dataset.seychas === p) continue;
      const img = el.querySelector('img');
      if (img && osnova(el.dataset.seychas) === osnova(p)) img.classList.toggle('ryvok', ryvok(p));
      else el.innerHTML = geroj(el.dataset.kto, p);
      el.dataset.seychas = p;
    }
  }, 125);
}

const knopkaZvuka = () => `<button class="kn-malaya" data-d="zvuk" aria-label="Звук" aria-pressed="${zvukVklyuchen()}">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path class="dinamik" d="M4 9h4l5-4v14l-5-4H4z"/>${zvukVklyuchen()
    ? '<path class="volna" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>'
    : '<path class="volna" d="M16 9l5 6M21 9l-5 6"/>'}</svg></button>`;

function verh() {
  const n = glava.kadry.length;
  const dolya = Math.round(((sost.kadr + 1) / n) * 100);
  return `<header class="verh"><button class="kn-malaya" data-d="nazad" aria-label="Назад">←</button>
    <button class="verh-imya" data-d="karta" aria-label="Все главы">Глава ${glava.nomer}</button>
    <span class="polosa" role="progressbar" aria-valuenow="${dolya}" aria-valuemin="0" aria-valuemax="100"><i style="width:${dolya}%"></i></span>
    ${knopkaZvuka()}</header>`;
}

// ---- Весь экран и установка ----
let ustanovka = null;
const iphone = /iphone|ipad|ipod/i.test(navigator.userAgent);
const ustanovleno = () => matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;
const mozhnoUstanovit = () => !ustanovleno() && (ustanovka || iphone);
const knopkaUstanovki = () => `<button class="kn-prozr kn-ustanovit" data-d="ustanovit" ${mozhnoUstanovit() ? '' : 'hidden'}>Поставить на экран телефона</button>`;
const obnovitUstanovku = () => app.querySelectorAll('.kn-ustanovit').forEach((b) => { b.hidden = !mozhnoUstanovit(); });
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); ustanovka = e; obnovitUstanovku(); });
addEventListener('appinstalled', () => { ustanovka = null; obnovitUstanovku(); });
function ustanovit(b) {
  if (ustanovka) {
    ustanovka.prompt();
    ustanovka.userChoice.finally(() => { ustanovka = null; obnovitUstanovku(); });
  } else if (iphone) {
    b.textContent = 'В Safari нажмите «Поделиться», потом «На экран Домой»';
    b.disabled = true;
  }
}
// Телефон и окно с ярлыка: первое касание раскрывает приложение на весь экран (браузер требует касания).
// Окно уже на весь экран (ярлык с --start-fullscreen, установленное приложение): ничего не делать, иначе экран мигнёт.
const nuzhenVesEkran = () => document.fullscreenEnabled && !document.fullscreenElement
  && !matchMedia('(display-mode: fullscreen)').matches
  && (matchMedia('(pointer: coarse)').matches || !matchMedia('(display-mode: browser)').matches);
// Окно с ярлыка на компьютере: Chrome на весь экран, Escape из него не выводит. Закрыть окно может только само приложение,
// и только если у окна нет истории: поэтому переходы здесь без записи в историю (location.replace). Телефон не трогаем: там «Назад».
const oknoPK = matchMedia('(display-mode: fullscreen)').matches && !/android|iphone|ipad|ipod/i.test(navigator.userAgent);
const perejti = (h) => { if (oknoPK) location.replace(h || '#'); else location.hash = h; };
const knopkaZakryt = () => oknoPK ? `<button class="kn-malaya kn-zakryt" data-d="zakryt" aria-label="Закрыть приложение">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>` : '';
function vesEkran() {
  if (nuzhenVesEkran()) document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
}

// ---- Карта-дорога: главы змейкой по три, звание, карточки ----
const sobrano = () => GLAVY.filter((g) => projdeno[g.n]).length;
const ZMEJKA = [0, 1, 2, 5, 4, 3, 6, 7, 8, 11, 10, 9]; // место в сетке 3x4 → номер главы по дороге
function karta() {
  glava = null;
  const n = sobrano();
  const sled = GLAVY.find((g) => !projdeno[g.n]);
  app.innerHTML = `<section class="ekran fon-chernila karta-glav">
    <header class="karta-shapka"><img src="img/glava1/oblozhka.webp" alt="" draggable="false">
      <div class="karta-titul"><h1>Продай мне ручку</h1><p>Продажи без уговоров</p></div>${knopkaZakryt()}${knopkaZvuka()}
      <div class="zvanie"><b>${esc(S.zvanie(n))}</b><span>${n} из ${GLAVY.length} карточек</span></div></header>
    <div class="doroga"><svg viewBox="0 0 6 8" preserveAspectRatio="none" aria-hidden="true"><polyline points="1,1 5,1 5,3 1,3 1,5 5,5 5,7 1,7"/></svg>
      <ol>${ZMEJKA.map((i) => {
        const g = GLAVY[i];
        const p = projdeno[g.n];
        const otkr = otkryta(g.n, projdeno);
        const kl = p ? 'projdena' : g === sled ? 'seychas' : otkr ? '' : 'zakryta';
        return `<li><button class="uzel ${kl}" data-d="glava" data-g="${g.n}" ${otkr ? '' : 'disabled'} aria-label="Глава ${g.n}: ${esc(g.nazv)}${otkr ? '' : ', закрыта'}">
          <span class="uzel-krug fon-${g.cvet}">${p ? '✓' : otkr ? g.n : '🔒'}</span><b>${esc(g.nazv)}</b></button></li>`;
      }).join('')}</ol></div>
    <div class="karta-niz">${sled ? `<button class="kn" data-d="glava" data-g="${sled.n}">${projdeno[1] ? 'Дальше' : 'Начать'}: глава ${sled.n}</button>` : ''}
      <div class="ryad"><button class="kn-prozr" data-d="kartochki">Мои карточки</button><button class="kn-prozr" data-d="versii">Что нового</button>${knopkaUstanovki()}</div></div></section>`;
}

// Коллекция карточек приёмов: собранные с рисунком, остальные закрыты
function kartochki() {
  app.innerHTML = `<section class="ekran fon-chernila kartochki"><header class="verh"><button class="kn-malaya" data-d="iz-versij" aria-label="Назад">←</button>
    <span class="verh-imya">Карточки: ${sobrano()} из ${GLAVY.length}</span><span></span><span></span></header>
    <ol class="kollekciya">${GLAVY.map((g) => projdeno[g.n]
      ? `<li class="kartochka-priyom fon-${g.cvet}">${g.img ? `<img src="${g.img}" alt="" draggable="false">` : `<span class="kp-n">${g.n}</span>`}<b>${esc(g.karta || g.nazv)}</b></li>`
      : `<li class="kartochka-priyom zakryta"><span class="kp-n">?</span><b>Глава ${g.n}</b></li>`).join('')}</ol></section>`;
}

// ---- Кадры главы ----
function zastavka(kd) {
  // Обложка главы: рисунок Codex на весь экран, слова влетают, одна кнопка
  if (kd.oblozhka) {
    app.innerHTML = `<section class="ekran fon-chernila oblozhka"><div class="obl-ramka"><img class="obl-fon" src="${kd.oblozhka}" alt="" draggable="false"></div>
      <p class="obl-metka">Глава ${glava.nomer}</p>${slova(kd.slova, 'chernila')}
      <div class="niz"><p class="obl-vopros">${esc(kd.vopros)}</p>${kn('dalshe', 'Начать главу')}${glava.nomer === 1 ? knopkaUstanovki() : ''}</div></section>`;
    igrat('vlet');
    return;
  }
  let i = 0;
  const scena = () => {
    const sc = kd.sceny[i];
    const posled = i === kd.sceny.length - 1;
    app.innerHTML = `<section class="ekran fon-${sc.fon} zastavka">
      ${i % 2 ? '<div class="linii"></div>' : ''}${slova(sc.slova, sc.fon)}${figura(sc.kto, sc.pozy, 250)}
      <div class="niz">${posled ? kn('dalshe', 'Начать главу') + (glava.nomer === 1 ? knopkaUstanovki() : '')
        : kn('dalshe', 'Пропустить', 'kn-prozr')}</div></section>`;
    igrat('vlet');
    if (!posled) pozzhe(() => { i++; scena(); }, tiho ? 2200 : sc.ms);
  };
  scena();
}

function panel(kd) {
  app.innerHTML = `<section class="ekran fon-${kd.fon} panel">${verh()}
    ${slova([kd.slovo], kd.fon)}${figura(kd.kto, kd.pozy)}
    <div class="niz"><div class="oblako">
      ${kd.imya ? `<b class="oblako-imya">${esc(kd.imya)}</b>` : ''}
      <p>${esc(kd.rech ? '«' + kd.rech + '»' : kd.tekst)}</p>${kd.posle ? `<p class="tiho">${esc(kd.posle)}</p>` : ''}
    </div>${kn('dalshe', 'Дальше')}</div></section>`;
  igrat('vlet');
}

function itog(kd) {
  const s = S.itogGlavy(glava, sost.otvety);
  projdeno = { ...projdeno, [glava.nomer]: { verno: s.verno, vsego: s.vsego } };
  pisat(S.KLYUCH_PROJDENO, projdeno);
  const sled = GLAVY.find((g) => g.n === glava.nomer + 1);
  const g = GLAVY.find((x) => x.n === glava.nomer);
  if (g.img) { nagrada(kd, s, g, sled); return; }
  app.innerHTML = `<section class="ekran fon-shafran itog">${verh()}
    <div class="itog-verh">${slova(kd.slova || ['ГЛАВА', 'ПРОЙДЕНА'], 'shafran')}${figura(kd.kto || 'ilyas', kd.pozy || ['mashet', 'mashet2'], 250)}</div>
    <div class="karta">
      <div class="itog-chisla"><div><b>${s.verno} из ${s.vsego}</b>с первого раза</div>
      ${s.razgovor ? `<div><b>${S.rubli(s.vyruchka)}</b>выручка</div><div><b>${S.soZnakom(s.doverie)}</b>доверие</div>` : ''}</div>
      <h2>Правило</h2><p>${esc(kd.pravilo)}</p>
      <h2>Задание на сегодня</h2><p>${esc(kd.zadanie)}</p>
      <p class="tiho">${esc(glava.istochnik)}</p>
    </div>
    <div class="niz-zad">${sled ? `<button class="kn" data-d="glava" data-g="${sled.n}">Глава ${sled.n}: ${esc(sled.nazv)}</button>` : ''}
      <div class="ryad">${kn('snova', 'Пройти снова', 'kn-prozr')}${kn('karta', 'Все главы', 'kn-prozr')}</div>${knopkaUstanovki()}</div></section>`;
  igrat('final');
}

// Награда главы нового вида: карточка приёма переворачивается, задание на сегодня, намёк на следующую главу
function nagrada(kd, s, g, sled) {
  const n = sobrano();
  app.innerHTML = `<section class="ekran fon-shafran nagrada">${verh()}
    <div class="nagr-verh"><div class="linii"></div>
      <div class="kartochka-priyom perevorot fon-${g.cvet}"><img src="${g.img}" alt="" draggable="false"><b>${esc(g.karta)}</b></div></div>
    <p class="nagr-metka">Карточка ${n} из ${GLAVY.length}. Звание: ${esc(S.zvanie(n))}</p>
    <div class="karta nagr-karta">
      <div class="itog-chisla"><div><b>${s.verno} из ${s.vsego}</b>с первого раза</div>
      ${s.razgovor ? `<div><b>${S.rubli(s.vyruchka)}</b>выручка</div><div><b>${S.soZnakom(s.doverie)}</b>доверие</div>` : ''}</div>
      <p class="nagr-pravilo">${esc(kd.pravilo)}</p>
      <h2>Сегодня в жизни</h2><p>${esc(kd.zadanie)}</p>
    </div>
    <div class="niz-zad">${sled ? `${kd.namek ? `<p class="nagr-namek">${esc(kd.namek)}</p>` : ''}<button class="kn" data-d="glava" data-g="${sled.n}">Глава ${sled.n}: ${esc(sled.nazv)}</button>` : ''}
      <div class="ryad">${kn('snova', 'Пройти снова', 'kn-prozr')}${kn('karta', 'Дорога', 'kn-prozr')}</div></div></section>`;
  igrat('final');
}

function versii() {
  app.innerHTML = `<section class="ekran fon-bumaga versii"><header class="verh"><button class="kn-malaya" data-d="iz-versij" aria-label="Назад">←</button><span class="verh-imya">Что нового</span><span></span><span></span></header>
    ${VERSIONS.slice(0, 3).map((v) => `<div class="karta"><h2>Версия ${v.v}</h2><ul>${v.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</section>`;
}

const SVOI = { zastavka, panel, itog };
function kadr() {
  ochistit();
  const kd = glava.kadry[sost.kadr];
  if (SVOI[kd.vid]) SVOI[kd.vid](kd);
  else {
    t.shag ??= 0;
    t.z = sost.otvety[sost.kadr] || {};
    app.innerHTML = ZADACHI[kd.vid].pokaz(kd, t, verh());
  }
  app.querySelector('.kn-otvet:not(:disabled), .kn, .plitka')?.focus({ preventScroll: true });
}

function idti(k) {
  t = {};
  sost.kadr = Math.max(0, Math.min(glava.kadry.length - 1, k));
  pisat(S.klyuch(glava.nomer), sost);
  kadr();
}

let zhdu = 0;
async function pokazat() {
  ochistit();
  if (location.hash === '#versii') { versii(); return; }
  if (location.hash === '#kartochki') { glava = null; kartochki(); return; }
  const m = /^#g(\d{1,2})$/.exec(location.hash);
  const n = m && GLAVY.some((g) => g.n === Number(m[1])) ? Number(m[1]) : null;
  if (!n) { karta(); return; }
  if (!glava || glava.nomer !== n) {
    const moj = ++zhdu;
    const g = await zagruzit(n);
    if (moj !== zhdu) return;
    glava = g;
    sost = S.prochitat(chitat(S.klyuch(n)), glava);
    t = {};
  }
  kadr();
}

function zadacha(b) {
  const kd = glava.kadry[sost.kadr];
  const r = ZADACHI[kd.vid].klik(kd, t, b) || {};
  if (r.zapis) {
    sost = S.zapisat(sost, sost.kadr, r.zapis[0], r.zapis[1]);
    pisat(S.klyuch(glava.nomer), sost);
  }
  if (r.zvuk) igrat(r.zvuk);
  if (r.dalshe) idti(sost.kadr + 1);
  else kadr();
}

app.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  razreshit();
  const d = b.dataset.d;
  if (!b.dataset.z) igrat('nazhatie');
  if (b.dataset.z || d === 'ewe' || d === 'dalshe-shag') { zadacha(b); return; }
  if (d === 'zvuk') { pereklyuchit(); b.outerHTML = knopkaZvuka(); igrat('nazhatie'); }
  else if (d === 'ustanovit') ustanovit(b);
  else if (d === 'glava') {
    const n = Number(b.dataset.g);
    if (glava && glava.nomer === n) idti(sost.kadr);
    perejti('#g' + n);
  } else if (d === 'dalshe') idti(sost.kadr + 1);
  else if (d === 'nazad') { if (sost.kadr > 0) idti(sost.kadr - 1); else perejti(''); }
  else if (d === 'karta') perejti('');
  else if (d === 'snova') { sost = S.pustoe(); idti(0); }
  else if (d === 'versii') perejti('#versii');
  else if (d === 'kartochki') perejti('#kartochki');
  else if (d === 'iz-versij') perejti('');
  else if (d === 'zakryt') window.close();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && oknoPK) window.close(); });
addEventListener('hashchange', pokazat);
addEventListener('pointerdown', () => { razreshit(); vesEkran(); });

pokazat();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  // Новая версия: страница перезагружается сама, если служба без сети уже была (скилл «Выкладка», 5)
  const bylaSluzhba = !!navigator.serviceWorker.controller;
  let perezagruzka = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (bylaSluzhba && !perezagruzka) { perezagruzka = true; location.reload(); }
  });
  navigator.serviceWorker.register('sw.js');
}

// Экраны главы 1. Кадры берутся из glava1.js по порядку, место в главе хранится в localStorage.
import { GLAVA, VIDY, PORYADOK, NACHALO, SHAG_TOVAR } from './glava1.js?v=19902189';
import { geroj, osnova, ryvok } from './geroi.js?v=19902189';
import * as S from './schet.js?v=19902189';
import { VERSIONS } from './versions.js?v=19902189';
import { igrat, razreshit, pereklyuchit, zvukVklyuchen } from './zvuki.js?v=19902189';

const app = document.getElementById('app');
const tiho = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let sost = S.pustoe();
try { sost = S.prochitat(localStorage.getItem(S.KLYUCH), GLAVA); } catch { /* память закрыта */ }
const sohranit = () => { try { localStorage.setItem(S.KLYUCH, JSON.stringify(sost)); } catch { /* нет места */ } };

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
      const shag = Math.floor((tik * 125) / Number(el.dataset.temp || 500));
      const p = pozy[shag % pozy.length];
      if (el.dataset.seychas === p) continue;
      const img = el.querySelector('img');
      if (img && osnova(el.dataset.seychas) === osnova(p)) img.classList.toggle('ryvok', ryvok(p));
      else el.innerHTML = geroj(el.dataset.kto, p);
      el.dataset.seychas = p;
    }
  }, 125);
}

const figura = (kto, pozy, temp = 500) =>
  `<div class="figura" data-kto="${kto}" data-pozy="${pozy.join(',')}" data-temp="${temp}" data-seychas="${pozy[0]}">${geroj(kto, pozy[0])}</div>`;
const slova = (s, fon) => `<div class="slova slova-${fon === 'bumaga' ? 'temnye' : 'svetlye'}" style="--n:${Math.max(5, ...s.map((x) => x.length))}">${s.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`;

function verh(nazad = true) {
  const n = GLAVA.kadry.length;
  const dolya = Math.round(((sost.kadr + 1) / n) * 100);
  return `<header class="verh">${nazad && sost.kadr > 0 ? '<button class="kn-malaya" data-d="nazad" aria-label="Назад">←</button>' : '<span></span>'}
    <span class="verh-imya">Глава ${GLAVA.nomer}</span>
    <span class="polosa" role="progressbar" aria-valuenow="${dolya}" aria-valuemin="0" aria-valuemax="100"><i style="width:${dolya}%"></i></span>
    ${knopkaZvuka()}</header>`;
}

const knopkaZvuka = () => `<button class="kn-malaya" data-d="zvuk" aria-label="Звук" aria-pressed="${zvukVklyuchen()}">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path class="dinamik" d="M4 9h4l5-4v14l-5-4H4z"/>${zvukVklyuchen()
    ? '<path class="volna" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>'
    : '<path class="volna" d="M16 9l5 6M21 9l-5 6"/>'}</svg></button>`;

// Установка на экран: Android Chrome даёт окно установки, iPhone только подсказку
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

function idti(k) {
  sost.kadr = Math.max(0, Math.min(GLAVA.kadry.length - 1, k));
  sohranit();
  pokazat();
}

// ---- Кадры ----

function zastavka(kd) {
  let i = 0;
  const scena = () => {
    const sc = kd.sceny[i];
    const posled = i === kd.sceny.length - 1;
    app.innerHTML = `<section class="ekran fon-${sc.fon} zastavka">
      ${i % 2 ? '<div class="linii"></div>' : ''}
      ${slova(sc.slova, sc.fon)}
      ${figura(sc.kto, sc.pozy, 250)}
      <div class="niz">${posled
        ? '<button class="kn" data-d="dalshe">Начать главу</button>' + knopkaUstanovki()
        : '<button class="kn-prozr" data-d="dalshe">Пропустить</button>'}</div></section>`;
    igrat('vlet');
    if (!posled) pozzhe(() => { i++; scena(); }, tiho ? 2200 : sc.ms);
  };
  scena();
}

function panel(kd) {
  app.innerHTML = `<section class="ekran fon-${kd.fon}">${verh()}
    ${slova([kd.slovo], kd.fon)}
    ${figura(kd.kto, kd.pozy)}
    <div class="niz"><div class="oblako">
      ${kd.imya ? `<b class="oblako-imya">${esc(kd.imya)}</b>` : ''}
      <p>${esc(kd.rech ? '«' + kd.rech + '»' : kd.tekst)}</p>
      ${kd.posle ? `<p class="tiho">${esc(kd.posle)}</p>` : ''}
    </div><button class="kn" data-d="dalshe">Дальше</button></div></section>`;
}

function vidy() {
  app.innerHTML = `<section class="ekran fon-bumaga prokrutka">${verh()}
    <h1 class="zagolovok">Четыре вопроса</h1>
    <p class="vvod">Задавайте их по порядку. Товар показывайте только потом.</p>
    <ol class="vidy">${PORYADOK.map((k, n) => `<li class="vid fon-${VIDY[k].cvet}">
      <span class="vid-n">${n + 1}</span><b>${esc(VIDY[k].nazv)}</b><p>${esc(VIDY[k].sut)}</p>
      <q>${esc(VIDY[k].primer)}</q></li>`).join('')}
      <li class="vid fon-chernila"><span class="vid-n">5</span><b>${esc(SHAG_TOVAR.nazv)}</b><p>${esc(SHAG_TOVAR.sut)}</p></li></ol>
    <div class="niz-prostoj"><button class="kn" data-d="dalshe">Понятно, проверим</button></div></section>`;
}

let testOtvet = null; // ответ на экране, пока человек не нажал «Дальше»
function test(kd) {
  const i = Object.keys(sost.test).length;
  if (i >= kd.voprosy.length && testOtvet === null) {
    const n = S.itogTesta(kd.voprosy, sost.test);
    app.innerHTML = `<section class="ekran fon-izumrud">${verh()}
      ${slova([n + ' ИЗ ' + kd.voprosy.length], 'izumrud')}${figura('musa', n === kd.voprosy.length ? ['kivaet', 'kivaet2'] : ['obyasnyaet', 'obyasnyaet2'])}
      <div class="niz"><div class="oblako"><b class="oblako-imya">Муса</b>
      <p>«${n === kd.voprosy.length ? 'Все верно. Теперь попробуй в разговоре.' : 'Неплохо. В разговоре станет понятнее.'}»</p></div>
      <button class="kn" data-d="dalshe">Дальше</button></div></section>`;
    return;
  }
  const nomer = testOtvet ? testOtvet.i : i;
  const q = kd.voprosy[nomer];
  const otvet = testOtvet && testOtvet.vid;
  app.innerHTML = `<section class="ekran fon-bumaga prokrutka">${verh()}
    <h1 class="zagolovok">${esc(kd.zagolovok)}</h1>
    <p class="vvod">Вопрос ${nomer + 1} из ${kd.voprosy.length}</p>
    <div class="oblako oblako-bolshoe"><b class="oblako-imya">Ильяс спрашивает</b><p>«${esc(q.tekst)}»</p></div>
    <div class="varianty">${PORYADOK.map((k) => `<button class="kn-vid fon-${VIDY[k].cvet}${otvet === k ? ' vybran' : ''}${otvet && k === q.vid ? ' verno' : ''}"
      data-vid="${k}" ${otvet ? 'disabled' : ''}>${esc(VIDY[k].nazv)}</button>`).join('')}</div>
    ${otvet ? `<div class="otzyv ${otvet === q.vid ? 'otzyv-da' : 'otzyv-net'}">
      <b>${otvet === q.vid ? 'Верно.' : 'Нет. Это вопрос «' + esc(VIDY[q.vid].nazv) + '».'}</b> ${esc(VIDY[q.vid].sut)}</div>
      <div class="niz-prostoj"><button class="kn" data-d="test-dalshe">Дальше</button></div>` : ''}</section>`;
}

// Разговор: лента реплик живёт в памяти, первые ответы в sost.praktika
let pr = null;
function praktika(kd) {
  if (!pr) pr = { shag: 0, lenta: [{ kto: 'adam', t: kd.nachalo }], oshibka: false, poryadok: S.peremeshat(3), gotovo: false };
  const sc = S.itogPraktiki(NACHALO, kd, sost.praktika);
  const sh = kd.shagi[pr.shag];
  const vid = sh.vid === 'tovar' ? SHAG_TOVAR : VIDY[sh.vid];
  const kto = { adam: 'Покупатель', ilyas: 'Ильяс', musa: 'Муса' };
  let niz;
  if (pr.gotovo) niz = '<button class="kn" data-d="dalshe">К итогу главы</button>';
  else if (pr.oshibka) niz = '<button class="kn" data-d="ewe">Попробовать ещё</button>';
  else {
    niz = `<p class="shag-imya"><span class="metka fon-${vid.cvet}">Шаг ${pr.shag + 1} из ${kd.shagi.length}</span> ${esc(vid.nazv)}</p>
      <div class="varianty-rech">${pr.poryadok.map((n) => `<button class="kn-rech" data-otvet="${n}">${esc(sh.otvety[n].tekst)}</button>`).join('')}</div>`;
  }
  app.innerHTML = `<section class="ekran fon-bumaga praktika">${verh()}
    <div class="scena fon-${vid.cvet}">${figura(kd.kto, pr.gotovo ? ['rad', 'rad2'] : pr.oshibka ? ['somnevaetsya', 'somnevaetsya2'] : ['stoit', 'stoit2'])}
      <div class="schet"><span class="chip fon-shafran">Выручка ${S.rubli(sc.vyruchka)}</span>
      <span class="chip fon-izumrud">Доверие ${S.soZnakom(sc.doverie)}</span></div></div>
    <div class="lenta" aria-live="polite">${pr.lenta.map((r) => `<div class="repl repl-${r.kto}"><b>${kto[r.kto]}</b>${esc(r.t)}</div>`).join('')}</div>
    <div class="niz-prak">${niz}</div></section>`;
  const l = app.querySelector('.lenta');
  l.scrollTop = l.scrollHeight;
}

function vybratRech(n) {
  const kd = GLAVA.kadry[sost.kadr];
  const o = kd.shagi[pr.shag].otvety[n];
  sost.praktika = S.pervyj(sost.praktika, pr.shag, n);
  sohranit();
  pr.lenta.push({ kto: 'ilyas', t: o.tekst }, { kto: 'adam', t: o.rech });
  igrat(o.tip === 'verno' ? 'verno' : 'neverno');
  if (o.tip === 'verno') {
    if (pr.shag === kd.shagi.length - 1) { pr.gotovo = true; setTimeout(() => igrat('monety'), 250); }
    else { pr.shag++; pr.poryadok = S.peremeshat(3); }
  } else {
    pr.lenta.push({ kto: 'musa', t: o.musa });
    pr.oshibka = true;
  }
  praktika(kd);
}

function itog(kd) {
  const t = GLAVA.kadry.find((k) => k.vid === 'test');
  const p = GLAVA.kadry.find((k) => k.vid === 'praktika');
  const sc = S.itogPraktiki(NACHALO, p, sost.praktika);
  app.innerHTML = `<section class="ekran fon-shafran prokrutka">${verh(false)}
    <div class="itog-verh">${slova(['ГЛАВА', 'ПРОЙДЕНА'], 'shafran')}${figura('ilyas', ['mashet', 'mashet2'], 250)}</div>
    <div class="karta">
      <div class="itog-chisla"><div><b>${S.rubli(sc.vyruchka)}</b>выручка</div><div><b>${S.soZnakom(sc.doverie)}</b>доверие</div>
      <div><b>${S.itogTesta(t.voprosy, sost.test)} из ${t.voprosy.length}</b>вопросы узнаны</div><div><b>${sc.verno} из ${p.shagi.length}</b>шагов с первого раза</div></div>
      <h2>Правило главы</h2><p>${esc(kd.pravilo)}</p>
      <h2>Задание на сегодня</h2><p>${esc(kd.zadanie)}</p>
      <p class="tiho">${esc(GLAVA.istochnik)}</p>
    </div>
    <div class="niz-prostoj"><button class="kn" data-d="snova">Пройти главу снова</button>
      ${knopkaUstanovki()}<button class="kn-prozr" data-d="versii">Что нового</button></div></section>`;
  igrat('final');
}

function versii() {
  app.innerHTML = `<section class="ekran fon-bumaga prokrutka"><header class="verh"><button class="kn-malaya" data-d="iz-versij" aria-label="Назад">←</button><span class="verh-imya">Что нового</span><span></span></header>
    ${VERSIONS.map((v) => `<div class="karta"><h2>Версия ${v.v}</h2><p class="tiho">${v.date}</p><ul>${v.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</section>`;
}

const EKRANY = { zastavka, panel, vidy, test, praktika, itog };
function pokazat() {
  ochistit();
  if (location.hash === '#versii') { versii(); return; }
  const kd = GLAVA.kadry[sost.kadr];
  EKRANY[kd.vid](kd);
  if (kd.vid === 'panel') igrat('vlet');
  app.querySelector('.kn, .kn-rech, .kn-vid')?.focus({ preventScroll: true });
}

app.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  razreshit();
  const d = b.dataset.d;
  if (!b.dataset.vid && b.dataset.otvet === undefined) igrat('nazhatie');
  if (d === 'zvuk') { pereklyuchit(); b.outerHTML = knopkaZvuka(); igrat('nazhatie'); return; }
  if (d === 'ustanovit') { ustanovit(b); return; }
  if (b.dataset.vid) {
    const i = Object.keys(sost.test).length;
    igrat(GLAVA.kadry[sost.kadr].voprosy[i]?.vid === b.dataset.vid ? 'verno' : 'neverno');
    sost.test = S.pervyj(sost.test, i, b.dataset.vid);
    sohranit();
    testOtvet = { i, vid: b.dataset.vid };
    pokazat();
  } else if (b.dataset.otvet !== undefined) vybratRech(Number(b.dataset.otvet));
  else if (d === 'dalshe') { pr = null; idti(sost.kadr + 1); }
  else if (d === 'nazad') { pr = null; testOtvet = null; idti(sost.kadr - 1); }
  else if (d === 'test-dalshe') { testOtvet = null; pokazat(); }
  else if (d === 'ewe') { pr.lenta.splice(-3); pr.oshibka = false; pr.poryadok = S.peremeshat(3); praktika(GLAVA.kadry[sost.kadr]); }
  else if (d === 'snova') { sost = S.pustoe(); pr = null; testOtvet = null; sohranit(); pokazat(); }
  else if (d === 'versii') location.hash = '#versii';
  else if (d === 'iz-versij') history.length > 1 ? history.back() : (location.hash = '');
});
addEventListener('hashchange', pokazat);
addEventListener('pointerdown', razreshit);

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

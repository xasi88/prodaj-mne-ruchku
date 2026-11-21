// Приложение: экраны по адресу после #. Главная с картой, место, сцена, настройки, версии, разбор книг (автор).
import { VERSIONS, VERSION } from './versions.js?v=466b0be8';
import * as db from './db.js?v=466b0be8';
import { knigiGlavnaya, knigiEtap, knigiItog, kniga, zanyatie } from './knigi.js?v=466b0be8';
import { karta, mesto, scena, sbrosKnopka, igraKlik } from './igra.js?v=466b0be8';

const app = document.getElementById('app');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TEMY = [['rynok', 'Рынок'], ['chernila', 'Чернила'], ['ring', 'Ринг']];
const MESTNO = location.hostname === 'localhost';

let user = null;
let knigiData = null; // null: не проверяли, false: нет доступа
let soob = '';

function hran(k, v) {
  try {
    if (v === undefined) return localStorage.getItem(k);
    localStorage.setItem(k, v);
  } catch { /* хранилище закрыто: работаем без него */ }
  return null;
}

function tema(t) {
  document.documentElement.dataset.tema = t;
  const c = getComputedStyle(document.documentElement).getPropertyValue('--fon').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c);
}

// Весь экран. Браузер разрешает его только после нажатия, поэтому включаем на первом нажатии.
// Выбор «в окне» помним: тогда сами экран не разворачиваем.
const vesEst = () => Boolean(document.fullscreenElement) || matchMedia('(display-mode: fullscreen)').matches;
function vesEkran(da) {
  const p = da ? document.documentElement.requestFullscreen?.() : document.exitFullscreen?.();
  p?.catch?.(() => {});
}
function pervoeNazhatie(e) {
  // Вход открывает окно Google: оно сразу выбило бы нас из полного экрана. Ждём следующего нажатия.
  if (e.target.closest?.('[data-do="voyti"], [data-do="ekran"]')) return;
  document.removeEventListener('click', pervoeNazhatie, true);
  if (hran('ekran') !== 'okno' && !vesEst()) vesEkran(true);
}

function vhod() {
  if (!db.est()) return '';
  return user
    ? `<a class="vhod est" href="#nastroyki" aria-label="Настройки и выход">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="">` : 'Вы'}</a>`
    : '<button class="vhod" type="button" data-do="voyti">Войти</button>';
}

function glavnaya() {
  const avtor = knigiData
    ? `<div class="razdel">Для автора</div><a class="step tek" href="#knigi"><span class="dot">К</span><span class="name">Разбор книг</span><span class="state">открыть</span></a>`
    : '';
  return `<header class="top"><img src="img/znachok-192.png" alt="" width="64" height="64"><div class="zag"><h1>Продай мне ручку</h1><div class="sub">Продажи без уговоров</div></div>${vhod()}</header>
  ${soob ? `<div class="soob">${esc(soob)}</div>` : ''}
  ${karta()}
  <div class="blok ruchka"><div class="row"><span>Задание «Продай мне ручку»</span><span class="state">скоро</span></div>
  <p class="note">Первое и последнее задание игры. Вы продаёте ручку как умеете. В конце сделаете это снова и увидите свой рост.</p></div>
  ${avtor}
  <div class="niz"><a href="#nastroyki">Настройки</a><a href="#versii">Версия ${VERSION}</a></div>`;
}

function nastroyki() {
  const t = document.documentElement.dataset.tema || 'rynok';
  // Кнопка темы сама в цветах своей темы: у неё тот же data-tema, что у страницы.
  const temy = TEMY.map(([id, name]) => `<button class="tema${id === t ? ' vybor' : ''}" type="button" data-tema="${id}"><i></i>${name}</button>`).join('');
  const akk = db.est()
    ? (user ? `<p>Вы вошли: ${esc(user.email || '')}</p><button class="vtor" type="button" data-do="vyyti">Выйти</button>`
      : '<button class="vtor" type="button" data-do="voyti">Войти через Google</button>')
    : '<p class="note">Вход появится, когда подключим базу.</p>';
  return `<a class="back" href="#">‹ Главная</a><h2>Настройки</h2>
  <div class="razdel">Тема</div><div class="temy">${temy}</div>
  ${document.documentElement.requestFullscreen ? `<div class="razdel">Экран</div><button class="vtor" type="button" data-do="ekran">${document.fullscreenElement ? 'Свернуть в окно' : 'На весь экран'}</button>` : ''}
  <div class="razdel">Игра</div>${sbrosKnopka()}
  <div class="razdel">Аккаунт</div>${akk}`;
}

function versii() {
  const rows = VERSIONS.map((x) => `<li><h3>Версия ${x.v}</h3><ul class="list">${x.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></li>`).join('');
  return `<a class="back" href="#">‹ Главная</a><h2>Что нового</h2><ul class="versii" style="margin-top:20px">${rows}</ul>`;
}

function zapis() {
  return MESTNO && user ? '<button class="vtor" type="button" data-do="zapis">Записать книги в базу</button>' : '';
}

function ekran() {
  const h = location.hash.slice(1);
  let m;
  if (h === 'nastroyki') return nastroyki();
  if (h === 'versii') return versii();
  if ((m = h.match(/^mesto-(\d+)$/))) return mesto(+m[1]) || glavnaya();
  if ((m = h.match(/^scena-(\d+)$/))) return scena(m[1]) || glavnaya();
  if (/^(knigi|kniga|itog)/.test(h)) {
    if (!knigiData) return `<a class="back" href="#">‹ Главная</a><h2>Разбор книг</h2><p class="lead">Этот раздел видит только автор после входа.</p>${zapis()}`;
    if ((m = h.match(/^kniga-(\d+)$/))) return kniga(knigiData, +m[1]);
    if ((m = h.match(/^itog-(\d+)$/))) return knigiItog(knigiData, +m[1]);
    if ((m = h.match(/^knigi-etap-(\d+)$/))) return knigiEtap(knigiData, +m[1]);
    return knigiGlavnaya(knigiData) + zapis();
  }
  return glavnaya();
}

let last = null;
function render() {
  const h = location.hash;
  app.innerHTML = `<div class="view">${ekran()}</div>`;
  if (h !== last) window.scrollTo(0, 0);
  last = h;
}

async function zagruzitKnigi() {
  if (!user) { knigiData = null; return; }
  try {
    const d = await db.knigi();
    knigiData = d.spisok ? d : null;
  } catch { knigiData = null; }
}

app.addEventListener('click', async (e) => {
  // Игра раньше занятий из книг: у обоих кнопки .opt, игра берёт только свои (data-otvet).
  if (igraKlik(e)) { render(); return; }
  if (zanyatie(e)) return;
  // Только кнопка темы: у <html> тоже есть data-tema, closest нашёл бы его при любом нажатии.
  const t = e.target.closest('button.tema[data-tema]');
  if (t) { tema(t.dataset.tema); hran('tema', t.dataset.tema); render(); return; }
  const b = e.target.closest('[data-do]');
  if (!b) return;
  if (b.dataset.do === 'ekran') {
    const da = !document.fullscreenElement;
    hran('ekran', da ? 'ves' : 'okno');
    vesEkran(da);
    return;
  }
  try {
    if (b.dataset.do === 'voyti') await db.voyti();
    if (b.dataset.do === 'vyyti') { await db.vyyti(); location.hash = ''; }
    if (b.dataset.do === 'zapis') {
      const docs = await (await fetch('_local/knigi.json', { cache: 'no-store' })).json();
      const n = await db.zapisatKnigi(docs);
      soob = `Записано документов: ${n}.`;
      await zagruzitKnigi();
      location.hash = '';
      render();
    }
  } catch (err) {
    soob = err.code === 'auth/popup-blocked'
      ? 'Браузер не открыл окно входа. Разрешите всплывающие окна для этого сайта и нажмите «Войти» ещё раз.'
      : 'Не получилось: ' + (err.code || err.message || 'ошибка') + '. Попробуйте ещё раз.';
    location.hash = '';
    render();
  }
});

tema(hran('tema') || 'rynok');
window.addEventListener('hashchange', render);
document.addEventListener('click', pervoeNazhatie, true);
document.addEventListener('fullscreenchange', () => { if (location.hash === '#nastroyki') render(); });
render();
db.sledit(async (u) => {
  user = u;
  await zagruzitKnigi();
  render();
});

// Работа без сети. Новая версия: страница сама перезагружается, если служба уже была.
if ('serviceWorker' in navigator && !MESTNO) {
  const byla = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (byla) location.reload(); });
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

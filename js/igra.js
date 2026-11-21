// Игра: карта города, место, сцена с тремя ответами. Прохождение хранит память браузера (ключ igra).
// Данные сцен собирает tools/sceny-v-igru.py, счёт и порядок считает schet.js.
import { ETAPY } from './etapy.js?v=3032a635';
import { MESTA, GEROY, GOROD } from './dannye/mesta.js?v=3032a635';
import { SCENY, NACHALO } from './dannye/sceny.js?v=3032a635';
import * as S from './schet.js?v=3032a635';

const KLYUCH = 'igra';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function pamyat(v) {
  try {
    if (v === undefined) return localStorage.getItem(KLYUCH);
    localStorage.setItem(KLYUCH, v);
  } catch { /* память закрыта: игра идёт до закрытия окна */ }
  return null;
}

let hod = S.prochitat(pamyat(), SCENY);
const poryadki = {}; // порядок ответов в сценах, где выбора ещё нет
let sbros = false;

const sohranit = () => pamyat(JSON.stringify(hod));
const mestoPo = (etap) => MESTA.find((m) => m.etap === etap);

function schetBlok() {
  const s = S.schet(NACHALO, SCENY, hod);
  return `<div class="schet" aria-label="Счёт"><div><small>Выручка</small><b>${S.rubli(s.vyruchka)}</b></div><div><small>Доверие</small><b>${s.doverie}</b></div></div>`;
}

export function karta() {
  const tek = MESTA.find((m) => m.mesto && S.proydeno(S.scenyEtapa(SCENY, m.etap), hod) < S.scenyEtapa(SCENY, m.etap).length);
  const rows = MESTA.map((m) => {
    const etap = esc(ETAPY[m.etap - 1]);
    if (!m.mesto) return `<div class="mesto closed"><span class="dot">${m.etap}</span><span class="name"><b>Этап ${m.etap}</b><small>${etap}</small></span><span class="state">скоро</span></div>`;
    const ryad = S.scenyEtapa(SCENY, m.etap);
    const n = S.proydeno(ryad, hod);
    return `<a class="mesto${m === tek ? ' tek' : ''}" href="#mesto-${m.etap}"><span class="dot">${m.etap}</span><span class="name"><b>${esc(m.mesto)}</b><small>${etap}</small></span><span class="state">${n === ryad.length ? 'пройдено' : `${n} из ${ryad.length}`}</span></a>`;
  }).join('');
  return `${schetBlok()}
  <div class="razdel">Город ${esc(GOROD)}</div>
  <p class="lead">${esc(GEROY)} учится продавать. Выберите место на карте: там ждут учитель и клиенты.</p>
  <nav class="karta" aria-label="Карта города">${rows}</nav>`;
}

export function mesto(n) {
  const m = mestoPo(n);
  if (!m?.mesto) return null;
  const ryad = S.scenyEtapa(SCENY, n);
  const rows = ryad.map((s, i) => {
    const o = S.otvet(s, hod[s.id]?.vybor);
    return `<a class="book${o ? '' : ' nov'}" href="#scena-${s.id}"><span class="dot">${i + 1}</span><span class="t">${esc(s.nazv)}</span><span class="state">${o ? esc(S.TIPY[o.tip].toLowerCase()) : 'не пройдена'}</span></a>`;
  }).join('');
  const pervaya = ryad.find((s) => !hod[s.id]) || ryad[0];
  return `<a class="back" href="#">‹ Карта</a>
  <div class="eyebrow">Этап ${n}. ${esc(ETAPY[n - 1])}</div><h2>${esc(m.mesto)}</h2>
  <div class="sec uchitel"><h3>Учитель: ${esc(m.uchitel)}</h3><p class="pravilo">«${esc(m.pravilo)}»</p></div>
  <p class="lead">${esc(m.mysl)}</p>
  <div class="razdel">Сцены</div><div class="books">${rows}</div>
  <a class="main-btn" href="#scena-${pervaya.id}">${hod[pervaya.id] ? 'Пройти сцены ещё раз' : 'Начать сцену'}</a>`;
}

const repliki = (t) => t.split(/(?=(?:Клиент|Герой): )/).map((r) => `<p>${esc(r.trim())}</p>`).join('');

export function scena(id) {
  const s = SCENY.find((x) => x.id === id);
  if (!s) return null;
  const m = mestoPo(s.etap);
  const ryad = S.scenyEtapa(SCENY, s.etap);
  const z = hod[id];
  const por = z?.poryadok || (poryadki[id] ||= S.peremeshat());
  const vybor = z ? S.otvet(s, z.vybor) : null;
  const luchshiy = s.otvety.find((o) => o.tip === 'chestno');
  const knopki = [...por].map((b, i) => {
    const o = S.otvet(s, b);
    const cls = !vybor ? '' : o === luchshiy ? ' best' : ' wrong';
    const mark = !vybor ? '' : o === vybor && o === luchshiy ? 'ваш ответ, лучший' : o === vybor ? 'ваш ответ' : o === luchshiy ? 'лучший ответ' : '';
    return `<button class="opt${cls}${o === vybor ? ' picked' : ''}" type="button" data-otvet="${b}" data-scena="${id}"${vybor ? ' disabled' : ''}><span class="letter">${S.BUKVY[i]}</span><span>${esc(o.tekst)}</span><span class="mark">${mark}</span></button>`;
  }).join('');
  let itog = '';
  if (vybor) {
    const dal = S.sleduyushchaya(SCENY, id);
    const razgovor = luchshiy.dalshe
      ? `<div class="sec example"><h3>${vybor === luchshiy ? 'Как пошёл разговор' : 'Как пошёл бы разговор с лучшим ответом'}</h3><p>Герой: ${esc(luchshiy.tekst)}</p>${repliki(luchshiy.dalshe)}</div>` : '';
    itog = `<div class="sec itog"><div class="eyebrow">${esc(S.TIPY[vybor.tip])}</div><h3>Что вышло</h3><p>${esc(vybor.itog)}</p>
    <div class="delty"><span class="delta${vybor.v > 0 ? ' plus' : ''}">Выручка ${vybor.v > 0 ? '+' : ''}${S.rubli(vybor.v)}</span><span class="delta${vybor.d > 0 ? ' plus' : ''}">Доверие ${S.soZnakom(vybor.d)}</span></div></div>
    ${razgovor}
    <div class="why"><h3>Почему</h3><p>${esc(S.pochemu(s.pochemu, por))}</p></div>
    <a class="main-btn" href="${dal ? `#scena-${dal.id}` : '#'}">Дальше</a>
    <button class="vtor" type="button" data-snova="${id}">Переиграть сцену</button>`;
  }
  return `<a class="back" href="#mesto-${s.etap}">‹ ${esc(m.mesto)}</a>
  <div class="eyebrow">Сцена ${ryad.indexOf(s) + 1} из ${ryad.length}</div><h2>${esc(s.nazv)}</h2>
  ${schetBlok()}
  <div class="lesson"><p>${esc(s.sit)}</p>
  ${s.klient ? `<div class="klient"><small>Клиент говорит</small><p>${esc(s.klient)}</p></div>` : ''}
  <div class="ask">Что ответит ${esc(GEROY)}?</div><div class="opts">${knopki}</div></div>
  ${itog}`;
}

// Строка в настройках: стереть прохождение. Второе нажатие подтверждает.
export function sbrosKnopka() {
  const n = S.proydeno(SCENY, hod);
  if (!n) return '<p class="note">Пройденных сцен пока нет.</p>';
  return `<p class="note">Пройдено сцен: ${n} из ${SCENY.length}. Прохождение хранит этот браузер.</p>
  <button class="vtor" type="button" data-sbros>${sbros ? 'Точно стереть? Нажмите ещё раз' : 'Начать игру заново'}</button>`;
}

// Нажатия игры. Возвращает true, если экран надо нарисовать заново.
export function igraKlik(e) {
  const o = e.target.closest('button[data-otvet]');
  if (o) {
    const s = SCENY.find((x) => x.id === o.dataset.scena);
    if (!s || hod[s.id]) return true; // повторное нажатие: выбор уже записан
    hod = S.vybrat(hod, s, o.dataset.otvet, poryadki[s.id] || S.BUKVY.join(''));
    sohranit();
    return true;
  }
  const sn = e.target.closest('button[data-snova]');
  if (sn) {
    hod = S.zabyt(hod, sn.dataset.snova);
    delete poryadki[sn.dataset.snova];
    sohranit();
    window.scrollTo(0, 0);
    return true;
  }
  if (e.target.closest('button[data-sbros]')) {
    if (sbros) { hod = {}; sohranit(); }
    sbros = !sbros;
    return true;
  }
  sbros = false;
  return false;
}

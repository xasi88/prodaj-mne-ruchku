// Звуки действий, собранные кодом (Web Audio): без файлов и без музыки.
// Браузер разрешает звук только после первого нажатия: до него звуки молчат.
// Выключатель звука хранится в localStorage.

const KLYUCH = 'prodaj-mne-ruchku-zvuk';
let ctx = null;
let mozhno = false;
let vklyuchen = true;
try { vklyuchen = localStorage.getItem(KLYUCH) !== 'net'; } catch { /* память закрыта */ }

export const zvukVklyuchen = () => vklyuchen;
export function pereklyuchit() {
  vklyuchen = !vklyuchen;
  try { localStorage.setItem(KLYUCH, vklyuchen ? 'da' : 'net'); } catch { /* память закрыта */ }
  return vklyuchen;
}

// Первое нажатие открывает звук
export function razreshit() {
  mozhno = true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!ctx && AC) ctx = new AC();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function gotov() { return mozhno && vklyuchen && ctx && ctx.state === 'running'; }

function ton(chastota, nachalo, dlit, vid = 'sine', gromko = 0.2, konec = chastota) {
  const t = ctx.currentTime + nachalo;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = vid;
  o.frequency.setValueAtTime(chastota, t);
  o.frequency.exponentialRampToValueAtTime(konec, t + dlit);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gromko, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dlit);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dlit + 0.02);
}

let bufShum = null;
function shum(nachalo, dlit, gromko, ot, do_) {
  if (!bufShum) {
    bufShum = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = bufShum.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + nachalo;
  const s = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  s.buffer = bufShum;
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(ot, t);
  f.frequency.exponentialRampToValueAtTime(do_, t + dlit);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gromko, t + dlit * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dlit);
  s.connect(f).connect(g).connect(ctx.destination);
  s.start(t);
  s.stop(t + dlit + 0.02);
}

const ZVUKI = {
  // Нажатие кнопки: короткий щелчок
  nazhatie: () => ton(620, 0, 0.06, 'triangle', 0.18, 380),
  // Слова влетают: свист воздуха и глухой удар
  vlet: () => { shum(0, 0.28, 0.35, 500, 3200); ton(140, 0.22, 0.14, 'sine', 0.35, 55); },
  // Верный ответ: две ноты вверх
  verno: () => { ton(660, 0, 0.12, 'triangle', 0.22); ton(990, 0.1, 0.22, 'triangle', 0.22); },
  // Неверный ответ: низкий гул вниз
  neverno: () => { ton(230, 0, 0.28, 'sawtooth', 0.09, 140); ton(115, 0, 0.28, 'sine', 0.2, 80); },
  // Выручка: монеты
  monety: () => [0, 0.07, 0.14, 0.24].forEach((t, i) => ton(1300 + i * 220, t, 0.12, 'square', 0.06)),
  // Конец главы: короткая фанфара
  final: () => [523, 659, 784, 1047].forEach((f, i) => ton(f, i * 0.11, i === 3 ? 0.5 : 0.16, 'triangle', 0.2)),
};

export function igrat(imya) {
  if (!gotov() || !ZVUKI[imya]) return;
  try { ZVUKI[imya](); } catch { /* звук не важнее игры */ }
}

export const IMENA_ZVUKOV = Object.keys(ZVUKI);

// Экраны разбора книг (только автор). Данные из базы: spisok, карточки 01..103, itog-N.
// HTML карточек собирает tools/книги-в-страницу.py, писать в базу может только автор.
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function spisok(D) {
  const stages = D.spisok?.stages || [];
  const all = stages.flatMap((s) => s.books);
  const ready = all.filter((b) => D[pad(b.n)]);
  return { stages, all, ready };
}

export function knigiGlavnaya(D) {
  const { stages, all, ready } = spisok(D);
  const pct = all.length ? Math.round((ready.length / all.length) * 100) : 0;
  const rows = stages.map((s) => {
    const r = s.books.filter((b) => D[pad(b.n)]).length;
    return r
      ? `<a class="step tek" href="#knigi-etap-${s.n}"><span class="dot">${s.n}</span><span class="name">${esc(s.name)}</span><span class="state">${r} из ${s.books.length}</span></a>`
      : `<div class="step closed"><span class="dot">${s.n}</span><span class="name">${esc(s.name)}</span><span class="state">${s.books.length} книг</span></div>`;
  }).join('');
  return `<a class="back" href="#">‹ Главная</a>
  <div class="eyebrow">Только для вас</div><h2>Разбор книг</h2>
  <div class="blok" style="margin-top:20px"><div class="row"><span>Разобрано книг</span><span class="big">${ready.length} / ${all.length}</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>
  <nav class="path" aria-label="Этапы">${rows}</nav>`;
}

export function knigiEtap(D, n) {
  const s = spisok(D).stages.find((x) => x.n === n);
  if (!s) return knigiGlavnaya(D);
  const it = D['itog-' + n];
  const rows = s.books.map((b) => (D[pad(b.n)]
    ? `<a class="book" href="#kniga-${pad(b.n)}"><span class="dot">${pad(b.n)}</span><span class="t">${esc(D[pad(b.n)].title)}</span></a>`
    : `<div class="book closed"><span class="dot">${pad(b.n)}</span><span class="t">${esc(b.text)}</span></div>`)).join('');
  return `<a class="back" href="#knigi">‹ Все этапы</a>
  <div class="eyebrow">Этап ${n}</div><h2>${esc(s.name)}</h2>
  <p class="lead">${s.books.filter((b) => D[pad(b.n)]).length} из ${s.books.length} книг разобрано.</p>
  ${it ? `<a class="main-btn" href="#itog-${n}">Навыки и порядок уроков</a>` : ''}
  <div class="books">${rows}</div>`;
}

export function knigiItog(D, n) {
  const it = D['itog-' + n];
  if (!it) return knigiEtap(D, n);
  const s = spisok(D).stages.find((x) => x.n === n);
  return `<a class="back" href="#knigi-etap-${n}">‹ Этап ${n}</a>
  <div class="eyebrow">Итог этапа ${n}</div><h2>${esc(s ? s.name : '')}</h2>
  <div class="note">${it.intro}</div><div class="secs">${it.body}</div>`;
}

export function kniga(D, n) {
  const c = D[pad(n)];
  if (!c) return knigiGlavnaya(D);
  const { stages, ready } = spisok(D);
  const s = stages.find((x) => x.books.some((b) => b.n === n));
  const i = ready.findIndex((b) => b.n === n);
  const link = (b, cls, label) => (b
    ? `<a class="${cls}" href="#kniga-${pad(b.n)}"><small>${label}</small><span>${pad(b.n)}. ${esc(D[pad(b.n)].title)}</span></a>`
    : '<span></span>');
  return `<a class="back" href="#knigi-etap-${s.n}">‹ Этап ${s.n}. ${esc(s.name)}</a>
  <div class="num">${pad(n)}</div><h2>${esc(c.title)}</h2>
  <div class="note">${c.intro}</div>
  <div class="secs">${c.body}</div>
  <nav class="pager">${link(ready[i - 1], 'prev', '‹ Назад')}${link(ready[i + 1], 'next', 'Дальше ›')}</nav>`;
}

// Выбор ответа в занятии: показать лучший и «Почему».
export function zanyatie(e) {
  const opt = e.target.closest('.opt');
  if (opt && !opt.disabled) {
    const box = opt.closest('.lesson');
    box.querySelectorAll('.opt').forEach((o) => {
      o.disabled = true;
      const best = o.dataset.best === '1';
      o.classList.add(best ? 'best' : 'wrong');
      o.querySelector('.mark').textContent = best ? 'Лучший' : '';
    });
    opt.classList.add('picked');
    opt.querySelector('.mark').textContent = opt.dataset.best === '1' ? 'Верно' : 'Ваш выбор';
    box.querySelector('.why').hidden = false;
    return true;
  }
  const again = e.target.closest('.again');
  if (again) {
    const box = again.closest('.lesson');
    box.querySelectorAll('.opt').forEach((o) => { o.disabled = false; o.className = 'opt'; o.querySelector('.mark').textContent = ''; });
    box.querySelector('.why').hidden = true;
    return true;
  }
  return false;
}

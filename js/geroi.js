// Герои: рисунки в стиле «А комикс-заставка» (брендбук, «Люди»). Картинки без фона в img/geroi/,
// режет их tools/vyrezat-pozy.py из листа поз Codex. Поза с «2» на конце: тот же рисунок, сдвинутый рывком.

export const POZY = {
  ilyas: ['stoit', 'mashet', 'dumaet', 'govorit', 'telefon', 'pokazyvaet', 'smushchen', 'rad'],
  musa: ['stoit', 'obyasnyaet', 'dumaet', 'kivaet'],
  adam: ['stoit', 'uhodit', 'somnevaetsya', 'rad'],
  zaur: ['stoit', 'obyasnyaet', 'dumaet', 'rad'],
  vaha: ['stoit', 'skuchaet', 'serditsya', 'rad'],
  hamzat: ['stoit', 'dumaet', 'somnevaetsya', 'ruka'],
};

export const IMENA = { ilyas: 'Ильяс', musa: 'Муса', adam: 'Адам', zaur: 'Заур', vaha: 'Ваха', hamzat: 'Хамзат' };

// Как покупатель в разговоре слушает, сомневается и радуется.
// Переписка в телефоне: на сцене Ильяс с телефоном.
export const REAKCII = {
  adam: { stoit: 'stoit', somn: 'somnevaetsya', rad: 'rad' },
  vaha: { stoit: 'stoit', somn: 'serditsya', rad: 'rad' },
  hamzat: { stoit: 'dumaet', somn: 'somnevaetsya', rad: 'ruka' },
  zaur: { stoit: 'stoit', somn: 'dumaet', rad: 'rad' },
  telefon: { kto: 'ilyas', stoit: 'telefon', somn: 'smushchen', rad: 'rad' },
};

export const osnova = (poza) => poza.replace(/2$/, '');
export const ryvok = (poza) => poza.endsWith('2');
export const kartinka = (kto, poza) => `img/geroi/${kto}-${osnova(poza)}.webp`;

export function geroj(kto, poza) {
  return `<img class="geroj${ryvok(poza) ? ' ryvok' : ''}" src="${kartinka(kto, poza)}" alt="" draggable="false">`;
}

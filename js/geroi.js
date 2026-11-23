// Герои: рисунки в стиле «А комикс-заставка» (брендбук, «Люди»). Картинки без фона в img/geroi/,
// режет их tools/vyrezat-pozy.py из листа поз Codex. Поза с «2» на конце: тот же рисунок, сдвинутый рывком.

export const POZY = {
  ilyas: ['stoit', 'mashet', 'dumaet', 'govorit'],
  musa: ['stoit', 'obyasnyaet', 'dumaet', 'kivaet'],
  adam: ['stoit', 'uhodit', 'somnevaetsya', 'rad'],
};

export const osnova = (poza) => poza.replace(/2$/, '');
export const ryvok = (poza) => poza.endsWith('2');
export const kartinka = (kto, poza) => `img/geroi/${kto}-${osnova(poza)}.webp`;

export function geroj(kto, poza) {
  return `<img class="geroj${ryvok(poza) ? ' ryvok' : ''}" src="${kartinka(kto, poza)}" alt="" draggable="false">`;
}

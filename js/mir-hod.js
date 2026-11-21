// Ходьба героя: шаг к цели и проверка, что он не входит в предметы. Без графики: это проверяют тесты.
export const RADIUS = 0.38; // половина ширины героя

// Можно ли стоять в точке: внутри границ, не в коробке и не в круге.
export function mozhno(x, z, p, r = RADIUS) {
  if (Math.abs(x) > p.granicy.x || Math.abs(z) > p.granicy.z) return false;
  for (const b of p.boxy) {
    const bx = Math.max(b.x0, Math.min(x, b.x1));
    const bz = Math.max(b.z0, Math.min(z, b.z1));
    if (Math.hypot(x - bx, z - bz) < r) return false;
  }
  for (const k of p.krugi) if (Math.hypot(x - k.x, z - k.z) < r + k.r) return false;
  return true;
}

// Один шаг длиной до dlina от (x, z) к цели. Упёрся: скользит вдоль предмета по одной оси.
// Возвращает новую точку, пройденный путь и признак «пришёл».
export function shag(x, z, cx, cz, dlina, p) {
  const dx = cx - x, dz = cz - z;
  const ost = Math.hypot(dx, dz);
  if (ost < 0.05) return { x, z, sdvig: 0, prishel: true };
  const d = Math.min(dlina, ost);
  const sx = (dx / ost) * d, sz = (dz / ost) * d;
  for (const [nx, nz] of [[x + sx, z + sz], [x + sx, z], [x, z + sz]]) {
    if ((nx !== x || nz !== z) && mozhno(nx, nz, p)) return { x: nx, z: nz, sdvig: Math.hypot(nx - x, nz - z), prishel: false };
  }
  return { x, z, sdvig: 0, prishel: false };
}

// Сцена «Ворота рынка»: земля, ворота, прилавки, деревья, дома. Только постройка, без движения.
// Каждое препятствие записано в список: герой не проходит сквозь предметы (правило автора о 3D).
// Фигуры людей временные, из простых форм. Их заменят модели из картинок.

export const GRANICY = { x: 11, z: 9 };
export const START = { x: 0, z: 6.5 };
export const UCHITEL = { x: 3.4, z: -1.5 };

export function postroit(T, c) {
  const g = new T.Group();
  const boxy = []; // препятствия-коробки: x0, x1, z0, z1
  const krugi = []; // препятствия-круги: x, z, r
  const mat = (cvet) => new T.MeshLambertMaterial({ color: cvet, flatShading: true });
  const M = {};
  for (const k of Object.keys(c)) M[k] = mat(c[k]);

  // Коробка стоит на земле: низ ровно на высоте y.
  const korobka = (m, w, h, d, x, z, y = 0, stena = false) => {
    const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    o.position.set(x, y + h / 2, z);
    o.castShadow = o.receiveShadow = true;
    g.add(o);
    if (stena) boxy.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
    return o;
  };

  const zemlya = new T.Mesh(new T.PlaneGeometry(60, 60), M.zemlya);
  zemlya.rotation.x = -Math.PI / 2;
  zemlya.receiveShadow = true;
  g.add(zemlya);
  const doroga = new T.Mesh(new T.PlaneGeometry(3.4, 60), M.doroga);
  doroga.rotation.x = -Math.PI / 2;
  doroga.position.y = 0.01;
  doroga.receiveShadow = true;
  g.add(doroga);

  // Ворота рынка: два столба, перекладина с вывеской, по бокам забор.
  korobka(M.stena, 0.9, 3.4, 0.9, -2.3, -3, 0, true);
  korobka(M.stena, 0.9, 3.4, 0.9, 2.3, -3, 0, true);
  korobka(M.krysha, 6.4, 0.5, 1.2, 0, -3, 3.4);
  korobka(M.stena, 9.3, 1.5, 0.4, -7.4, -3, 0, true);
  korobka(M.stena, 9.3, 1.5, 0.4, 7.4, -3, 0, true);
  const holst = document.createElement('canvas');
  holst.width = 512; holst.height = 128;
  const k = holst.getContext('2d');
  k.fillStyle = c.vyveska; k.fillRect(0, 0, 512, 128);
  k.fillStyle = c.vyveskaTekst; k.font = '84px "Russo One", "Arial Black", sans-serif';
  k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('РЫНОК', 256, 70);
  const tekstura = new T.CanvasTexture(holst);
  tekstura.colorSpace = T.SRGBColorSpace;
  const vyveska = new T.Mesh(new T.PlaneGeometry(3.4, 0.85), new T.MeshBasicMaterial({ map: tekstura }));
  vyveska.position.set(0, 2.9, -2.52);
  g.add(vyveska);
  korobka(M.vyveska, 3.6, 1, 0.1, 0, -2.6, 2.4);

  // Будка сторожа у правого столба.
  korobka(M.doska, 1.6, 2.1, 1.4, 5, -1.9, 0, true);
  korobka(M.krysha, 2, 0.25, 1.8, 5, -1.9, 2.1);

  // Прилавок: стол, четыре стойки, навес и товар.
  const prilavok = (x, z, naves) => {
    korobka(M.doska, 2.4, 0.9, 1.1, x, z, 0, true);
    for (const [dx, dz] of [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]]) korobka(M.stvol, 0.12, 2.2, 0.12, x + dx, z + dz);
    const n = korobka(naves, 2.8, 0.12, 1.6, x, z, 2.2);
    n.rotation.x = 0.16;
    [M.tovar1, M.tovar2, M.tovar3].forEach((m, i) => korobka(m, 0.55, 0.3, 0.6, x - 0.75 + i * 0.75, z, 0.9));
  };
  prilavok(-7.5, -6.5, M.naves1);
  prilavok(-4.3, -6.5, M.naves3);
  prilavok(4.3, -6.5, M.naves2);
  prilavok(7.5, -6.5, M.naves1);

  // Дерево: ствол и крона. Круглое препятствие.
  const derevo = (x, z, s = 1) => {
    const stvol = new T.Mesh(new T.CylinderGeometry(0.16 * s, 0.22 * s, 1.5 * s, 7), M.stvol);
    stvol.position.set(x, 0.75 * s, z);
    const krona = new T.Mesh(new T.IcosahedronGeometry(1.15 * s, 0), M.listva);
    krona.position.set(x, 2.3 * s, z);
    krona.rotation.y = x;
    for (const o of [stvol, krona]) { o.castShadow = true; g.add(o); }
    krugi.push({ x, z, r: 0.35 * s });
  };
  derevo(-7.5, 1.5); derevo(8, 2.5, 1.2); derevo(-4.8, 6.8, 0.9); derevo(6, 7.5); derevo(-10, -8, 1.2); derevo(10.2, -8.3);

  // Дом: стены, крыша-шатёр, дверь.
  const dom = (x, z, w, d, h) => {
    korobka(M.stena, w, h, d, x, z, 0, true);
    const krysha = new T.Mesh(new T.ConeGeometry(Math.hypot(w, d) / 2 + 0.3, 1.6, 4), M.krysha);
    krysha.position.set(x, h + 0.8, z);
    krysha.rotation.y = Math.PI / 4;
    krysha.castShadow = true;
    g.add(krysha);
  };
  dom(-10.4, 5, 3, 3.4, 2.8);
  dom(10.4, 5.6, 3, 3, 3.2);
  korobka(M.doska, 0.08, 1.8, 0.9, -8.88, 5);
  korobka(M.doska, 0.08, 1.8, 0.9, 8.88, 5.6);

  // Скамейка и ящики на площади.
  korobka(M.doska, 1.8, 0.45, 0.5, -3.6, 0.3, 0, true);
  korobka(M.doska, 0.7, 0.6, 0.7, -6.3, -1.9, 0, true);
  korobka(M.tovar2, 0.6, 0.5, 0.6, -6.3, -1.9, 0.6);

  return { gruppa: g, boxy, krugi, zemlya };
}

// Человек из простых форм. Ступни стоят на y = 0. Возвращает группу и части для ходьбы.
export function chelovek(T, c, vid) {
  const g = new T.Group();
  const mat = (cvet) => new T.MeshLambertMaterial({ color: cvet, flatShading: true });
  const chast = (geo, m, x, y, z, roditel = g) => {
    const o = new T.Mesh(geo, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    roditel.add(o);
    return o;
  };
  const kozha = mat(c.kozha);
  const odezhda = mat(vid.odezhda);
  const niz = mat(c.shtany);
  // Нога и рука качаются от бедра и плеча: ось вращения вверху части.
  const konechnost = (m, r, dlina, x, y) => {
    const os = new T.Group();
    os.position.set(x, y, 0);
    g.add(os);
    chast(new T.CylinderGeometry(r, r * 0.85, dlina, 8), m, 0, -dlina / 2, 0, os);
    return os;
  };
  const nogi = [konechnost(niz, 0.13, 0.8, -0.16, 0.8), konechnost(niz, 0.13, 0.8, 0.16, 0.8)];
  const dlinaPalto = vid.palto ? 1.05 : 0.75;
  chast(new T.CylinderGeometry(0.27, vid.palto ? 0.36 : 0.3, dlinaPalto, 10), odezhda, 0, 1.5 - dlinaPalto / 2, 0);
  const ruki = [konechnost(odezhda, 0.09, 0.68, -0.37, 1.45), konechnost(odezhda, 0.09, 0.68, 0.37, 1.45)];
  for (const r of ruki) chast(new T.SphereGeometry(0.09, 8, 6), kozha, 0, -0.72, 0, r);
  chast(new T.SphereGeometry(0.23, 12, 10), kozha, 0, 1.75, 0);
  if (vid.boroda) chast(new T.SphereGeometry(0.19, 10, 8), mat(c.boroda), 0, 1.65, 0.1).scale.set(1, 0.9, 0.8);
  if (vid.papaha) chast(new T.CylinderGeometry(0.25, 0.23, 0.26, 12), mat(c.papaha), 0, 2.0, 0);
  else chast(new T.SphereGeometry(0.235, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), niz, 0, 1.78, 0);
  return { gruppa: g, nogi, ruki };
}

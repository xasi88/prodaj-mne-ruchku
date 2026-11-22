// 3D-мир: сцена, камера сверху и сбоку, герой идёт туда, куда нажали пальцем.
// Сцену строит mir-rynok.js. Цвета берём из css/tokens.css (переменные --mir-*).
import * as T from './vendor/three.module.js?v=32745c8b';
import { postroit, chelovek, GRANICY, START, UCHITEL } from './mir-rynok.js?v=32745c8b';
import { shag } from './mir-hod.js?v=32745c8b';

const CVETA = ['nebo', 'zemlya', 'doroga', 'stena', 'krysha', 'listva', 'stvol', 'doska', 'naves-1', 'naves-2', 'naves-3',
  'tovar-1', 'tovar-2', 'tovar-3', 'kozha', 'geroy', 'shtany', 'storozh', 'papaha', 'boroda', 'metka', 'vyveska', 'vyveska-tekst'];
const SKOROST = 3.2; // метров в секунду
const RYADOM = 2; // на таком расстоянии от учителя начинается разговор

function cveta() {
  const st = getComputedStyle(document.documentElement);
  const c = {};
  for (const k of CVETA) c[k.replace(/-(\w)/g, (_, b) => b.toUpperCase())] = st.getPropertyValue('--mir-' + k).trim();
  return c;
}

// Открывает мир в блоке. naUchitelya(da): герой подошёл к учителю или отошёл. Возвращает функцию закрытия.
export function otkryt(blok, naUchitelya) {
  const c = cveta();
  const holst = blok.querySelector('canvas');
  const r = new T.WebGLRenderer({ canvas: holst, antialias: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  r.shadowMap.enabled = true;
  r.shadowMap.type = T.PCFSoftShadowMap;

  const scena = new T.Scene();
  scena.background = new T.Color(c.nebo);
  scena.fog = new T.Fog(c.nebo, 30, 55);
  scena.add(new T.HemisphereLight(0xffffff, c.zemlya, 1.5));
  const solnce = new T.DirectionalLight(0xffffff, 2.2);
  solnce.position.set(-9, 16, 8);
  solnce.castShadow = true;
  solnce.shadow.mapSize.set(2048, 2048);
  Object.assign(solnce.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 50 });
  scena.add(solnce);

  const mir = postroit(T, c);
  scena.add(mir.gruppa);
  const pregrady = { boxy: mir.boxy, krugi: [...mir.krugi, { x: UCHITEL.x, z: UCHITEL.z, r: 0.45 }], granicy: GRANICY };

  const geroy = chelovek(T, c, { odezhda: c.geroy });
  geroy.gruppa.position.set(START.x, 0, START.z);
  geroy.gruppa.rotation.y = Math.PI;
  const uchitel = chelovek(T, c, { odezhda: c.storozh, palto: true, boroda: true, papaha: true });
  uchitel.gruppa.position.set(UCHITEL.x, 0, UCHITEL.z);
  scena.add(geroy.gruppa, uchitel.gruppa);

  // Метка над учителем: к нему можно подойти.
  const znak = new T.Mesh(new T.OctahedronGeometry(0.2, 0), new T.MeshBasicMaterial({ color: c.metka }));
  znak.position.set(UCHITEL.x, 2.75, UCHITEL.z);
  scena.add(znak);
  // Кольцо на земле: сюда идёт герой.
  const cel = new T.Mesh(new T.RingGeometry(0.28, 0.4, 28), new T.MeshBasicMaterial({ color: c.metka, transparent: true }));
  cel.rotation.x = -Math.PI / 2;
  cel.position.y = 0.03;
  cel.visible = false;
  scena.add(cel);

  const kamera = new T.PerspectiveCamera(36, 1, 0.5, 120);
  const tochka = new T.Vector3(START.x, 0, START.z);
  function razmer() {
    const w = blok.clientWidth, h = blok.clientHeight;
    r.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();
  }
  function kameraZa() {
    const dal = kamera.aspect < 1 ? 27 : 20; // узкий экран: камера дальше, чтобы площадь помещалась
    kamera.position.set(tochka.x, dal * 0.68, tochka.z + dal * 0.8);
    kamera.lookAt(tochka.x, 1, tochka.z - 2.5);
  }

  let put = null; // куда идёт герой: { x, z, kUchitelyu }
  let uUchitelya = false;
  let faza = 0;

  const luch = new T.Raycaster();
  const ploskost = new T.Plane(new T.Vector3(0, 1, 0), 0);
  let nazhal = null;
  const vniz = (e) => { nazhal = { x: e.clientX, y: e.clientY }; };
  const vverh = (e) => {
    if (!nazhal || Math.hypot(e.clientX - nazhal.x, e.clientY - nazhal.y) > 14) return;
    const b = holst.getBoundingClientRect();
    luch.setFromCamera(new T.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1), kamera);
    if (luch.intersectObject(uchitel.gruppa, true).length || luch.intersectObject(znak).length) {
      // Встать перед учителем со стороны героя.
      const p = geroy.gruppa.position;
      const ugol = Math.atan2(p.x - UCHITEL.x, p.z - UCHITEL.z);
      put = { x: UCHITEL.x + Math.sin(ugol) * 1.2, z: UCHITEL.z + Math.cos(ugol) * 1.2, kUchitelyu: true };
    } else {
      const t = luch.ray.intersectPlane(ploskost, new T.Vector3());
      if (!t) return;
      put = { x: T.MathUtils.clamp(t.x, -GRANICY.x, GRANICY.x), z: T.MathUtils.clamp(t.z, -GRANICY.z, GRANICY.z) };
    }
    cel.position.set(put.x, 0.03, put.z);
    cel.visible = !put.kUchitelyu;
    if (uUchitelya) { uUchitelya = false; naUchitelya(false); }
  };
  holst.addEventListener('pointerdown', vniz);
  holst.addEventListener('pointerup', vverh);

  const povorot = (o, ugol, dt) => {
    let d = ugol - o.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    o.rotation.y += d * Math.min(1, dt * 10);
  };
  const kachat = (f, sila) => {
    f.nogi[0].rotation.x = Math.sin(faza) * 0.7 * sila;
    f.nogi[1].rotation.x = -Math.sin(faza) * 0.7 * sila;
    f.ruki[0].rotation.x = -Math.sin(faza) * 0.5 * sila;
    f.ruki[1].rotation.x = Math.sin(faza) * 0.5 * sila;
  };

  const chasy = new T.Timer();
  let kadr = 0;
  let sila = 0; // плавный переход между ходьбой и стойкой
  function tik() {
    kadr = requestAnimationFrame(tik);
    chasy.update();
    const dt = Math.min(chasy.getDelta(), 0.05);
    const p = geroy.gruppa.position;
    let idet = false;
    if (put) {
      const s = shag(p.x, p.z, put.x, put.z, SKOROST * dt, pregrady);
      idet = s.sdvig > 0.0005;
      if (idet) povorot(geroy.gruppa, Math.atan2(s.x - p.x, s.z - p.z), dt);
      p.x = s.x; p.z = s.z;
      const doUchitelya = Math.hypot(p.x - UCHITEL.x, p.z - UCHITEL.z);
      if (s.prishel || !idet) {
        if (put.kUchitelyu && doUchitelya < RYADOM) { uUchitelya = true; naUchitelya(true); }
        put = null;
        cel.visible = false;
      }
    }
    if (uUchitelya) {
      povorot(geroy.gruppa, Math.atan2(UCHITEL.x - p.x, UCHITEL.z - p.z), dt);
      povorot(uchitel.gruppa, Math.atan2(p.x - UCHITEL.x, p.z - UCHITEL.z), dt);
    }
    sila += ((idet ? 1 : 0) - sila) * Math.min(1, dt * 12);
    faza += dt * 10;
    kachat(geroy, sila);
    znak.rotation.y += dt * 2;
    znak.position.y = 2.75 + Math.sin(faza * 0.3) * 0.08;
    znak.visible = !uUchitelya;
    if (cel.visible) cel.material.opacity = 0.6 + Math.sin(faza * 0.6) * 0.3;
    tochka.lerp(new T.Vector3(p.x, 0, p.z), Math.min(1, dt * 4));
    kameraZa();
    r.render(scena, kamera);
  }

  const nablyudatel = new ResizeObserver(razmer);
  nablyudatel.observe(blok);
  razmer();
  kameraZa();
  tik();

  // Для проверок: где стоят герой и учитель, что мешает пройти.
  blok.mirProverka = { geroy: geroy.gruppa, uchitel: uchitel.gruppa, pregrady, idti: (x, z) => { put = { x, z }; } };

  return () => {
    cancelAnimationFrame(kadr);
    nablyudatel.disconnect();
    holst.removeEventListener('pointerdown', vniz);
    holst.removeEventListener('pointerup', vverh);
    scena.traverse((o) => { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose?.(); });
    r.dispose();
  };
}

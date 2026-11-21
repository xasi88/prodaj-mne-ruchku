// Firebase: вход через Google и база. Библиотеки грузятся только когда нужны (как в «Кабинке»).
import { FIREBASE } from './config.js?v=d2c9bc4e';

const V = 'https://www.gstatic.com/firebasejs/10.14.1/';
let appPromise;

export const est = () => Boolean(FIREBASE);

function app() {
  appPromise ||= import(V + 'firebase-app.js').then((m) => m.initializeApp(FIREBASE));
  return appPromise;
}

async function authApi() {
  const [a, m] = await Promise.all([app(), import(V + 'firebase-auth.js')]);
  return { m, auth: m.getAuth(a) };
}

async function store() {
  const [a, f] = await Promise.all([app(), import(V + 'firebase-firestore.js')]);
  return { f, db: f.getFirestore(a) };
}

export async function sledit(cb) {
  if (!est()) return cb(null);
  const { m, auth } = await authApi();
  m.onAuthStateChanged(auth, cb);
}

// Вход окном Google. Переход на страницу Google не годится: Chrome не отдаёт данные входа
// с адреса firebaseapp.com (проверено 2026-11-21). Окно открывается только от нажатия человека.
export async function voyti() {
  const { m, auth } = await authApi();
  await m.signInWithPopup(auth, new m.GoogleAuthProvider());
}

export async function vyyti() {
  const { m, auth } = await authApi();
  await m.signOut(auth);
}

// Все документы книг. Нет доступа: ошибка, экран книг не показываем.
export async function knigi() {
  const { f, db } = await store();
  const snap = await f.getDocs(f.collection(db, 'knigi'));
  const out = {};
  snap.forEach((d) => { out[d.id] = d.data(); });
  return out;
}

// Убрать документы книг из базы по номерам. Только автор (firestore.rules).
export async function udalitKnigi(ids) {
  const { f, db } = await store();
  const batch = f.writeBatch(db);
  for (const id of ids) batch.delete(f.doc(db, 'knigi', id));
  await batch.commit();
  return ids.length;
}

// Только на компьютере автора: запись книг из site/_local/knigi.json в базу.
export async function zapisatKnigi(docs) {
  const { f, db } = await store();
  const batch = f.writeBatch(db);
  for (const [id, data] of Object.entries(docs)) batch.set(f.doc(db, 'knigi', id), data);
  await batch.commit();
  return Object.keys(docs).length;
}

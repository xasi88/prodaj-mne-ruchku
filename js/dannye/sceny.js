// Собрано скриптом tools/sceny-v-igru.py. Руками не править: править карточки и tools/razmetka-scen-*.json.
import s1 from './sceny-1.js?v=32745c8b';
import s2 from './sceny-2.js?v=32745c8b';
import s3 from './sceny-3.js?v=32745c8b';
import s4 from './sceny-4.js?v=32745c8b';

export const NACHALO = {"vyruchka": 3000, "doverie": 10};
export const SCENY = [...s1, ...s2, ...s3, ...s4];

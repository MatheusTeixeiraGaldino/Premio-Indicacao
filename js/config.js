import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function getConfig() {
  const snap = await getDoc(doc(db, 'configuracoes', 'geral'));
  if (!snap.exists()) {
    const defaults = { valorPadrao: 500, criadoEm: serverTimestamp() };
    await setDoc(doc(db, 'configuracoes', 'geral'), defaults);
    return defaults;
  }
  return snap.data();
}

export async function saveConfig(dados, userId) {
  await setDoc(doc(db, 'configuracoes', 'geral'), {
    ...dados,
    atualizadoEm: serverTimestamp(),
    atualizadoPor: userId
  }, { merge: true });
}

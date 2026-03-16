import { db } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function addAuditLog(acao, descricao, userId, referenciaId = null) {
  try {
    await addDoc(collection(db, 'historico'), {
      acao,
      descricao,
      userId,
      referenciaId,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error('Erro ao salvar auditoria:', e);
  }
}

export async function getAuditLogs(referenciaId = null, limitN = 50) {
  let q;
  if (referenciaId) {
    q = query(
      collection(db, 'historico'),
      where('referenciaId', '==', referenciaId),
      orderBy('timestamp', 'desc'),
      limit(limitN)
    );
  } else {
    q = query(
      collection(db, 'historico'),
      orderBy('timestamp', 'desc'),
      limit(limitN)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

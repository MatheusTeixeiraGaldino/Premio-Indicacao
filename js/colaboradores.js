import { db } from './firebase-config.js';
import {
  collection, setDoc, updateDoc, doc, getDoc, getDocs,
  query, orderBy, where, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { addAuditLog } from './audit.js';

/**
 * Converte matrícula para ID de documento.
 * Padrão: MAT_00123 — garante que a REST API externa não duplique registros.
 */
export function matriculaToId(matricula) {
  return 'MAT_' + String(matricula).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function toTimestamp(dateStr) {
  if (!dateStr) return null;
  return Timestamp.fromDate(new Date(dateStr + 'T00:00:00'));
}

export function toInputDate(date) {
  if (!date) return '';
  if (date.toDate) date = date.toDate();
  if (typeof date === 'string') date = new Date(date + 'T00:00:00');
  return date.toISOString().split('T')[0];
}

export async function upsertColaborador(dados, fonte = 'manual', userId = null) {
  const docId = matriculaToId(dados.matricula);
  const ref = doc(db, 'colaboradores', docId);
  const snap = await getDoc(ref);

  const payload = {
    matricula: String(dados.matricula).trim(),
    nome: dados.nome,
    setor: dados.setor || '',
    dataAdmissao: dados.dataAdmissao ? toTimestamp(dados.dataAdmissao) : null,
    tipoContrato: dados.tipoContrato || 'experiencia',
    dataTerminoContrato: dados.dataTerminoContrato ? toTimestamp(dados.dataTerminoContrato) : null,
    status: dados.status || 'ativo',
    dataDesligamento: dados.dataDesligamento ? toTimestamp(dados.dataDesligamento) : null,
    fonte,
    atualizadoEm: serverTimestamp()
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...payload,
      foiIndicado: false,
      indicacaoId: null,
      criadoEm: serverTimestamp(),
      criadoPor: userId || fonte
    });
    if (userId) await addAuditLog('criar_colaborador', `Colaborador ${dados.nome} (${dados.matricula}) criado`, userId);
    return { id: docId, acao: 'criado' };
  } else {
    const existente = snap.data();
    if (existente.foiIndicado) {
      delete payload.foiIndicado;
      delete payload.indicacaoId;
    }
    await updateDoc(ref, payload);
    if (userId) await addAuditLog('atualizar_colaborador', `Colaborador ${dados.nome} (${dados.matricula}) atualizado`, userId);
    return { id: docId, acao: 'atualizado' };
  }
}

export async function listarColaboradores(filtros = {}) {
  const constraints = [orderBy('nome', 'asc')];
  if (filtros.status && filtros.status !== 'todos') {
    constraints.unshift(where('status', '==', filtros.status));
  }
  const snap = await getDocs(query(collection(db, 'colaboradores'), ...constraints));
  let lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (filtros.busca) {
    const b = filtros.busca.toLowerCase();
    lista = lista.filter(c =>
      c.nome?.toLowerCase().includes(b) ||
      c.matricula?.toLowerCase().includes(b) ||
      (c.setor || '').toLowerCase().includes(b)
    );
  }

  if (filtros.foiIndicado !== undefined) {
    lista = lista.filter(c => c.foiIndicado === filtros.foiIndicado);
  }

  return lista;
}

export async function getColaborador(id) {
  const snap = await getDoc(doc(db, 'colaboradores', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function marcarComoIndicado(colaboradorId, indicacaoId, userId) {
  await updateDoc(doc(db, 'colaboradores', colaboradorId), {
    foiIndicado: true,
    indicacaoId,
    atualizadoEm: serverTimestamp()
  });
  await addAuditLog('marcar_indicado', `Colaborador marcado como indicado. Indicação: ${indicacaoId}`, userId, colaboradorId);
}

export async function registrarDesligamentoColaborador(matricula, dataDesligamento, userId) {
  const docId = matriculaToId(matricula);
  const ref = doc(db, 'colaboradores', docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  await updateDoc(ref, {
    status: 'desligado',
    dataDesligamento: toTimestamp(dataDesligamento),
    atualizadoEm: serverTimestamp()
  });

  const dado = snap.data();
  if (dado.indicacaoId && dado.dataAdmissao) {
    const adm = dado.dataAdmissao.toDate();
    const deslig = new Date(dataDesligamento + 'T00:00:00');
    const dias = Math.floor((deslig - adm) / 86400000);
    if (dias < 180 && dado.tipoContrato !== 'determinado') {
      await updateDoc(doc(db, 'indicacoes', dado.indicacaoId), {
        status: 'colaborador_desligado',
        dataDesligamentoIndicado: toTimestamp(dataDesligamento),
        atualizadoEm: serverTimestamp()
      });
    }
  }

  await addAuditLog('desligamento_colaborador', `Colaborador ${matricula} desligado em ${dataDesligamento}`, userId);
  return docId;
}

import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { addAuditLog } from './audit.js';

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'usuarios', cred.user.uid));
  if (!userDoc.exists()) throw new Error('Usuário não encontrado no sistema.');
  const userData = userDoc.data();
  if (userData.status === 'inativo') throw new Error('Usuário inativo.');
  sessionStorage.setItem('userData', JSON.stringify({ uid: cred.user.uid, ...userData }));
  return { uid: cred.user.uid, ...userData };
}

export async function logout() {
  const userData = getCurrentUser();
  if (userData) await addAuditLog('logout', 'Logout realizado', userData.uid);
  sessionStorage.removeItem('userData');
  await signOut(auth);
  window.location.href = '/index.html';
}

export function getCurrentUser() {
  const data = sessionStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
}

export function requireAuth(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/index.html';
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.perfil)) {
    window.location.href = '/pages/dashboard.html';
    return null;
  }
  return user;
}

export async function createUser(email, nome, perfil, createdBy) {
  const tempPassword = gerarSenhaTemporaria();
  const cred = await createUserWithEmailAndPassword(auth, email, tempPassword);
  await setDoc(doc(db, 'usuarios', cred.user.uid), {
    nome,
    email,
    perfil,
    status: 'ativo',
    senhaTemporaria: true,
    criadoEm: serverTimestamp(),
    criadoPor: createdBy
  });
  await addAuditLog('criar_usuario', `Usuário ${nome} (${email}) criado com perfil ${perfil}`, createdBy);
  return { uid: cred.user.uid, tempPassword };
}

export async function resetUserPassword(uid, resetBy) {
  const userDoc = await getDoc(doc(db, 'usuarios', uid));
  if (!userDoc.exists()) throw new Error('Usuário não encontrado.');
  const email = userDoc.data().email;
  await sendPasswordResetEmail(auth, email);
  await addAuditLog('reset_senha', `Senha redefinida para usuário ${email}`, resetBy);
}

export async function changePassword(newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('Não autenticado.');
  await updatePassword(user, newPassword);
  await setDoc(doc(db, 'usuarios', user.uid), { senhaTemporaria: false }, { merge: true });
  const userData = getCurrentUser();
  if (userData) {
    userData.senhaTemporaria = false;
    sessionStorage.setItem('userData', JSON.stringify(userData));
  }
}

function gerarSenhaTemporaria() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export { onAuthStateChanged };

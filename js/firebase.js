import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { FIREBASE_CONFIG, INTERNAL_EMAIL } from "./config.js";

const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ---------- Auth ----------
export function login(senha) {
  return signInWithEmailAndPassword(auth, INTERNAL_EMAIL, senha);
}

export function logout() {
  return signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ---------- Fichas (templates) ----------
// profiles/{perfilId}/templates/{fichaId}
export async function criarFicha(perfilId, ficha) {
  const ref = collection(db, "profiles", perfilId, "templates");
  return addDoc(ref, { ...ficha, criadoEm: serverTimestamp() });
}

export async function listarFichas(perfilId) {
  const ref = collection(db, "profiles", perfilId, "templates");
  const snap = await getDocs(query(ref, orderBy("criadoEm", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function excluirFicha(perfilId, fichaId) {
  return deleteDoc(doc(db, "profiles", perfilId, "templates", fichaId));
}

// ---------- Histórico ----------
// profiles/{perfilId}/history/{registroId}
export async function registrarTreinoConcluido(perfilId, registro) {
  const ref = collection(db, "profiles", perfilId, "history");
  return addDoc(ref, { ...registro, concluidoEm: serverTimestamp() });
}

export async function listarHistorico(perfilId) {
  const ref = collection(db, "profiles", perfilId, "history");
  const snap = await getDocs(query(ref, orderBy("concluidoEm", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function excluirRegistroHistorico(perfilId, registroId) {
  return deleteDoc(doc(db, "profiles", perfilId, "history", registroId));
}

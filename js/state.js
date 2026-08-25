import { PROFILES } from "./config.js";

const STORAGE_KEY = "treino-app:perfil";

export const state = {
  perfilId: localStorage.getItem(STORAGE_KEY) || PROFILES[0].id,
  fichas: [],
  historico: [],
  execucao: null, // { ficha, exercicios: [...], indice, concluidos: [] }
};

// Cache em memória por perfil, para evitar recarregar do Firestore a cada navegação.
// { [perfilId]: { fichas: [...] | null, historico: [...] | null } }
const cache = {};

export function getPerfilCache(perfilId) {
  if (!cache[perfilId]) cache[perfilId] = { fichas: null, historico: null };
  return cache[perfilId];
}

export function setPerfil(id) {
  state.perfilId = id;
  localStorage.setItem(STORAGE_KEY, id);
}

export function perfilAtual() {
  return PROFILES.find((p) => p.id === state.perfilId) || PROFILES[0];
}

// ============================================================
// CONFIGURAÇÃO — edite antes de publicar
// ============================================================

// 1) Cole aqui a config do seu projeto Firebase (Configurações do projeto > Geral > Seus apps > SDK)
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDeQdktBqVxHdvmR19S4riBV182Lz5wdKk",
  authDomain: "treino-curto.firebaseapp.com",
  projectId: "treino-curto",
  storageBucket: "treino-curto.firebasestorage.app",
  messagingSenderId: "552277045282",
  appId: "1:552277045282:web:e9cec0856bc58accfcda7b",
  measurementId: "G-PHL66CK39N"
};

// 2) E-mail interno fixo usado por trás do login por senha única.
// Crie esse usuário manualmente em Firebase Auth > Users > Add user,
// com a senha que vocês vão usar para entrar no app.
export const INTERNAL_EMAIL = "gabriel_barbatti@hotmail.com";

// 3) Os 2 perfis do app. O "id" é usado como nome da subcoleção em profiles/{id}/...
export const PROFILES = [
  { id: "voce", nome: "Gabriel", iniciais: "GB" },
  { id: "parceira", nome: "Raissa", iniciais: "RS" },
];

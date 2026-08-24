// ============================================================
// CONFIGURAÇÃO — edite antes de publicar
// ============================================================

// 1) Cole aqui a config do seu projeto Firebase (Configurações do projeto > Geral > Seus apps > SDK)
export const FIREBASE_CONFIG = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI.firebaseapp.com",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI.appspot.com",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI",
};

// 2) E-mail interno fixo usado por trás do login por senha única.
// Crie esse usuário manualmente em Firebase Auth > Users > Add user,
// com a senha que vocês vão usar para entrar no app.
export const INTERNAL_EMAIL = "app@seudominio.com";

// 3) Os 2 perfis do app. O "id" é usado como nome da subcoleção em profiles/{id}/...
export const PROFILES = [
  { id: "voce", nome: "Você", iniciais: "VC" },
  { id: "parceira", nome: "Sua Parceira", iniciais: "SP" },
];

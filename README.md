# App de Treino

App pessoal de treino (2 perfis), HTML + Tailwind (CDN) + JS puro, com Firebase (Auth + Firestore).

## 1. Criar o projeto Firebase

1. Acesse https://console.firebase.google.com e crie um novo projeto.
2. Em **Build > Authentication**, ative o provedor **E-mail/senha**.
3. Em **Authentication > Users**, clique em **Add user** e crie um usuário com:
   - E-mail: qualquer e-mail interno, ex. `app@seudominio.com`
   - Senha: a senha única que vocês vão usar para entrar no app
4. Em **Build > Firestore Database**, crie o banco (modo produção).
5. Em **Configurações do projeto > Geral > Seus apps**, crie um app da Web e copie o objeto `firebaseConfig`.

## 2. Configurar o app

Abra `js/config.js` e preencha:

```js
export const FIREBASE_CONFIG = { ...cole aqui... };
export const INTERNAL_EMAIL = "app@seudominio.com"; // o mesmo e-mail criado no passo 1.3
export const PROFILES = [
  { id: "voce", nome: "Você", iniciais: "VC" },
  { id: "parceira", nome: "Sua Parceira", iniciais: "SP" },
];
```

`PROFILES[i].id` é o nome da subcoleção no Firestore — pode trocar os nomes/iniciais à vontade, mas evite mudar os `id` depois de já ter dados salvos.

## 3. Regras do Firestore

Em **Firestore > Regras**, use (garante que só quem estiver logado com a senha acessa os dados):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{profileId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4. Publicar no GitHub Pages

1. Suba esta pasta para um repositório no GitHub.
2. Em **Settings > Pages**, selecione a branch e a pasta raiz (`/`).
3. Acesse a URL gerada — a tela de login deve aparecer.

## Estrutura de dados no Firestore

```
profiles/{perfilId}/templates/{fichaId}
  nome: string
  dia: string | null
  exercicios: [{ exercicioId, nome, imagem, series, reps }]
  criadoEm: timestamp

profiles/{perfilId}/history/{registroId}
  templateId: string
  templateNome: string
  exercicios: [{ exercicioId, nome, imagem, series, reps }]
  concluidoEm: timestamp
```

## Estrutura de arquivos

```
index.html
css/styles.css
js/config.js          — credenciais e perfis (editar antes de publicar)
js/firebase.js         — Firebase Auth + Firestore
js/exercises-data.js   — catálogo de 140 exercícios
js/utils.js            — toast, datas, streak
js/state.js            — estado do app
js/router.js           — navegação entre telas
js/app.js              — ponto de entrada
js/screens/            — uma tela por arquivo
```

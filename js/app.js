import { login, logout, watchAuth } from "./firebase.js";
import { showToast, icons } from "./utils.js";
import { initRouter, irPara, registrarNavegacao, renderProfileToggle } from "./router.js";
import { renderHome } from "./screens/home.js";
import { renderWorkouts } from "./screens/workouts.js";
import { renderCreateWorkout } from "./screens/create-workout.js";
import { renderExecute } from "./screens/execute.js";
import { renderHistory } from "./screens/history.js";

const LOGIN_AT_KEY = "treino-app:loginAt";
const SESSAO_MS = 48 * 60 * 60 * 1000; // 48 horas

const screenLogin = document.getElementById("screen-login");
const appShell = document.getElementById("app-shell");
const formLogin = document.getElementById("form-login");
const inputSenha = document.getElementById("input-senha");
const btnLogin = document.getElementById("btn-login");
const loginErro = document.getElementById("login-erro");

registrarNavegacao((tela) => {
  if (tela === "home") renderHome();
  else if (tela === "workouts") renderWorkouts();
  else if (tela === "create") renderCreateWorkout();
  else if (tela === "execute") renderExecute();
  else if (tela === "history") renderHistory();
});

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  const senha = inputSenha.value;
  if (!senha) return;

  btnLogin.disabled = true;
  btnLogin.textContent = "Entrando…";
  loginErro.textContent = "";

  try {
    await login(senha);
    localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
  } catch (err) {
    loginErro.textContent = "Senha incorreta.";
    btnLogin.disabled = false;
    btnLogin.textContent = "Entrar";
  }
});

watchAuth(async (user) => {
  if (user) {
    const loginAt = Number(localStorage.getItem(LOGIN_AT_KEY));
    if (!loginAt) {
      // sessão já existia antes deste controle; começa a contar 48h a partir de agora
      localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
    } else if (Date.now() - loginAt > SESSAO_MS) {
      localStorage.removeItem(LOGIN_AT_KEY);
      await logout();
      return;
    }

    screenLogin.classList.remove("active", "flex");
    screenLogin.style.display = "none";
    appShell.classList.remove("hidden");
    initRouter();
    irPara("home");
  } else {
    localStorage.removeItem(LOGIN_AT_KEY);
    appShell.classList.add("hidden");
    screenLogin.style.display = "";
    screenLogin.classList.add("active", "flex");
    inputSenha.value = "";
    btnLogin.disabled = false;
    btnLogin.textContent = "Entrar";
  }
});

icons();

// Verifica periodicamente se a sessão de 48h expirou, mesmo com o app aberto
setInterval(() => {
  const loginAt = Number(localStorage.getItem(LOGIN_AT_KEY));
  if (loginAt && Date.now() - loginAt > SESSAO_MS) {
    logout();
  }
}, 5 * 60 * 1000);
